import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDay, updateDay, addSegment, updateSegment, deleteSegment, SEGMENT_TYPES, TRANSFER_MODES, createEmptySegment } from '../utils/storage'
import { loadSelections, saveSelections } from '../utils/imageApi'
import ImageSelector from '../components/ImageSelector'

const TIME_OPTIONS = ['Morning', 'Midday', 'Afternoon', 'Evening', 'Night']

function DayEditor() {
  const { dayNumber } = useParams()
  const navigate = useNavigate()
  const [day, setDay] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [imageSelections, setImageSelections] = useState({})
  const [showImageSelector, setShowImageSelector] = useState(null) // { segmentId, segmentTitle }

  const loadDay = () => {
    const data = getDay(parseInt(dayNumber))
    if (data) {
      setDay(data)
    }
  }

  useEffect(() => {
    loadDay()
    // Load image selections
    const fetchSelections = async () => {
      try {
        const selections = await loadSelections(parseInt(dayNumber))
        if (selections && selections.segments) {
          setImageSelections(selections.segments)
        }
      } catch (e) {
        console.error('Failed to load image selections:', e)
      }
    }
    fetchSelections()
  }, [dayNumber])

  if (!day) {
    return (
      <div className="card">
        <h2>Day not found</h2>
        <p>Day {dayNumber} doesn't exist in your itinerary.</p>
        <button className="primary" onClick={() => navigate('/')}>
          Back to Dashboard
        </button>
      </div>
    )
  }

  // Segment handlers
  const handleAddSegment = () => {
    addSegment(day.day, { type: 'activity', time: 'Morning' })
    loadDay()
  }

  const handleSegmentChange = (segmentId, field, value) => {
    updateSegment(day.day, segmentId, { [field]: value })
    loadDay()
  }

  const handleDeleteSegment = (segmentId) => {
    if (window.confirm('Delete this segment?')) {
      deleteSegment(day.day, segmentId)
      loadDay()
    }
  }

  const handleSave = () => {
    updateDay(day.day, {
      walkDetails: day.walkDetails,
      pointsOfInterest: day.pointsOfInterest,
      practicalInfo: day.practicalInfo,
      status: day.status === 'draft' ? 'in-progress' : day.status
    })
    alert('Saved!')
  }

  const handleStatusChange = (newStatus) => {
    updateDay(day.day, { status: newStatus })
    loadDay()
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'images', label: 'Images' },
    { id: 'walk', label: 'Walk Details' },
    { id: 'poi', label: 'Points of Interest' },
    { id: 'practical', label: 'Practical Info' }
  ]

  // Image handling functions
  const handleOpenImageSelector = (segmentId, segmentTitle) => {
    setShowImageSelector({ segmentId, segmentTitle })
  }

  const handleSaveImages = async (images) => {
    const { segmentId, segmentTitle } = showImageSelector
    const newSelections = {
      ...imageSelections,
      [segmentId]: {
        name: segmentTitle,
        images
      }
    }
    setImageSelections(newSelections)

    // Save to backend
    try {
      await saveSelections(parseInt(dayNumber), { segments: newSelections })
    } catch (e) {
      console.error('Failed to save image selections:', e)
      alert('Failed to save selections')
    }
  }

  const getTotalImageCount = () => {
    return Object.values(imageSelections).reduce((sum, seg) => sum + (seg.images?.length || 0), 0)
  }

  // Get segment type color
  const getSegmentColor = (type) => {
    switch (type) {
      case 'transfer': return '#fef3c7'
      case 'activity': return '#dbeafe'
      case 'meal': return '#dcfce7'
      case 'check-in':
      case 'check-out': return '#f3e8ff'
      case 'free-time': return '#fce7f3'
      default: return '#f3f4f6'
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <button className="secondary" onClick={() => navigate('/')} style={{ marginRight: '15px' }}>
            ← Back
          </button>
          <h1 style={{ display: 'inline' }}>Day {day.day}: {day.title || day.original?.title || 'Untitled'}</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={day.status}
            onChange={e => handleStatusChange(e.target.value)}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
          >
            <option value="draft">Draft</option>
            <option value="in-progress">In Progress</option>
            <option value="reviewed">Reviewed</option>
            <option value="complete">Complete</option>
          </select>
          <button className="primary" onClick={handleSave}>Save Changes</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'primary' : 'secondary'}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab - Side by side: Original + Segments */}
      {activeTab === 'overview' && (
        <div className="comparison">
          {/* Original Raw Text */}
          <div className="comparison-panel original">
            <h3>Original (Raw Text)</h3>
            <div style={{ background: 'white', padding: '12px', borderRadius: '6px', whiteSpace: 'pre-wrap', maxHeight: 'calc(100vh - 250px)', overflow: 'auto', fontSize: '0.85rem', lineHeight: '1.6' }}>
              {day.original?.rawText || <em style={{ color: '#999' }}>No raw text available. Re-import your itinerary to capture the original text for each day.</em>}
            </div>
          </div>

          {/* Segments Editor */}
          <div className="comparison-panel enhanced">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Segments ({day.segments?.length || 0})</h3>
              <button className="primary" onClick={handleAddSegment} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                + Add Segment
              </button>
            </div>

            {(!day.segments || day.segments.length === 0) ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#666', background: '#f9f9f9', borderRadius: '8px' }}>
                <p>No segments yet.</p>
                <p style={{ fontSize: '0.85rem' }}>Segments are the structured activities, transfers, and events for this day.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
                {day.segments.map((segment, idx) => (
                  <div
                    key={segment.id}
                    style={{
                      background: getSegmentColor(segment.type),
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0,0,0,0.1)'
                    }}
                  >
                    {/* Segment Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select
                          value={segment.time || ''}
                          onChange={e => handleSegmentChange(segment.id, 'time', e.target.value)}
                          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                        >
                          <option value="">Time</option>
                          {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select
                          value={segment.type || 'activity'}
                          onChange={e => handleSegmentChange(segment.id, 'type', e.target.value)}
                          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                        >
                          {SEGMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <button
                        onClick={() => handleDeleteSegment(segment.id)}
                        style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>

                    {/* Title */}
                    <input
                      type="text"
                      value={segment.title || ''}
                      onChange={e => handleSegmentChange(segment.id, 'title', e.target.value)}
                      placeholder="Segment title"
                      style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd', fontWeight: 500 }}
                    />

                    {/* Type-specific fields */}
                    {segment.type === 'transfer' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          value={segment.from || ''}
                          onChange={e => handleSegmentChange(segment.id, 'from', e.target.value)}
                          placeholder="From"
                          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                        />
                        <input
                          type="text"
                          value={segment.to || ''}
                          onChange={e => handleSegmentChange(segment.id, 'to', e.target.value)}
                          placeholder="To"
                          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                        />
                        <select
                          value={segment.mode || ''}
                          onChange={e => handleSegmentChange(segment.id, 'mode', e.target.value)}
                          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                        >
                          <option value="">Transport mode</option>
                          {TRANSFER_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <input
                          type="text"
                          value={segment.duration || ''}
                          onChange={e => handleSegmentChange(segment.id, 'duration', e.target.value)}
                          placeholder="Duration"
                          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                        />
                      </div>
                    )}

                    {segment.type === 'activity' && (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '8px' }}>
                          <input
                            type="text"
                            value={segment.location || ''}
                            onChange={e => handleSegmentChange(segment.id, 'location', e.target.value)}
                            placeholder="Location"
                            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                          />
                          <input
                            type="text"
                            value={segment.duration || ''}
                            onChange={e => handleSegmentChange(segment.id, 'duration', e.target.value)}
                            placeholder="Duration"
                            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                          />
                        </div>
                        {/* Walk Details for activities */}
                        {segment.walkDetails && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px', background: 'rgba(255,255,255,0.5)', padding: '8px', borderRadius: '4px' }}>
                            <input
                              type="text"
                              value={segment.walkDetails.distance || ''}
                              onChange={e => handleSegmentChange(segment.id, 'walkDetails', { ...segment.walkDetails, distance: e.target.value })}
                              placeholder="Distance"
                              style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.8rem' }}
                            />
                            <input
                              type="text"
                              value={segment.walkDetails.elevation || ''}
                              onChange={e => handleSegmentChange(segment.id, 'walkDetails', { ...segment.walkDetails, elevation: e.target.value })}
                              placeholder="Elevation"
                              style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.8rem' }}
                            />
                            <select
                              value={segment.walkDetails.difficulty || ''}
                              onChange={e => handleSegmentChange(segment.id, 'walkDetails', { ...segment.walkDetails, difficulty: e.target.value })}
                              style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.8rem' }}
                            >
                              <option value="">Difficulty</option>
                              <option value="easy">Easy</option>
                              <option value="moderate">Moderate</option>
                              <option value="challenging">Challenging</option>
                            </select>
                          </div>
                        )}
                      </>
                    )}

                    {(segment.type === 'meal' || segment.type === 'check-in' || segment.type === 'check-out') && (
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          value={segment.location || ''}
                          onChange={e => handleSegmentChange(segment.id, 'location', e.target.value)}
                          placeholder="Location"
                          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                        />
                        <input
                          type="text"
                          value={segment.duration || ''}
                          onChange={e => handleSegmentChange(segment.id, 'duration', e.target.value)}
                          placeholder="Duration"
                          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                        />
                      </div>
                    )}

                    {/* Description */}
                    <textarea
                      value={segment.description || ''}
                      onChange={e => handleSegmentChange(segment.id, 'description', e.target.value)}
                      placeholder="Description"
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.85rem', minHeight: '60px', resize: 'vertical' }}
                    />

                    {/* Highlights for activities */}
                    {segment.type === 'activity' && (
                      <div style={{ marginTop: '8px' }}>
                        <label style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginBottom: '4px' }}>Highlights (one per line)</label>
                        <textarea
                          value={segment.highlights?.join('\n') || ''}
                          onChange={e => handleSegmentChange(segment.id, 'highlights', e.target.value.split('\n').filter(h => h.trim()))}
                          placeholder="Key points..."
                          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.8rem', minHeight: '50px', resize: 'vertical' }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Images Tab */}
      {activeTab === 'images' && (
        <div className="card">
          <h2>Images ({getTotalImageCount()} selected)</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Select images for each segment of the day. Images are saved automatically and can be exported for the website.
          </p>

          {/* Day-level images */}
          <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f7ff', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>Day Overview Images</h3>
              <button
                className="primary"
                onClick={() => handleOpenImageSelector('day-overview', day.title || `Day ${day.day}`)}
                style={{ padding: '8px 15px', fontSize: '0.9rem' }}
              >
                📷 Select Images
              </button>
            </div>
            {imageSelections['day-overview']?.images?.length > 0 ? (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {imageSelections['day-overview'].images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.thumb || img.url}
                    alt={img.alt}
                    style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                ))}
              </div>
            ) : (
              <p style={{ color: '#888', margin: 0 }}>No images selected</p>
            )}
          </div>

          {/* Per-segment images */}
          <h3>Segment Images</h3>
          {(!day.segments || day.segments.length === 0) ? (
            <p style={{ color: '#888' }}>No segments defined. Add segments in the Overview tab first.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {day.segments.map(segment => {
                const segmentImages = imageSelections[segment.id]?.images || []
                return (
                  <div
                    key={segment.id}
                    style={{
                      padding: '15px',
                      background: '#f9f9f9',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          background: '#e0e0e0',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          marginRight: '10px'
                        }}>
                          {segment.type}
                        </span>
                        <strong>{segment.title || 'Untitled segment'}</strong>
                      </div>
                      <button
                        className="secondary"
                        onClick={() => handleOpenImageSelector(segment.id, segment.title || segment.type)}
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                      >
                        📷 {segmentImages.length > 0 ? `Edit (${segmentImages.length})` : 'Add Images'}
                      </button>
                    </div>
                    {segmentImages.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {segmentImages.map((img, idx) => (
                          <img
                            key={idx}
                            src={img.thumb || img.url}
                            alt={img.alt}
                            style={{ width: '80px', height: '55px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Walk Details Tab */}
      {activeTab === 'walk' && (
        <div className="card">
          <h2>Walk Details</h2>
          <div className="grid-2">
            <div>
              <label style={{ fontWeight: 500, display: 'block', marginBottom: '5px' }}>Distance</label>
              <input
                type="text"
                value={day.walkDetails?.distance || ''}
                onChange={e => setDay({
                  ...day,
                  walkDetails: { ...day.walkDetails, distance: e.target.value }
                })}
                placeholder="e.g., 13.7km"
              />
            </div>
            <div>
              <label style={{ fontWeight: 500, display: 'block', marginBottom: '5px' }}>Elevation</label>
              <input
                type="text"
                value={day.walkDetails?.elevation || ''}
                onChange={e => setDay({
                  ...day,
                  walkDetails: { ...day.walkDetails, elevation: e.target.value }
                })}
                placeholder="e.g., 500m gain"
              />
            </div>
            <div>
              <label style={{ fontWeight: 500, display: 'block', marginBottom: '5px' }}>Difficulty</label>
              <select
                value={day.walkDetails?.difficulty || ''}
                onChange={e => setDay({
                  ...day,
                  walkDetails: { ...day.walkDetails, difficulty: e.target.value }
                })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              >
                <option value="">Select difficulty</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="challenging">Challenging</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: '15px' }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: '5px' }}>Route Description</label>
            <textarea
              value={day.walkDetails?.route || ''}
              onChange={e => setDay({
                ...day,
                walkDetails: { ...day.walkDetails, route: e.target.value }
              })}
              placeholder="Describe the route, starting point, key landmarks..."
            />
          </div>
        </div>
      )}

      {/* POI Tab */}
      {activeTab === 'poi' && (
        <div className="card">
          <h2>Points of Interest</h2>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Add detailed information about places mentioned in this day's itinerary.
          </p>

          {day.pointsOfInterest?.map((poi, idx) => (
            <div key={idx} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <input
                  type="text"
                  value={poi.name}
                  onChange={e => {
                    const updated = [...day.pointsOfInterest]
                    updated[idx].name = e.target.value
                    setDay({ ...day, pointsOfInterest: updated })
                  }}
                  placeholder="POI Name"
                  style={{ fontWeight: 'bold', flex: 1, marginRight: '10px' }}
                />
                <button
                  className="secondary"
                  onClick={() => {
                    const updated = day.pointsOfInterest.filter((_, i) => i !== idx)
                    setDay({ ...day, pointsOfInterest: updated })
                  }}
                >
                  Remove
                </button>
              </div>
              <textarea
                value={poi.history || ''}
                onChange={e => {
                  const updated = [...day.pointsOfInterest]
                  updated[idx].history = e.target.value
                  setDay({ ...day, pointsOfInterest: updated })
                }}
                placeholder="History and background..."
                style={{ marginBottom: '10px' }}
              />
              <textarea
                value={poi.tips || ''}
                onChange={e => {
                  const updated = [...day.pointsOfInterest]
                  updated[idx].tips = e.target.value
                  setDay({ ...day, pointsOfInterest: updated })
                }}
                placeholder="Visitor tips..."
                style={{ minHeight: '80px' }}
              />
            </div>
          ))}

          <button
            className="secondary"
            onClick={() => {
              const updated = [...(day.pointsOfInterest || []), { name: '', history: '', tips: '', images: [] }]
              setDay({ ...day, pointsOfInterest: updated })
            }}
          >
            + Add Point of Interest
          </button>
        </div>
      )}

      {/* Practical Info Tab */}
      {activeTab === 'practical' && (
        <div className="card">
          <h2>Practical Information</h2>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: '5px' }}>Expected Weather (for May)</label>
            <input
              type="text"
              value={day.practicalInfo?.weather || ''}
              onChange={e => setDay({
                ...day,
                practicalInfo: { ...day.practicalInfo, weather: e.target.value }
              })}
              placeholder="e.g., Warm, 20-25°C, possible rain"
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: '5px' }}>What to Pack (one item per line)</label>
            <textarea
              value={day.practicalInfo?.whatToPack?.join('\n') || ''}
              onChange={e => setDay({
                ...day,
                practicalInfo: {
                  ...day.practicalInfo,
                  whatToPack: e.target.value.split('\n').filter(i => i.trim())
                }
              })}
              placeholder="Comfortable walking shoes&#10;Sun hat&#10;Water bottle"
              style={{ minHeight: '100px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: '5px' }}>Timing Recommendations</label>
            <textarea
              value={day.practicalInfo?.timing || ''}
              onChange={e => setDay({
                ...day,
                practicalInfo: { ...day.practicalInfo, timing: e.target.value }
              })}
              placeholder="Best times to visit, crowd levels, recommended duration..."
            />
          </div>
          <div>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: '5px' }}>Additional Notes</label>
            <textarea
              value={day.practicalInfo?.notes || ''}
              onChange={e => setDay({
                ...day,
                practicalInfo: { ...day.practicalInfo, notes: e.target.value }
              })}
              placeholder="Any other helpful information..."
            />
          </div>
        </div>
      )}

      {/* Image Selector Modal */}
      {showImageSelector && (
        <ImageSelector
          dayNumber={parseInt(dayNumber)}
          segmentId={showImageSelector.segmentId}
          segmentTitle={showImageSelector.segmentTitle}
          existingImages={imageSelections[showImageSelector.segmentId]?.images || []}
          onSave={handleSaveImages}
          onClose={() => setShowImageSelector(null)}
        />
      )}
    </div>
  )
}

export default DayEditor
