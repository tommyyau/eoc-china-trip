import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loadItinerary, getSettings, updateSettings, calculateDate, addDay, deleteDay, moveDay, getSavedTrips, saveCurrentAs, loadTrip, deleteSavedTrip, renameSavedTrip, getCurrentTripId, clearCurrentTrip, updateSavedTrip } from '../utils/storage'

function Dashboard() {
  const navigate = useNavigate()
  const [itinerary, setItinerary] = useState({ days: [], settings: {} })
  const [startDate, setStartDate] = useState('')
  const [showAddDay, setShowAddDay] = useState(false)
  const [newDayNumber, setNewDayNumber] = useState(0)
  const [newDayTitle, setNewDayTitle] = useState('')
  const [error, setError] = useState('')

  // Saved trips state
  const [savedTrips, setSavedTrips] = useState([])
  const [currentTripId, setCurrentTripId] = useState(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [newTripName, setNewTripName] = useState('')
  const [renamingTrip, setRenamingTrip] = useState(null)
  const [renameValue, setRenameValue] = useState('')

  useEffect(() => {
    const data = loadItinerary()
    setItinerary(data)
    const settings = getSettings()
    if (settings.startDate) {
      setStartDate(settings.startDate)
    }
    // Load saved trips
    setSavedTrips(getSavedTrips())
    setCurrentTripId(getCurrentTripId())
  }, [])

  const days = itinerary.days || []

  const stats = {
    total: days.length,
    draft: days.filter(d => d.status === 'draft').length,
    inProgress: days.filter(d => d.status === 'in-progress').length,
    reviewed: days.filter(d => d.status === 'reviewed').length,
    complete: days.filter(d => d.status === 'complete').length
  }

  const handleStartDateChange = (value) => {
    setStartDate(value)
    updateSettings({ startDate: value })
  }

  const handleAddDay = () => {
    setError('')
    const result = addDay(newDayNumber, newDayTitle)
    if (result.error) {
      setError(result.error)
      return
    }
    // Refresh data
    setItinerary(loadItinerary())
    setShowAddDay(false)
    setNewDayNumber(0)
    setNewDayTitle('')
    // Navigate to new day
    navigate(`/day/${newDayNumber}`)
  }

  const handleDeleteDay = (dayNumber, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm(`Delete Day ${dayNumber}? This cannot be undone.`)) {
      deleteDay(dayNumber)
      setItinerary(loadItinerary())
    }
  }

  const handleMoveDay = (fromDay, direction, e) => {
    e.preventDefault()
    e.stopPropagation()
    const toDay = fromDay + direction
    const result = moveDay(fromDay, toDay)
    if (result.error) {
      alert(result.error)
      return
    }
    setItinerary(loadItinerary())
  }

  // Get display date for a day
  const getDisplayDate = (day) => {
    if (startDate) {
      return calculateDate(day.day, startDate)
    }
    return day.date || 'Date not set'
  }

  // Get day label (Day 0 = Departure, Day 1 = Arrival, negative = pre-trip)
  const getDayLabel = (dayNum) => {
    if (dayNum === 0) return 'Day 0 (Departure)'
    if (dayNum === 1) return 'Day 1 (Arrival)'
    if (dayNum < 0) return `Day ${dayNum} (Pre-trip)`
    return `Day ${dayNum}`
  }

  // Saved trips handlers
  const handleSaveAs = () => {
    if (!newTripName.trim()) return
    saveCurrentAs(newTripName.trim())
    setSavedTrips(getSavedTrips())
    setCurrentTripId(getCurrentTripId())
    setShowSaveDialog(false)
    setNewTripName('')
  }

  const handleLoadTrip = (id) => {
    if (window.confirm('Load this trip? Any unsaved changes to current data will be lost.')) {
      loadTrip(id)
      setItinerary(loadItinerary())
      setCurrentTripId(id)
      const settings = getSettings()
      if (settings.startDate) setStartDate(settings.startDate)
    }
  }

  const handleDeleteTrip = (id, name) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteSavedTrip(id)
      setSavedTrips(getSavedTrips())
      if (currentTripId === id) setCurrentTripId(null)
    }
  }

  const handleRenameTrip = (id) => {
    if (!renameValue.trim()) return
    renameSavedTrip(id, renameValue.trim())
    setSavedTrips(getSavedTrips())
    setRenamingTrip(null)
    setRenameValue('')
  }

  const handleClearCurrent = () => {
    if (window.confirm('Clear current trip? All data will be removed. Make sure to save first if needed.')) {
      clearCurrentTrip()
      setItinerary(loadItinerary())
      setCurrentTripId(null)
      setStartDate('')
    }
  }

  const handleUpdateSaved = () => {
    if (!currentTripId) return
    if (window.confirm('Update the saved trip with current changes?')) {
      updateSavedTrip(currentTripId)
      setSavedTrips(getSavedTrips())
    }
  }

  const getCurrentTripName = () => {
    if (!currentTripId) return null
    const trip = savedTrips.find(t => t.id === currentTripId)
    return trip?.name
  }

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Dashboard</h1>

      {/* Trip Settings */}
      <div className="card">
        <h2>Trip Settings</h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
              Trip Start Date (Day 0 - Departure)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => handleStartDateChange(e.target.value)}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>
          {startDate && (
            <div style={{ color: '#666', fontSize: '0.9rem' }}>
              Day 0 (Departure): {new Date(startDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              <br />
              Day 1 (Arrival): {calculateDate(1, startDate)}
            </div>
          )}
        </div>
      </div>

      {/* Saved Trips */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0 }}>
            Saved Trips
            {getCurrentTripName() && (
              <span style={{ fontSize: '0.8rem', fontWeight: 'normal', marginLeft: '10px', color: '#16a34a' }}>
                (Currently: {getCurrentTripName()})
              </span>
            )}
          </h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            {currentTripId && (
              <button className="secondary" onClick={handleUpdateSaved} style={{ fontSize: '0.85rem' }}>
                Save Changes
              </button>
            )}
            <button className="primary" onClick={() => setShowSaveDialog(true)} style={{ fontSize: '0.85rem' }}>
              Save As New...
            </button>
            <button
              onClick={handleClearCurrent}
              style={{
                padding: '8px 12px',
                fontSize: '0.85rem',
                background: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Clear Current
            </button>
          </div>
        </div>

        {/* Save dialog */}
        {showSaveDialog && (
          <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Trip Name</label>
                <input
                  type="text"
                  value={newTripName}
                  onChange={e => setNewTripName(e.target.value)}
                  placeholder="e.g., China 2026 - Option A"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                  onKeyDown={e => e.key === 'Enter' && handleSaveAs()}
                  autoFocus
                />
              </div>
              <button className="primary" onClick={handleSaveAs}>Save</button>
              <button className="secondary" onClick={() => { setShowSaveDialog(false); setNewTripName('') }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Saved trips list */}
        {savedTrips.length === 0 ? (
          <p style={{ color: '#666', margin: 0 }}>No saved trips yet. Click "Save As New..." to save your current itinerary.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {savedTrips.map(trip => (
              <div
                key={trip.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 15px',
                  background: trip.id === currentTripId ? '#f0fdf4' : '#f9f9f9',
                  border: trip.id === currentTripId ? '2px solid #16a34a' : '1px solid #eee',
                  borderRadius: '8px'
                }}
              >
                <div style={{ flex: 1 }}>
                  {renamingTrip === trip.id ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        onKeyDown={e => e.key === 'Enter' && handleRenameTrip(trip.id)}
                        autoFocus
                      />
                      <button onClick={() => handleRenameTrip(trip.id)} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Save</button>
                      <button onClick={() => { setRenamingTrip(null); setRenameValue('') }} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Cancel</button>
                    </div>
                  ) : (
                    <>
                      <strong>{trip.name}</strong>
                      {trip.id === currentTripId && (
                        <span style={{ marginLeft: '8px', fontSize: '0.75rem', background: '#16a34a', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
                          LOADED
                        </span>
                      )}
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
                        {trip.data?.days?.length || 0} days • Last modified: {new Date(trip.lastModified).toLocaleDateString('en-GB')}
                      </div>
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {trip.id !== currentTripId && (
                    <button
                      onClick={() => handleLoadTrip(trip.id)}
                      style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Load
                    </button>
                  )}
                  <button
                    onClick={() => { setRenamingTrip(trip.id); setRenameValue(trip.name) }}
                    style={{ padding: '6px 10px', fontSize: '0.8rem', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => handleDeleteTrip(trip.id, trip.name)}
                    style={{ padding: '6px 10px', fontSize: '0.8rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats - only show when we have data */}
      {days.length > 0 && (
        <div className="card">
          <h2>Overview</h2>
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '1.1rem' }}><strong>{stats.total}</strong> Total Days</div>
            {stats.draft > 0 && <div><span className="status draft">{stats.draft}</span> Draft</div>}
            {stats.inProgress > 0 && <div><span className="status in-progress">{stats.inProgress}</span> In Progress</div>}
            {stats.reviewed > 0 && <div><span className="status reviewed">{stats.reviewed}</span> Reviewed</div>}
            {stats.complete > 0 && <div><span className="status complete">{stats.complete}</span> Complete</div>}
          </div>
        </div>
      )}

      {/* Add Day */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showAddDay ? '15px' : 0 }}>
          <h2 style={{ margin: 0 }}>Days</h2>
          <button className="secondary" onClick={() => setShowAddDay(!showAddDay)}>
            {showAddDay ? 'Cancel' : '+ Add Day'}
          </button>
        </div>

        {showAddDay && (
          <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Day Number</label>
                <input
                  type="number"
                  value={newDayNumber}
                  onChange={e => setNewDayNumber(parseInt(e.target.value) || 0)}
                  style={{ width: '80px', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                />
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                  0 = Departure, 1 = Arrival, negative = pre-trip
                </div>
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Title</label>
                <input
                  type="text"
                  value={newDayTitle}
                  onChange={e => setNewDayTitle(e.target.value)}
                  placeholder="e.g., Departure - Meet at Heathrow"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                />
              </div>
              <button className="primary" onClick={handleAddDay}>
                Add Day
              </button>
            </div>
            {error && <p style={{ color: '#dc2626', marginTop: '10px', marginBottom: 0 }}>{error}</p>}
            {startDate && newDayNumber !== '' && (
              <p style={{ color: '#666', marginTop: '10px', marginBottom: 0, fontSize: '0.85rem' }}>
                This will be: {calculateDate(newDayNumber, startDate)}
              </p>
            )}
          </div>
        )}

        {/* Day list */}
        {days.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            <p style={{ marginBottom: '15px' }}>No days yet. Import an itinerary or add days manually.</p>
            <Link to="/import">
              <button className="primary">Import Itinerary</button>
            </Link>
          </div>
        ) : (
          <div className="day-list">
            {days.map((day, index) => (
              <div key={day.day} className="day-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Move buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <button
                    onClick={(e) => handleMoveDay(day.day, -1, e)}
                    disabled={index === 0}
                    style={{
                      padding: '2px 6px',
                      fontSize: '0.7rem',
                      background: index === 0 ? '#eee' : '#ddd',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: index === 0 ? 'not-allowed' : 'pointer'
                    }}
                    title="Move up (earlier)"
                  >
                    ▲
                  </button>
                  <button
                    onClick={(e) => handleMoveDay(day.day, 1, e)}
                    disabled={index === days.length - 1}
                    style={{
                      padding: '2px 6px',
                      fontSize: '0.7rem',
                      background: index === days.length - 1 ? '#eee' : '#ddd',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: index === days.length - 1 ? 'not-allowed' : 'pointer'
                    }}
                    title="Move down (later)"
                  >
                    ▼
                  </button>
                </div>

                {/* Day content - clickable */}
                <Link to={`/day/${day.day}`} style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                  <div className="day-info">
                    <h3>{getDayLabel(day.day)}: {day.title || day.enhanced?.title || day.original?.title || 'Untitled'}</h3>
                    <p>{getDisplayDate(day)} • {day.enhanced?.location || day.original?.location || 'Location TBD'}</p>
                  </div>
                  <span className={`status ${day.status}`}>
                    {day.status.replace('-', ' ')}
                  </span>
                </Link>

                {/* Delete button */}
                <button
                  onClick={(e) => handleDeleteDay(day.day, e)}
                  style={{
                    padding: '6px 10px',
                    fontSize: '0.8rem',
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  title="Delete day"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
