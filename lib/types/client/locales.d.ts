/**
 * `dsh-open-in` locale namespace: the workspace overflow-menu row copy.
 * Chinese is the product copy; English mirrors it.
 */
/** Simplified Chinese dictionary (the key-set source of truth). */
export declare const zh: {
    'row.openIn.aria': string;
    'target.vscode': string;
    'target.explorer': string;
    'target.terminal': string;
    'error.notMounted': string;
    'error.openFailed': string;
    'settings.title': string;
    'settings.description': string;
    'settings.expand': string;
    'settings.collapse': string;
    'settings.unsaved': string;
    'settings.readonly': string;
    'settings.id': string;
    'settings.label': string;
    'settings.label.placeholder': string;
    'settings.command': string;
    'settings.args': string;
    'settings.platforms': string;
    'settings.enabled': string;
    'settings.add': string;
    'settings.remove': string;
    'settings.removeAction': string;
    'settings.save': string;
    'settings.saving': string;
    'settings.discard': string;
    'settings.invalid': string;
    'settings.failed': string;
    'settings.loadFailed': string;
    'settings.error.idRequired': string;
    'settings.error.idDuplicate': string;
    'settings.error.idDuplicateNamed': string;
    'settings.error.commandRequired': string;
};
/** The `dsh-open-in` namespace key union. */
export type OpenInKey = keyof typeof zh;
/** English dictionary, checked complete against the zh key set. */
export declare const en: {
    'row.openIn.aria': string;
    'target.vscode': string;
    'target.explorer': string;
    'target.terminal': string;
    'error.notMounted': string;
    'error.openFailed': string;
    'settings.title': string;
    'settings.description': string;
    'settings.expand': string;
    'settings.collapse': string;
    'settings.unsaved': string;
    'settings.readonly': string;
    'settings.id': string;
    'settings.label': string;
    'settings.label.placeholder': string;
    'settings.command': string;
    'settings.args': string;
    'settings.platforms': string;
    'settings.enabled': string;
    'settings.add': string;
    'settings.remove': string;
    'settings.removeAction': string;
    'settings.save': string;
    'settings.saving': string;
    'settings.discard': string;
    'settings.invalid': string;
    'settings.failed': string;
    'settings.loadFailed': string;
    'settings.error.idRequired': string;
    'settings.error.idDuplicate': string;
    'settings.error.idDuplicateNamed': string;
    'settings.error.commandRequired': string;
};
/** Locale namespace id registered under ctx.locale. */
export declare const NS = "dsh-open-in";
/**
 * Fill one dictionary template's `{name}`-style placeholders.
 * @param template - dictionary text.
 * @param params - placeholder values; absent params replace nothing.
 * @returns the filled text.
 */
export declare function fmt(template: string, params: Record<string, string>): string;
