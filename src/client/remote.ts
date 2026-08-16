/**
 * The client-side Typert Remote contribution for the dsh-open-in host
 * service: mounts the shared strict descriptors into `ctx.remote.openIn`.
 * The descriptors and codecs come from the shared contract module, so the
 * browser bundle and the host manifest stay on one wire definition.
 */
import type { RemoteResult, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import { OPEN_IN_INVOCATIONS } from '../contract.ts'
import type { OpenTarget } from '../types.ts'

/** The openIn Remote namespace's client contribution. */
export const OPEN_IN_REMOTE: TypertRemoteContribution = {
  package: 'dsh-open-in',
  descriptors: OPEN_IN_INVOCATIONS,
}

declare module '@deepseek-ai/dsh-typert-protocol' {
  // Typed faces of the mounted namespace. Note: the runtime access is NOT the
  // dotted `ctx.remote.openIn` read — that path walks the cordis fiber chain
  // and stops at the Loader's runtime-less internal forks between a plugin
  // entry and the root fiber. The plugin resolves the namespace service
  // through `ctx.reflect.get('remote.openIn')` instead (see client/index.ts).
  /** The `openIn` namespace face mounted under `ctx.remote.openIn`. */
  interface TypertRemoteNamespaceMap {
    openIn: {
      list(signal?: AbortSignal): Promise<RemoteResult<{ targets: readonly OpenTarget[]; writable: boolean }>>
      save(targets: OpenTarget[], signal?: AbortSignal): Promise<RemoteResult<{ saved: true }>>
      open(targetId: string, path: string, signal?: AbortSignal): Promise<RemoteResult<{ opened: true }>>
    }
  }
  interface TypertRemoteMap {
    'openIn/list': (signal?: AbortSignal) => Promise<RemoteResult<{ targets: readonly OpenTarget[]; writable: boolean }>>
    'openIn/save': (targets: OpenTarget[], signal?: AbortSignal) => Promise<RemoteResult<{ saved: true }>>
    'openIn/open': (targetId: string, path: string, signal?: AbortSignal) => Promise<RemoteResult<{ opened: true }>>
  }
}
