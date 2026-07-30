import { useSettingsStore } from '@renderer/state/settingsStore'

function ThemeToggle(): React.JSX.Element {
  const theme = useSettingsStore((s) => s.settings?.theme ?? 'dark')
  const setTheme = useSettingsStore((s) => s.setTheme)

  return (
    <div className="settings-field">
      <label>Theme</label>
      <div className="theme-toggle" role="radiogroup" aria-label="Theme">
        <button
          type="button"
          className={theme === 'dark' ? 'is-active' : ''}
          aria-pressed={theme === 'dark'}
          onClick={() => setTheme('dark')}
        >
          Dark
        </button>
        <button
          type="button"
          className={theme === 'light' ? 'is-active' : ''}
          aria-pressed={theme === 'light'}
          onClick={() => setTheme('light')}
        >
          Light
        </button>
      </div>
    </div>
  )
}

export default ThemeToggle
