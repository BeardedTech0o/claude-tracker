import { useSyncStore } from '@renderer/state/syncStore'

function RefreshButton(): React.JSX.Element {
  const status = useSyncStore((s) => s.status)
  const progress = useSyncStore((s) => s.progress)
  const runSync = useSyncStore((s) => s.runSync)
  const syncing = status === 'syncing'

  return (
    <button className="refresh-button" onClick={() => runSync()} disabled={syncing} type="button">
      {syncing
        ? progress && progress.total > 0
          ? `Syncing ${progress.done}/${progress.total}...`
          : 'Syncing...'
        : 'Refresh'}
    </button>
  )
}

export default RefreshButton
