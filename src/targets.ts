/**
 * The shipped default open targets. Each entry's `command`/`args` use the
 * Windows form; {@link resolveTargetCommand} maps the *unchanged* defaults to
 * the host platform (explorer -> open / xdg-open, terminal -> wt / Terminal /
 * gnome-terminal). Any user customization is authoritative.
 */
import type { OpenTarget } from './types.ts'

/** Built-in targets, in menu display order. */
export const DEFAULT_TARGETS: OpenTarget[] = [
  { id: 'vscode', label: '', command: 'code', args: [], platforms: [], enabled: true },
  { id: 'explorer', label: '', command: 'explorer', args: [], platforms: [], enabled: true },
  { id: 'terminal', label: '', command: 'wt', args: ['-d'], platforms: [], enabled: true },
]

/**
 * Fresh copies for schema defaults: the loader validates the composed config
 * against the schema, and a shared mutable default must never leak across
 * plugins or reloads.
 * @returns a deep-enough copy of the default target list.
 */
export function defaultTargets(): OpenTarget[] {
  return DEFAULT_TARGETS.map(target => ({
    ...target,
    args: [...target.args],
    platforms: [...target.platforms],
  }))
}
