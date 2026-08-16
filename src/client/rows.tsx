/**
 * The workspace overflow-menu rows contributed into the harness's
 * `sidebar.workspaces.row-menu` slot: one row per configured open target
 * ("Open in VS Code", "Open in File Explorer", "Open in Terminal", …) that
 * launches the workspace directory in that launcher through the host Remote.
 * Pure presentation — data and callbacks arrive through the props shares
 * (owner share from the slot, the target list + open callback from the
 * inject face, the locale seat).
 */
import { useRef } from 'react'
import {
  IconCodeOutline16,
  IconFolderOpenOutline16,
  IconPlayOutline16,
  IconRightUpOutline16,
  type IconProps,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { fmt, type OpenInKey } from './locales.ts'
import type { TargetSummary } from '../types.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The workspace overflow-menu row copy. */
    'dsh-open-in': OpenInKey
  }

  interface SlotMap {
    /**
     * The workspace overflow-menu row hole (declared by a newer ui-workspace
     * than the published rc.6; the legacy DOM adapter below covers rc.6).
     */
    'sidebar.workspaces.row-menu': {
      kind: 'single'
      scope: 'root'
      owner: {
        /** Display title of the Workspace. */
        label: string
        /** Absolute directory path; absent rows render nothing. */
        cwd: string | undefined
        /** Close the Workspace overflow menu before launching. */
        onClose: () => void
      }
    }
  }
}

/** The rows' business face: the host Remote calls behind the menu actions. */
export interface OpenInInjected {
  /** Menu rows to render, in configuration order. */
  targets: readonly TargetSummary[]
  /**
   * Open one absolute directory with a configured target.
   * @param targetId - configured target id.
   * @param path - absolute directory path.
   * @returns fulfillment after the launch is accepted.
   */
  open: (targetId: string, path: string) => Promise<void>
}

/** Full rows props: the slot's owner share + the locale seat + the inject face. */
export type OpenInRowsProps =
  PropsRuntime<'sidebar.workspaces.row-menu'>
  & PropsLocale<'dsh-open-in'>
  & OpenInInjected

/** Minimal presentation props shared by the native slot and legacy adapter. */
export interface OpenInMenuRowProps {
  /** One menu row to render. */
  target: TargetSummary
  /** Display title of the Workspace. */
  label: string
  /** Absolute directory path; absent rows render nothing. */
  cwd: string | undefined
  /** Close the Workspace overflow menu before launching. */
  onClose: () => void
  /**
   * Open one absolute directory with the row's target.
   * @param targetId - configured target id.
   * @param path - absolute directory path.
   * @returns fulfillment after the launch is accepted.
   */
  open: (targetId: string, path: string) => Promise<void>
  /** Locale-bound translation seat. */
  t: OpenInRowsProps['t']
  /** Launch on pointerdown when a legacy menu removes injected DOM before click. */
  eagerPointerActivation?: boolean
}

/** Loose translate for dynamic `target.<id>` keys outside the declared union. */
type LooseTranslate = (key: string, params?: Record<string, unknown>) => string

/**
 * Resolve a row's display label: the configured label wins; built-in ids
 * fall back to the `target.<id>` dictionary key; unknown ids fall back to
 * the id itself.
 * @param id - target id.
 * @param t - locale-bound translate seat.
 * @returns the display label.
 */
export function targetRowLabel(id: string, t: OpenInRowsProps['t']): string {
  const key = `target.${id}`
  const label = (t as unknown as LooseTranslate)(key)
  return label === key ? id : label
}

/** Icon per built-in target id; custom targets get a generic external-open icon. */
function targetIcon(id: string): (props: IconProps) => JSX.Element {
  switch (id) {
    case 'vscode': return IconCodeOutline16
    case 'explorer': return IconFolderOpenOutline16
    case 'terminal': return IconPlayOutline16
    default: return IconRightUpOutline16
  }
}

/**
 * Render one locale-following launcher row for one Workspace row.
 * @param props - target + workspace identity, close callback, open face, locale seat.
 * @returns the menu row, or nothing for a row without a directory.
 */
export function OpenInMenuRow({
  target,
  cwd,
  label,
  onClose,
  open,
  t,
  eagerPointerActivation = false,
}: OpenInMenuRowProps) {
  const activated = useRef(false)
  if (cwd === undefined) return null
  const rowLabel = target.label !== '' ? target.label : targetRowLabel(target.id, t)
  const launch = (): void => {
    if (activated.current) return
    activated.current = true
    // The menu interaction completes with the click; the launch settles async.
    onClose()
    open(target.id, cwd).catch((error: unknown) => {
      console.error('[dsh-open-in] open failed:', error)
    })
  }
  const Icon = targetIcon(target.id)
  return (
    <button
      type="button"
      role="menuitem"
      className="dsh-open-in-row"
      aria-label={fmt(t('row.openIn.aria'), { target: rowLabel, name: label })}
      onClick={launch}
      onPointerDown={(event) => {
        if (eagerPointerActivation && event.button === 0) launch()
      }}
    >
      <span className="dsh-open-in-icon"><Icon /></span>
      <span className="dsh-open-in-label">{rowLabel}</span>
    </button>
  )
}

/** Native row-menu slot entry: one row per visible target. */
export function OpenInRows(props: OpenInRowsProps) {
  if (props.cwd === undefined) return null
  return (
    <>
      {props.targets.map(target => (
        <OpenInMenuRow
          key={target.id}
          target={target}
          cwd={props.cwd}
          label={props.label}
          onClose={props.onClose}
          open={props.open}
          t={props.t}
        />
      ))}
    </>
  )
}
