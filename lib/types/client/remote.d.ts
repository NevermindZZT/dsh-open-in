/**
 * The client-side Typert Remote contribution for the dsh-open-in host
 * service: mounts the shared strict descriptors into `ctx.remote.openIn`.
 * The descriptors and codecs come from the shared contract module, so the
 * browser bundle and the host manifest stay on one wire definition.
 */
import type { RemoteResult, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol';
import type { OpenTarget } from '../types.ts';
/** The openIn Remote namespace's client contribution. */
export declare const OPEN_IN_REMOTE: TypertRemoteContribution;
declare module '@deepseek-ai/dsh-typert-protocol' {
    /** The `openIn` namespace face mounted under `ctx.remote.openIn`. */
    interface TypertRemoteNamespaceMap {
        openIn: {
            list(signal?: AbortSignal): Promise<RemoteResult<{
                targets: readonly OpenTarget[];
                writable: boolean;
            }>>;
            save(targets: OpenTarget[], signal?: AbortSignal): Promise<RemoteResult<{
                saved: true;
            }>>;
            open(targetId: string, path: string, signal?: AbortSignal): Promise<RemoteResult<{
                opened: true;
            }>>;
        };
    }
    interface TypertRemoteMap {
        'openIn/list': (signal?: AbortSignal) => Promise<RemoteResult<{
            targets: readonly OpenTarget[];
            writable: boolean;
        }>>;
        'openIn/save': (targets: OpenTarget[], signal?: AbortSignal) => Promise<RemoteResult<{
            saved: true;
        }>>;
        'openIn/open': (targetId: string, path: string, signal?: AbortSignal) => Promise<RemoteResult<{
            opened: true;
        }>>;
    }
}
