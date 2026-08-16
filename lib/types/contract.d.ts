/**
 * The dsh-open-in wire contract, shared verbatim by the host manifest
 * (`ctx.typert.register` in typert.ts) and the client contribution
 * (`ctx.remote.$mount` in client/remote.ts). Three endpoints: `list` returns
 * the enabled, platform-visible targets (full shape for the Settings editor)
 * plus whether the settings document accepts writes; `save` persists a
 * validated target list through the host settings namespace; `open` launches
 * one target on one absolute directory.
 */
import { z } from 'zod';
import type { InvocationDescriptor } from '@deepseek-ai/dsh-typert-protocol';
/** Wire codec: a target id. */
export declare const targetIdSchema: z.ZodString;
/** Wire codec: the absolute directory path to open. */
export declare const pathSchema: z.ZodString;
/** Wire codec: one full open target (the Settings editor shape). */
export declare const openTargetSchema: z.ZodReadonly<z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    command: z.ZodString;
    args: z.ZodArray<z.ZodString>;
    platforms: z.ZodArray<z.ZodString>;
    enabled: z.ZodBoolean;
}, z.core.$strip>>;
/** Wire codec: the launch result — the launcher was accepted. */
export declare const openResultSchema: z.ZodReadonly<z.ZodObject<{
    opened: z.ZodLiteral<true>;
}, z.core.$strip>>;
/** Wire codec: the visible-target list plus settings writability. */
export declare const listResultSchema: z.ZodReadonly<z.ZodObject<{
    targets: z.ZodArray<z.ZodReadonly<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        command: z.ZodString;
        args: z.ZodArray<z.ZodString>;
        platforms: z.ZodArray<z.ZodString>;
        enabled: z.ZodBoolean;
    }, z.core.$strip>>>;
    writable: z.ZodBoolean;
}, z.core.$strip>>;
/** Wire codec: the persist result — the settings document accepted the list. */
export declare const saveResultSchema: z.ZodReadonly<z.ZodObject<{
    saved: z.ZodLiteral<true>;
}, z.core.$strip>>;
/** The openIn Remote namespace's strict invocation descriptors. */
export declare const OPEN_IN_INVOCATIONS: readonly InvocationDescriptor[];
