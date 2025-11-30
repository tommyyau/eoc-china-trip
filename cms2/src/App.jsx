import { useState, useEffect, useCallback } from 'react'
import { Save, RefreshCw, Calendar, Info } from 'lucide-react'
import DayList from './components/DayList'
import DayEditor from './components/DayEditor'
import InfoEditor from './components/InfoEditor'
import { loadItinerary, saveItinerary, loadInfo, saveInfo, getFromLocalStorage, saveToLocalStorage } from './utils/storage'

function App() {
  const [activeTab, setActiveTab] = useState('itinerary')
  const [data, setData] = useState(null)
  const [infoData, setInfoData] = useState(null)
  const [selectedDay, setSelectedDay] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [hasInfoChanges, setHasInfoChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  // Load data on mount
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // Try localStorage first (for crash recovery)
        const cached = getFromLocalStorage()
        if (cached) {
          setData(cached)
          setHasChanges(true) // Mark as having unsaved changes
        } else {
          // Load from server
          const serverData = await loadItinerary()
          if (serverData) {
            setData(serverData)
            setLastSaved(serverData.metadata?.lastModified)
          }
        }
        // Load info page data
        const serverInfoData = await loadInfo()
        if (serverInfoData) {
          setInfoData(serverInfoData)
        }
      } catch (err) {
        console.error('Failed to load:', err)
      }
      setLoading(false)
    }
    load()
  }, [])

  // Auto-save to localStorage on changes
  useEffect(() => {
    if (data && hasChanges) {
      saveToLocalStorage(data)
    }
  }, [data, hasChanges])

  // Update data and mark as changed
  const updateData = useCallback((updater) => {
    setData(prev => {
      const newData = typeof updater === 'function' ? updater(prev) : updater
      return newData
    })
    setHasChanges(true)
  }, [])

  // Save to server
  const handleSave = async () => {
    setSaving(true)
    try {
      if (activeTab === 'itinerary' && data) {
        await saveItinerary(data)
        setHasChanges(false)
        localStorage.removeItem('cms2-itinerary')
      } else if (activeTab === 'info' && infoData) {
        await saveInfo(infoData)
        setHasInfoChanges(false)
      }
      setLastSaved(new Date().toISOString())
    } catch (err) {
      console.error('Failed to save:', err)
      alert('Failed to save: ' + err.message)
    }
    setSaving(false)
  }

  // Reload from server (discard local changes)
  const handleReload = async () => {
    const currentHasChanges = activeTab === 'itinerary' ? hasChanges : hasInfoChanges
    if (currentHasChanges && !confirm('Discard unsaved changes and reload from server?')) {
      return
    }
    setLoading(true)
    try {
      if (activeTab === 'itinerary') {
        localStorage.removeItem('cms2-itinerary')
        const serverData = await loadItinerary()
        if (serverData) {
          setData(serverData)
          setLastSaved(serverData.metadata?.lastModified)
          setHasChanges(false)
        }
      } else {
        const serverInfoData = await loadInfo()
        if (serverInfoData) {
          setInfoData(serverInfoData)
          setHasInfoChanges(false)
        }
      }
    } catch (err) {
      console.error('Failed to reload:', err)
    }
    setLoading(false)
  }

  // Update info data
  const updateInfoData = useCallback((newData) => {
    setInfoData(newData)
    setHasInfoChanges(true)
  }, [])

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  const currentDay = data?.days?.[selectedDay]
  const currentHasChanges = activeTab === 'itinerary' ? hasChanges : hasInfoChanges

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1>CMS2</h1>
          <nav className="header-tabs">
            <button
              className={`tab ${activeTab === 'itinerary' ? 'active' : ''}`}
              onClick={() => setActiveTab('itinerary')}
            >
              <Calendar size={16} />
              Itinerary
            </button>
            <button
              className={`tab ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              <Info size={16} />
              Info Page
            </button>
          </nav>
        </div>
        <div className="header-actions">
          {lastSaved && (
            <span className="last-saved">
              Last saved: {new Date(lastSaved).toLocaleString()}
            </span>
          )}
          {currentHasChanges && <span className="unsaved-badge">Unsaved changes</span>}
          <button onClick={handleReload} disabled={loading} className="btn btn-secondary">
            <RefreshCw size={16} />
            Reload
          </button>
          <button onClick={handleSave} disabled={saving || !currentHasChanges} className="btn btn-primary">
            <Save size={16} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      {activeTab === 'itinerary' ? (
        <div className="main">
          <aside className="sidebar">
            {data && (
              <DayList
                days={data.days || []}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
                onUpdateDays={(days) => updateData(prev => ({ ...prev, days }))}
              />
            )}
          </aside>

          <main className="content">
            {currentDay ? (
              <DayEditor
                day={currentDay}
                dayIndex={selectedDay}
                onUpdate={(updatedDay) => {
                  updateData(prev => ({
                    ...prev,
                    days: prev.days.map((d, i) => i === selectedDay ? updatedDay : d)
                  }))
                }}
              />
            ) : (
              <div className="empty-state">
                <p>Select a day to edit or load data from server</p>
              </div>
            )}
          </main>
        </div>
      ) : (
        <div className="main info-main">
          <main className="content full-width">
            {infoData ? (
              <InfoEditor data={infoData} onUpdate={updateInfoData} />
            ) : (
              <div className="empty-state">
                <p>No info page data found</p>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  )
}

export default App
