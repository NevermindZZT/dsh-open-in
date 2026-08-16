/**
 * The Settings → Plugins card for dsh-open-in: a collapsible plugin card in
 * the same shape as the built-in cards (header with name/description and a
 * rotating chevron; the targets editor appears in the expanded body).
 * rc.6's settings API serves a fixed allowlist of namespaces to the Web
 * client, so the card reads and writes through the openIn Typert Remote
 * instead of the settings transport: `load` fetches the current targets (and
 * settings writability), `save` persists a validated list through the host
 * settings namespace. Staged edits write only on Save; invalid rows block it
 * with localized errors; the header carries an "unsaved" badge while edits
 * are staged.
 */
import { useEffect, useState } from 'react'
import { IconChevronDownOutline14 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { OpenTarget } from '../types.ts'
import {
  draftsToTargets,
  emptyDraft,
  targetsToDrafts,
  validateDrafts,
  type DraftError,
  type TargetDraft,
} from './targets-editor.ts'

/** The card's business face: the openIn Remote calls behind the editor. */
export interface TargetsSettingsCardInjected {
  /**
   * Fetch the current targets plus whether the settings document accepts writes.
   * @returns the visible targets and writability.
   */
  load: () => Promise<{ targets: OpenTarget[]; writable: boolean }>
  /**
   * Persist a complete target list through the host settings namespace.
   * @param targets - the complete target list.
   */
  save: (targets: OpenTarget[]) => Promise<void>
}

/** Full card props: slot owner share (empty) + locale seat + the Remote face. */
export type TargetsSettingsCardProps =
  PropsRuntime<'settings.plugin.item'>
  & PropsLocale<'dsh-open-in'>
  & TargetsSettingsCardInjected

/** Load lifecycle the card renders against. */
type CardLoad =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; targets: OpenTarget[]; writable: boolean }

/** Error copy for one row field, addressed by kind. */
function errorCopy(errors: readonly DraftError[], index: number, field: DraftError['field'], t: TargetsSettingsCardProps['t']): string | undefined {
  const error = errors.find(candidate => candidate.index === index && candidate.field === field)
  if (error === undefined) return undefined
  switch (error.kind) {
    case 'id-required': return t('settings.error.idRequired')
    case 'id-duplicate': return error.id === undefined ? t('settings.error.idDuplicate') : t('settings.error.idDuplicateNamed', { id: error.id })
    case 'command-required': return t('settings.error.commandRequired')
  }
}

/**
 * Render the collapsible targets editor card.
 * @param props - the load/save face, the locale seat, and the slot's standard props.
 * @returns the card, or nothing while the initial load is in flight.
 */
