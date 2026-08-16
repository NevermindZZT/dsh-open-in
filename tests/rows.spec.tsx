// @vitest-environment jsdom
/**
 * Client row presentation: renders the locale-following launcher rows from
 * the slot's owner share, launches the chosen target on click (closing the
 * menu first), reports launch failure without crashing the row, and renders
 * nothing for a row without a directory.
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fmt, zh } from '../src/client/locales.ts'
import { OpenInMenuRow, OpenInRows, targetRowLabel, type OpenInMenuRowProps, type OpenInRowsProps } from '../src/client/rows.tsx'

afterEach(cleanup)

/** The real zh dictionary through the locale seat shape. */
const t = ((key: string, params?: Record<string, string>) => {
  const template = (zh as Record<string, string>)[key] ?? key
  return params === undefined ? template : fmt(template, params)
}) as OpenInMenuRowProps['t']

// The row never reads the global seats; stubs satisfy the type only.
const useSessions = (() => undefined) as unknown as OpenInRowsProps['useSessions']
const useWorkspaces = (() => undefined) as unknown as OpenInRowsProps['useWorkspaces']

const TARGETS = [
  { id: 'vscode', label: '' },
  { id: 'explorer', label: '' },
  { id: 'custom', label: '我的工具' },
]

function rowProps(overrides: Partial<OpenInMenuRowProps> = {}): OpenInMenuRowProps {
  return {
    target: TARGETS[0],
    label: 'Project',
    cwd: 'C:/projects/project',
    onClose: vi.fn(),
    open: vi.fn(async () => {}),
    t,
    ...overrides,
  }
}

function rowsProps(overrides: Partial<OpenInMenuRowProps> = {}): OpenInRowsProps {
  return { ...rowProps(overrides), targets: TARGETS, useSessions, useWorkspaces }
}

describe('targetRowLabel', () => {
  it('resolves built-in ids through the locale dictionary and falls back to the id', () => {
    expect(targetRowLabel('vscode', t)).toBe('在 VS Code 中打开')
    expect(targetRowLabel('explorer', t)).toBe('在文件管理器中打开')
    expect(targetRowLabel('unknown-id', t)).toBe('unknown-id')
  })
})

describe('OpenInMenuRow', () => {
  it('renders the zh menu row with the workspace in its aria label', () => {
    const view = render(<OpenInMenuRow {...rowProps()} />)
    const row = screen.getByRole('menuitem', { name: '用 在 VS Code 中打开 打开 Project' })
    expect(row.textContent).toBe('在 VS Code 中打开')
    expect(row.querySelector('svg')).not.toBeNull()
    expect(view).toBeTruthy()
  })

  it('prefers a configured label over the locale fallback', () => {
    render(<OpenInMenuRow {...rowProps({ target: TARGETS[2] })} />)
    expect(screen.getByRole('menuitem', { name: '用 我的工具 打开 Project' }).textContent).toBe('我的工具')
  })

  it('clicking the row closes the menu and launches the target on the cwd', async () => {
    const onClose = vi.fn()
    const open = vi.fn(async () => {})
    render(<OpenInMenuRow {...rowProps({ target: TARGETS[1], onClose, open })} />)
    fireEvent.click(screen.getByRole('menuitem'))
    expect(onClose).toHaveBeenCalledOnce()
    expect(open).toHaveBeenCalledWith('explorer', 'C:/projects/project')
    await Promise.resolve()
  })

  it('a rejected launch is reported without throwing through the row', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const open = vi.fn(async () => { throw new Error('no such command') })
      render(<OpenInMenuRow {...rowProps({ open })} />)
      fireEvent.click(screen.getByRole('menuitem'))
      await Promise.resolve()
      expect(consoleError).toHaveBeenCalledWith('[dsh-open-in] open failed:', expect.any(Error))
    } finally {
      consoleError.mockRestore()
    }
  })

  it('renders nothing for a Workspace row without a directory', () => {
    const { container } = render(<OpenInMenuRow {...rowProps({ cwd: undefined })} />)
    expect(container.firstChild).toBeNull()
    expect(screen.queryByRole('menuitem')).toBeNull()
  })
})

describe('OpenInRows', () => {
  it('renders one row per visible target', () => {
    render(<OpenInRows {...rowsProps()} />)
    expect(screen.getAllByRole('menuitem')).toHaveLength(3)
    expect(screen.getByText('在 VS Code 中打开')).toBeTruthy()
    expect(screen.getByText('在文件管理器中打开')).toBeTruthy()
    expect(screen.getByText('我的工具')).toBeTruthy()
  })

  it('renders nothing without a directory', () => {
    const { container } = render(<OpenInRows {...rowsProps({ cwd: undefined })} />)
    expect(container.firstChild).toBeNull()
  })
})
