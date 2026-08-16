import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { OpenTarget, ResolvedConfig } from './types.ts';
/**
 * Live configuration handle the runtime reads and writes through. The read
 * source tracks the settings namespace when one is mounted (schema defaults →
 * cordis entry as `base` → the user settings document) and falls back to the
 * entry otherwise; `save` persists through the host settings service.
 */
export interface OpenInConfigHandle {
    /** Read the current resolved configuration. */
    get(): ResolvedConfig;
    /**
     * Persist a target list through the host settings namespace.
     * @param targets - validated target list.
     */
    save(targets: OpenTarget[]): Promise<void>;
    /** Whether the settings document accepts writes (false without a settings service). */
    readonly writable: boolean;
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
export declare function launch(command: string, args: readonly string[], path: string, signal?: AbortSignal): Promise<void>;
/** Open-in launcher service: list/save targets, launch one on a directory. */
export declare class OpenInRuntime extends TypertRemoteService {
    private readonly config;
    /**
     * Register the service under the `openIn` key (the wire namespace).
     * @param ctx - owning cordis context.
     * @param config - live configuration handle (settings-aware).
     */
    constructor(ctx: Context, config: OpenInConfigHandle);
    /**
     * List the targets the client renders: enabled targets, filtered by the
     * host platform, plus whether the settings document accepts writes.
     * @returns the visible targets in configuration order and writability.
     */
    list(): Promise<{
        targets: readonly OpenTarget[];
        writable: boolean;
    }>;
    /**
     * Persist a validated target list through the host settings namespace;
     * the next list/open call reads the new value (live application).
     * @param targets - the complete target list.
     * @param signal - caller lifetime.
     * @returns the accepted persist.
     */
    save(targets: OpenTarget[], signal?: AbortSignal): Promise<{
        saved: true;
    }>;
    /**
     * Open one absolute directory with a configured target.
     * @param targetId - configured target id; unknown or disabled ids are rejected.
     * @param path - absolute directory path from the workspace row.
     * @param signal - caller lifetime; an abort before launch cancels the open.
     * @returns the accepted launch.
     */
    open(targetId: string, path: string, signal?: AbortSignal): Promise<{
        opened: true;
    }>;
}
