import { useState, useEffect } from 'react'
import { Search, X, Check, Link, Plus } from 'lucide-react'
import { searchImages } from '../utils/storage'

function ImageSearch({ initialQuery, onSelect, onClose }) {
  const [query, setQuery] = useState(initialQuery || '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState([])
  const [provider, setProvider] = useState('all')
  const [showManualAdd, setShowManualAdd] = useState(false)
  const [manualUrl, setManualUrl] = useState('')
  const [manualAlt, setManualAlt] = useState('')

  // Search on initial load if query provided
  useEffect(() => {
    if (initialQuery) {
      handleSearch()
    }
  }, [])

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setSelected([])
    try {
      const images = await searchImages(query, provider, 18)
      setResults(images)
    } catch (err) {
      console.error('Search failed:', err)
    }
    setLoading(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
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

  const handleManualAdd = () => {
    if (!manualUrl.trim()) return

    const manualImage = {
      id: `manual-${Date.now()}`,
      src: manualUrl.trim(),
      thumb: manualUrl.trim(),
      full: manualUrl.trim(),
      alt: manualAlt.trim() || 'Image',
      photographer: '',
      photographerUrl: '',
      source: 'manual',
      sourceUrl: manualUrl.trim(),
    }

    onSelect([manualImage])
    setManualUrl('')
    setManualAlt('')
    setShowManualAdd(false)
  }

  return (
    <div className="image-search-modal" onClick={onClose}>
      <div className="image-search-content" onClick={(e) => e.stopPropagation()}>
        <div className="image-search-header">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search images..."
            autoFocus
          />
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            style={{ padding: '10px', borderRadius: 6, border: '1px solid #ddd' }}
          >
            <option value="all">All Sources</option>
            <option value="unsplash">Unsplash</option>
            <option value="pexels">Pexels</option>
            <option value="pixabay">Pixabay</option>
            <option value="wikimedia">Wikimedia</option>
          </select>
          <button onClick={handleSearch} className="btn btn-primary" disabled={loading}>
            <Search size={16} />
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button
            onClick={() => setShowManualAdd(!showManualAdd)}
            className={`btn ${showManualAdd ? 'btn-primary' : 'btn-secondary'}`}
            title="Add image by URL"
          >
            <Link size={16} />
          </button>
          <button onClick={onClose} className="btn btn-secondary">
            <X size={16} />
          </button>
        </div>

        {/* Manual URL Input */}
        {showManualAdd && (
          <div style={{
            padding: 16,
            borderBottom: '1px solid #ddd',
            background: '#f9f9f9',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-end'
          }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#666' }}>
                Image URL
              </label>
              <input
                type="text"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#666' }}>
                Alt Text
              </label>
              <input
                type="text"
                value={manualAlt}
                onChange={(e) => setManualAlt(e.target.value)}
                placeholder="Description..."
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6 }}
              />
            </div>
            <button
              onClick={handleManualAdd}
              className="btn btn-primary"
              disabled={!manualUrl.trim()}
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        )}

        <div className="image-search-results">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div className="spinner"></div>
              <p>Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
              {query ? 'No images found. Try a different search or add by URL.' : 'Enter a search term to find images, or add by URL.'}
            </div>
          ) : (
            <div className="search-grid">
              {results.map(image => {
                const isSelected = selected.some(img => img.id === image.id)
                return (
                  <div key={image.id}>
                    <div
                      className={`search-image ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleSelect(image)}
                    >
                      <img src={image.thumb} alt={image.alt} />
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
                    </div>
                    <div className="image-source">
                      {image.source} • {image.photographer}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

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
