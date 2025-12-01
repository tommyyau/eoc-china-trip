function RefinementPanel({ suggestions, onSelect }) {
  if (suggestions.length === 0) return null

  return (
    <div className="refinement-panel">
      <h3>Suggestions to improve results</h3>
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className="suggestion"
          onClick={() => onSelect(suggestion)}
        >
          <div className="suggestion-text">
            {suggestion.type === 'add_qualifier' ? (
              <>Try: "{suggestion.suggestion}"</>
            ) : (
              suggestion.suggestion
            )}
          </div>
          <div className="suggestion-reason">{suggestion.reason}</div>
        </div>
      ))}
    </div>
  )
}

export default RefinementPanel
