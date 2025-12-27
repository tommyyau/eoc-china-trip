import { useState, useRef } from 'react'
import { Upload, X, Trash2, Check } from 'lucide-react'

function ImageSearch({ initialQuery, onSelect, onClose, dayNumber = 0 }) {
  const [uploading, setUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState([])
  const [selected, setSelected] = useState([])
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('image', file)

        const response = await fetch(`/api/images/upload?dayNumber=${dayNumber}`, {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || 'Upload failed')
        }

        const result = await response.json()
        if (result.success && result.image) {
          setUploadedImages(prev => [...prev, result.image])
          setSelected(prev => [...prev, result.image])
        }
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message)
    }

    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (image) => {
    if (!image.filename) return

    try {
      const response = await fetch(`/api/images/${image.filename}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setUploadedImages(prev => prev.filter(img => img.id !== image.id))
        setSelected(prev => prev.filter(img => img.id !== image.id))
      }
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const toggleSelect = (image) => {
    setSelected(prev => {
      const isSelected = prev.some(img => img.id === image.id)
      if (isSelected) {
        return prev.filter(img => img.id !== image.id)
      }
      return [...prev, image]
    })
  }

  const handleAdd = () => {
    if (selected.length > 0) {
      onSelect(selected)
    }
  }

  return (
    <div className="image-search-modal" onClick={onClose}>
      <div className="image-search-content" onClick={(e) => e.stopPropagation()}>
        <div className="image-search-header">
          <h3 style={{ margin: 0, flex: 1 }}>Upload Images</h3>
          <button onClick={onClose} className="btn btn-secondary">
            <X size={16} />
          </button>
        </div>

        {/* Upload Section */}
        <div style={{
          padding: 20,
          borderBottom: '1px solid #ddd',
          background: '#f9f9f9',
          textAlign: 'center'
        }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary"
            disabled={uploading}
            style={{ padding: '12px 24px', fontSize: 16 }}
          >
            <Upload size={20} />
            {uploading ? 'Uploading...' : 'Choose Images from Computer'}
          </button>
          <p style={{ margin: '12px 0 0', color: '#666', fontSize: 14 }}>
            Select JPEG, PNG, GIF, or WebP images (max 10MB each)
          </p>
          {error && (
            <p style={{ color: '#d32f2f', marginTop: 8 }}>{error}</p>
          )}
        </div>

        {/* Uploaded Images Grid */}
        <div className="image-search-results">
          {uploadedImages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
              No images uploaded yet. Click the button above to select images from your computer.
            </div>
          ) : (
            <div className="search-grid">
              {uploadedImages.map(image => {
                const isSelected = selected.some(img => img.id === image.id)
                return (
                  <div key={image.id}>
                    <div
                      className={`search-image ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleSelect(image)}
                    >
                      <img src={image.thumb || image.src} alt={image.alt} />
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          width: 24,
                          height: 24,
                          background: '#2196f3',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Check size={14} color="white" />
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(image)
                        }}
                        style={{
                          position: 'absolute',
                          bottom: 4,
                          right: 4,
                          width: 28,
                          height: 28,
                          background: 'rgba(211, 47, 47, 0.9)',
                          border: 'none',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Delete image"
                      >
                        <Trash2 size={14} color="white" />
                      </button>
                    </div>
                    <div className="image-source">
                      {image.filename || 'Local Upload'}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer with Add button */}
        {selected.length > 0 && (
          <div style={{
            padding: 16,
            borderTop: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{selected.length} image{selected.length > 1 ? 's' : ''} selected</span>
            <button onClick={handleAdd} className="btn btn-primary">
              Add Selected Images
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageSearch
