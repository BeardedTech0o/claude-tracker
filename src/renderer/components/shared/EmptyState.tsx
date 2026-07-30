interface EmptyStateProps {
  title: string
  description?: string
}

function EmptyState({ title, description }: EmptyStateProps): React.JSX.Element {
  return (
    <div className="empty-state">
      <p className="empty-state__title">{title}</p>
      {description && <p className="empty-state__description">{description}</p>}
    </div>
  )
}

export default EmptyState
