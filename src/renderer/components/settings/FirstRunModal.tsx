interface FirstRunModalProps {
  onAddToken: () => void
  onDismiss: () => void
}

function FirstRunModal({ onAddToken, onDismiss }: FirstRunModalProps): React.JSX.Element {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="first-run-title">
      <div className="modal">
        <h2 id="first-run-title">Connect your GitHub account</h2>
        <p className="modal__intro">
          claude-tracker reads your repos, commits, and languages from GitHub - it never
          writes, comments, or pushes anything, so the token you create only needs
          read access.
        </p>

        <div className="modal__section">
          <h3>Recommended: fine-grained token</h3>
          <ol>
            <li>
              Open{' '}
              <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">
                github.com/settings/personal-access-tokens/new
              </a>
            </li>
            <li>
              Set <strong>Repository access</strong> to "All repositories" (or pick specific
              ones)
            </li>
            <li>
              Under <strong>Repository permissions</strong>, set <strong>Contents</strong> to{' '}
              <strong>Read-only</strong>
            </li>
            <li>
              <strong>Metadata</strong> is included automatically as Read-only and is
              required - leave it as is
            </li>
            <li>Generate the token and paste it into Settings</li>
          </ol>
        </div>

        <div className="modal__section">
          <h3>Alternative: classic token</h3>
          <p>
            Create one at{' '}
            <a href="https://github.com/settings/tokens/new" target="_blank" rel="noreferrer">
              github.com/settings/tokens/new
            </a>{' '}
            and check the <strong>repo</strong> scope (needed to see private repos - use{' '}
            <strong>public_repo</strong> instead if you only want public ones tracked).
          </p>
        </div>

        <div className="modal__actions">
          <button type="button" className="modal__secondary" onClick={onDismiss}>
            Maybe later
          </button>
          <button type="button" className="modal__primary" onClick={onAddToken}>
            Add token now
          </button>
        </div>
      </div>
    </div>
  )
}

export default FirstRunModal
