// @vitest-environment jsdom
/**
 * The Settings card: a collapsible plugin card matching the built-in cards —
 * collapsed by default with a header (name, description, chevron, unsaved
 * badge), the targets editor inside the expanded body. Loads through the
 * injected `load` face, stages edits locally, and on Save persists the whole
 * targets array through `save`. Invalid rows block the save; a failed load
 * shows an error; a non-writable deployment shows a readonly note.
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fmt, zh } from '../src/client/locales.ts'
import { TargetsSettingsCard, type TargetsSettingsCardInjected, type TargetsSettingsCardProps } from '../src/client/targets-card.tsx'
import type { OpenTarget } from '../src/types.ts'

afterEach(cleanup)

/** The real zh dictionary through the locale seat shape. */
const t = ((key: string, params?: Record<string, string>) => {
  const template = (zh as Record<string, string>)[key] ?? key
  return params === undefined ? template : fmt(template, params)
}) as TargetsSettingsCardProps['t']

const useSessions = (() => undefined) as unknown as TargetsSettingsCardProps['useSessions']
const useWorkspaces = (() => undefined) as unknown as TargetsSettingsCardProps['useWorkspaces']

const INITIAL: OpenTarget[] = [
  { id: 'vscode', label: '', command: 'code', args: [], platforms: [], enabled: true },
  { id: 'explorer', label: '', command: 'explorer', args: [], platforms: ['win32'], enabled: true },
]

function fakeFace(initial: OpenTarget[], options: { writable?: boolean; loadError?: Error } = {}): TargetsSettingsCardInjected & { load: ReturnType<typeof vi.fn>; save: ReturnType<typeof vi.fn> } {
  let current = { targets: initial, writable: options.writable ?? true }
  const load = vi.fn(async () => {
    if (options.loadError !== undefined) throw options.loadError
    return { targets: [...current.targets], writable: current.writable }
  })
  const save = vi.fn(async (targets: OpenTarget[]) => {
    current = { ...current, targets: [...targets] }
  })
  return { load, save }
}

function props(face: TargetsSettingsCardInjected): TargetsSettingsCardProps {
  return { ...face, t, useSessions, useWorkspaces }
}

describe('TargetsSettingsCard', () => {
  it('renders collapsed by default: header only, no editor rows', async () => {
    const face = fakeFace(INITIAL)
    render(<TargetsSettingsCard {...props(face)} />)
    const header = await screen.findByRole('button', { name: '展开: 打开方式' })
    expect(header.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByDisplayValue('vscode')).toBeNull()
  })

  it('expands to show one row per loaded target', async () => {
    const face = fakeFace(INITIAL)
    render(<TargetsSettingsCard {...props(face)} />)
    fireEvent.click(await screen.findByRole('button', { name: '展开: 打开方式' }))
    await screen.findByDisplayValue('vscode')
    expect(screen.getAllByRole('textbox', { name: /ID/ })).toHaveLength(2)
    expect(screen.getAllByRole('textbox')).toHaveLength(2 * 5) // id/label/command/args/platforms per row
    expect(screen.getAllByDisplayValue('explorer')).toHaveLength(2) // row 2: id + command
  })

  it('adds a row, edits it, and saves the full targets array', async () => {
    const face = fakeFace(INITIAL)
    const { container } = render(<TargetsSettingsCard {...props(face)} />)
    fireEvent.click(await screen.findByRole('button', { name: '展开: 打开方式' }))
    await screen.findByDisplayValue('vscode')
    fireEvent.click(screen.getByRole('button', { name: '添加目标' }))
    // The new row is the last row container; edit its id and command.
    const rows = container.querySelectorAll('.dsh-open-in-target-row')
    const lastRowInputs = rows.item(rows.length - 1).querySelectorAll<HTMLInputElement>('input[type="text"], input:not([type])')
    const newIdInput = [...lastRowInputs].find(input => input.placeholder === 'vscode')
    const newCommandInput = [...lastRowInputs].find(input => input.placeholder === 'code')
    expect(newIdInput).toBeDefined()
    expect(newCommandInput).toBeDefined()
    fireEvent.change(newIdInput!, { target: { value: 'terminal' } })
    fireEvent.change(newCommandInput!, { target: { value: 'wt' } })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(face.save).toHaveBeenCalledOnce()
    const saved = face.save.mock.calls[0][0] as OpenTarget[]
    expect(saved.map(target => target.id)).toEqual(['vscode', 'explorer', 'terminal'])
    expect(saved[2]).toMatchObject({ id: 'terminal', command: 'wt' })
    // After the save the card re-loads and mirrors the accepted list.
    await screen.findByDisplayValue('terminal')
  })

  it('blocks the save while a row is invalid', async () => {
    const face = fakeFace(INITIAL)
    render(<TargetsSettingsCard {...props(face)} />)
    fireEvent.click(await screen.findByRole('button', { name: '展开: 打开方式' }))
    await screen.findByDisplayValue('vscode')
    fireEvent.click(screen.getByRole('button', { name: '添加目标' }))
    // New row has empty id and command -> save stays disabled.
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(face.save).not.toHaveBeenCalled()
    expect(screen.getByText('存在无效行：ID 不能为空且必须唯一，命令不能为空。')).toBeTruthy()
  })

  it('removes a row and saves without it', async () => {
    const face = fakeFace(INITIAL)
    render(<TargetsSettingsCard {...props(face)} />)
    fireEvent.click(await screen.findByRole('button', { name: '展开: 打开方式' }))
    await screen.findByDisplayValue('vscode')
    fireEvent.click(screen.getByRole('button', { name: '删除 explorer' }))
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(face.save).toHaveBeenCalledOnce()
    expect((face.save.mock.calls[0][0] as OpenTarget[]).map(target => target.id)).toEqual(['vscode'])
  })

  it('shows an unsaved badge on the collapsed header while edits are staged', async () => {
    const face = fakeFace(INITIAL)
    const { container } = render(<TargetsSettingsCard {...props(face)} />)
    fireEvent.click(await screen.findByRole('button', { name: '展开: 打开方式' }))
    await screen.findByDisplayValue('vscode')
    fireEvent.click(screen.getByRole('button', { name: '添加目标' }))
    // Collapse again: the header now carries the unsaved badge.
    fireEvent.click(screen.getByRole('button', { name: '折叠: 打开方式' }))
    expect(container.textContent).toContain('未保存')
  })

  it('shows an error note in the expanded body when the load fails', async () => {
    const face = fakeFace(INITIAL, { loadError: new Error('boom') })
    render(<TargetsSettingsCard {...props(face)} />)
    fireEvent.click(await screen.findByRole('button', { name: '展开: 打开方式' }))
    await screen.findByText(/加载失败/)
    expect(screen.getByText(/boom/)).toBeTruthy()
  })

  it('shows a readonly note and no save button when the settings document is not writable', async () => {
    const face = fakeFace(INITIAL, { writable: false })
    render(<TargetsSettingsCard {...props(face)} />)
    fireEvent.click(await screen.findByRole('button', { name: '展开: 打开方式' }))
    await screen.findByText('当前部署为只读，无法保存修改。')
    expect(screen.queryByRole('button', { name: '保存' })).toBeNull()
  })
})
