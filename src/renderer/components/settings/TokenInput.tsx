import { useState } from 'react'
import { useSettingsStore } from '@renderer/state/settingsStore'

function TokenInput(): React.JSX.Element {
  const hasToken = useSettingsStore((s) => s.settings?.hasToken ?? false)
  const setToken = useSettingsStore((s) => s.setToken)
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async (): Promise<void> => {
    const trimmed = value.trim()
    if (!trimmed) return
    setSaving(true)
    try {
      await setToken(trimmed)
      setValue('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="settings-field">
      <label htmlFor="gh-token">GitHub personal access token</label>
      <div className="settings-field__row">
        <input
          id="gh-token"
          type="password"
          autoComplete="off"
          placeholder={hasToken ? 'Token saved - enter a new one to replace it' : 'ghp_...'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="button" onClick={handleSave} disabled={saving || !value.trim()}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      <p className="settings-field__status">
        {hasToken ? 'Connected to GitHub.' : 'No token configured yet - add one to start syncing.'}
      </p>
    </div>
  )
}

export default TokenInput