export function TargetsSettingsCard({ load, save: saveTargets, t }: TargetsSettingsCardProps) {
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState<CardLoad>({ status: 'loading' })
  // null drafts = mirror the loaded targets; a non-null array is staged edits.
  const [drafts, setDrafts] = useState<TargetDraft[] | null>(null)
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    load().then(({ targets, writable }) => {
      if (alive) setLoaded({ status: 'ready', targets, writable })
    }).catch((error: unknown) => {
      if (alive) setLoaded({
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      })
    })
    return () => { alive = false }
  }, [load])

  if (loaded.status === 'loading') return null

  const title = t('settings.title')
  const dirty = drafts !== null
  const rows = loaded.status === 'ready' ? (drafts ?? targetsToDrafts(loaded.targets)) : []
  const errors = validateDrafts(rows)
  const invalid = errors.length > 0
  const blocked = !dirty || invalid || saving
  const save = async (): Promise<void> => {
    if (blocked) return
    const targets = draftsToTargets(rows)
    if (targets === undefined) return
    setSaving(true)
    setFailed(false)
    try {
      await saveTargets(targets)
      // Mirror what the host accepted; the namespace now carries the new list.
      const refreshed = await load()
      setLoaded({ status: 'ready', ...refreshed })
      setDrafts(null)
    } catch {
      setFailed(true)
    } finally {
      setSaving(false)
    }
  }
  const discard = (): void => {
    setDrafts(null)
    setFailed(false)
  }
  const edit = (index: number, patch: Partial<TargetDraft>): void => {
    setFailed(false)
    setDrafts(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }
  const addRow = (): void => {
    setFailed(false)
    setDrafts([...rows, emptyDraft()])
  }
  const removeRow = (index: number): void => {
    setFailed(false)
    setDrafts(rows.filter((_, i) => i !== index))
  }

  return (
    <li className={open ? 'dsh-open-in-card dsh-open-in-card-open' : 'dsh-open-in-card'}>
      <button
        type="button"
        className="dsh-open-in-card-header"
        aria-expanded={open}
        aria-label={`${t(open ? 'settings.collapse' : 'settings.expand')}: ${title}`}
        onClick={() => setOpen(!open)}
      >
        <span className="dsh-open-in-card-head-text">
          <span className="dsh-open-in-card-name">{title}</span>
          <span className="dsh-open-in-card-description">{t('settings.description')}</span>
        </span>
        {dirty ? <span className="dsh-open-in-card-pending">{t('settings.unsaved')}</span> : null}
        <IconChevronDownOutline14
          className={open ? 'dsh-open-in-card-chevron dsh-open-in-card-chevron-open' : 'dsh-open-in-card-chevron'}
        />
      </button>

      {open ? (
        <div className="dsh-open-in-card-body">
          {loaded.status === 'error' ? (
            <p className="dsh-open-in-card-failed" role="status">
              {t('settings.loadFailed', { message: loaded.message })}
            </p>
          ) : !loaded.writable ? (
            <p className="dsh-open-in-card-read-only" role="status">{t('settings.readonly')}</p>
          ) : (
            <>
              <div className="dsh-open-in-card-rows">
                {rows.map((row, index) => (
                  <div className="dsh-open-in-target-row" key={index}>
                    <div className="dsh-open-in-target-grid">
                      <label className="dsh-open-in-field">
                        <span className="dsh-open-in-field-label">{t('settings.id')}</span>
                        <input
                          className="dsh-open-in-input"
                          value={row.id}
                          placeholder="vscode"
                          onChange={event => edit(index, { id: event.target.value })}
                        />
                        <span className="dsh-open-in-field-error">{errorCopy(errors, index, 'id', t)}</span>
                      </label>
                      <label className="dsh-open-in-field">
                        <span className="dsh-open-in-field-label">{t('settings.label')}</span>
                        <input
                          className="dsh-open-in-input"
                          value={row.label}
                          placeholder={t('settings.label.placeholder')}
                          onChange={event => edit(index, { label: event.target.value })}
                        />
                      </label>
                      <label className="dsh-open-in-field">
                        <span className="dsh-open-in-field-label">{t('settings.command')}</span>
                        <input
                          className="dsh-open-in-input"
                          value={row.command}
                          placeholder="code"
                          onChange={event => edit(index, { command: event.target.value })}
                        />
                        <span className="dsh-open-in-field-error">{errorCopy(errors, index, 'command', t)}</span>
                      </label>
                      <label className="dsh-open-in-field">
                        <span className="dsh-open-in-field-label">{t('settings.args')}</span>
                        <input
                          className="dsh-open-in-input"
                          value={row.argsText}
                          placeholder="-d"
                          onChange={event => edit(index, { argsText: event.target.value })}
                        />
                      </label>
                      <label className="dsh-open-in-field">
                        <span className="dsh-open-in-field-label">{t('settings.platforms')}</span>
                        <input
                          className="dsh-open-in-input"
                          value={row.platformsText}
                          placeholder="win32, darwin, linux"
                          onChange={event => edit(index, { platformsText: event.target.value })}
                        />
                      </label>
                      <label className="dsh-open-in-field dsh-open-in-field-inline">
                        <input
                          className="dsh-open-in-checkbox"
                          type="checkbox"
                          checked={row.enabled}
                          onChange={event => edit(index, { enabled: event.target.checked })}
                        />
                        <span className="dsh-open-in-field-label">{t('settings.enabled')}</span>
                      </label>
                    </div>
                    <button
                      type="button"
                      className="dsh-open-in-row-remove"
                      aria-label={t('settings.remove', { id: row.id !== '' ? row.id : String(index + 1) })}
                      onClick={() => removeRow(index)}
                    >
                      {t('settings.removeAction')}
                    </button>
                  </div>
                ))}
              </div>

              <div className="dsh-open-in-card-add-row">
                <button type="button" className="dsh-open-in-card-add" onClick={addRow}>
                  {t('settings.add')}
                </button>
              </div>

              <div className="dsh-open-in-card-footer">
                {invalid ? <p className="dsh-open-in-card-failed" role="status">{t('settings.invalid')}</p> : null}
                {failed ? <p className="dsh-open-in-card-failed" role="status">{t('settings.failed')}</p> : null}
                <button type="button" className="dsh-open-in-card-discard" disabled={!dirty || saving} onClick={discard}>
                  {t('settings.discard')}
                </button>
                <button
                  type="button"
                  className="dsh-open-in-card-save"
                  disabled={blocked}
                  onClick={() => void save()}
                >
                  {t(saving ? 'settings.saving' : 'settings.save')}
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </li>
  )
}
