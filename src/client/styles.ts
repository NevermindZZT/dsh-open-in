/**
 * The menu-row stylesheet, injected once by the client apply. The rows copy
 * the harness menu-cell geometry (figma .Menu_cell: min-h 40, r10, pad 10/8,
 * 14/22, gap 8) and are styled ONLY with `--dsw-alias-*` semantic tokens, so
 * they follow the system theme exactly like the built-in menu rows.
 */
const STYLE_ID = 'dsh-open-in-styles'

const css = `
.dsh-open-in-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 40px;
  padding: 8px 10px;
  border: none;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  line-height: 22px;
  color: var(--dsw-alias-label-primary);
  text-align: left;
}
.dsh-open-in-row:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.dsh-open-in-row:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: -2px;
}
.dsh-open-in-row .dsh-open-in-icon {
  display: inline-flex;
  flex: none;
  width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
  color: var(--dsw-alias-label-tertiary);
}
.dsh-open-in-row .dsh-open-in-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dsh-open-in-card {
  list-style: none;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-3);
  transition: border-color .16s, background .16s;
}
.dsh-open-in-card:hover {
  border-color: var(--dsw-alias-label-dimmed);
}
.dsh-open-in-card-open {
  background: var(--dsw-alias-bg-layer-2);
  border-color: var(--dsw-alias-label-dimmed);
}
.dsh-open-in-card-header {
  width: 100%;
  appearance: none;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
}
.dsh-open-in-card-header:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: -2px;
}
.dsh-open-in-card-head-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dsh-open-in-card-name {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--dsw-alias-label-primary);
}
.dsh-open-in-card-description {
  font-size: 13px;
  line-height: 1.5;
  color: var(--dsw-alias-label-tertiary);
}
.dsh-open-in-card-chevron {
  flex: none;
  color: var(--dsw-alias-label-tertiary);
  transition: transform .16s;
}
.dsh-open-in-card-chevron-open {
  transform: rotate(180deg);
}
.dsh-open-in-card-pending {
  flex: none;
  border-radius: 999px;
  padding: 1px 8px;
  font-size: 11px;
  line-height: 17px;
  font-weight: 500;
  white-space: nowrap;
  background: var(--dsw-alias-bg-module-platform);
  color: var(--dsw-alias-label-secondary);
}
.dsh-open-in-card-body {
  border-top: 1px solid var(--dsw-alias-border-l2);
  margin: 0 16px;
  padding-bottom: 8px;
}
.dsh-open-in-card-read-only {
  margin: 12px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-label-tertiary);
}
.dsh-open-in-card-failed {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-label-error);
}
.dsh-open-in-card-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
}
.dsh-open-in-target-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-3);
}
.dsh-open-in-target-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  flex: 1;
  min-width: 0;
}
.dsh-open-in-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.dsh-open-in-field-inline {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}
.dsh-open-in-field-label {
  font-size: 12px;
  line-height: 16px;
  color: var(--dsw-alias-label-secondary);
}
.dsh-open-in-field-error {
  font-size: 12px;
  line-height: 16px;
  color: var(--dsw-alias-label-error);
}
.dsh-open-in-input {
  width: 100%;
  box-sizing: border-box;
  min-height: 32px;
  padding: 4px 8px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-3);
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  line-height: 20px;
}
.dsh-open-in-input:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: -1px;
}
.dsh-open-in-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--dsw-alias-brand-primary);
}
.dsh-open-in-row-remove {
  flex: none;
  min-height: 28px;
  padding: 2px 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: none;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 20px;
  cursor: pointer;
}
.dsh-open-in-row-remove:hover {
  color: var(--dsw-alias-label-primary);
  border-color: var(--dsw-alias-label-dimmed);
}
.dsh-open-in-card-add-row {
  padding: 10px 0 2px;
}
.dsh-open-in-card-add,
.dsh-open-in-card-discard,
.dsh-open-in-card-save {
  appearance: none;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 5px 14px;
  font: inherit;
  font-size: 13px;
  line-height: 1.5;
  cursor: pointer;
}
.dsh-open-in-card-add,
.dsh-open-in-card-discard {
  border-color: var(--dsw-alias-border-l2);
  background: none;
  color: var(--dsw-alias-label-secondary);
}
.dsh-open-in-card-add:hover:not(:disabled),
.dsh-open-in-card-discard:hover:not(:disabled) {
  color: var(--dsw-alias-label-primary);
  border-color: var(--dsw-alias-label-dimmed);
}
.dsh-open-in-card-save {
  background: var(--dsw-alias-label-primary);
  color: var(--dsw-alias-bg-layer-3);
}
.dsh-open-in-card-add:disabled,
.dsh-open-in-card-discard:disabled,
.dsh-open-in-card-save:disabled {
  opacity: 0.4;
  cursor: default;
}
.dsh-open-in-card-add:focus-visible,
.dsh-open-in-card-discard:focus-visible,
.dsh-open-in-card-save:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 1px;
}
.dsh-open-in-card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 0 4px;
  border-top: 1px solid var(--dsw-alias-border-l2);
}
`

/** Inject the row stylesheet once; a second call is a no-op. */
export function adoptStyles(): void {
  if (document.getElementById(STYLE_ID) !== null) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = css
  document.head.appendChild(style)
}
