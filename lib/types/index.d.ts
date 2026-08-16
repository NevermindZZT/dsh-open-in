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
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import type { OpenTarget, ResolvedConfig } from './types.ts';
/** Cordis plugin name (the Loader entry and client bundle id). */
export declare const name = "dsh-open-in";
/** Services required before load: the Typert registry. */
export declare const inject: string[];
/** Deployment configuration: which launchers the workspace menu offers. */
export interface Config {
    targets: OpenTarget[];
}
/** Raw (partial) configuration input the schema accepts and normalizes. */
export interface ConfigInput {
    targets?: OpenTarget[] | null;
}
export declare const OpenTargetSchema: z<Schemastery.ObjectS<{
    id: z<string, string>;
    label: z<string, string>;
    command: z<string, string>;
    args: z<string[], string[]>;
    platforms: z<string[], string[]>;
    enabled: z<boolean, boolean>;
}>, Schemastery.ObjectT<{
    id: z<string, string>;
    label: z<string, string>;
    command: z<string, string>;
    args: z<string[], string[]>;
    platforms: z<string[], string[]>;
    enabled: z<boolean, boolean>;
}>>;
/**
 * Configuration schema: deployment-varying choices stay tunable from
 * cordis.yml AND from Settings → Plugins (the settings namespace shares this
 * schema). The annotated type keeps the callable form accepting partial
 * input, so `Config({})` yields the defaults (what the Loader does for
 * cordis.yml compositions). An explicit annotation also keeps the emitted
 * declaration free of transitive cosmokit type references.
 */
export declare const Config: Schemastery<ConfigInput, ResolvedConfig>;
/**
 * Mount the open-in service, its live settings wiring, and its strict Typert
 * manifest.
 * @param ctx - host cordis context.
 * @param config - validated plugin configuration (schema defaults applied).
 */
export declare function apply(ctx: Context, config?: Config): void;
