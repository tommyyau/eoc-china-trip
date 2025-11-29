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
      {/* Compact search controls */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '15px' }}>
        {/* Search input */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>
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
              padding: '10px 12px',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Provider selection - compact */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>
            Source
          </label>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { value: 'both', label: 'Both', color: '#1a5f7a' },
              { value: 'unsplash', label: 'Unsplash', color: '#111' },
              { value: 'pexels', label: 'Pexels', color: '#05a081' }
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setProvider(opt.value)}
                style={{
                  padding: '8px 12px',
                  background: provider === opt.value ? opt.color : 'white',
                  color: provider === opt.value ? 'white' : '#666',
                  border: `1px solid ${provider === opt.value ? opt.color : '#ccc'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: provider === opt.value ? 'bold' : 'normal',
                  fontSize: '0.85rem',
                  transition: 'all 0.15s'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          style={{
            padding: '10px 20px',
            background: loading ? '#ccc' : '#1a5f7a',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            height: '42px'
          }}
        >
          {loading ? '...' : '🔍 Search'}
        </button>
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
