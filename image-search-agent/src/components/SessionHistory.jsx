function SessionHistory({ searches, onSelect }) {
  if (searches.length === 0) {
    return (
      <div>
        <h2>Recent Searches</h2>
        <p style={{ fontSize: 13, color: '#888', padding: '10px 0' }}>
          No searches yet
        </p>
      </div>
    )
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div>
      <h2>Recent Searches</h2>
      <ul className="search-history">
        {searches.slice(0, 15).map(search => (
          <li key={search.id} onClick={() => onSelect(search.query)}>
            <div className="query">{search.query}</div>
            <div className="meta">
              {search.resultCount} results &bull; {formatTime(search.timestamp)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SessionHistory
