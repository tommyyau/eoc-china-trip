// Single image card with selection checkbox, source badge, photographer credit

function ImageCard({ image, selected, onToggle, onSave, onPreview, showSaveButton = false }) {
  const handleCardClick = (e) => {
    // If clicking on the checkbox area, toggle selection
    // Otherwise, open preview
    if (onPreview) {
      onPreview(image)
    } else if (onToggle) {
      onToggle(image.id)
    }
  }

  const handleCheckboxClick = (e) => {
    e.stopPropagation()
    if (onToggle) onToggle(image.id)
  }

  return (
    <div
      className={`image-card ${selected ? 'selected' : ''}`}
      onClick={handleCardClick}
      style={{
        border: selected ? '3px solid #27ae60' : '2px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        background: selected ? '#e8f5e9' : 'white',
        transition: 'all 0.2s'
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', paddingBottom: '66%', background: '#f5f5f5' }}>
        <img
          src={image.thumb || image.url}
          alt={image.alt}
          loading="lazy"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Checkbox for selection (separate click target) */}
        {onToggle && (
          <div
            onClick={handleCheckboxClick}
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              width: '28px',
              height: '28px',
              background: selected ? '#27ae60' : 'rgba(255,255,255,0.9)',
              border: selected ? '2px solid #27ae60' : '2px solid #666',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {selected && (
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>✓</span>
            )}
          </div>
        )}

        {/* Preview hint */}
        {onPreview && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.7rem'
          }}>
            🔍 Click to preview
          </div>
        )}

        {/* Selection indicator */}
        {selected && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            background: '#27ae60',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}>
            ✓ Selected
          </div>
        )}

        {/* Source badge */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          background: {
            pexels: '#05a081',
            unsplash: '#111',
            pixabay: '#00ab6c',
            wikimedia: '#006699',
            custom: '#666'
          }[image.source] || '#666',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.7rem',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          {image.source}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '10px' }}>
        <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>
          📸 {image.photographer}
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: '#888',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {image.alt}
        </div>
      </div>

      {/* Save button for search results */}
      {showSaveButton && onSave && (
        <button
          onClick={(e) => { e.stopPropagation(); onSave(image); }}
          style={{
            width: '100%',
            padding: '8px',
            background: '#27ae60',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 'bold'
          }}
        >
          + Add to Selection
        </button>
      )}
    </div>
  )
}

export default ImageCard
