import { useEffect, useState } from 'react'
import { useReposStore } from '@renderer/state/reposStore'
import { useSyncStore } from '@renderer/state/syncStore'
import TileGrid from '@renderer/components/wall/TileGrid'
import RefreshButton from '@renderer/components/shared/RefreshButton'
import ErrorBanner from '@renderer/components/shared/ErrorBanner'
import Dashboard from '@renderer/components/dashboard/Dashboard'
import SettingsScreen from '@renderer/components/settings/SettingsScreen'

function App(): React.JSX.Element {
  const repos = useReposStore((s) => s.repos)
  const stats = useReposStore((s) => s.stats)
  const fetchAll = useReposStore((s) => s.fetchAll)
  const runSync = useSyncStore((s) => s.runSync)
  const [view, setView] = useState<'dashboard' | 'settings'>('dashboard')

  useEffect(() => {
    fetchAll().then(() => runSync())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>claude-tracker</h1>
        <div className="app-header__actions">
          <RefreshButton />
          <button
            type="button"
            className="settings-button"
            aria-label="Settings"
            onClick={() => setView(view === 'settings' ? 'dashboard' : 'settings')}
          >
            ⚙
          </button>
        </div>
      </header>

      {view === 'settings' ? (
        <SettingsScreen onClose={() => setView('dashboard')} />
      ) : (
        <>
          <ErrorBanner />
          {stats && <Dashboard stats={stats} />}
          <TileGrid repos={repos} />
        </>
      )}
    </div>
  )
}

export default App
