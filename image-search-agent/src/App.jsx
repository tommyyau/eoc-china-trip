import { useState, useEffect } from 'react'
import SearchBar from './components/SearchBar'
import ImageGrid from './components/ImageGrid'
import SessionHistory from './components/SessionHistory'
import RefinementPanel from './components/RefinementPanel'

function App() {
  const [query, setQuery] = useState('')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [sources, setSources] = useState({})
  const [searches, setSearches] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [stats, setStats] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)

  // Load session history on mount
  useEffect(() => {
    loadSessions()
    loadStats()
  }, [])

  const loadSessions = async () => {
    try {
      const res = await fetch('/api/sessions')
      const data = await res.json()
      setSearches(data.searches || [])
    } catch (e) {
      console.error('Failed to load sessions:', e)
    }
  }

  const loadStats = async () => {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      setStats(data)
    } catch (e) {
      console.error('Failed to load stats:', e)
    }
  }

  const loadSuggestions = async (searchQuery) => {
    try {
      const res = await fetch(`/api/suggestions?query=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setSuggestions(data.suggestions || [])
    } catch (e) {
      console.error('Failed to load suggestions:', e)
    }
  }

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return

    setQuery(searchQuery)
    setLoading(true)
    setImages([])
    setSuggestions([])

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, count: 40 })
      })
      const data = await res.json()
      setImages(data.images || [])
      setSources(data.sources || {})
      loadSessions()
      loadSuggestions(searchQuery)
    } catch (e) {
      console.error('Search failed:', e)
    }

    setLoading(false)
  }

  const handleRate = async (imageId, rating) => {
    try {
      await fetch('/api/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, imageId, rating })
      })

      // Update local state
      setImages(prev => prev.map(img =>
        img.id === imageId ? { ...img, userRating: rating } : img
      ))

      loadStats()
      loadSuggestions(query)
    } catch (e) {
      console.error('Rating failed:', e)
    }
  }

  const handleSelectSearch = (searchQuery) => {
    handleSearch(searchQuery)
  }

  const handleSelectSuggestion = (suggestion) => {
    if (suggestion.type === 'add_qualifier') {
      handleSearch(suggestion.suggestion)
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>Image Search Agent</h1>

        <SessionHistory
          searches={searches}
          onSelect={handleSelectSearch}
        />

        {stats && (
          <div className="stats">
            <h2>Statistics</h2>
            <div className="stat-item">
              <span className="label">Total Searches</span>
              <span className="value">{stats.totalSearches}</span>
            </div>
            <div className="stat-item">
              <span className="label">Images Rated</span>
              <span className="value">{stats.totalRatings}</span>
            </div>
            <div className="stat-item">
              <span className="label">Very Relevant</span>
              <span className="value" style={{color: '#2e7d32'}}>{stats.ratingCounts.veryRelevant}</span>
            </div>
            <div className="stat-item">
              <span className="label">Relevant</span>
              <span className="value" style={{color: '#f57c00'}}>{stats.ratingCounts.relevant}</span>
            </div>
            <div className="stat-item">
              <span className="label">Not Relevant</span>
              <span className="value" style={{color: '#c62828'}}>{stats.ratingCounts.notRelevant}</span>
            </div>
          </div>
        )}
      </aside>

      <main className="main">
        <SearchBar
          onSearch={handleSearch}
          loading={loading}
          initialQuery={query}
        />

        {suggestions.length > 0 && (
          <RefinementPanel
            suggestions={suggestions}
            onSelect={handleSelectSuggestion}
          />
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Searching images...</p>
          </div>
        ) : images.length > 0 ? (
          <>
            <div className="result-count">
              Found {images.length} images
              {Object.keys(sources).length > 0 && (
                <span className="source-badges" style={{marginLeft: 12, display: 'inline-flex'}}>
                  {sources.wikimedia > 0 && <span className="source-badge wikimedia">Wikimedia: {sources.wikimedia}</span>}
                  {sources.unsplash > 0 && <span className="source-badge unsplash">Unsplash: {sources.unsplash}</span>}
                  {sources.pexels > 0 && <span className="source-badge pexels">Pexels: {sources.pexels}</span>}
                  {sources.pixabay > 0 && <span className="source-badge pixabay">Pixabay: {sources.pixabay}</span>}
                </span>
              )}
            </div>
            <ImageGrid
              images={images}
              onRate={handleRate}
              onSelect={setSelectedImage}
            />
          </>
        ) : query ? (
          <div className="empty-state">
            <h3>No images found</h3>
            <p>Try different search terms or check your API keys</p>
          </div>
        ) : (
          <div className="empty-state">
            <h3>Search for a location</h3>
            <p>Try "Great Wall of China", "Terracotta Warriors Xi'an", or "Mount Tai Shandong"</p>
          </div>
        )}
      </main>

      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <button className="image-modal-close" onClick={() => setSelectedImage(null)}>&times;</button>
          <img src={selectedImage.full || selectedImage.url} alt={selectedImage.alt} />
        </div>
      )}
    </div>
  )
}

export default App
