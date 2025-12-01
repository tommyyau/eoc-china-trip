import { useState } from 'react'
import { ChevronDown, ChevronUp, Search, Plus, Trash2 } from 'lucide-react'
import { searchImages } from '../utils/storage'

function ItineraryPageEditor({ data, onUpdate }) {
  const [expandedSections, setExpandedSections] = useState({ hero: true })
  const [expandedRegions, setExpandedRegions] = useState({})
  const [searchingFor, setSearchingFor] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const toggleRegion = (regionId) => {
    setExpandedRegions(prev => ({ ...prev, [regionId]: !prev[regionId] }))
  }

  const updateHero = (field, value) => {
    onUpdate({ ...data, hero: { ...data.hero, [field]: value } })
  }

  const updateHeroBilingual = (field, lang, value) => {
    onUpdate({
      ...data,
      hero: {
        ...data.hero,
        [field]: { ...data.hero[field], [lang]: value }
      }
    })
  }

  const updateRegion = (index, field, value) => {
    const newRegions = [...data.regions]
    newRegions[index] = { ...newRegions[index], [field]: value }
    onUpdate({ ...data, regions: newRegions })
  }

  const updateRegionBilingual = (index, field, lang, value) => {
    const newRegions = [...data.regions]
    newRegions[index] = {
      ...newRegions[index],
      [field]: { ...newRegions[index][field], [lang]: value }
    }
    onUpdate({ ...data, regions: newRegions })
  }

  const updateRegionHighlight = (regionIndex, highlightIndex, lang, value) => {
    const newRegions = [...data.regions]
    const highlights = { ...newRegions[regionIndex].highlights }
    highlights[lang] = [...highlights[lang]]
    highlights[lang][highlightIndex] = value
    newRegions[regionIndex] = { ...newRegions[regionIndex], highlights }
    onUpdate({ ...data, regions: newRegions })
  }

  const addHighlight = (regionIndex) => {
    const newRegions = [...data.regions]
    const highlights = { ...newRegions[regionIndex].highlights }
    highlights.en = [...(highlights.en || []), '']
    highlights.cn = [...(highlights.cn || []), '']
    newRegions[regionIndex] = { ...newRegions[regionIndex], highlights }
    onUpdate({ ...data, regions: newRegions })
  }

  const removeHighlight = (regionIndex, highlightIndex) => {
    const newRegions = [...data.regions]
    const highlights = { ...newRegions[regionIndex].highlights }
    highlights.en = highlights.en.filter((_, i) => i !== highlightIndex)
    highlights.cn = highlights.cn.filter((_, i) => i !== highlightIndex)
    newRegions[regionIndex] = { ...newRegions[regionIndex], highlights }
    onUpdate({ ...data, regions: newRegions })
  }

  const handleImageSearch = async (target) => {
    if (!searchQuery.trim()) return
    setSearchingFor(target)
    try {
      const results = await searchImages(searchQuery, 'all', 12)
      setSearchResults(results || [])
    } catch (err) {
      console.error('Search failed:', err)
      setSearchResults([])
    }
  }

  const selectImage = (url) => {
    if (searchingFor === 'hero') {
      updateHero('backgroundImage', url)
    } else if (searchingFor?.startsWith('region-')) {
      const index = parseInt(searchingFor.split('-')[1])
      updateRegion(index, 'heroImage', url)
    }
    setSearchingFor(null)
    setSearchResults([])
    setSearchQuery('')
  }

  return (
    <div className="info-editor">
      {/* Hero Section */}
      <div className="section collapsible">
        <div className="section-header" onClick={() => toggleSection('hero')}>
          <h3>Hero Section</h3>
          {expandedSections.hero ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        {expandedSections.hero && (
          <div className="section-content">
            <div className="field">
              <label>Background Image</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  value={data.hero?.backgroundImage || ''}
                  onChange={(e) => updateHero('backgroundImage', e.target.value)}
                  placeholder="Image URL..."
                  style={{ flex: 1 }}
                />
                <button
                  className="btn btn-small btn-secondary"
                  onClick={() => {
                    setSearchingFor('hero')
                    setSearchQuery('china landscape mountain')
                  }}
                >
                  <Search size={14} />
                </button>
              </div>
              {data.hero?.backgroundImage && (
                <img
                  src={data.hero.backgroundImage}
                  alt="Hero preview"
                  style={{ marginTop: '0.5rem', maxHeight: '150px', borderRadius: '8px' }}
                />
              )}
            </div>

            <div className="field-row">
              <div className="field">
                <label>Title (English)</label>
                <input
                  type="text"
                  value={data.hero?.title?.en || ''}
                  onChange={(e) => updateHeroBilingual('title', 'en', e.target.value)}
                  placeholder="15 Days of Adventure"
                />
              </div>
              <div className="field">
                <label>Title (Chinese)</label>
                <input
                  type="text"
                  value={data.hero?.title?.cn || ''}
                  onChange={(e) => updateHeroBilingual('title', 'cn', e.target.value)}
                  placeholder="15天冒险之旅"
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Subtitle (English)</label>
                <input
                  type="text"
                  value={data.hero?.subtitle?.en || ''}
                  onChange={(e) => updateHeroBilingual('subtitle', 'en', e.target.value)}
                />
              </div>
              <div className="field">
                <label>Subtitle (Chinese)</label>
                <input
                  type="text"
                  value={data.hero?.subtitle?.cn || ''}
                  onChange={(e) => updateHeroBilingual('subtitle', 'cn', e.target.value)}
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Download Button (English)</label>
                <input
                  type="text"
                  value={data.hero?.downloadButton?.en || ''}
                  onChange={(e) => updateHeroBilingual('downloadButton', 'en', e.target.value)}
                  placeholder="Download PDF"
                />
              </div>
              <div className="field">
                <label>Download Button (Chinese)</label>
                <input
                  type="text"
                  value={data.hero?.downloadButton?.cn || ''}
                  onChange={(e) => updateHeroBilingual('downloadButton', 'cn', e.target.value)}
                  placeholder="下载PDF"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Regions Section */}
      <div className="section">
        <h3>Destination Regions ({data.regions?.length || 0})</h3>

        {data.regions?.map((region, index) => (
          <div key={region.id} className="region-card" style={{ marginTop: '1rem', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            <div
              className="region-header"
              onClick={() => toggleRegion(region.id)}
              style={{
                padding: '0.75rem 1rem',
                background: region.color || '#666',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ fontWeight: 600 }}>
                {region.name?.en || 'Region'} - Days {region.days?.join(', ')}
              </span>
              {expandedRegions[region.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>

            {expandedRegions[region.id] && (
              <div style={{ padding: '1rem' }}>
                <div className="field-row">
                  <div className="field">
                    <label>Name (English)</label>
                    <input
                      type="text"
                      value={region.name?.en || ''}
                      onChange={(e) => updateRegionBilingual(index, 'name', 'en', e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Name (Chinese)</label>
                    <input
                      type="text"
                      value={region.name?.cn || ''}
                      onChange={(e) => updateRegionBilingual(index, 'name', 'cn', e.target.value)}
                    />
                  </div>
                </div>

                <div className="field-row">
                  <div className="field">
                    <label>Days (comma separated)</label>
                    <input
                      type="text"
                      value={region.days?.join(', ') || ''}
                      onChange={(e) => {
                        const days = e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d))
                        updateRegion(index, 'days', days)
                      }}
                      placeholder="1, 2, 3, 4"
                    />
                  </div>
                  <div className="field">
                    <label>Theme Color</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="color"
                        value={region.color || '#666666'}
                        onChange={(e) => updateRegion(index, 'color', e.target.value)}
                        style={{ width: '50px', padding: 0 }}
                      />
                      <input
                        type="text"
                        value={region.color || ''}
                        onChange={(e) => updateRegion(index, 'color', e.target.value)}
                        placeholder="#D84315"
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label>Hero Image</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={region.heroImage || ''}
                      onChange={(e) => updateRegion(index, 'heroImage', e.target.value)}
                      placeholder="Image URL..."
                      style={{ flex: 1 }}
                    />
                    <button
                      className="btn btn-small btn-secondary"
                      onClick={() => {
                        setSearchingFor(`region-${index}`)
                        setSearchQuery(region.name?.en || 'china')
                      }}
                    >
                      <Search size={14} />
                    </button>
                  </div>
                  {region.heroImage && (
                    <img
                      src={region.heroImage}
                      alt="Region preview"
                      style={{ marginTop: '0.5rem', maxHeight: '100px', borderRadius: '8px' }}
                    />
                  )}
                </div>

                <div className="field-row">
                  <div className="field">
                    <label>Description (English)</label>
                    <textarea
                      value={region.description?.en || ''}
                      onChange={(e) => updateRegionBilingual(index, 'description', 'en', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="field">
                    <label>Description (Chinese)</label>
                    <textarea
                      value={region.description?.cn || ''}
                      onChange={(e) => updateRegionBilingual(index, 'description', 'cn', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Highlights</label>
                  {region.highlights?.en?.map((_, hIndex) => (
                    <div key={hIndex} className="field-row" style={{ marginBottom: '0.5rem' }}>
                      <input
                        type="text"
                        value={region.highlights.en[hIndex] || ''}
                        onChange={(e) => updateRegionHighlight(index, hIndex, 'en', e.target.value)}
                        placeholder="English highlight..."
                        style={{ flex: 1 }}
                      />
                      <input
                        type="text"
                        value={region.highlights.cn?.[hIndex] || ''}
                        onChange={(e) => updateRegionHighlight(index, hIndex, 'cn', e.target.value)}
                        placeholder="Chinese highlight..."
                        style={{ flex: 1 }}
                      />
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => removeHighlight(index, hIndex)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn btn-small btn-secondary"
                    onClick={() => addHighlight(index)}
                    style={{ marginTop: '0.5rem' }}
                  >
                    <Plus size={14} /> Add Highlight
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Image Search Modal */}
      {searchingFor && (
        <div className="modal-overlay" onClick={() => setSearchingFor(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Search Images</h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for images..."
                onKeyDown={(e) => e.key === 'Enter' && handleImageSearch(searchingFor)}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={() => handleImageSearch(searchingFor)}>
                Search
              </button>
            </div>
            <div className="image-grid">
              {searchResults.map((img) => (
                <div
                  key={img.id}
                  className="image-result"
                  onClick={() => selectImage(img.src)}
                >
                  <img src={img.thumb} alt={img.alt} />
                  <div className="image-source">{img.source}</div>
                </div>
              ))}
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => setSearchingFor(null)}
              style={{ marginTop: '1rem' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ItineraryPageEditor
