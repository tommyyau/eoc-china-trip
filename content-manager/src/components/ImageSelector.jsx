// Simple image upload selector - upload from local filesystem only

import { useState, useEffect, useRef } from 'react'

const API_BASE = 'http://localhost:3001'

// Small component for selected image thumbnails with hover-to-delete
function SelectedImageThumb({ image, onPreview, onDelete }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      style={{
        position: 'relative',
        cursor: 'pointer'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={image.thumb || image.url}
        alt={image.alt}
        onClick={onPreview}
        style={{
          width: '100%',
          height: '120px',
          objectFit: 'cover',
          borderRadius: '8px',
          border: '3px solid #27ae60'
        }}
      />
      {/* Trash overlay - only visible on hover */}
      {isHovered && (
        <div
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(231, 76, 60, 0.85)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>Delete</span>
        </div>
      )}
    </div>
  )
}

function ImageSelector({ dayNumber, segmentId, segmentTitle, existingImages = [], onSave, onClose }) {
  const [selectedImages, setSelectedImages] = useState(existingImages)
  const [uploading, setUploading] = useState(false)
  const [lightboxImage, setLightboxImage] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const fileInputRef = useRef(null)

  // Handle Escape key for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (lightboxImage) {
          setLightboxImage(null)
        } else if (deleteConfirm) {
          setDeleteConfirm(null)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxImage, deleteConfirm])

  const handleFileSelect = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('image', file)

        const response = await fetch(`${API_BASE}/api/upload-image?dayNumber=${dayNumber}`, {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        const data = await response.json()
        setSelectedImages(prev => [...prev, data.image])
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = async (imageId) => {
    const image = selectedImages.find(img => img.id === imageId)

    // If it's a local image, delete the file too
    if (image && image.source === 'local' && image.filename) {
      try {
        await fetch(`${API_BASE}/api/delete-image/${image.filename}`, {
          method: 'DELETE'
        })
      } catch (error) {
        console.error('Failed to delete file:', error)
      }
    }

    setSelectedImages(prev => prev.filter(img => img.id !== imageId))
    setDeleteConfirm(null)
  }

  const handleSave = () => {
    onSave(selectedImages)
    onClose()
  }

  const openLightbox = (image) => {
    setLightboxImage(image)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0 }}>Upload Images</h2>
            <p style={{ margin: '5px 0 0', color: '#666' }}>
              Day {dayNumber}{segmentTitle ? ` - ${segmentTitle}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            x
          </button>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {/* Upload Area */}
          <div style={{
            border: '3px dashed #ccc',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            marginBottom: '20px',
            background: '#f9f9f9'
          }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              style={{
                display: 'inline-block',
                padding: '15px 40px',
                background: uploading ? '#ccc' : '#1a5f7a',
                color: 'white',
                borderRadius: '8px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}
            >
              {uploading ? 'Uploading...' : 'Choose Images'}
            </label>
            <p style={{ marginTop: '15px', color: '#666' }}>
              Select one or more images from your computer (JPEG, PNG, GIF, WebP)
            </p>
          </div>

          {/* Selected Images Grid */}
          {selectedImages.length > 0 && (
            <div>
              <h3 style={{ marginBottom: '15px' }}>Selected Images ({selectedImages.length})</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '15px'
              }}>
                {selectedImages.map(img => (
                  <SelectedImageThumb
                    key={img.id}
                    image={img}
                    onPreview={() => openLightbox(img)}
                    onDelete={() => setDeleteConfirm(img.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {selectedImages.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#999'
            }}>
              No images selected yet. Click "Choose Images" to upload.
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '15px 20px',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#e0e0e0',
              color: '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 25px',
              background: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Save ({selectedImages.length} images)
          </button>
        </div>
      </div>

      {/* Lightbox for full-screen preview */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxImage(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              fontSize: '2rem',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            x
          </button>

          {/* Image */}
          <img
            src={lightboxImage.full || lightboxImage.url}
            alt={lightboxImage.alt}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90%',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />

          {/* Image info */}
          <div style={{ color: 'white', textAlign: 'center', marginTop: '15px' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              {lightboxImage.alt}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div
          onClick={() => setDeleteConfirm(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 2000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '25px',
              maxWidth: '400px',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
            }}
          >
            <h3 style={{ margin: '0 0 10px' }}>Delete Image?</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              This will remove the image from your selection and delete the file.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  padding: '10px 25px',
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveImage(deleteConfirm)}
                style={{
                  padding: '10px 25px',
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageSelector
