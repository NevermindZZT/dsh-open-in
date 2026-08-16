/**
 * Host composition behavior: the plugin module boots over a real cordis
 * Context with the real Typert registry, registers the openIn service and its
 * strict manifest, and the list/save/open @Remotes behave with the entry
 * config (no settings service is mounted in a bare Context, so the
 * composition entry stands and save fails loud). The editor seam is real (a
 * fixture script); only the process boundary is a fixture command.
 */
import { Context, symbols } from '@deepseek-ai/cordis'
import TypertRegistry from '@deepseek-ai/dsh-typert-registry'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import * as plugin from '../src/index.ts'
import type { OpenInRuntime } from '../src/runtime.ts'
import type { OpenTarget } from '../src/types.ts'

/** The unproxied service original (cordis caller-tracking may wrap instances). */
function originalOf(service: object): object {
  const original = Reflect.get(service, symbols.original) as object | undefined
  return original ?? service
}

/** A fixture "launcher": a node script that appends its directory argument to a marker file. */
async function fixtureLauncher(): Promise<{ root: string; marker: string; args: string[] }> {
  const root = await mkdtemp(join(tmpdir(), 'dsh-open-in-'))
  const marker = join(root, 'opened.log')
  const script = join(root, 'launcher.mjs')
  await writeFile(script, [
    "import { appendFileSync } from 'node:fs'",
    'const [marker, path] = process.argv.slice(2)',
    'appendFileSync(marker, path + String.fromCharCode(10))',
    '',
  ].join('\n'))
  return { root, marker, args: [script, marker] }
}

/** Mount the function-plugin module on a fresh context (harness test pattern). */
async function mount(ctx: Context, config?: plugin.Config) {
  const registryFiber = ctx.plugin(TypertRegistry)
  await registryFiber
  const fiber = ctx.plugin({ inject: plugin.inject, apply: plugin.apply }, config)
  await fiber
  return fiber
}

function target(overrides: Partial<OpenTarget>): OpenTarget {
  return { id: 'custom', label: '', command: 'tool', args: [], platforms: [], enabled: true, ...overrides }
}

const DEFAULT_FULL = [
  { id: 'vscode', label: '', command: 'code', args: [], platforms: [], enabled: true },
  { id: 'explorer', label: '', command: 'explorer', args: [], platforms: [], enabled: true },
  { id: 'terminal', label: '', command: 'wt', args: ['-d'], platforms: [], enabled: true },
]

