import { useState } from 'react'
import { Search } from 'lucide-react'

function SearchBar({ onSearch, loading, initialQuery }) {
  const [query, setQuery] = useState(initialQuery || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter a location (e.g., Forbidden City Beijing, Lushan Mountain)"
        disabled={loading}
      />
      <button type="submit" disabled={loading || !query.trim()}>
        <Search size={18} />
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  )
}

export default SearchBar
