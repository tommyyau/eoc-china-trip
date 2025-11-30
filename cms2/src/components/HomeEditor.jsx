import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronRight, Image } from 'lucide-react'
import ImageSearch from './ImageSearch'

function HomeEditor({ data, onUpdate }) {
  const [expandedSections, setExpandedSections] = useState({
    hero: true,
    intro: false,
    stats: false,
    map: false,
    destinations: false,
    cta: false
  })
  const [imageSearchTarget, setImageSearchTarget] = useState(null)

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const updateField = (path, value) => {
    const newData = JSON.parse(JSON.stringify(data))
    const keys = path.split('.')
    let obj = newData
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]]
    }
    obj[keys[keys.length - 1]] = value
    onUpdate(newData)
  }

  const updateDestination = (index, field, lang, value) => {
    const newData = JSON.parse(JSON.stringify(data))
    if (lang) {
      newData.destinations.items[index][field][lang] = value
    } else {
      newData.destinations.items[index][field] = value
    }
    onUpdate(newData)
  }

  const addDestination = () => {
    const newData = JSON.parse(JSON.stringify(data))
    newData.destinations.items.push({
      id: `dest-${Date.now()}`,
      name: { en: 'New Destination', cn: '新目的地' },
      days: [1],
      coordinates: [0, 0],
      heroImage: '',
      description: { en: '', cn: '' },
      color: '#666666'
    })
    onUpdate(newData)
  }

  const removeDestination = (index) => {
    if (!confirm('Remove this destination?')) return
    const newData = JSON.parse(JSON.stringify(data))
    newData.destinations.items.splice(index, 1)
    onUpdate(newData)
  }

  const handleImageSelect = (image) => {
    if (!imageSearchTarget) return
    const { type, index } = imageSearchTarget

    if (type === 'hero') {
      updateField('hero.backgroundImage', image.src)
    } else if (type === 'cta') {
      updateField('cta.backgroundImage', image.src)
    } else if (type === 'destination') {
      updateDestination(index, 'heroImage', null, image.src)
    }
    setImageSearchTarget(null)
  }

  const SectionHeader = ({ id, title }) => (
    <div
      className="section-header"
      onClick={() => toggleSection(id)}
      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
    >
      {expandedSections[id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      <h3 style={{ margin: 0 }}>{title}</h3>
    </div>
  )

  return (
    <div className="home-editor">
      <h2>Home Page Editor</h2>

      {/* Hero Section */}
      <section className="editor-section">
        <SectionHeader id="hero" title="Hero Section" />
        {expandedSections.hero && (
          <div className="section-content">
            <div className="field">
              <label>Title (English)</label>
              <input
                type="text"
                value={data.hero?.title?.en || ''}
                onChange={(e) => updateField('hero.title.en', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Title (Chinese)</label>
              <input
                type="text"
                value={data.hero?.title?.cn || ''}
                onChange={(e) => updateField('hero.title.cn', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Subtitle (English)</label>
              <input
                type="text"
                value={data.hero?.subtitle?.en || ''}
                onChange={(e) => updateField('hero.subtitle.en', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Subtitle (Chinese)</label>
              <input
                type="text"
                value={data.hero?.subtitle?.cn || ''}
                onChange={(e) => updateField('hero.subtitle.cn', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Date (English)</label>
              <input
                type="text"
                value={data.hero?.date?.en || ''}
                onChange={(e) => updateField('hero.date.en', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Date (Chinese)</label>
              <input
                type="text"
                value={data.hero?.date?.cn || ''}
                onChange={(e) => updateField('hero.date.cn', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Primary Button (English)</label>
              <input
                type="text"
                value={data.hero?.ctaPrimary?.en || ''}
                onChange={(e) => updateField('hero.ctaPrimary.en', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Primary Button (Chinese)</label>
              <input
                type="text"
                value={data.hero?.ctaPrimary?.cn || ''}
                onChange={(e) => updateField('hero.ctaPrimary.cn', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Secondary Button (English)</label>
              <input
                type="text"
                value={data.hero?.ctaSecondary?.en || ''}
                onChange={(e) => updateField('hero.ctaSecondary.en', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Secondary Button (Chinese)</label>
              <input
                type="text"
                value={data.hero?.ctaSecondary?.cn || ''}
                onChange={(e) => updateField('hero.ctaSecondary.cn', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Background Image</label>
              <div className="image-field">
                {data.hero?.backgroundImage && (
                  <img src={data.hero.backgroundImage} alt="Hero" className="preview-image" />
                )}
                <input
                  type="text"
                  value={data.hero?.backgroundImage || ''}
                  onChange={(e) => updateField('hero.backgroundImage', e.target.value)}
                  placeholder="Image URL..."
                />
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => setImageSearchTarget({ type: 'hero' })}
                >
                  <Image size={14} /> Search
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Introduction Section */}
      <section className="editor-section">
        <SectionHeader id="intro" title="Introduction Section" />
        {expandedSections.intro && (
          <div className="section-content">
            <div className="field">
              <label>Title (English)</label>
              <input
                type="text"
                value={data.intro?.title?.en || ''}
                onChange={(e) => updateField('intro.title.en', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Title (Chinese)</label>
              <input
                type="text"
                value={data.intro?.title?.cn || ''}
                onChange={(e) => updateField('intro.title.cn', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Text (English)</label>
              <textarea
                value={data.intro?.text?.en || ''}
                onChange={(e) => updateField('intro.text.en', e.target.value)}
                rows={4}
              />
            </div>
            <div className="field">
              <label>Text (Chinese)</label>
              <textarea
                value={data.intro?.text?.cn || ''}
                onChange={(e) => updateField('intro.text.cn', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )}
      </section>

      {/* Stats Section */}
      <section className="editor-section">
        <SectionHeader id="stats" title="Stats Section" />
        {expandedSections.stats && (
          <div className="section-content">
            <div className="stats-grid">
              <div className="stat-item">
                <label>Days</label>
                <input
                  type="number"
                  value={data.stats?.days || 0}
                  onChange={(e) => updateField('stats.days', parseInt(e.target.value) || 0)}
                />
                <input
                  type="text"
                  value={data.stats?.labels?.days?.en || ''}
                  onChange={(e) => updateField('stats.labels.days.en', e.target.value)}
                  placeholder="Label (EN)"
                />
                <input
                  type="text"
                  value={data.stats?.labels?.days?.cn || ''}
                  onChange={(e) => updateField('stats.labels.days.cn', e.target.value)}
                  placeholder="Label (CN)"
                />
              </div>
              <div className="stat-item">
                <label>Destinations</label>
                <input
                  type="number"
                  value={data.stats?.destinations || 0}
                  onChange={(e) => updateField('stats.destinations', parseInt(e.target.value) || 0)}
                />
                <input
                  type="text"
                  value={data.stats?.labels?.destinations?.en || ''}
                  onChange={(e) => updateField('stats.labels.destinations.en', e.target.value)}
                  placeholder="Label (EN)"
                />
                <input
                  type="text"
                  value={data.stats?.labels?.destinations?.cn || ''}
                  onChange={(e) => updateField('stats.labels.destinations.cn', e.target.value)}
                  placeholder="Label (CN)"
                />
              </div>
              <div className="stat-item">
                <label>Hiking (km)</label>
                <input
                  type="number"
                  value={data.stats?.hikingKm || 0}
                  onChange={(e) => updateField('stats.hikingKm', parseInt(e.target.value) || 0)}
                />
                <input
                  type="text"
                  value={data.stats?.labels?.hikingKm?.en || ''}
                  onChange={(e) => updateField('stats.labels.hikingKm.en', e.target.value)}
                  placeholder="Label (EN)"
                />
                <input
                  type="text"
                  value={data.stats?.labels?.hikingKm?.cn || ''}
                  onChange={(e) => updateField('stats.labels.hikingKm.cn', e.target.value)}
                  placeholder="Label (CN)"
                />
              </div>
              <div className="stat-item">
                <label>Elevation (m)</label>
                <input
                  type="number"
                  value={data.stats?.elevation || 0}
                  onChange={(e) => updateField('stats.elevation', parseInt(e.target.value) || 0)}
                />
                <input
                  type="text"
                  value={data.stats?.labels?.elevation?.en || ''}
                  onChange={(e) => updateField('stats.labels.elevation.en', e.target.value)}
                  placeholder="Label (EN)"
                />
                <input
                  type="text"
                  value={data.stats?.labels?.elevation?.cn || ''}
                  onChange={(e) => updateField('stats.labels.elevation.cn', e.target.value)}
                  placeholder="Label (CN)"
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Map Section */}
      <section className="editor-section">
        <SectionHeader id="map" title="Map Section" />
        {expandedSections.map && (
          <div className="section-content">
            <div className="field">
              <label>Title (English)</label>
              <input
                type="text"
                value={data.map?.title?.en || ''}
                onChange={(e) => updateField('map.title.en', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Title (Chinese)</label>
              <input
                type="text"
                value={data.map?.title?.cn || ''}
                onChange={(e) => updateField('map.title.cn', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Subtitle (English)</label>
              <input
                type="text"
                value={data.map?.subtitle?.en || ''}
                onChange={(e) => updateField('map.subtitle.en', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Subtitle (Chinese)</label>
              <input
                type="text"
                value={data.map?.subtitle?.cn || ''}
                onChange={(e) => updateField('map.subtitle.cn', e.target.value)}
              />
            </div>
          </div>
        )}
      </section>

      {/* Destinations Section */}
      <section className="editor-section">
        <SectionHeader id="destinations" title="Destinations Section" />
        {expandedSections.destinations && (
          <div className="section-content">
            <div className="field">
              <label>Section Title (English)</label>
              <input
                type="text"
                value={data.destinations?.title?.en || ''}
                onChange={(e) => updateField('destinations.title.en', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Section Title (Chinese)</label>
              <input
                type="text"
                value={data.destinations?.title?.cn || ''}
                onChange={(e) => updateField('destinations.title.cn', e.target.value)}
              />
            </div>

            <h4>Destination Cards</h4>
            {data.destinations?.items?.map((dest, index) => (
              <div key={dest.id || index} className="destination-card">
                <div className="destination-header">
                  <span className="destination-badge" style={{ backgroundColor: dest.color }}>
                    {dest.name?.en || 'Untitled'}
                  </span>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => removeDestination(index)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="destination-fields">
                  <div className="field-row">
                    <div className="field">
                      <label>Name (EN)</label>
                      <input
                        type="text"
                        value={dest.name?.en || ''}
                        onChange={(e) => updateDestination(index, 'name', 'en', e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Name (CN)</label>
                      <input
                        type="text"
                        value={dest.name?.cn || ''}
                        onChange={(e) => updateDestination(index, 'name', 'cn', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label>Days (comma-separated)</label>
                      <input
                        type="text"
                        value={dest.days?.join(', ') || ''}
                        onChange={(e) => {
                          const days = e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d))
                          updateDestination(index, 'days', null, days)
                        }}
                      />
                    </div>
                    <div className="field">
                      <label>Color</label>
                      <input
                        type="color"
                        value={dest.color || '#666666'}
                        onChange={(e) => updateDestination(index, 'color', null, e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label>Description (EN)</label>
                    <textarea
                      value={dest.description?.en || ''}
                      onChange={(e) => updateDestination(index, 'description', 'en', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="field">
                    <label>Description (CN)</label>
                    <textarea
                      value={dest.description?.cn || ''}
                      onChange={(e) => updateDestination(index, 'description', 'cn', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="field">
                    <label>Hero Image</label>
                    <div className="image-field">
                      {dest.heroImage && (
                        <img src={dest.heroImage} alt={dest.name?.en} className="preview-image" />
                      )}
                      <input
                        type="text"
                        value={dest.heroImage || ''}
                        onChange={(e) => updateDestination(index, 'heroImage', null, e.target.value)}
                        placeholder="Image URL..."
                      />
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => setImageSearchTarget({ type: 'destination', index })}
                      >
                        <Image size={14} /> Search
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={addDestination}>
              <Plus size={16} /> Add Destination
            </button>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="editor-section">
        <SectionHeader id="cta" title="Call to Action Section" />
        {expandedSections.cta && (
          <div className="section-content">
            <div className="field">
              <label>Title (English)</label>
              <input
                type="text"
                value={data.cta?.title?.en || ''}
                onChange={(e) => updateField('cta.title.en', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Title (Chinese)</label>
              <input
                type="text"
                value={data.cta?.title?.cn || ''}
                onChange={(e) => updateField('cta.title.cn', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Text (English)</label>
              <textarea
                value={data.cta?.text?.en || ''}
                onChange={(e) => updateField('cta.text.en', e.target.value)}
                rows={2}
              />
            </div>
            <div className="field">
              <label>Text (Chinese)</label>
              <textarea
                value={data.cta?.text?.cn || ''}
                onChange={(e) => updateField('cta.text.cn', e.target.value)}
                rows={2}
              />
            </div>
            <div className="field">
              <label>Button Text (English)</label>
              <input
                type="text"
                value={data.cta?.button?.en || ''}
                onChange={(e) => updateField('cta.button.en', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Button Text (Chinese)</label>
              <input
                type="text"
                value={data.cta?.button?.cn || ''}
                onChange={(e) => updateField('cta.button.cn', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Background Image</label>
              <div className="image-field">
                {data.cta?.backgroundImage && (
                  <img src={data.cta.backgroundImage} alt="CTA" className="preview-image" />
                )}
                <input
                  type="text"
                  value={data.cta?.backgroundImage || ''}
                  onChange={(e) => updateField('cta.backgroundImage', e.target.value)}
                  placeholder="Image URL..."
                />
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => setImageSearchTarget({ type: 'cta' })}
                >
                  <Image size={14} /> Search
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Image Search Modal */}
      {imageSearchTarget && (
        <div className="modal-overlay" onClick={() => setImageSearchTarget(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ImageSearch onSelect={handleImageSelect} onClose={() => setImageSearchTarget(null)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default HomeEditor
