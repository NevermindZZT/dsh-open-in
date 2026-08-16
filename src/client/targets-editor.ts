/**
 * Pure targets-editor logic for the Settings card: convert between the stored
 * `OpenTarget` shape and editable row drafts, parse list fields, and validate
 * rows. Kept dependency-free so the card logic is unit-testable without a
 * DOM.
 */
import type { OpenTarget } from '../types.ts'

/** One editable row in the targets editor. */
export interface TargetDraft {
  /** Target id; must be non-empty and unique within the list. */
  id: string
  /** Menu label; empty falls back to the locale key for the id. */
  label: string
  /** Executable that opens a directory. */
  command: string
  /** Comma/whitespace separated launcher arguments (before the directory path). */
  argsText: string
  /** Comma/whitespace separated platform allowlist; empty = every platform. */
  platformsText: string
  /** Whether the target is listed and launchable. */
  enabled: boolean
}

/** Split a comma/whitespace separated list, dropping empty parts. */
export function parseList(text: string): string[] {
  return text.split(/[\s,]+/).filter(part => part !== '')
}

/** Convert stored targets to editable row drafts. */
export function targetsToDrafts(targets: readonly OpenTarget[]): TargetDraft[] {
  return targets.map(target => ({
    id: target.id,
    label: target.label,
    command: target.command,
    argsText: target.args.join(', '),
    platformsText: target.platforms.join(', '),
    enabled: target.enabled,
  }))
}

/** Convert drafts back to stored targets; invalid drafts yield undefined. */
export function draftsToTargets(drafts: readonly TargetDraft[]): OpenTarget[] | undefined {
  if (validateDrafts(drafts).length > 0) return undefined
  return drafts.map(draft => ({
    id: draft.id.trim(),
    label: draft.label.trim(),
    command: draft.command.trim(),
    args: parseList(draft.argsText),
    platforms: parseList(draft.platformsText),
    enabled: draft.enabled,
  }))
}

/** Why one row's draft is invalid; the card maps kinds to localized copy. */
export type DraftErrorKind = 'id-required' | 'id-duplicate' | 'command-required'

/** One validation problem on one row. */
export interface DraftError {
  /** Zero-based row index. */
  index: number
  /** The offending field. */
  field: 'id' | 'command'
  /** Machine kind for localized copy. */
  kind: DraftErrorKind
  /** Offending id for duplicate errors. */
  id?: string
}

/** Validate drafts: non-empty unique ids, non-empty commands. */
export function validateDrafts(drafts: readonly TargetDraft[]): DraftError[] {
  const errors: DraftError[] = []
  const seen = new Map<string, number>()
  drafts.forEach((draft, index) => {
    const id = draft.id.trim()
    if (id === '') {
      errors.push({ index, field: 'id', kind: 'id-required' })
    } else if (seen.has(id)) {
      errors.push({ index, field: 'id', kind: 'id-duplicate', id })
    } else {
      seen.set(id, index)
    }
    if (draft.command.trim() === '') {
      errors.push({ index, field: 'command', kind: 'command-required' })
    }
  })
  return errors
}

/** An empty draft for the add-row action. */
export function emptyDraft(): TargetDraft {
  return { id: '', label: '', command: '', argsText: '', platformsText: '', enabled: true }
}
