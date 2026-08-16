/**
 * The dsh-open-in host Remote service (`ctx.openIn`, wire namespace
 * `openIn`). Registered as a TypertRemoteService so the Host Gateway's
 * source-mode discovery exports its @Remote methods to the Web client under
 * `/api/openIn/*`; the strict manifest (typert.ts) resolves and invokes the
 * endpoints in a profile-loaded bundle.
 */
import { spawn } from 'node:child_process'
import { isAbsolute } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { resolveTargetCommand, visibleTargets } from './resolve.ts'
import type { OpenTarget, ResolvedConfig } from './types.ts'

/**
 * Live configuration handle the runtime reads and writes through. The read
 * source tracks the settings namespace when one is mounted (schema defaults →
 * cordis entry as `base` → the user settings document) and falls back to the
 * entry otherwise; `save` persists through the host settings service.
 */
export interface OpenInConfigHandle {
  /** Read the current resolved configuration. */
  get(): ResolvedConfig
  /**
   * Persist a target list through the host settings namespace.
   * @param targets - validated target list.
   */
  save(targets: OpenTarget[]): Promise<void>
  /** Whether the settings document accepts writes (false without a settings service). */
  readonly writable: boolean
}

/**
 * Spawn a launcher on one directory and settle when the process has launched
 * (the child detaches and outlives the server).
 * @param command - executable resolved through PATH.
 * @param args - extra arguments before the directory path.
 * @param path - absolute directory to open.
 * @param signal - caller lifetime; an abort before launch rejects the open.
 * @returns fulfillment once the launch is accepted.
 */
export function launch(
  command: string,
  args: readonly string[],
  path: string,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted === true) {
      reject(new Error('dsh-open-in: the open request was aborted'))
      return
    }
    const child = spawn(command, [...args, path], {
      detached: true,
      stdio: 'ignore',
      // `code` resolves to the Electron GUI on Windows. Hiding the spawned
      // process also hides its first window, leaving a live editor process
      // with no visible window.
      windowsHide: false,
    })
    const abort = (): void => { child.kill() }
    signal?.addEventListener('abort', abort, { once: true })
    child.once('error', (error: NodeJS.ErrnoException) => {
      signal?.removeEventListener('abort', abort)
      const hint = error.code === 'ENOENT'
        ? `; the "${command}" executable is not on PATH — install the tool or configure the plugin "targets" (command/args per target)`
        : ''
      reject(new Error(`dsh-open-in: failed to launch "${command}": ${error.message}${hint}`))
    })
    child.once('spawn', () => {
      signal?.removeEventListener('abort', abort)
      child.unref()
      resolve()
    })
  })
}

/** Open-in launcher service: list/save targets, launch one on a directory. */
export class OpenInRuntime extends TypertRemoteService {
  /**
   * Register the service under the `openIn` key (the wire namespace).
   * @param ctx - owning cordis context.
   * @param config - live configuration handle (settings-aware).
   */
  constructor(
    ctx: Context,
    private readonly config: OpenInConfigHandle,
  ) {
    super(ctx, 'openIn')
  }

  /**
   * List the targets the client renders: enabled targets, filtered by the
   * host platform, plus whether the settings document accepts writes.
   * @returns the visible targets in configuration order and writability.
   */
  @Remote
  async list(): Promise<{ targets: readonly OpenTarget[]; writable: boolean }> {
    return {
      targets: visibleTargets(this.config.get().targets),
      writable: this.config.writable,
    }
  }

  /**
   * Persist a validated target list through the host settings namespace;
   * the next list/open call reads the new value (live application).
   * @param targets - the complete target list.
   * @param signal - caller lifetime.
   * @returns the accepted persist.
   */
  @Remote
  async save(targets: OpenTarget[], signal?: AbortSignal): Promise<{ saved: true }> {
    void signal
    await this.config.save(targets)
    return { saved: true }
  }

  /**
   * Open one absolute directory with a configured target.
   * @param targetId - configured target id; unknown or disabled ids are rejected.
   * @param path - absolute directory path from the workspace row.
   * @param signal - caller lifetime; an abort before launch cancels the open.
   * @returns the accepted launch.
   */
  @Remote
  async open(targetId: string, path: string, signal?: AbortSignal): Promise<{ opened: true }> {
    if (!isAbsolute(path)) {
      throw new Error(`dsh-open-in: refusing a relative path "${path}"`)
    }
    const target = this.config.get().targets
      .find(candidate => candidate.id === targetId && candidate.enabled !== false)
    if (target === undefined) {
      throw new Error(`dsh-open-in: unknown or disabled target "${targetId}"`)
    }
    if (target.platforms.length > 0 && !target.platforms.includes(process.platform)) {
      throw new Error(`dsh-open-in: target "${targetId}" is not available on ${process.platform}`)
    }
    const { command, args } = resolveTargetCommand(target)
    await launch(command, args, path, signal)
    return { opened: true }
  }
}
