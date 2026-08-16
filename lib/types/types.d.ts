/**
 * Shared host types for dsh-open-in. The client half imports only the
 * wire-safe {@link TargetSummary} shape (type-only, erased at build).
 */
/** One configurable open target: a launcher command line plus visibility rules. */
export interface OpenTarget {
    /** Stable id; the client references targets by id on the wire. */
    id: string;
    /** Menu label; an empty string falls back to the built-in locale key for the id. */
    label: string;
    /** Executable that opens a directory, resolved through PATH (built-ins get platform mapping). */
    command: string;
    /** Extra arguments passed before the directory path. */
    args: string[];
    /** Platform allowlist; an empty array means every platform. */
    platforms: string[];
    /** Disabled targets are never listed or launched. */
    enabled: boolean;
}
/** Validated plugin configuration (schema defaults applied). */
export interface ResolvedConfig {
    targets: OpenTarget[];
}
/** Wire-safe target summary the client renders as menu rows. */
export interface TargetSummary {
    id: string;
    label: string;
}
