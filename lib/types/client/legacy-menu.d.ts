import { type OpenInMenuRowProps } from './rows.tsx';
import type { TargetSummary } from '../types.ts';
interface WorkspaceItem {
    title: string;
    path: string;
}
interface WorkspaceListSource {
    getSnapshot(): {
        items: readonly WorkspaceItem[];
    };
}
export interface LegacyWorkspaceMenuOptions {
    workspaces: WorkspaceListSource;
    workspaceT: WorkspaceTranslate;
    rowT: OpenInMenuRowProps['t'];
    targets: () => readonly TargetSummary[];
    open: (targetId: string, path: string) => Promise<void>;
}
type WorkspaceTranslate = (key: 'actions.workspace.aria' | 'rename' | 'delete.workspace', params?: Record<string, unknown>) => string;
/**
 * Add the dsh-open-in rows to the published rc.6 Workspace menu.
 * @returns disposer removing listeners, observers, and any mounted rows.
 */
export declare function installLegacyWorkspaceMenu(options: LegacyWorkspaceMenuOptions): () => void;
export {};
