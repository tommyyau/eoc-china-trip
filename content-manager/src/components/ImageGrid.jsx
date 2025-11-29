// Grid layout of ImageCards with selection state

import ImageCard from './ImageCard'

function ImageGrid({ images, selectedIds = new Set(), onToggle, onSave, onPreview, showSaveButton = false }) {
  if (!images || images.length === 0) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
        No images to display
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: '15px'
    }}>
      {images.map(image => (
        <ImageCard
          key={image.id}
          image={image}
          selected={selectedIds.has(image.id)}
          onToggle={onToggle}
          onSave={onSave}
          onPreview={onPreview}
          showSaveButton={showSaveButton}
        />
      ))}
    </div>
  )
}

export default ImageGrid
