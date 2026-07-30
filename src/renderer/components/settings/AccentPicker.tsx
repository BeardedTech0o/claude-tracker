import type { Accent } from '@shared/ipcContract'
import { useSettingsStore } from '@renderer/state/settingsStore'

const ACCENTS: { key: Accent; label: string; swatch: string }[] = [
  { key: 'lime', label: 'Electric lime', swatch: '#b6ff2e' },
  { key: 'blue', label: 'Electric blue', swatch: '#3987e5' },
  { key: 'violet', label: 'Violet', swatch: '#9085e9' },
  { key: 'coral', label: 'Coral', swatch: '#eb6834' },
  { key: 'teal', label: 'Teal', swatch: '#1baf7a' },
  { key: 'pink', label: 'Hot pink', swatch: '#ff6fb0' }
]

function AccentPicker(): React.JSX.Element {
  const accent = useSettingsStore((s) => s.settings?.accent ?? 'lime')
  const setAccent = useSettingsStore((s) => s.setAccent)

  return (
    <div className="settings-field">
      <label>Accent color</label>
      <div className="accent-picker" role="radiogroup" aria-label="Accent color">
        {ACCENTS.map((a) => (
          <button
            key={a.key}
            type="button"
            className={`accent-swatch${accent === a.key ? ' is-active' : ''}`}
            style={{ background: a.swatch }}
            aria-pressed={accent === a.key}
            aria-label={a.label}
            title={a.label}
            onClick={() => setAccent(a.key)}
          />
        ))}
      </div>
    </div>
  )
}

export default AccentPicker
