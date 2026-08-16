/**
 * `dsh-open-in` locale namespace: the workspace overflow-menu row copy.
 * Chinese is the product copy; English mirrors it.
 */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'row.openIn.aria': '用 {target} 打开 {name}',
  'target.vscode': '在 VS Code 中打开',
  'target.explorer': '在文件管理器中打开',
  'target.terminal': '在终端中打开',
  'error.notMounted': '打开方式服务未就绪',
  'error.openFailed': '打开失败：{message}',
  'settings.title': '打开方式',
  'settings.description': '配置工作区菜单中的"打开方式"：添加、修改或删除打开目标（VS Code、文件管理器、终端等）。',
  'settings.expand': '展开',
  'settings.collapse': '折叠',
  'settings.unsaved': '未保存',
  'settings.readonly': '当前部署为只读，无法保存修改。',
  'settings.id': 'ID',
  'settings.label': '标签',
  'settings.label.placeholder': '留空使用内置语言文案',
  'settings.command': '命令',
  'settings.args': '参数',
  'settings.platforms': '平台',
  'settings.enabled': '启用',
  'settings.add': '添加目标',
  'settings.remove': '删除 {id}',
  'settings.removeAction': '删除',
  'settings.save': '保存',
  'settings.saving': '保存中…',
  'settings.discard': '放弃',
  'settings.invalid': '存在无效行：ID 不能为空且必须唯一，命令不能为空。',
  'settings.failed': '保存失败，请重试。',
  'settings.loadFailed': '加载失败：{message}',
  'settings.error.idRequired': 'ID 不能为空',
  'settings.error.idDuplicate': 'ID 重复',
  'settings.error.idDuplicateNamed': 'ID "{id}" 重复',
  'settings.error.commandRequired': '命令不能为空',
} satisfies Record<string, string>

/** The `dsh-open-in` namespace key union. */
export type OpenInKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'row.openIn.aria': 'Open {name} with {target}',
  'target.vscode': 'Open in VS Code',
  'target.explorer': 'Open in File Explorer',
  'target.terminal': 'Open in Terminal',
  'error.notMounted': 'The open-in service is not ready',
  'error.openFailed': 'Open failed: {message}',
  'settings.title': 'Open In',
  'settings.description': 'Configure the workspace menu "open with" entries: add, edit, or remove launchers (VS Code, File Explorer, Terminal, …).',
  'settings.expand': 'Expand',
  'settings.collapse': 'Collapse',
  'settings.unsaved': 'Unsaved',
  'settings.readonly': 'This deployment is read-only; changes cannot be saved.',
  'settings.id': 'ID',
  'settings.label': 'Label',
  'settings.label.placeholder': 'empty = built-in copy',
  'settings.command': 'Command',
  'settings.args': 'Args',
  'settings.platforms': 'Platforms',
  'settings.enabled': 'Enabled',
  'settings.add': 'Add target',
  'settings.remove': 'Remove {id}',
  'settings.removeAction': 'Remove',
  'settings.save': 'Save',
  'settings.saving': 'Saving…',
  'settings.discard': 'Discard',
  'settings.invalid': 'Invalid rows: ids must be non-empty and unique, commands must be non-empty.',
  'settings.failed': 'Save failed; please retry.',
  'settings.loadFailed': 'Load failed: {message}',
  'settings.error.idRequired': 'Id is required',
  'settings.error.idDuplicate': 'Duplicate id',
  'settings.error.idDuplicateNamed': 'Duplicate id "{id}"',
  'settings.error.commandRequired': 'Command is required',
} satisfies Record<OpenInKey, string>

/** Locale namespace id registered under ctx.locale. */
export const NS = 'dsh-open-in'

/**
 * Fill one dictionary template's `{name}`-style placeholders.
 * @param template - dictionary text.
 * @param params - placeholder values; absent params replace nothing.
 * @returns the filled text.
 */
export function fmt(template: string, params: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => params[key] ?? `{${key}}`)
}
