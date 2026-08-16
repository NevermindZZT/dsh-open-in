import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import { type OpenInKey } from './locales.ts';
import type { TargetSummary } from '../types.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** The workspace overflow-menu row copy. */
        'dsh-open-in': OpenInKey;
    }
    interface SlotMap {
        /**
         * The workspace overflow-menu row hole (declared by a newer ui-workspace
         * than the published rc.6; the legacy DOM adapter below covers rc.6).
         */
        'sidebar.workspaces.row-menu': {
            kind: 'single';
            scope: 'root';
            owner: {
                /** Display title of the Workspace. */
                label: string;
                /** Absolute directory path; absent rows render nothing. */
                cwd: string | undefined;
                /** Close the Workspace overflow menu before launching. */
                onClose: () => void;
            };
        };
    }
}
/** The rows' business face: the host Remote calls behind the menu actions. */
export interface OpenInInjected {
    /** Menu rows to render, in configuration order. */
    targets: readonly TargetSummary[];
    /**
     * Open one absolute directory with a configured target.
     * @param targetId - configured target id.
     * @param path - absolute directory path.
     * @returns fulfillment after the launch is accepted.
     */
    open: (targetId: string, path: string) => Promise<void>;
}
/** Full rows props: the slot's owner share + the locale seat + the inject face. */
export type OpenInRowsProps = PropsRuntime<'sidebar.workspaces.row-menu'> & PropsLocale<'dsh-open-in'> & OpenInInjected;
/** Minimal presentation props shared by the native slot and legacy adapter. */
export interface OpenInMenuRowProps {
    /** One menu row to render. */
    target: TargetSummary;
    /** Display title of the Workspace. */
    label: string;
    /** Absolute directory path; absent rows render nothing. */
    cwd: string | undefined;
    /** Close the Workspace overflow menu before launching. */
    onClose: () => void;
    /**
     * Open one absolute directory with the row's target.
     * @param targetId - configured target id.
     * @param path - absolute directory path.
     * @returns fulfillment after the launch is accepted.
     */
    open: (targetId: string, path: string) => Promise<void>;
    /** Locale-bound translation seat. */
    t: OpenInRowsProps['t'];
    /** Launch on pointerdown when a legacy menu removes injected DOM before click. */
    eagerPointerActivation?: boolean;
}
/**
 * Resolve a row's display label: the configured label wins; built-in ids
 * fall back to the `target.<id>` dictionary key; unknown ids fall back to
 * the id itself.
 * @param id - target id.
 * @param t - locale-bound translate seat.
 * @returns the display label.
 */
export declare function targetRowLabel(id: string, t: OpenInRowsProps['t']): string;
/**
 * Render one locale-following launcher row for one Workspace row.
 * @param props - target + workspace identity, close callback, open face, locale seat.
 * @returns the menu row, or nothing for a row without a directory.
 */
export declare function OpenInMenuRow({ target, cwd, label, onClose, open, t, eagerPointerActivation, }: OpenInMenuRowProps): import("react").JSX.Element | null;
/** Native row-menu slot entry: one row per visible target. */
export declare function OpenInRows(props: OpenInRowsProps): import("react").JSX.Element | null;