describe('dsh-open-in host composition', () => {
  it('boots the plugin and registers the service under its own key', async () => {
    const ctx = new Context()
    const fiber = await mount(ctx)
    try {
      const runtime = ctx.get('openIn') as OpenInRuntime | undefined
      expect(runtime).toBeDefined()
      expect(Reflect.get(originalOf(runtime as OpenInRuntime), 'typertRemote').namespace).toBe('openIn')
    } finally {
      await fiber.dispose()
    }
  })

  it('registers the strict Typert manifest and withdraws it on disposal', async () => {
    const ctx = new Context()
    const fiber = await mount(ctx)
    const registry = ctx.get('typert') as TypertRegistry
    for (const endpoint of ['openIn/list', 'openIn/save', 'openIn/open']) {
      expect(registry.local.get(endpoint)).toMatchObject({
        service: 'openIn',
        namespace: 'openIn',
      })
    }
    expect(registry.local.get('openIn/list')?.id).toBe('dsh-open-in#openIn/list')
    expect(registry.local.get('openIn/save')?.id).toBe('dsh-open-in#openIn/save')
    expect(registry.local.get('openIn/open')?.id).toBe('dsh-open-in#openIn/open')
    await fiber.dispose()
    expect(registry.local.get('openIn/open')).toBeUndefined()
    expect(ctx.get('openIn')).toBeUndefined()
  })

  it('lists the default targets from the entry config, non-writable without settings', async () => {
    const ctx = new Context()
    const fiber = await mount(ctx)
    try {
      const runtime = ctx.get('openIn') as OpenInRuntime
      await expect(runtime.list()).resolves.toEqual({
        targets: DEFAULT_FULL,
        writable: false,
      })
    } finally {
      await fiber.dispose()
    }
  })

  it('lists composition targets filtered by platform and enabled', async () => {
    const ctx = new Context()
    const fiber = await mount(ctx, {
      targets: [
        target({ id: 'a', platforms: ['win32'] }),
        target({ id: 'b', platforms: ['darwin'] }),
        target({ id: 'c', enabled: false }),
        target({ id: 'd' }),
      ],
    })
    try {
      const runtime = ctx.get('openIn') as OpenInRuntime
      const listed = await runtime.list()
      expect(listed.targets.map(item => item.id)).toEqual(process.platform === 'win32' ? ['a', 'd'] : ['d'])
    } finally {
      await fiber.dispose()
    }
  })

  it('save fails loud when no settings service is mounted', async () => {
    const ctx = new Context()
    const fiber = await mount(ctx)
    try {
      const runtime = ctx.get('openIn') as OpenInRuntime
      await expect(runtime.save([target({ id: 'x' })])).rejects.toThrow(/settings service is absent/)
    } finally {
      await fiber.dispose()
    }
  })

  it('open launches the configured launcher on the directory', async () => {
    const fixture = await fixtureLauncher()
    try {
      const dir = join(fixture.root, 'workspace')
      const ctx = new Context()
      const fiber = await mount(ctx, {
        targets: [target({ id: 'editor', command: process.execPath, args: fixture.args })],
      })
      try {
        const runtime = ctx.get('openIn') as OpenInRuntime
        await expect(runtime.open('editor', dir, new AbortController().signal)).resolves.toEqual({ opened: true })
        await vi.waitFor(async () => {
          expect(await readFile(fixture.marker, 'utf8')).toContain(dir)
        })
      } finally {
        await fiber.dispose()
      }
    } finally {
      await rm(fixture.root, { recursive: true, force: true })
    }
  })

  it('open refuses a relative path', async () => {
    const ctx = new Context()
    const fiber = await mount(ctx)
    try {
      const runtime = ctx.get('openIn') as OpenInRuntime
      await expect(runtime.open('vscode', 'relative/path', new AbortController().signal))
        .rejects.toThrow(/refusing a relative path/)
    } finally {
      await fiber.dispose()
    }
  })

  it('open rejects an unknown or disabled target', async () => {
    const ctx = new Context()
    const fiber = await mount(ctx, { targets: [target({ id: 'x', enabled: false })] })
    try {
      const runtime = ctx.get('openIn') as OpenInRuntime
      await expect(runtime.open('missing', '/tmp', new AbortController().signal))
        .rejects.toThrow(/unknown or disabled target "missing"/)
      await expect(runtime.open('x', '/tmp', new AbortController().signal))
        .rejects.toThrow(/unknown or disabled target "x"/)
    } finally {
      await fiber.dispose()
    }
  })

  it('open rejects a target excluded by the host platform', async () => {
    const ctx = new Context()
    const fiber = await mount(ctx, { targets: [target({ id: 'mac', platforms: ['darwin'] })] })
    try {
      const runtime = ctx.get('openIn') as OpenInRuntime
      await expect(runtime.open('mac', '/tmp', new AbortController().signal))
        .rejects.toThrow(/not available on/)
    } finally {
      await fiber.dispose()
    }
  })

  it('open reports a missing executable with a fix hint', async () => {
    const ctx = new Context()
    const fiber = await mount(ctx, { targets: [target({ id: 'ghost', command: 'definitely-not-a-launcher-bin' })] })
    try {
      const runtime = ctx.get('openIn') as OpenInRuntime
      await expect(runtime.open('ghost', '/tmp', new AbortController().signal))
        .rejects.toThrow(/definitely-not-a-launcher-bin/)
      await expect(runtime.open('ghost', '/tmp', new AbortController().signal))
        .rejects.toThrow(/not on PATH/)
    } finally {
      await fiber.dispose()
    }
  })

  it('open rejects an already-aborted request without spawning', async () => {
    const ctx = new Context()
    const fiber = await mount(ctx, { targets: [target({ id: 'editor', command: process.execPath })] })
    try {
      const runtime = ctx.get('openIn') as OpenInRuntime
      const aborted = new AbortController()
      aborted.abort()
      await expect(runtime.open('editor', '/tmp', aborted.signal)).rejects.toThrow(/aborted/)
    } finally {
      await fiber.dispose()
    }
  })
})
