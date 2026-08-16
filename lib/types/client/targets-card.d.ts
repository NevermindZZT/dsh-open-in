import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { OpenTarget } from '../types.ts';
/** The card's business face: the openIn Remote calls behind the editor. */
export interface TargetsSettingsCardInjected {
    /**
     * Fetch the current targets plus whether the settings document accepts writes.
     * @returns the visible targets and writability.
     */
    load: () => Promise<{
        targets: OpenTarget[];
        writable: boolean;
    }>;
    /**
     * Persist a complete target list through the host settings namespace.
     * @param targets - the complete target list.
     */
    save: (targets: OpenTarget[]) => Promise<void>;
}
/** Full card props: slot owner share (empty) + locale seat + the Remote face. */
export type TargetsSettingsCardProps = PropsRuntime<'settings.plugin.item'> & PropsLocale<'dsh-open-in'> & TargetsSettingsCardInjected;
/**
 * Render the collapsible targets editor card.
 * @param props - the load/save face, the locale seat, and the slot's standard props.
 * @returns the card, or nothing while the initial load is in flight.
 */
export declare function TargetsSettingsCard({ load, save: saveTargets, t }: TargetsSettingsCardProps): import("react").JSX.Element | null;
