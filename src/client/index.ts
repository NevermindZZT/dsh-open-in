/**
 * dsh-open-in client plugin: the browser half. Two surfaces:
 *
 * - Workspace overflow-menu "open with …" rows: mounts the openIn Remote
 *   namespace, lists the configured targets, and registers one row per target
 *   into the harness's `sidebar.workspaces.row-menu` slot, with zh/en
 *   dictionaries.
 * - Settings → Plugins card: a structured targets editor (add / edit /
 *   remove) registered into the `settings.plugin.item` slot. rc.6's settings
 *   API serves a fixed allowlist of namespaces to the Web client, so the card
 *   reads and writes through the openIn Remote (`list`/`save`), which the
 *   host persists through its settings namespace.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the ui-workspace SlotMap/LocaleNamespaceMap merges.
import type {} from '@deepseek-ai/dsh-client-ui-workspace/client'
// Type-only: brings the ctx.locale Context merge.
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: brings the `settings.plugin.item` SlotMap declaration.
import type {} from '@deepseek-ai/dsh-client-ui-settings-plugins/client'
import { OPEN_IN_REMOTE } from './remote.ts'
import { NS, en, zh } from './locales.ts'
import { OpenInRows, type OpenInInjected } from './rows.tsx'
import { installLegacyWorkspaceMenu } from './legacy-menu.tsx'
import { adoptStyles } from './styles.ts'
import { TargetsSettingsCard, type TargetsSettingsCardInjected } from './targets-card.tsx'
import type { OpenTarget, TargetSummary } from '../types.ts'

/** Required services: slots, the gateway Remote face, and locale. */
export const inject = ['slots', 'remote', 'locale', 'workspaces']

/** The mounted openIn namespace service's callable face. */
interface OpenInNamespaceFace {
  list(signal?: AbortSignal): Promise<
    { ok: true; value: { targets: readonly OpenTarget[]; writable: boolean } } | { ok: false; error: { code: string; message: string; details: object } }
  >
  save(targets: OpenTarget[], signal?: AbortSignal): Promise<
    { ok: true; value: { saved: true } } | { ok: false; error: { code: string; message: string; details: object } }
  >
  open(targetId: string, path: string, signal?: AbortSignal): Promise<
    { ok: true; value: { opened: true } } | { ok: false; error: { code: string; message: string; details: object } }
  >
}

/**
 * Compose the workspace overflow-menu rows and the settings card.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  adoptStyles()
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-open-in: dictionaries')

  // The mounted namespace handle resolves through the service store
  // (`ctx.reflect.get`), not through `ctx.remote.openIn`: the generated-style
  // dotted read walks the cordis fiber chain, which stops at the Loader's
  // runtime-less internal forks between a plugin entry and the root fiber —
  // the namespace service mounted under the gateway entry is unreachable that
  // way (the store path resolves it by isolation label).
  let openIn: OpenInNamespaceFace | undefined
  let targets: TargetSummary[] = []
  ctx.effect(async () => {
    const dispose = await ctx.remote.$mount(OPEN_IN_REMOTE)
    openIn = (ctx.reflect as unknown as { get(name: string): unknown })
      .get('remote.openIn') as OpenInNamespaceFace | undefined
    if (openIn === undefined) {
      throw new Error('dsh-open-in: the openIn Remote namespace did not mount')
    }
    const listed = await openIn.list()
    if (listed.ok) {
      targets = listed.value.targets.map(target => ({ id: target.id, label: target.label }))
    } else {
      console.error('[dsh-open-in] listing targets failed:', listed.error.code, listed.error.message)
    }
    return () => {
      targets = []
      openIn = undefined
      void dispose()
    }
  }, 'dsh-open-in: remote')

  const open = async (targetId: string, path: string): Promise<void> => {
    if (openIn === undefined) {
      throw new Error('dsh-open-in: the openIn Remote is not mounted')
    }
    const result = await openIn.open(targetId, path)
    if (!result.ok) {
      throw new Error(`dsh-open-in: ${result.error.code}: ${result.error.message}`)
    }
  }

  // The inject factory reads the current target snapshot at mount time; by
  // the time a workspace menu renders, the boot-time remote listing has long
  // settled, so the rows carry the configured targets.
  const face = (): OpenInInjected => ({ targets, open })

  ctx.slots.inject('sidebar.workspaces.row-menu', () => ctx.slots.register({
    name: 'sidebar.workspaces.row-menu',
    locale: NS,
    inject: face,
  }, OpenInRows))

  // The latest public npm build (0.1.0-rc.6) predates the Workspace row-menu
  // slot. Keep its DOM adapter live only while that declaration is absent;
  // a newer runtime declaring the slot immediately tears the adapter down.
  ctx.effect(() => {
    let disposeLegacy: (() => void) | undefined
    const reconcile = (): void => {
      const native = ctx.slots.spec('sidebar.workspaces.row-menu') !== undefined
      if (native) {
        disposeLegacy?.()
        disposeLegacy = undefined
      } else if (disposeLegacy === undefined) {
        disposeLegacy = installLegacyWorkspaceMenu({
          workspaces: ctx.workspaces.list,
          workspaceT: ctx.locale.bind('workspace'),
          rowT: ctx.locale.bind(NS),
          targets: () => targets,
          open,
        })
      }
    }
    const unsubscribe = ctx.slots.subscribe('sidebar.workspaces.row-menu', reconcile)
    reconcile()
    return () => {
      unsubscribe()
      disposeLegacy?.()
    }
  }, 'dsh-open-in: rc.6 workspace-menu compatibility')

  // Settings → Plugins card: read/write through the openIn Remote (the rc.6
  // settings API does not serve third-party namespaces to the Web client).
  // The slot inject waits for the Plugins section to declare
  // `settings.plugin.item`; a deployment without it just never mounts.
  const load = async (): Promise<{ targets: OpenTarget[]; writable: boolean }> => {
    if (openIn === undefined) {
      throw new Error('dsh-open-in: the openIn Remote is not mounted')
    }
    const result = await openIn.list()
    if (!result.ok) {
      throw new Error(`dsh-open-in: ${result.error.code}: ${result.error.message}`)
    }
    return { targets: [...result.value.targets], writable: result.value.writable }
  }
  const save = async (next: OpenTarget[]): Promise<void> => {
    if (openIn === undefined) {
      throw new Error('dsh-open-in: the openIn Remote is not mounted')
    }
    const result = await openIn.save(next)
    if (!result.ok) {
      throw new Error(`dsh-open-in: ${result.error.code}: ${result.error.message}`)
    }
  }
  const cardFace = (): TargetsSettingsCardInjected => ({ load, save })
  ctx.slots.inject('settings.plugin.item', () => {
    console.info('[dsh-open-in] registering Settings card into settings.plugin.item')
    return ctx.slots.register({
      name: 'settings.plugin.item',
      id: 'dsh-open-in',
      order: 100,
      locale: NS,
      inject: cardFace,
    }, TargetsSettingsCard)
  })
}
