/**
 * The hand-written host Typert manifest for the openIn Remote. Registered
 * through `ctx.typert.register` in the plugin body, it claims the wire
 * endpoints through the strict registry — the same path generated `./typert`
 * artifacts use — so the Host Gateway resolves and invokes `openIn/*`
 * without consulting the `@Remote` marker table. That marker independence
 * matters in source-launch environments where the gateway and a
 * profile-loaded plugin bundle can hold separate copies of the decorator
 * module state.
 */
import type { TypertContribution } from '@deepseek-ai/dsh-typert-registry/types'
import { OPEN_IN_INVOCATIONS } from './contract.ts'

/** The openIn namespace's host manifest (strict codecs shared with the client). */
export const TYPERT_MANIFEST: TypertContribution = {
  package: 'dsh-open-in',
  face: 'host',
  schemas: [],
  model: {
    services: [
      {
        key: 'openIn',
        exportName: 'OpenInRuntime',
        description: 'Open one workspace directory with a configured launcher (editor / file manager / terminal).',
        tags: [],
        members: [
          {
            kind: 'method',
            name: 'list',
            signature: 'list(): Promise<{ targets: readonly OpenTarget[]; writable: boolean }>',
          },
          {
            kind: 'method',
            name: 'save',
            signature: 'save(targets: OpenTarget[], signal?: AbortSignal): Promise<{ saved: true }>',
          },
          {
            kind: 'method',
            name: 'open',
            signature: 'open(targetId: string, path: string, signal?: AbortSignal): Promise<{ opened: true }>',
          },
        ],
        types: [],
      },
    ],
    events: [],
    objects: [],
  },
  invocations: OPEN_IN_INVOCATIONS,
}
