/**
 * The dsh-open-in wire contract, shared verbatim by the host manifest
 * (`ctx.typert.register` in typert.ts) and the client contribution
 * (`ctx.remote.$mount` in client/remote.ts). Three endpoints: `list` returns
 * the enabled, platform-visible targets (full shape for the Settings editor)
 * plus whether the settings document accepts writes; `save` persists a
 * validated target list through the host settings namespace; `open` launches
 * one target on one absolute directory.
 */
import { z } from 'zod'
import type { InvocationDescriptor } from '@deepseek-ai/dsh-typert-protocol'

/** Wire codec: a target id. */
export const targetIdSchema = z.string().min(1)

/** Wire codec: the absolute directory path to open. */
export const pathSchema = z.string().min(1)

/** Wire codec: one full open target (the Settings editor shape). */
export const openTargetSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  command: z.string().min(1),
  args: z.array(z.string()),
  platforms: z.array(z.string()),
  enabled: z.boolean(),
}).readonly()

/** Wire codec: the launch result — the launcher was accepted. */
export const openResultSchema = z.object({ opened: z.literal(true) }).readonly()

/** Wire codec: the visible-target list plus settings writability. */
export const listResultSchema = z.object({
  targets: z.array(openTargetSchema),
  writable: z.boolean(),
}).readonly()

/** Wire codec: the persist result — the settings document accepted the list. */
export const saveResultSchema = z.object({ saved: z.literal(true) }).readonly()

/** The openIn Remote namespace's strict invocation descriptors. */
export const OPEN_IN_INVOCATIONS: readonly InvocationDescriptor[] = [
  {
    id: 'dsh-open-in#openIn/list',
    service: 'openIn',
    namespace: 'openIn',
    method: 'list',
    invocation: { kind: 'direct' },
    parameters: [],
    result: {
      mode: 'strict',
      typeSymbol: 'dsh-open-in#ListResult',
      schema: listResultSchema,
    },
  },
  {
    id: 'dsh-open-in#openIn/save',
    service: 'openIn',
    namespace: 'openIn',
    method: 'save',
    invocation: { kind: 'direct' },
    parameters: [
      {
        name: 'targets',
        wire: 'targets',
        source: 'json',
        codec: { mode: 'strict', typeSymbol: 'dsh-open-in#Targets', schema: z.array(openTargetSchema) },
      },
    ],
    cancellation: { parameter: 'signal' },
    result: {
      mode: 'strict',
      typeSymbol: 'dsh-open-in#SaveResult',
      schema: saveResultSchema,
    },
  },
  {
    id: 'dsh-open-in#openIn/open',
    service: 'openIn',
    namespace: 'openIn',
    method: 'open',
    invocation: { kind: 'direct' },
    parameters: [
      {
        name: 'targetId',
        wire: 'targetId',
        source: 'json',
        codec: { mode: 'strict', typeSymbol: 'dsh-open-in#TargetId', schema: targetIdSchema },
      },
      {
        name: 'path',
        wire: 'path',
        source: 'json',
        codec: { mode: 'strict', typeSymbol: 'dsh-open-in#Path', schema: pathSchema },
      },
    ],
    cancellation: { parameter: 'signal' },
    result: {
      mode: 'strict',
      typeSymbol: 'dsh-open-in#OpenResult',
      schema: openResultSchema,
    },
  },
]
