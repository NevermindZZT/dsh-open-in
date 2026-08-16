/**
 * Command resolution: built-in per-platform mapping for the shipped logical
 * targets, plus the Windows VS Code executable search for the default `code`
 * command. Explicit (customized) commands stay authoritative — deployment
 * configuration always wins.
 */
import { existsSync } from 'node:fs'
import { win32 } from 'node:path'
import { DEFAULT_TARGETS } from './targets.ts'
import type { OpenTarget } from './types.ts'

type Exists = (path: string) => boolean

function pathValue(env: NodeJS.ProcessEnv): string {
  return env.PATH ?? env.Path ?? env.path ?? ''
}

/** Standard Windows VS Code executable locations, with PATH-derived locations first. */
export function candidateWindowsVsCodePaths(env: NodeJS.ProcessEnv = process.env): string[] {
  const candidates: string[] = []
  for (const raw of pathValue(env).split(';')) {
    const entry = raw.trim().replace(/^"|"$/g, '')
    if (entry === '') continue
    candidates.push(win32.join(entry, 'Code.exe'))
    if (win32.basename(entry).toLowerCase() === 'bin') {
      candidates.push(win32.resolve(entry, '..', 'Code.exe'))
    }
  }

  const roots = [
    env.LOCALAPPDATA === undefined ? undefined : win32.join(env.LOCALAPPDATA, 'Programs'),
    env.ProgramFiles ?? 'C:\\Program Files',
    env['ProgramFiles(x86)'],
  ]
  for (const root of roots) {
    if (root !== undefined && root !== '') {
      candidates.push(win32.join(root, 'Microsoft VS Code', 'Code.exe'))
    }
  }

  const seen = new Set<string>()
  return candidates.filter((candidate) => {
    const key = candidate.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** Per-platform mapping for built-in targets whose config is still default. */
const BUILTIN_PLATFORM_COMMANDS: Record<string, Partial<Record<NodeJS.Platform, { command: string; args: readonly string[] }>>> = {
  explorer: {
    win32: { command: 'explorer', args: [] },
    darwin: { command: 'open', args: [] },
    linux: { command: 'xdg-open', args: [] },
  },
  terminal: {
    win32: { command: 'wt', args: ['-d'] },
    darwin: { command: 'open', args: ['-a', 'Terminal'] },
    linux: { command: 'gnome-terminal', args: ['--working-directory'] },
  },
}

function sameArgs(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

/** Whether a target still carries its shipped default command line. */
function isDefaultTarget(target: OpenTarget): boolean {
  const shipped = DEFAULT_TARGETS.find(candidate => candidate.id === target.id)
  return shipped !== undefined
    && target.command === shipped.command
    && sameArgs(target.args, shipped.args)
}

/** Resolve only the default `code` command on Windows. Explicit commands remain untouched. */
function resolveCodeOnWindows(
  command: string,
  platform: NodeJS.Platform,
  env: NodeJS.ProcessEnv,
  exists: Exists,
): string {
  if (platform !== 'win32' || command.toLowerCase() !== 'code') return command
  return candidateWindowsVsCodePaths(env).find(exists) ?? command
}

/**
 * Resolve the executable and args for one target on the host platform.
 * @param target - configured target.
 * @param platform - host platform (injectable for tests).
 * @param env - process environment (injectable for tests).
 * @param exists - existence probe (injectable for tests).
 * @returns the command line that opens a directory.
 */
export function resolveTargetCommand(
  target: OpenTarget,
  platform: NodeJS.Platform = process.platform,
  env: NodeJS.ProcessEnv = process.env,
  exists: Exists = existsSync,
): { command: string; args: readonly string[] } {
  const mapping = BUILTIN_PLATFORM_COMMANDS[target.id]
  if (mapping !== undefined && isDefaultTarget(target)) {
    const hit = mapping[platform]
    if (hit !== undefined) {
      return { command: resolveCodeOnWindows(hit.command, platform, env, exists), args: hit.args }
    }
  }
  return { command: resolveCodeOnWindows(target.command, platform, env, exists), args: target.args }
}

/**
 * Targets visible on a platform: enabled and not excluded by `platforms`.
 * @param targets - configured targets.
 * @param platform - host platform (injectable for tests).
 * @returns the visible targets in configuration order.
 */
export function visibleTargets(
  targets: readonly OpenTarget[],
  platform: NodeJS.Platform = process.platform,
): OpenTarget[] {
  return targets.filter(
    target => target.enabled !== false
      && (target.platforms.length === 0 || target.platforms.includes(platform)),
  )
}
