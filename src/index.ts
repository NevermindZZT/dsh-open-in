/**
 * dsh-open-in host plugin: mounts the `openIn` Typert Remote service (list
 * and persist the launcher targets, open one workspace directory in a chosen
 * launcher) and registers its strict Typert manifest. The launcher
 * configuration is live: while a settings service exists, the `dsh-open-in`
 * settings namespace resolves schema defaults → the cordis composition entry
 * → the user settings document, and every list/open call reads the current
 * value; `save` persists through the host settings service (the Web client
 * reaches it via the openIn Remote, because rc.6's settings API serves a
 * fixed allowlist of namespaces that excludes third-party ones). Without a
 * settings service, the composition entry stands and `save` fails loud.
 * The client half ships in the same package (`./client`); the web server
 * serves it under /plugins/dsh-open-in/client.js, and it registers the
 * per-target rows into the harness's workspace overflow-menu slot plus a
 * targets editor card in Settings → Plugins.
 */
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
// Type-only: brings the `ctx.typert` Context merge into this program.
import type {} from '@deepseek-ai/dsh-typert-registry'
import { settingsNamespace, type SettingsScope } from '@deepseek-ai/dsh-settings'
import { OpenInRuntime, type OpenInConfigHandle } from './runtime.ts'
import { TYPERT_MANIFEST } from './typert.ts'
import { defaultTargets } from './targets.ts'
import type { OpenTarget, ResolvedConfig } from './types.ts'

/** Cordis plugin name (the Loader entry and client bundle id). */
export const name = 'dsh-open-in'

/** Services required before load: the Typert registry. */
export const inject = ['typert']

/** Deployment configuration: which launchers the workspace menu offers. */
export interface Config {
  targets: OpenTarget[]
}

/** Raw (partial) configuration input the schema accepts and normalizes. */
export interface ConfigInput {
  targets?: OpenTarget[] | null
}

export const OpenTargetSchema = z.object({
  id: z.string().required(),
  label: z.string().default(''),
  command: z.string().required(),
  args: z.array(z.string()).default([]),
  platforms: z.array(z.string()).default([]),
  enabled: z.boolean().default(true),
})

/**
 * Configuration schema: deployment-varying choices stay tunable from
 * cordis.yml AND from Settings → Plugins (the settings namespace shares this
 * schema). The annotated type keeps the callable form accepting partial
 * input, so `Config({})` yields the defaults (what the Loader does for
 * cordis.yml compositions). An explicit annotation also keeps the emitted
 * declaration free of transitive cosmokit type references.
 */
export const Config: Schemastery<ConfigInput, ResolvedConfig> = z.object({
  targets: z.array(OpenTargetSchema).default(defaultTargets()),
})

/**
 * Mount the open-in service, its live settings wiring, and its strict Typert
 * manifest.
 * @param ctx - host cordis context.
 * @param config - validated plugin configuration (schema defaults applied).
 */
export function apply(ctx: Context, config?: Config): void {
  const entry: ResolvedConfig = Config(config ?? {})
  // Live configuration source: the cordis entry while no settings service is
  // mounted; once the `dsh-open-in` namespace registers (schema defaults →
  // cordis entry as `base` → the user settings document), the source tracks
  // the resolved scope, so Settings edits apply to the next list/open call.
  // The write scope stays host-local: rc.6's settings API serves a fixed
  // allowlist of namespaces to the Web client, so the client persists through
  // the openIn Remote instead of the settings transport.
  let source: () => ResolvedConfig = () => entry
  let writeScope: SettingsScope<ResolvedConfig> | undefined
  let writable = false
  ctx.inject(['settings'], (sctx) => {
    const scope = sctx.settings.register(settingsNamespace('dsh-open-in'), Config, { base: entry })
    writeScope = scope
    writable = sctx.settings.writable
    source = () => scope.get()
    console.log('[dsh-open-in] settings namespace attached; edits apply live')
    sctx.effect(() => () => {
      writeScope = undefined
      writable = false
      source = () => entry
    })
  })
  const handle: OpenInConfigHandle = {
    get: () => source(),
    get writable() { return writable },
    save: async (targets) => {
      if (writeScope === undefined) {
        throw new Error('dsh-open-in: settings service is absent; cannot persist targets (edit cordis.yml instead)')
      }
      // Schema validation with defaults fills partial rows and rejects bad ones.
      const validated = Config({ targets })
      await writeScope.replace({ targets: validated.targets })
    },
  }
  new OpenInRuntime(ctx, handle)
  // Strict endpoint registration: the gateway resolves openIn/list,
  // openIn/save, and openIn/open from this manifest, independent of decorator
  // marker state.
  ctx.effect(() => {
    const dispose = ctx.typert.register(TYPERT_MANIFEST)
    return () => { void dispose() }
  }, 'dsh-open-in: typert manifest')
}
