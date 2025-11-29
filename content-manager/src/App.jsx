import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import DayEditor from './pages/DayEditor'
import ImportPage from './pages/ImportPage'
import ExportPage from './pages/ExportPage'
import TripInfoPage from './pages/TripInfoPage'
import { syncFromServer, syncSavedTripsFromServer } from './utils/storage'
import './App.css'

function App() {
  // Sync data from server files on startup
  useEffect(() => {
    syncFromServer()
    syncSavedTripsFromServer()
  }, [])

  return (
    <BrowserRouter>
      <div className="app">
        <nav className="sidebar">
          <h1>Content Manager</h1>
          <ul>
            <li><NavLink to="/">Dashboard</NavLink></li>
            <li><NavLink to="/trip-info">Trip Info</NavLink></li>
            <li><NavLink to="/import">Import</NavLink></li>
            <li><NavLink to="/export">Export</NavLink></li>
          </ul>
        </nav>
        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/day/:dayNumber" element={<DayEditor />} />
            <Route path="/trip-info" element={<TripInfoPage />} />
            <Route path="/import" element={<ImportPage />} />
            <Route path="/export" element={<ExportPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
