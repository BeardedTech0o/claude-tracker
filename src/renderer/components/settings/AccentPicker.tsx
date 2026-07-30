import type { Accent } from '@shared/ipcContract'
import { useSettingsStore } from '@renderer/state/settingsStore'

// Gradient pairs mirror the --accent/--accent-2 tokens in tokens.css.
const ACCENTS: { key: Accent; label: string; swatch: string }[] = [
  { key: 'lime', label: 'Aurora lime', swatch: 'linear-gradient(135deg, #c6ff4a, #34e0a1)' },
  { key: 'blue', label: 'Electric blue', swatch: 'linear-gradient(135deg, #4ac8ff, #7c5cff)' },
  { key: 'violet', label: 'Violet', swatch: 'linear-gradient(135deg, #9c7cff, #ff6bcb)' },
  { key: 'coral', label: 'Coral', swatch: 'linear-gradient(135deg, #ff8a5c, #ffd166)' },
  { key: 'teal', label: 'Teal', swatch: 'linear-gradient(135deg, #34e0a1, #4ac8ff)' },
  { key: 'pink', label: 'Hot pink', swatch: 'linear-gradient(135deg, #ff6bcb, #ff8a5c)' }
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
