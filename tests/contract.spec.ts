/**
 * Wire contract tests: the strict codecs shared by the host manifest and the
 * client contribution accept valid payloads and reject malformed ones.
 */
import { describe, expect, it } from 'vitest'
import {
  listResultSchema,
  openResultSchema,
  openTargetSchema,
  pathSchema,
  saveResultSchema,
  targetIdSchema,
} from '../src/contract.ts'

describe('openIn wire contract', () => {
  it('accepts absolute paths and target ids, rejects empty values', () => {
    expect(pathSchema.parse('C:/projects/demo')).toBe('C:/projects/demo')
    expect(targetIdSchema.parse('vscode')).toBe('vscode')
    expect(() => pathSchema.parse('')).toThrow()
    expect(() => targetIdSchema.parse('')).toThrow()
  })

  it('accepts full open targets and rejects malformed ones', () => {
    expect(openTargetSchema.parse({
      id: 'vscode', label: '', command: 'code', args: [], platforms: [], enabled: true,
    })).toBeTruthy()
    expect(() => openTargetSchema.parse({ id: '', command: 'code' })).toThrow()
    expect(() => openTargetSchema.parse({ id: 'x', command: '' })).toThrow()
    expect(() => openTargetSchema.parse({ id: 'x', label: '' })).toThrow()
  })

  it('accepts the open and save result shapes only', () => {
    expect(openResultSchema.parse({ opened: true })).toEqual({ opened: true })
    expect(() => openResultSchema.parse({ opened: false })).toThrow()
    expect(saveResultSchema.parse({ saved: true })).toEqual({ saved: true })
    expect(() => saveResultSchema.parse({ saved: false })).toThrow()
  })

  it('accepts and normalizes the target list result', () => {
    const listed = listResultSchema.parse({
      targets: [
        { id: 'vscode', label: '', command: 'code', args: [], platforms: [], enabled: true },
        { id: 'custom', label: '我的工具', command: 'tool', args: ['-d'], platforms: ['win32'], enabled: false },
      ],
      writable: true,
    })
    expect(listed.targets).toHaveLength(2)
    expect(listed.writable).toBe(true)
    expect(() => listResultSchema.parse({ targets: [{ id: 'x', command: '' }], writable: true })).toThrow()
    expect(() => listResultSchema.parse({ targets: [], writable: 'yes' })).toThrow()
  })
})
