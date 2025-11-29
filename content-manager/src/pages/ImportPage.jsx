import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { importDays, importTripInfo, loadItinerary, clearItinerary } from '../utils/storage'

function ImportPage() {
  const navigate = useNavigate()
  const [rawText, setRawText] = useState('')
  const [preview, setPreview] = useState(null)
  const [tripInfoPreview, setTripInfoPreview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingTripInfo, setLoadingTripInfo] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [parseMode, setParseMode] = useState('itinerary') // 'itinerary' or 'tripInfo'
  const timerRef = useRef(null)

  useEffect(() => {
    if (loading || loadingTripInfo) {
      setElapsed(0)
      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [loading, loadingTripInfo])

  const handleParseItinerary = async () => {
    setError('')
    setPreview(null)
    if (!rawText.trim()) { setError('Please paste your itinerary text'); return }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to parse')
      if (data.days?.length > 0) setPreview(data.days)
      else setError('No days found')
    } catch (e) {
      setError(e.message.includes('Failed to fetch') ? 'Cannot connect to server. Run: npm run server' : 'Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleParseTripInfo = async () => {
    setError('')
    setTripInfoPreview(null)
    if (!rawText.trim()) { setError('Please paste your text'); return }

    setLoadingTripInfo(true)
    try {
      const response = await fetch('http://localhost:3001/api/parse-trip-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to parse')
      if (data.tripInfo) setTripInfoPreview(data.tripInfo)
      else setError('No trip info found')
    } catch (e) {
      setError(e.message.includes('Failed to fetch') ? 'Cannot connect to server. Run: npm run server' : 'Error: ' + e.message)
    } finally {
      setLoadingTripInfo(false)
    }
  }

  const handleImportDays = () => {
    if (preview?.length > 0) {
      importDays(preview)
      navigate('/')
    }
  }

  const handleImportTripInfo = () => {
    if (tripInfoPreview) {
      importTripInfo(tripInfoPreview)
      navigate('/trip-info')
    }
  }

  const handleClear = () => {
    setRawText('')
    setPreview(null)
    setTripInfoPreview(null)
    setError('')
  }

  const handleClearAll = () => {
    if (window.confirm('Clear ALL imported data? This cannot be undone.')) {
      clearItinerary()
      window.location.reload()
    }
  }

  const existingData = loadItinerary()
  const hasExistingData = existingData.days?.length > 0
  const isLoading = loading || loadingTripInfo

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Import</h1>

      {hasExistingData && (
        <div className="card" style={{ background: '#fef3c7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0 }}>
            <strong>Note:</strong> You have {existingData.days.length} days imported. New imports will update/add days.
          </p>
          <button className="secondary" onClick={handleClearAll} style={{ background: '#fee2e2', color: '#dc2626' }}>
            Clear All Data
          </button>
        </div>
      )}

      <div className="card">
        <h2>Paste Raw Text</h2>
        <p style={{ marginBottom: '15px', color: '#666', fontSize: '0.9rem' }}>
          Paste your itinerary document. Parse it as Itinerary (days/segments) or Trip Info (costs, visa, flights).
        </p>

        <textarea
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          placeholder="Paste your full itinerary document here..."
          style={{ marginBottom: '15px', minHeight: '200px' }}
        />

        {error && (
          <p style={{ color: '#dc2626', marginBottom: '15px', padding: '10px', background: '#fef2f2', borderRadius: '6px' }}>
            {error}
          </p>
        )}

        {isLoading && (
          <div style={{ background: '#dbeafe', padding: '15px', borderRadius: '6px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '24px', height: '24px', border: '3px solid #1e40af', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <div>
              <strong>{loading ? 'Parsing Itinerary...' : 'Parsing Trip Info...'}</strong>
              <div style={{ fontSize: '0.85rem', color: '#1e40af' }}>
                {elapsed}s - {loading ? 'Extracting days with segments, transfers, activities' : 'Extracting costs, flights, visa info'}
              </div>
            </div>
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="primary" onClick={handleParseItinerary} disabled={isLoading}>
            {loading ? `Parsing... ${elapsed}s` : 'Parse Itinerary (Days)'}
          </button>
          <button className="secondary" onClick={handleParseTripInfo} disabled={isLoading}>
            {loadingTripInfo ? `Parsing... ${elapsed}s` : 'Parse Trip Info'}
          </button>
          <button className="secondary" onClick={handleClear} disabled={isLoading}>
            Clear
          </button>
        </div>
      </div>

      {/* Itinerary Preview */}
      {preview?.length > 0 && (
        <div className="card">
          <h2>Itinerary Preview ({preview.length} days)</h2>
          <div style={{ maxHeight: '500px', overflow: 'auto' }}>
            {preview.map((day, idx) => (
              <div key={idx} style={{ padding: '15px', background: '#f9f9f9', borderRadius: '6px', marginBottom: '10px' }}>
                <h3 style={{ marginBottom: '8px' }}>Day {day.day}: {day.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>{day.location}</p>

                {/* Segments */}
                {day.segments?.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    {day.segments.map((seg, sIdx) => (
                      <div key={sIdx} style={{
                        display: 'flex', gap: '10px', padding: '8px', marginBottom: '4px',
                        background: seg.type === 'transfer' ? '#fef3c7' : '#fff',
                        borderRadius: '4px', borderLeft: `3px solid ${seg.type === 'transfer' ? '#f59e0b' : seg.type === 'activity' ? '#3b82f6' : '#9ca3af'}`
                      }}>
                        <span style={{ fontSize: '0.75rem', color: '#666', minWidth: '60px' }}>{seg.time}</span>
                        <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '3px', background: '#e5e7eb' }}>{seg.type}</span>
                        <span style={{ fontSize: '0.85rem', flex: 1 }}>
                          {seg.title}
                          {seg.type === 'transfer' && seg.from && seg.to && (
                            <span style={{ color: '#666' }}> ({seg.from} → {seg.to}, {seg.mode}, {seg.duration})</span>
                          )}
                          {seg.walkDetails?.distance && (
                            <span style={{ color: '#065f46' }}> - {seg.walkDetails.distance}</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {day.accommodation?.name && (
                  <div style={{ fontSize: '0.8rem', marginTop: '8px', color: '#4b5563' }}>
                    <strong>Stay:</strong> {day.accommodation.name} {day.accommodation.rating && `(${day.accommodation.rating})`}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '15px' }}>
            <button className="primary" onClick={handleImportDays}>Import {preview.length} Days</button>
          </div>
        </div>
      )}

      {/* Trip Info Preview */}
      {tripInfoPreview && (
        <div className="card">
          <h2>Trip Info Preview</h2>
          <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '6px' }}>
            {tripInfoPreview.tripName && <p><strong>Trip:</strong> {tripInfoPreview.tripName}</p>}
            {tripInfoPreview.duration && <p><strong>Duration:</strong> {tripInfoPreview.duration}</p>}
            {tripInfoPreview.costs?.perPerson && <p><strong>Cost:</strong> {tripInfoPreview.costs.perPerson} per person</p>}
            {tripInfoPreview.costs?.included?.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <strong>Included:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                  {tripInfoPreview.costs.included.slice(0, 5).map((item, i) => <li key={i} style={{ fontSize: '0.85rem' }}>{item}</li>)}
                  {tripInfoPreview.costs.included.length > 5 && <li style={{ fontSize: '0.85rem', color: '#666' }}>...and {tripInfoPreview.costs.included.length - 5} more</li>}
                </ul>
              </div>
            )}
            {tripInfoPreview.flights?.outbound?.from && (
              <p style={{ marginTop: '10px' }}><strong>Flight:</strong> {tripInfoPreview.flights.outbound.from} → {tripInfoPreview.flights.outbound.to}</p>
            )}
          </div>
          <div style={{ marginTop: '15px' }}>
            <button className="primary" onClick={handleImportTripInfo}>Import Trip Info</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImportPage
