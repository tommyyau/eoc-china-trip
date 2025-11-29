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
  const [isRawTextExpanded, setIsRawTextExpanded] = useState(false)
  const [researchingPOIs, setResearchingPOIs] = useState(false)
  const [poiResearchStatus, setPoiResearchStatus] = useState('')

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
      title: day.title,
      enhanced: day.enhanced,
      walkDetails: day.walkDetails,
      pointsOfInterest: day.pointsOfInterest,
      practicalInfo: day.practicalInfo,
      status: day.status === 'draft' ? 'in-progress' : day.status
    })
    alert('Saved!')
  }

  const handleResearchPOIs = async () => {
    setResearchingPOIs(true)
    setPoiResearchStatus('Researching POIs from highlights...')

    try {
      const response = await fetch(`http://localhost:3001/api/poi/research/${day.day}`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Research failed')
      }

      const data = await response.json()

      if (data.pois && data.pois.length > 0) {
        // Merge with existing POIs or replace
        setDay({
          ...day,
          pointsOfInterest: data.pois.map(poi => ({
            name: poi.name,
            summary: poi.summary,
            history: poi.historicalContext,
            tips: poi.practicalTips,
            links: poi.links || [],
            status: poi.status || 'pending',
            confidence: poi.confidence,
            images: []
          }))
        })
        setPoiResearchStatus(`✓ Found ${data.pois.length} POIs`)
      } else {
        setPoiResearchStatus('No POIs found for this day')
      }
    } catch (error) {
      console.error('POI research error:', error)
      setPoiResearchStatus(`✗ Error: ${error.message}`)
    }

    setResearchingPOIs(false)
    setTimeout(() => setPoiResearchStatus(''), 5000)
  }

  const handlePOIStatusChange = (idx, newStatus) => {
    const updated = [...day.pointsOfInterest]
    updated[idx].status = newStatus
    setDay({ ...day, pointsOfInterest: updated })
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
    // Only count images for segments that exist in current day data
    const validSegmentIds = new Set([
      'day-overview',
      ...(day?.segments?.map(s => s.id) || [])
    ])
    return Object.entries(imageSelections)
      .filter(([segmentId]) => validSegmentIds.has(segmentId))
      .reduce((sum, [, seg]) => sum + (seg.images?.length || 0), 0)
  }

  // Get segment type border color (subtle left accent)
  const getSegmentBorderColor = (type) => {
    switch (type) {
      case 'transfer': return '#f59e0b' // amber
      case 'activity': return '#6366f1' // indigo
      case 'meal': return '#10b981' // emerald
      case 'check-in':
      case 'check-out': return '#8b5cf6' // violet
      case 'free-time': return '#ec4899' // pink
      default: return '#9ca3af' // gray
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
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#374151', fontSize: '0.875rem' }}
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

      {/* Overview Tab - Single column with collapsible raw text */}
      {activeTab === 'overview' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Collapsible Raw Text Panel */}
          <div style={{
            marginBottom: '16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            background: '#ffffff'
          }}>
            <button
              onClick={() => setIsRawTextExpanded(!isRawTextExpanded)}
              style={{
                width: '100%',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#6b7280'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{isRawTextExpanded ? '▼' : '▶'}</span>
                Original Text
              </span>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                {day.original?.rawText ? (isRawTextExpanded ? 'Click to collapse' : 'Click to expand') : 'No text available'}
              </span>
            </button>
            {isRawTextExpanded && (
              <div style={{
                padding: '0 16px 16px 16px',
                maxHeight: '250px',
                overflow: 'auto'
              }}>
                <div style={{
                  background: '#f9fafb',
                  padding: '12px',
                  borderRadius: '6px',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                  color: '#374151'
                }}>
                  {day.original?.rawText || <em style={{ color: '#9ca3af' }}>No raw text available. Re-import your itinerary to capture the original text for each day.</em>}
                </div>
              </div>
            )}
          </div>

          {/* Day Title & Description */}
          <div style={{
            marginBottom: '16px',
            padding: '16px',
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '6px' }}>DAY TITLE</label>
              <input
                type="text"
                value={day.title || ''}
                onChange={e => setDay({ ...day, title: e.target.value })}
                placeholder="Enter day title..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '1rem', fontWeight: 500, color: '#1f2937', background: '#ffffff' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '6px' }}>SHORT DESCRIPTION</label>
              <textarea
                value={day.enhanced?.description || ''}
                onChange={e => setDay({ ...day, enhanced: { ...day.enhanced, description: e.target.value } })}
                placeholder="Brief overview of the day's activities..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#374151', background: '#ffffff', minHeight: '80px', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Day Overview Images Strip */}
          <div style={{
            marginBottom: '16px',
            padding: '12px 16px',
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: imageSelections['day-overview']?.images?.length > 0 ? '12px' : '0' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280' }}>Day Images</span>
              <button
                onClick={() => handleOpenImageSelector('day-overview', day.title || `Day ${day.day}`)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  background: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                {imageSelections['day-overview']?.images?.length > 0 ? `Edit (${imageSelections['day-overview'].images.length})` : '+ Add'}
              </button>
            </div>
            {imageSelections['day-overview']?.images?.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {imageSelections['day-overview'].images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.thumb || img.url}
                    alt={img.alt}
                    style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => handleOpenImageSelector('day-overview', day.title || `Day ${day.day}`)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Segments Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Segments ({day.segments?.length || 0})</h3>
            <button
              onClick={handleAddSegment}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                background: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              + Add Segment
            </button>
          </div>

          {/* Segments List */}
          {(!day.segments || day.segments.length === 0) ? (
            <div style={{ padding: '40px 30px', textAlign: 'center', color: '#6b7280', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 500 }}>No segments yet</p>
              <p style={{ fontSize: '0.85rem', margin: 0, color: '#9ca3af' }}>Segments are the structured activities, transfers, and events for this day.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {day.segments.map((segment, idx) => {
                const segmentImages = imageSelections[segment.id]?.images || []
                return (
                  <div
                    key={segment.id}
                    style={{
                      background: '#ffffff',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      borderLeft: `4px solid ${getSegmentBorderColor(segment.type)}`
                    }}
                  >
                    {/* Segment Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select
                          value={segment.time || ''}
                          onChange={e => handleSegmentChange(segment.id, 'time', e.target.value)}
                          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.8rem', color: '#374151', background: '#ffffff' }}
                        >
                          <option value="">Time</option>
                          {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select
                          value={segment.type || 'activity'}
                          onChange={e => handleSegmentChange(segment.id, 'type', e.target.value)}
                          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.8rem', color: '#374151', background: '#ffffff' }}
                        >
                          {SEGMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <button
                        onClick={() => handleDeleteSegment(segment.id)}
                        style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#ffffff', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
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
                      style={{ width: '100%', padding: '10px 12px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontWeight: 500, fontSize: '0.95rem', color: '#1f2937', background: '#ffffff' }}
                    />

                    {/* Type-specific fields */}
                    {segment.type === 'transfer' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                        <input
                          type="text"
                          value={segment.from || ''}
                          onChange={e => handleSegmentChange(segment.id, 'from', e.target.value)}
                          placeholder="From"
                          style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.85rem', color: '#374151', background: '#ffffff' }}
                        />
                        <input
                          type="text"
                          value={segment.to || ''}
                          onChange={e => handleSegmentChange(segment.id, 'to', e.target.value)}
                          placeholder="To"
                          style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.85rem', color: '#374151', background: '#ffffff' }}
                        />
                        <select
                          value={segment.mode || ''}
                          onChange={e => handleSegmentChange(segment.id, 'mode', e.target.value)}
                          style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.85rem', color: '#374151', background: '#ffffff' }}
                        >
                          <option value="">Transport mode</option>
                          {TRANSFER_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <input
                          type="text"
                          value={segment.duration || ''}
                          onChange={e => handleSegmentChange(segment.id, 'duration', e.target.value)}
                          placeholder="Duration"
                          style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.85rem', color: '#374151', background: '#ffffff' }}
                        />
                      </div>
                    )}

                    {segment.type === 'activity' && (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '10px' }}>
                          <input
                            type="text"
                            value={segment.location || ''}
                            onChange={e => handleSegmentChange(segment.id, 'location', e.target.value)}
                            placeholder="Location"
                            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.85rem', color: '#374151', background: '#ffffff' }}
                          />
                          <input
                            type="text"
                            value={segment.duration || ''}
                            onChange={e => handleSegmentChange(segment.id, 'duration', e.target.value)}
                            placeholder="Duration"
                            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.85rem', color: '#374151', background: '#ffffff' }}
                          />
                        </div>
                        {/* Walk Details for activities */}
                        {segment.walkDetails && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px', background: '#f3f4f6', padding: '10px', borderRadius: '6px' }}>
                            <input
                              type="text"
                              value={segment.walkDetails.distance || ''}
                              onChange={e => handleSegmentChange(segment.id, 'walkDetails', { ...segment.walkDetails, distance: e.target.value })}
                              placeholder="Distance"
                              style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.8rem', color: '#374151', background: '#ffffff' }}
                            />
                            <input
                              type="text"
                              value={segment.walkDetails.elevation || ''}
                              onChange={e => handleSegmentChange(segment.id, 'walkDetails', { ...segment.walkDetails, elevation: e.target.value })}
                              placeholder="Elevation"
                              style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.8rem', color: '#374151', background: '#ffffff' }}
                            />
                            <select
                              value={segment.walkDetails.difficulty || ''}
                              onChange={e => handleSegmentChange(segment.id, 'walkDetails', { ...segment.walkDetails, difficulty: e.target.value })}
                              style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.8rem', color: '#374151', background: '#ffffff' }}
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
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '10px' }}>
                        <input
                          type="text"
                          value={segment.location || ''}
                          onChange={e => handleSegmentChange(segment.id, 'location', e.target.value)}
                          placeholder="Location"
                          style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.85rem', color: '#374151', background: '#ffffff' }}
                        />
                        <input
                          type="text"
                          value={segment.duration || ''}
                          onChange={e => handleSegmentChange(segment.id, 'duration', e.target.value)}
                          placeholder="Duration"
                          style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.85rem', color: '#374151', background: '#ffffff' }}
                        />
                      </div>
                    )}

                    {/* Description */}
                    <textarea
                      value={segment.description || ''}
                      onChange={e => handleSegmentChange(segment.id, 'description', e.target.value)}
                      placeholder="Description"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.85rem', minHeight: '70px', resize: 'vertical', color: '#374151', background: '#ffffff' }}
                    />

                    {/* Highlights for activities */}
                    {segment.type === 'activity' && (
                      <div style={{ marginTop: '10px' }}>
                        <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '6px', fontWeight: 500 }}>Highlights (one per line)</label>
                        <textarea
                          value={segment.highlights?.join('\n') || ''}
                          onChange={e => handleSegmentChange(segment.id, 'highlights', e.target.value.split('\n').filter(h => h.trim()))}
                          placeholder="Key points..."
                          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.85rem', minHeight: '60px', resize: 'vertical', color: '#374151', background: '#ffffff' }}
                        />
                      </div>
                    )}

                    {/* Inline Segment Images */}
                    <div style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid #e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}>
                      {segmentImages.length > 0 ? (
                        <>
                          {segmentImages.map((img, imgIdx) => (
                            <img
                              key={imgIdx}
                              src={img.thumb || img.url}
                              alt={img.alt}
                              style={{
                                width: '100px',
                                height: '70px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                              onClick={() => handleOpenImageSelector(segment.id, segment.title || segment.type)}
                            />
                          ))}
                          <button
                            onClick={() => handleOpenImageSelector(segment.id, segment.title || segment.type)}
                            style={{
                              width: '100px',
                              height: '70px',
                              border: '1px dashed #d1d5db',
                              borderRadius: '6px',
                              background: '#f9fafb',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              color: '#6b7280'
                            }}
                          >
                            + Add more
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleOpenImageSelector(segment.id, segment.title || segment.type)}
                          style={{
                            padding: '8px 14px',
                            border: '1px dashed #d1d5db',
                            borderRadius: '6px',
                            background: '#f9fafb',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span>📷</span> Add images
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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
        <div style={{ maxWidth: '800px', margin: '0 auto', background: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', color: '#1f2937' }}>Walk Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontWeight: 500, display: 'block', marginBottom: '6px', fontSize: '0.875rem', color: '#374151' }}>Distance</label>
              <input
                type="text"
                value={day.walkDetails?.distance || ''}
                onChange={e => setDay({
                  ...day,
                  walkDetails: { ...day.walkDetails, distance: e.target.value }
                })}
                placeholder="e.g., 13.7km"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#374151', background: '#ffffff' }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 500, display: 'block', marginBottom: '6px', fontSize: '0.875rem', color: '#374151' }}>Elevation</label>
              <input
                type="text"
                value={day.walkDetails?.elevation || ''}
                onChange={e => setDay({
                  ...day,
                  walkDetails: { ...day.walkDetails, elevation: e.target.value }
                })}
                placeholder="e.g., 500m gain"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#374151', background: '#ffffff' }}
              />
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: '6px', fontSize: '0.875rem', color: '#374151' }}>Difficulty</label>
            <select
              value={day.walkDetails?.difficulty || ''}
              onChange={e => setDay({
                ...day,
                walkDetails: { ...day.walkDetails, difficulty: e.target.value }
              })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#374151', background: '#ffffff' }}
            >
              <option value="">Select difficulty</option>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="challenging">Challenging</option>
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: '6px', fontSize: '0.875rem', color: '#374151' }}>Route Description</label>
            <textarea
              value={day.walkDetails?.route || ''}
              onChange={e => setDay({
                ...day,
                walkDetails: { ...day.walkDetails, route: e.target.value }
              })}
              placeholder="Describe the route, starting point, key landmarks..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#374151', background: '#ffffff', minHeight: '120px', resize: 'vertical' }}
            />
          </div>
        </div>
      )}

      {/* POI Tab */}
      {activeTab === 'poi' && (
        <div style={{ maxWidth: '900px', margin: '0 auto', background: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#1f2937' }}>Points of Interest</h2>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                Research and review POIs from this day's highlights.
              </p>
            </div>
            <button
              onClick={handleResearchPOIs}
              disabled={researchingPOIs}
              style={{
                padding: '10px 16px',
                fontSize: '0.875rem',
                background: researchingPOIs ? '#e5e7eb' : '#6366f1',
                color: researchingPOIs ? '#6b7280' : '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: researchingPOIs ? 'not-allowed' : 'pointer',
                fontWeight: 500
              }}
            >
              {researchingPOIs ? '⏳ Researching...' : '🔍 Research POIs'}
            </button>
          </div>

          {poiResearchStatus && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '0.875rem',
              background: poiResearchStatus.startsWith('✓') ? '#d1fae5' : poiResearchStatus.startsWith('✗') ? '#fee2e2' : '#dbeafe',
              color: poiResearchStatus.startsWith('✓') ? '#065f46' : poiResearchStatus.startsWith('✗') ? '#991b1b' : '#1e40af'
            }}>
              {poiResearchStatus}
            </div>
          )}

          {day.pointsOfInterest?.map((poi, idx) => (
            <div key={idx} style={{
              background: '#f9fafb',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px',
              border: '1px solid #e5e7eb',
              borderLeft: `4px solid ${poi.status === 'approved' ? '#10b981' : poi.status === 'rejected' ? '#ef4444' : '#f59e0b'}`
            }}>
              {/* Header with name and status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '12px' }}>
                <input
                  type="text"
                  value={poi.name}
                  onChange={e => {
                    const updated = [...day.pointsOfInterest]
                    updated[idx].name = e.target.value
                    setDay({ ...day, pointsOfInterest: updated })
                  }}
                  placeholder="POI Name"
                  style={{ flex: 1, padding: '10px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '1rem', fontWeight: 600, color: '#1f2937', background: '#ffffff' }}
                />
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => handlePOIStatusChange(idx, 'approved')}
                    style={{
                      padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 500,
                      background: poi.status === 'approved' ? '#10b981' : '#ffffff',
                      color: poi.status === 'approved' ? '#ffffff' : '#10b981',
                      border: `1px solid ${poi.status === 'approved' ? '#10b981' : '#d1fae5'}`
                    }}
                  >✓ Approve</button>
                  <button
                    onClick={() => handlePOIStatusChange(idx, 'pending')}
                    style={{
                      padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 500,
                      background: poi.status === 'pending' ? '#f59e0b' : '#ffffff',
                      color: poi.status === 'pending' ? '#ffffff' : '#f59e0b',
                      border: `1px solid ${poi.status === 'pending' ? '#f59e0b' : '#fef3c7'}`
                    }}
                  >⏳ Pending</button>
                  <button
                    onClick={() => handlePOIStatusChange(idx, 'rejected')}
                    style={{
                      padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 500,
                      background: poi.status === 'rejected' ? '#ef4444' : '#ffffff',
                      color: poi.status === 'rejected' ? '#ffffff' : '#ef4444',
                      border: `1px solid ${poi.status === 'rejected' ? '#ef4444' : '#fecaca'}`
                    }}
                  >✗ Reject</button>
                </div>
              </div>

              {/* Summary */}
              {poi.summary && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>SUMMARY</label>
                  <textarea
                    value={poi.summary || ''}
                    onChange={e => {
                      const updated = [...day.pointsOfInterest]
                      updated[idx].summary = e.target.value
                      setDay({ ...day, pointsOfInterest: updated })
                    }}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#374151', background: '#ffffff', minHeight: '100px', resize: 'vertical' }}
                  />
                </div>
              )}

              {/* History */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>HISTORICAL CONTEXT</label>
                <textarea
                  value={poi.history || ''}
                  onChange={e => {
                    const updated = [...day.pointsOfInterest]
                    updated[idx].history = e.target.value
                    setDay({ ...day, pointsOfInterest: updated })
                  }}
                  placeholder="History and background..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#374151', background: '#ffffff', minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              {/* Tips */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>PRACTICAL TIPS</label>
                <textarea
                  value={poi.tips || ''}
                  onChange={e => {
                    const updated = [...day.pointsOfInterest]
                    updated[idx].tips = e.target.value
                    setDay({ ...day, pointsOfInterest: updated })
                  }}
                  placeholder="Visitor tips..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#374151', background: '#ffffff', minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              {/* Links */}
              {poi.links && poi.links.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>LINKS</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {poi.links.map((link, linkIdx) => (
                      <a
                        key={linkIdx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          background: '#e0e7ff',
                          color: '#4338ca',
                          borderRadius: '4px',
                          textDecoration: 'none'
                        }}
                      >
                        🔗 {link.type || 'Link'}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Confidence & Remove */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                {poi.confidence && (
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Confidence: {Math.round(poi.confidence * 100)}%
                  </span>
                )}
                <button
                  onClick={() => {
                    const updated = day.pointsOfInterest.filter((_, i) => i !== idx)
                    setDay({ ...day, pointsOfInterest: updated })
                  }}
                  style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#ffffff', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => {
              const updated = [...(day.pointsOfInterest || []), { name: '', history: '', tips: '', summary: '', links: [], status: 'pending', images: [] }]
              setDay({ ...day, pointsOfInterest: updated })
            }}
            style={{ padding: '10px 16px', fontSize: '0.875rem', background: '#ffffff', color: '#6366f1', border: '1px solid #c7d2fe', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
          >
            + Add Point of Interest
          </button>
        </div>
      )}

      {/* Practical Info Tab */}
      {activeTab === 'practical' && (
        <div style={{ maxWidth: '800px', margin: '0 auto', background: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', color: '#1f2937' }}>Practical Information</h2>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: '6px', fontSize: '0.875rem', color: '#374151' }}>Expected Weather (for May)</label>
            <input
              type="text"
              value={day.practicalInfo?.weather || ''}
              onChange={e => setDay({
                ...day,
                practicalInfo: { ...day.practicalInfo, weather: e.target.value }
              })}
              placeholder="e.g., Warm, 20-25°C, possible rain"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#374151', background: '#ffffff' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: '6px', fontSize: '0.875rem', color: '#374151' }}>What to Pack (one item per line)</label>
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
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#374151', background: '#ffffff', minHeight: '100px', resize: 'vertical' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: '6px', fontSize: '0.875rem', color: '#374151' }}>Timing Recommendations</label>
            <textarea
              value={day.practicalInfo?.timing || ''}
              onChange={e => setDay({
                ...day,
                practicalInfo: { ...day.practicalInfo, timing: e.target.value }
              })}
              placeholder="Best times to visit, crowd levels, recommended duration..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#374151', background: '#ffffff', minHeight: '80px', resize: 'vertical' }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: '6px', fontSize: '0.875rem', color: '#374151' }}>Additional Notes</label>
            <textarea
              value={day.practicalInfo?.notes || ''}
              onChange={e => setDay({
                ...day,
                practicalInfo: { ...day.practicalInfo, notes: e.target.value }
              })}
              placeholder="Any other helpful information..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#374151', background: '#ffffff', minHeight: '80px', resize: 'vertical' }}
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
