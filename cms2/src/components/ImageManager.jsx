import { useState } from 'react'
import { Plus, X, GripVertical } from 'lucide-react'
import ImageSearch from './ImageSearch'

function ImageManager({ images, onUpdate, segmentTitle, dayNumber = 0 }) {
  const [showSearch, setShowSearch] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState(null)

  const handleRemove = (index) => {
    onUpdate(images.filter((_, i) => i !== index))
  }

  const handleAddImages = (newImages) => {
    onUpdate([...images, ...newImages])
    setShowSearch(false)
  }

  // Drag and drop reordering
  const handleDragStart = (index) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedImage)
    onUpdate(newImages)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="image-manager">
      <div className="field">
        <label>Images ({images.length})</label>

        {images.length > 0 && (
          <div className="image-grid">
            {images.map((img, index) => (
              <div
                key={img.id || index}
                className="image-item"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                style={{ opacity: draggedIndex === index ? 0.5 : 1 }}
              >
                <img src={img.thumb || img.src} alt={img.alt || ''} />
                <span className="image-order">{index + 1}</span>
                <button
                  className="remove-btn"
                  onClick={() => handleRemove(index)}
                  title="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          className="btn btn-secondary"
          onClick={() => setShowSearch(true)}
          style={{ marginTop: 12 }}
        >
          <Plus size={14} />
          Upload Images
        </button>
      </div>

      {showSearch && (
        <ImageSearch
          initialQuery={segmentTitle}
          onSelect={handleAddImages}
          onClose={() => setShowSearch(false)}
          dayNumber={dayNumber}
        />
      )}
    </div>
  )
}

export default ImageManager
