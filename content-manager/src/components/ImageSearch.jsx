// Search component for Pexels/Unsplash images

import { useState } from 'react'
import { searchImages } from '../utils/imageApi'
import ImageGrid from './ImageGrid'

function ImageSearch({ onAddImage, onPreview, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery)
  const [provider, setProvider] = useState('both')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setError(null)

    try {
      const images = await searchImages(query, provider, 8)
      setResults(images)
    } catch (e) {
      setError(e.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleAddImage = (image) => {
    if (onAddImage) {
      onAddImage(image)
    }
  }

  return (
    <div>
      {/* Search controls - stacked layout for better visibility */}
      <div style={{ marginBottom: '20px' }}>
        {/* Provider selection - prominent row */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '1rem', color: '#333' }}>
            Image Provider
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { value: 'both', label: 'Both (Unsplash + Pexels)', color: '#1a5f7a' },
              { value: 'unsplash', label: 'Unsplash Only', color: '#111' },
              { value: 'pexels', label: 'Pexels Only', color: '#05a081' }
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setProvider(opt.value)}
                style={{
                  padding: '10px 20px',
                  background: provider === opt.value ? opt.color : 'white',
                  color: provider === opt.value ? 'white' : '#333',
                  border: `2px solid ${opt.color}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: provider === opt.value ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search input row */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '1rem', color: '#333' }}>
              Search Query
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., 'great wall china sunset'"
              style={{
                width: '100%',
                padding: '12px 15px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              style={{
                padding: '12px 30px',
                background: loading ? '#ccc' : '#1a5f7a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem',
                height: '48px'
              }}
            >
              {loading ? 'Searching...' : '🔍 Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '15px', background: '#fee', color: '#c00', borderRadius: '6px', marginBottom: '15px' }}>
          Error: {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div>
          <div style={{ marginBottom: '15px', padding: '10px 15px', background: '#f0f0f0', borderRadius: '6px' }}>
            Found <strong>{results.length}</strong> images for "<strong>{query}</strong>" from <strong>{provider === 'both' ? 'Unsplash + Pexels' : provider}</strong>
          </div>
          <ImageGrid
            images={results}
            onSave={handleAddImage}
            onPreview={onPreview}
            showSaveButton={true}
          />
        </div>
      )}

      {/* No results message */}
      {!loading && results.length === 0 && query && (
        <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>
          Enter a search term and click Search to find images
        </div>
      )}
    </div>
  )
}

export default ImageSearch
