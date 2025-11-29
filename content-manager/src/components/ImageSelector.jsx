// Main image selection modal with 3 tabs: Research, Search, Custom URL

import { useState, useEffect } from 'react'
import { loadResearch } from '../utils/imageApi'
import ImageGrid from './ImageGrid'
import ImageSearch from './ImageSearch'

// Small component for selected image thumbnails with hover-to-delete
function SelectedImageThumb({ image, onPreview, onDelete }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      style={{
        position: 'relative',
        flexShrink: 0,
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
          width: '100px',
          height: '70px',
          objectFit: 'cover',
          borderRadius: '6px',
          border: '3px solid #27ae60',
          transition: 'opacity 0.2s',
          opacity: isHovered ? 0.7 : 1
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
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '2px'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>🗑️</span>
          <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: 'bold' }}>Remove</span>
        </div>
      )}
    </div>
  )
}

function ImageSelector({ dayNumber, segmentId, segmentTitle, existingImages = [], onSave, onClose }) {
  const [activeTab, setActiveTab] = useState('research')
  const [research, setResearch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImages, setSelectedImages] = useState(existingImages)
  const [customUrl, setCustomUrl] = useState('')
  const [customAlt, setCustomAlt] = useState('')
  const [lightboxImage, setLightboxImage] = useState(null) // For full-screen preview
  const [deleteConfirm, setDeleteConfirm] = useState(null) // For delete confirmation

  // Load research data on mount
  useEffect(() => {
    const fetchResearch = async () => {
      setLoading(true)
      try {
        const data = await loadResearch(dayNumber)
        setResearch(data)
      } catch (e) {
        console.error('Failed to load research:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchResearch()
  }, [dayNumber])

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

  // Find the matching activity from research data
  const getMatchingActivity = () => {
    if (!research || !research.activities) return null

    // For day-overview, return null (will show all activities)
    if (segmentId === 'day-overview') return null

    // Try to find matching activity by segment title
    if (segmentTitle) {
      const matchingActivity = research.activities.find(a => {
        const activityName = a.name.toLowerCase()
        const title = segmentTitle.toLowerCase()
        return activityName.includes(title) ||
               title.includes(activityName) ||
               // Also check individual words
               title.split(' ').some(word => word.length > 3 && activityName.includes(word))
      })
      if (matchingActivity) return matchingActivity
    }

    return null
  }

  // Get research images for this segment/activity
  const getResearchImages = () => {
    if (!research || !research.activities) return []

    const matchingActivity = getMatchingActivity()

    // If we found a matching activity, return only its images
    if (matchingActivity) {
      return matchingActivity.images || []
    }

    // For day-overview or no match, return all images from all activities
    return research.activities.flatMap(a => a.images || [])
  }

  // Get the search term used for this activity
  const getSearchTerm = () => {
    const matchingActivity = getMatchingActivity()
    if (matchingActivity) {
      return matchingActivity.searchTerm
    }
    // Default search term based on segment title and day location
    if (segmentTitle && research?.location?.en) {
      return `${segmentTitle} ${research.location.en} china`
    }
    return segmentTitle || ''
  }

  // Get all search terms for day overview
  const getAllSearchTerms = () => {
    if (!research || !research.activities) return []
    return research.activities.map(a => ({
      name: a.name,
      searchTerm: a.searchTerm
    }))
  }

  const matchingActivity = getMatchingActivity()
  const searchTerm = getSearchTerm()
  const allSearchTerms = getAllSearchTerms()

  const handleToggleImage = (imageId) => {
    setSelectedImages(prev => {
      const exists = prev.find(img => img.id === imageId)
      if (exists) {
        return prev.filter(img => img.id !== imageId)
      } else {
        // Find the image in research
        const allImages = getResearchImages()
        const image = allImages.find(img => img.id === imageId)
        if (image) {
          return [...prev, image]
        }
        return prev
      }
    })
  }

  const handleAddFromSearch = (image) => {
    // Check if already selected
    if (selectedImages.find(img => img.id === image.id)) {
      alert('Image already selected')
      return
    }
    setSelectedImages(prev => [...prev, image])
  }

  const handleAddCustomUrl = () => {
    if (!customUrl.trim()) {
      alert('Please enter an image URL')
      return
    }

    const customImage = {
      id: `custom-${Date.now()}`,
      url: customUrl,
      thumb: customUrl,
      full: customUrl,
      alt: customAlt || 'Custom image',
      photographer: 'Custom',
      source: 'custom'
    }

    setSelectedImages(prev => [...prev, customImage])
    setCustomUrl('')
    setCustomAlt('')
  }

  const handleRemoveSelected = (imageId) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId))
    setDeleteConfirm(null)
  }

  const handleSave = () => {
    onSave(selectedImages)
    onClose()
  }

  // Open lightbox with image
  const openLightbox = (image) => {
    setLightboxImage(image)
  }

  // Select image from lightbox
  const selectFromLightbox = () => {
    if (lightboxImage) {
      if (!selectedImages.find(img => img.id === lightboxImage.id)) {
        setSelectedImages(prev => [...prev, lightboxImage])
      }
      setLightboxImage(null)
    }
  }

  const selectedIds = new Set(selectedImages.map(img => img.id))
  const researchImages = getResearchImages()

  const tabs = [
    { id: 'research', label: `Research (${researchImages.length})` },
    { id: 'search', label: 'Search New' },
    { id: 'custom', label: 'Custom URL' }
  ]

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
        maxWidth: '1200px',
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
            <h2 style={{ margin: 0 }}>Select Images</h2>
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
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                background: activeTab === tab.id ? '#1a5f7a' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#666',
                border: 'none',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {/* Research Tab */}
          {activeTab === 'research' && (
            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  Loading research data...
                </div>
              ) : researchImages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <p>No research images found for this segment.</p>
                  <p style={{ marginTop: '10px' }}>Try the <strong>Search New</strong> tab with suggested term: <code style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: '4px' }}>{searchTerm}</code></p>
                </div>
              ) : (
                <>
                  {/* Show search terms info - prominently displayed */}
                  <div style={{ marginBottom: '20px', padding: '15px', background: '#1a5f7a', borderRadius: '8px', color: 'white' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '10px' }}>
                      🔍 Search Terms Used
                    </div>
                    {matchingActivity ? (
                      <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px', borderRadius: '6px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                          ✓ {matchingActivity.name}
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', background: 'rgba(255,255,255,0.2)', padding: '6px 10px', borderRadius: '4px' }}>
                          {matchingActivity.searchTerm}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ marginBottom: '8px', opacity: 0.9 }}>
                          All {allSearchTerms.length} activities for Day {dayNumber}:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {allSearchTerms.map((item, idx) => (
                            <div key={idx} style={{ background: 'rgba(255,255,255,0.15)', padding: '8px 10px', borderRadius: '6px' }}>
                              <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.name}</div>
                              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', opacity: 0.9 }}>{item.searchTerm}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <p style={{ marginBottom: '15px', color: '#666' }}>
                    Click an image to view full-screen, or click the checkbox to select/deselect.
                  </p>
                  <ImageGrid
                    images={researchImages}
                    selectedIds={selectedIds}
                    onToggle={handleToggleImage}
                    onPreview={openLightbox}
                  />
                </>
              )}
            </div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div>
              {/* Prominent search term suggestion */}
              <div style={{ marginBottom: '20px', padding: '15px', background: '#2e7d32', borderRadius: '8px', color: 'white' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '8px' }}>
                  💡 Suggested Search Term
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '1rem', background: 'rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '6px' }}>
                  {searchTerm || 'No suggestion available'}
                </div>
              </div>
              <ImageSearch
                onAddImage={handleAddFromSearch}
                onPreview={openLightbox}
                initialQuery={searchTerm}
              />
            </div>
          )}

          {/* Custom URL Tab */}
          {activeTab === 'custom' && (
            <div>
              <p style={{ marginBottom: '15px', color: '#666' }}>
                Add any image by pasting its URL. Use this for images not available on Pexels/Unsplash.
              </p>
              <div style={{ maxWidth: '600px' }}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Alt Text (optional)
                  </label>
                  <input
                    type="text"
                    value={customAlt}
                    onChange={(e) => setCustomAlt(e.target.value)}
                    placeholder="Description of the image"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <button
                  onClick={handleAddCustomUrl}
                  disabled={!customUrl.trim()}
                  style={{
                    padding: '10px 25px',
                    background: customUrl.trim() ? '#27ae60' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: customUrl.trim() ? 'pointer' : 'not-allowed',
                    fontWeight: 'bold'
                  }}
                >
                  Add Image
                </button>

                {/* Preview */}
                {customUrl && (
                  <div style={{ marginTop: '20px' }}>
                    <h4>Preview:</h4>
                    <img
                      src={customUrl}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '200px',
                        borderRadius: '8px',
                        border: '2px solid #e0e0e0'
                      }}
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Selected Images Section */}
        {selectedImages.length > 0 && (
          <div style={{
            padding: '15px 20px',
            borderTop: '1px solid #e0e0e0',
            background: '#f9f9f9'
          }}>
            <h4 style={{ margin: '0 0 10px' }}>
              Selected Images ({selectedImages.length})
            </h4>
            <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', paddingTop: '5px' }}>
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
            Save Selection ({selectedImages.length} images)
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
            ×
          </button>

          {/* Image */}
          <img
            src={lightboxImage.full || lightboxImage.url}
            alt={lightboxImage.alt}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90%',
              maxHeight: '70vh',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />

          {/* Image info */}
          <div style={{ color: 'white', textAlign: 'center', marginTop: '15px' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '5px' }}>
              {lightboxImage.alt}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
              📸 {lightboxImage.photographer} • {lightboxImage.source}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImage(null)}
              style={{
                padding: '12px 25px',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Close (Esc)
            </button>
            {selectedIds.has(lightboxImage.id) ? (
              <button
                onClick={() => {
                  handleToggleImage(lightboxImage.id)
                  setLightboxImage(null)
                }}
                style={{
                  padding: '12px 25px',
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                ✓ Selected - Click to Remove
              </button>
            ) : (
              <button
                onClick={selectFromLightbox}
                style={{
                  padding: '12px 25px',
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                ✓ Select This Image
              </button>
            )}
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
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🗑️</div>
            <h3 style={{ margin: '0 0 10px' }}>Remove Image?</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Are you sure you want to remove this image from your selection?
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
                onClick={() => handleRemoveSelected(deleteConfirm)}
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
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageSelector
