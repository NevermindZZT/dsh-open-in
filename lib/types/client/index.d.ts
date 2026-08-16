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
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
/** Required services: slots, the gateway Remote face, and locale. */
export declare const inject: string[];
/**
 * Compose the workspace overflow-menu rows and the settings card.
 * @param ctx - client root context.
 */
export declare function apply(ctx: ClientContext): void;
