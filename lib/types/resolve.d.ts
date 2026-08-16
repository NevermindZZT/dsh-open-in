import type { OpenTarget } from './types.ts';
type Exists = (path: string) => boolean;
/** Standard Windows VS Code executable locations, with PATH-derived locations first. */
export declare function candidateWindowsVsCodePaths(env?: NodeJS.ProcessEnv): string[];
/**
 * Resolve the executable and args for one target on the host platform.
 * @param target - configured target.
 * @param platform - host platform (injectable for tests).
 * @param env - process environment (injectable for tests).
 * @param exists - existence probe (injectable for tests).
 * @returns the command line that opens a directory.
 */
export declare function resolveTargetCommand(target: OpenTarget, platform?: NodeJS.Platform, env?: NodeJS.ProcessEnv, exists?: Exists): {
    command: string;
    args: readonly string[];
};
/**
 * Targets visible on a platform: enabled and not excluded by `platforms`.
 * @param targets - configured targets.
 * @param platform - host platform (injectable for tests).
 * @returns the visible targets in configuration order.
 */
export declare function visibleTargets(targets: readonly OpenTarget[], platform?: NodeJS.Platform): OpenTarget[];
export {};
