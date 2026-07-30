import { useSyncStore } from '@renderer/state/syncStore'
import type { SyncErrorKind } from '@shared/ipcContract'

const KIND_LABEL: Record<SyncErrorKind, string> = {
  auth: 'GitHub token problem',
  offline: 'Offline',
  rate_limited: 'Rate limited',
  unknown: 'Sync error'
}

function ErrorBanner(): React.JSX.Element | null {
  const status = useSyncStore((s) => s.status)
  const lastResult = useSyncStore((s) => s.lastResult)

  if (status !== 'error' || !lastResult || lastResult.ok) return null

  const kind = lastResult.errorKind ?? 'unknown'
  const severity = kind === 'auth' || kind === 'unknown' ? 'critical' : 'warning'

  return (
    <div className={`error-banner error-banner--${severity}`} role="alert">
      <strong>{KIND_LABEL[kind]}:</strong> {lastResult.message ?? 'Something went wrong during sync.'}
      <span className="error-banner__hint"> Showing last cached data.</span>
    </div>
  )
}

export default ErrorBanner
