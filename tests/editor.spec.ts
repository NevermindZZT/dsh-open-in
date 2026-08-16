/**
 * Targets editor logic: draft conversion, list parsing, and validation are
 * pure functions — no DOM, no scope.
 */
import { describe, expect, it } from 'vitest'
import {
  draftsToTargets,
  emptyDraft,
  parseList,
  targetsToDrafts,
  validateDrafts,
} from '../src/client/targets-editor.ts'
import { DEFAULT_TARGETS } from '../src/targets.ts'

describe('parseList', () => {
  it('splits on commas and whitespace, dropping empties', () => {
    expect(parseList('')).toEqual([])
    expect(parseList('  ')).toEqual([])
    expect(parseList('a, b c')).toEqual(['a', 'b', 'c'])
    expect(parseList('--window 0,-d')).toEqual(['--window', '0', '-d'])
  })
})

describe('draft conversion', () => {
  it('round-trips stored targets through drafts', () => {
    const drafts = targetsToDrafts(DEFAULT_TARGETS)
    expect(drafts).toHaveLength(3)
    expect(drafts[2].argsText).toBe('-d')
    const converted = draftsToTargets(drafts)
    expect(converted).toEqual(DEFAULT_TARGETS)
  })

  it('yields undefined when drafts are invalid', () => {
    const drafts = targetsToDrafts(DEFAULT_TARGETS)
    drafts[0] = { ...drafts[0], id: '' }
    expect(draftsToTargets(drafts)).toBeUndefined()
  })
})

describe('validateDrafts', () => {
  it('accepts the default targets', () => {
    expect(validateDrafts(targetsToDrafts(DEFAULT_TARGETS))).toEqual([])
  })

  it('flags empty ids, duplicate ids, and empty commands', () => {
    const drafts = targetsToDrafts(DEFAULT_TARGETS)
    drafts[1] = { ...drafts[1], id: 'vscode', command: '  ' }
    const errors = validateDrafts(drafts)
    expect(errors).toContainEqual({ index: 1, field: 'id', kind: 'id-duplicate', id: 'vscode' })
    expect(errors).toContainEqual({ index: 1, field: 'command', kind: 'command-required' })
  })

  it('flags an empty id on a fresh draft', () => {
    const errors = validateDrafts([emptyDraft()])
    expect(errors).toContainEqual({ index: 0, field: 'id', kind: 'id-required' })
    expect(errors).toContainEqual({ index: 0, field: 'command', kind: 'command-required' })
  })
})
