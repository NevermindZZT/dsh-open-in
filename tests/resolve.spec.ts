/**
 * Command resolution tests: built-in targets follow the host platform, the
 * default `code` command finds standard Windows VS Code locations, and any
 * explicit customization stays authoritative.
 */
import { win32 } from 'node:path'
import { describe, expect, it } from 'vitest'
import { candidateWindowsVsCodePaths, resolveTargetCommand, visibleTargets } from '../src/resolve.ts'
import { DEFAULT_TARGETS } from '../src/targets.ts'
import type { OpenTarget } from '../src/types.ts'

function target(overrides: Partial<OpenTarget>): OpenTarget {
  return { id: 'custom', label: '', command: 'tool', args: [], platforms: [], enabled: true, ...overrides }
}

describe('built-in platform mapping', () => {
  it('maps the default explorer target per platform', () => {
    const explorer = DEFAULT_TARGETS.find(t => t.id === 'explorer')!
    expect(resolveTargetCommand(explorer, 'win32', {}, () => false).command).toBe('explorer')
    expect(resolveTargetCommand(explorer, 'darwin', {}, () => false)).toEqual({ command: 'open', args: [] })
    expect(resolveTargetCommand(explorer, 'linux', {}, () => false)).toEqual({ command: 'xdg-open', args: [] })
  })

  it('maps the default terminal target per platform', () => {
    const terminal = DEFAULT_TARGETS.find(t => t.id === 'terminal')!
    expect(resolveTargetCommand(terminal, 'win32', {}, () => false)).toEqual({ command: 'wt', args: ['-d'] })
    expect(resolveTargetCommand(terminal, 'darwin', {}, () => false)).toEqual({ command: 'open', args: ['-a', 'Terminal'] })
    expect(resolveTargetCommand(terminal, 'linux', {}, () => false)).toEqual({ command: 'gnome-terminal', args: ['--working-directory'] })
  })

  it('keeps customized commands and args authoritative', () => {
    const customExplorer = target({ id: 'explorer', command: 'explorer.exe', args: ['/select,'], platforms: ['win32'] })
    expect(resolveTargetCommand(customExplorer, 'darwin', {}, () => false)).toEqual({ command: 'explorer.exe', args: ['/select,'] })
    const customTerminal = target({ id: 'terminal', command: 'wt', args: ['--window', '0', '-d'] })
    expect(resolveTargetCommand(customTerminal, 'win32', {}, () => false)).toEqual({ command: 'wt', args: ['--window', '0', '-d'] })
  })

  it('passes unknown targets through verbatim', () => {
    const custom = target({ id: 'my-tool', command: 'mytool', args: ['--cwd'] })
    expect(resolveTargetCommand(custom, 'win32', {}, () => false)).toEqual({ command: 'mytool', args: ['--cwd'] })
  })
})

describe('Windows VS Code command resolution', () => {
  it('finds PATH, per-user, and system Code.exe locations in order', () => {
    expect(candidateWindowsVsCodePaths({
      PATH: '"D:\\VS Code\\bin";E:\\portable',
      LOCALAPPDATA: 'C:\\Users\\Ada\\AppData\\Local',
      ProgramFiles: 'C:\\Program Files',
      'ProgramFiles(x86)': 'C:\\Program Files (x86)',
    })).toEqual([
      win32.join('D:\\VS Code\\bin', 'Code.exe'),
      win32.resolve('D:\\VS Code\\bin', '..', 'Code.exe'),
      win32.join('E:\\portable', 'Code.exe'),
      win32.join('C:\\Users\\Ada\\AppData\\Local', 'Programs', 'Microsoft VS Code', 'Code.exe'),
      win32.join('C:\\Program Files', 'Microsoft VS Code', 'Code.exe'),
      win32.join('C:\\Program Files (x86)', 'Microsoft VS Code', 'Code.exe'),
    ])
  })

  it('uses the first installed standard location for the default command', () => {
    const installed = win32.join('C:\\Users\\Ada\\AppData\\Local', 'Programs', 'Microsoft VS Code', 'Code.exe')
    expect(resolveTargetCommand(
      DEFAULT_TARGETS.find(t => t.id === 'vscode')!,
      'win32',
      { LOCALAPPDATA: 'C:\\Users\\Ada\\AppData\\Local', ProgramFiles: 'C:\\Program Files' },
      candidate => candidate === installed,
    ).command).toBe(installed)
  })

  it('preserves custom commands and the PATH fallback', () => {
    const vscode = DEFAULT_TARGETS.find(t => t.id === 'vscode')!
    expect(resolveTargetCommand(target({ id: 'vscode', command: 'cursor' }), 'win32', {}, () => false).command).toBe('cursor')
    expect(resolveTargetCommand(vscode, 'win32', {}, () => false).command).toBe('code')
    expect(resolveTargetCommand(vscode, 'darwin', {}, () => true).command).toBe('code')
  })
})

describe('visibleTargets', () => {
  it('filters by enabled and platform', () => {
    const list: OpenTarget[] = [
      target({ id: 'a', platforms: ['win32'] }),
      target({ id: 'b', platforms: ['darwin'] }),
      target({ id: 'c', enabled: false }),
      target({ id: 'd' }),
    ]
    expect(visibleTargets(list, 'win32').map(t => t.id)).toEqual(['a', 'd'])
    expect(visibleTargets(list, 'darwin').map(t => t.id)).toEqual(['b', 'd'])
    expect(visibleTargets(list, 'linux').map(t => t.id)).toEqual(['d'])
  })
})
