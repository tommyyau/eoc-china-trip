// Storage utility - saves to both localStorage (cache) and server file (persistent)
// Primary storage: data/itinerary.json via API
// Fallback/cache: localStorage

const STORAGE_KEY = 'itinerary-data'
const API_BASE = 'http://localhost:3001'

// Segment types
export const SEGMENT_TYPES = ['activity', 'transfer', 'check-in', 'check-out', 'meal', 'free-time']
export const TRANSFER_MODES = ['train', 'flight', 'bus', 'coach', 'walk', 'cable-car', 'boat']

// Create empty segment
export function createEmptySegment() {
  return {
    id: Date.now().toString(),
    time: '',              // Morning, Midday, Afternoon, Evening, Night
    type: 'activity',      // activity | transfer | check-in | check-out | meal | free-time
    title: '',
    location: '',
    description: '',
    duration: '',
    // Transfer-specific fields
    from: '',
    to: '',
    mode: '',              // train | flight | bus | coach | walk | cable-car | boat
    // Activity-specific
    highlights: [],
    walkDetails: null,     // { distance, elevation, difficulty }
    // Images
    images: []
  }
}

// Create empty day structure
export function createEmptyDay(dayNumber, date = '') {
  return {
    day: dayNumber,
    date: date,

    // Basic info
    title: '',
    location: '',          // Primary location(s) for the day

    // Segments - ordered list of activities/transfers
    segments: [],

    // Legacy/original data (kept for reference)
    original: {
      rawText: '',
      title: '',
      location: '',
      description: '',
      highlights: [],
      meals: '',
      accommodation: ''
    },

    // Enhanced/edited data
    enhanced: {
      title: '',
      location: '',
      description: '',
      highlights: [],
      accommodation: { name: '', rating: '', location: '' }
    },

    // Accommodation for the night
    accommodation: {
      name: '',
      rating: '',
      location: '',
      address: '',
      bookingUrl: ''
    },

    // Meals summary
    meals: '',

    // Practical info
    practicalInfo: {
      weather: '',
      whatToPack: [],
      timing: '',
      notes: ''
    },

    // Images for the day
    images: [],

    status: 'draft',
    lastModified: new Date().toISOString()
  }
}

// Trip Info structure (separate from itinerary)
export function createEmptyTripInfo() {
  return {
    // Basic trip details
    tripName: '',
    dates: { start: '', end: '' },
    duration: '',

    // Costs
    costs: {
      perPerson: '',
      singleSupplement: '',
      currency: 'GBP',
      included: [],        // List of what's included
      excluded: []         // List of what's not included
    },

    // Flights
    flights: {
      outbound: { from: '', to: '', date: '', time: '', airline: '', flightNo: '' },
      return: { from: '', to: '', date: '', time: '', airline: '', flightNo: '' },
      notes: ''
    },

    // Visa & documents
    visa: {
      required: true,
      type: '',
      notes: ''
    },

    // Insurance
    insurance: {
      included: false,
      notes: ''
    },

    // Packing list
    packingList: [],

    // Health & safety
    healthSafety: {
      vaccinations: '',
      medications: '',
      emergencyContacts: '',
      notes: ''
    },

    // General notes
    notes: '',

    lastModified: new Date().toISOString()
  }
}

// Load all days from localStorage (sync - for immediate use)
export function loadItinerary() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Error loading itinerary:', e)
  }
  return {
    days: [],
    tripInfo: createEmptyTripInfo(),
    metadata: { lastModified: null, version: 2 },
    settings: { startDate: null }
  }
}

// Load from server file and sync to localStorage (async - call on app startup)
export async function syncFromServer() {
  try {
    const response = await fetch(`${API_BASE}/api/itinerary`)
    const { itinerary } = await response.json()

    if (itinerary) {
      // Server has data - update localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(itinerary))
      console.log('Synced itinerary from server file')
      return itinerary
    } else {
      // No server data - push localStorage to server if we have any
      const local = loadItinerary()
      if (local.days?.length > 0) {
        await fetch(`${API_BASE}/api/itinerary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itinerary: local })
        })
        console.log('Pushed localStorage to server file')
      }
      return local
    }
  } catch (e) {
    console.warn('Could not sync with server:', e.message)
    return loadItinerary()
  }
}

// Load/save trip info
export function getTripInfo() {
  const itinerary = loadItinerary()
  return itinerary.tripInfo || createEmptyTripInfo()
}

export function saveTripInfo(tripInfo) {
  const itinerary = loadItinerary()
  itinerary.tripInfo = { ...tripInfo, lastModified: new Date().toISOString() }
  saveItinerary(itinerary)
  return itinerary.tripInfo
}

// Get/set trip settings
export function getSettings() {
  const itinerary = loadItinerary()
  return itinerary.settings || { startDate: null }
}

export function updateSettings(settings) {
  const itinerary = loadItinerary()
  itinerary.settings = { ...itinerary.settings, ...settings }
  saveItinerary(itinerary)
  return itinerary.settings
}

// Calculate date for a day based on start date
// Day 0 = start date (departure), Day 1 = next day (arrival), etc.
export function calculateDate(dayNumber, startDate) {
  if (!startDate) return null
  const start = new Date(startDate)
  start.setDate(start.getDate() + dayNumber) // Day 0 = start date, Day 1 = start + 1
  return start.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

// Add a new day
export function addDay(dayNumber, title = '') {
  const itinerary = loadItinerary()

  // Check if day already exists
  if (itinerary.days.find(d => d.day === dayNumber)) {
    return { error: `Day ${dayNumber} already exists` }
  }

  const newDay = createEmptyDay(dayNumber, '')
  newDay.original.title = title
  newDay.enhanced.title = title

  itinerary.days.push(newDay)
  itinerary.days.sort((a, b) => a.day - b.day)
  saveItinerary(itinerary)

  return newDay
}

// Delete a day
export function deleteDay(dayNumber) {
  const itinerary = loadItinerary()
  itinerary.days = itinerary.days.filter(d => d.day !== dayNumber)
  saveItinerary(itinerary)
}

// Move a day (change its day number)
export function moveDay(fromDayNumber, toDayNumber) {
  const itinerary = loadItinerary()

  // Find the day to move
  const dayIndex = itinerary.days.findIndex(d => d.day === fromDayNumber)
  if (dayIndex === -1) return { error: 'Day not found' }

  // Check if target day number already exists
  const targetExists = itinerary.days.find(d => d.day === toDayNumber)
  if (targetExists) return { error: `Day ${toDayNumber} already exists` }

  // Update the day number
  itinerary.days[dayIndex].day = toDayNumber

  // Re-sort
  itinerary.days.sort((a, b) => a.day - b.day)
  saveItinerary(itinerary)

  return { success: true }
}

// Renumber all days sequentially (starting from a given number)
export function renumberDays(startFrom = 1) {
  const itinerary = loadItinerary()
  itinerary.days.sort((a, b) => a.day - b.day)
  itinerary.days.forEach((day, index) => {
    day.day = startFrom + index
  })
  saveItinerary(itinerary)
  return itinerary
}

// Save all days to localStorage and server file
export function saveItinerary(itinerary) {
  try {
    itinerary.metadata = {
      ...itinerary.metadata,
      lastModified: new Date().toISOString()
    }
    // Save to localStorage (cache)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itinerary))

    // Save to server file (persistent) - fire and forget
    fetch(`${API_BASE}/api/itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itinerary })
    }).catch(e => console.warn('Could not save to server:', e.message))

    return true
  } catch (e) {
    console.error('Error saving itinerary:', e)
    return false
  }
}

// Get a single day
export function getDay(dayNumber) {
  const itinerary = loadItinerary()
  return itinerary.days.find(d => d.day === dayNumber)
}

// Update a single day
export function updateDay(dayNumber, updates) {
  const itinerary = loadItinerary()
  const index = itinerary.days.findIndex(d => d.day === dayNumber)

  if (index >= 0) {
    itinerary.days[index] = {
      ...itinerary.days[index],
      ...updates,
      lastModified: new Date().toISOString()
    }
    saveItinerary(itinerary)
    return itinerary.days[index]
  }
  return null
}

// ============================================
// Segment CRUD Operations
// ============================================

// Add a new segment to a day
export function addSegment(dayNumber, segment = {}) {
  const itinerary = loadItinerary()
  const dayIndex = itinerary.days.findIndex(d => d.day === dayNumber)

  if (dayIndex === -1) return { error: 'Day not found' }

  const newSegment = {
    ...createEmptySegment(),
    ...segment,
    id: Date.now().toString()
  }

  if (!itinerary.days[dayIndex].segments) {
    itinerary.days[dayIndex].segments = []
  }

  itinerary.days[dayIndex].segments.push(newSegment)
  itinerary.days[dayIndex].lastModified = new Date().toISOString()
  saveItinerary(itinerary)

  return newSegment
}

// Update a segment within a day
export function updateSegment(dayNumber, segmentId, updates) {
  const itinerary = loadItinerary()
  const dayIndex = itinerary.days.findIndex(d => d.day === dayNumber)

  if (dayIndex === -1) return { error: 'Day not found' }

  const segments = itinerary.days[dayIndex].segments || []
  const segIndex = segments.findIndex(s => s.id === segmentId)

  if (segIndex === -1) return { error: 'Segment not found' }

  itinerary.days[dayIndex].segments[segIndex] = {
    ...segments[segIndex],
    ...updates
  }
  itinerary.days[dayIndex].lastModified = new Date().toISOString()
  saveItinerary(itinerary)

  return itinerary.days[dayIndex].segments[segIndex]
}

// Delete a segment from a day
export function deleteSegment(dayNumber, segmentId) {
  const itinerary = loadItinerary()
  const dayIndex = itinerary.days.findIndex(d => d.day === dayNumber)

  if (dayIndex === -1) return { error: 'Day not found' }

  itinerary.days[dayIndex].segments = (itinerary.days[dayIndex].segments || [])
    .filter(s => s.id !== segmentId)
  itinerary.days[dayIndex].lastModified = new Date().toISOString()
  saveItinerary(itinerary)

  return { success: true }
}

// Reorder segments within a day
export function reorderSegments(dayNumber, segmentIds) {
  const itinerary = loadItinerary()
  const dayIndex = itinerary.days.findIndex(d => d.day === dayNumber)

  if (dayIndex === -1) return { error: 'Day not found' }

  const segments = itinerary.days[dayIndex].segments || []
  const reordered = segmentIds
    .map(id => segments.find(s => s.id === id))
    .filter(Boolean)

  itinerary.days[dayIndex].segments = reordered
  itinerary.days[dayIndex].lastModified = new Date().toISOString()
  saveItinerary(itinerary)

  return reordered
}

// Add new days from parsed data
export function importDays(parsedDays) {
  const itinerary = loadItinerary()

  parsedDays.forEach(parsed => {
    const existing = itinerary.days.findIndex(d => d.day === parsed.day)
    const newDay = createEmptyDay(parsed.day, parsed.date)

    // Set basic info
    newDay.title = parsed.title || ''
    newDay.location = parsed.location || ''
    newDay.meals = parsed.meals || ''

    // Build enhanced description from segments
    let enhancedDescription = ''
    let enhancedHighlights = []

    if (parsed.segments?.length > 0) {
      // Build clean description from segment descriptions
      enhancedDescription = parsed.segments
        .filter(seg => seg.description)
        .map(seg => seg.description)
        .join('\n\n')

      // Extract highlights from segments
      enhancedHighlights = parsed.segments
        .filter(seg => seg.highlights?.length > 0)
        .flatMap(seg => seg.highlights)

      // If no highlights, use activity titles
      if (enhancedHighlights.length === 0) {
        enhancedHighlights = parsed.segments
          .filter(seg => seg.type === 'activity' && seg.title)
          .map(seg => seg.title)
      }
    }

    // Set original data (raw text for this day, untouched)
    newDay.original = {
      rawText: parsed.rawText || parsed.description || '',
      title: parsed.title || '',
      location: parsed.location || '',
      highlights: parsed.highlights || [],
      meals: parsed.meals || '',
      accommodation: typeof parsed.accommodation === 'string' ? parsed.accommodation : parsed.accommodation?.name || ''
    }

    // Set enhanced data (extracted/structured, easy to read)
    newDay.enhanced = {
      title: parsed.title || '',
      location: parsed.location || '',
      description: enhancedDescription || parsed.description || '',
      highlights: enhancedHighlights.length > 0 ? enhancedHighlights : (parsed.highlights || []),
      accommodation: {
        name: typeof parsed.accommodation === 'string' ? parsed.accommodation : parsed.accommodation?.name || '',
        rating: parsed.accommodation?.rating || '',
        location: parsed.accommodation?.location || ''
      }
    }

    // Set accommodation
    if (parsed.accommodation) {
      if (typeof parsed.accommodation === 'string') {
        newDay.accommodation = { name: parsed.accommodation, rating: '', location: '', address: '', bookingUrl: '' }
      } else {
        newDay.accommodation = { ...newDay.accommodation, ...parsed.accommodation }
      }
    }

    // Import segments if provided by LLM
    if (parsed.segments && Array.isArray(parsed.segments)) {
      newDay.segments = parsed.segments.map((seg, idx) => ({
        id: `${parsed.day}-${idx}-${Date.now()}`,
        time: seg.time || '',
        type: seg.type || 'activity',
        title: seg.title || '',
        location: seg.location || '',
        description: seg.description || '',
        duration: seg.duration || '',
        from: seg.from || '',
        to: seg.to || '',
        mode: seg.mode || '',
        highlights: seg.highlights || [],
        walkDetails: seg.walkDetails || null,
        images: []
      }))
    }

    if (existing >= 0) {
      itinerary.days[existing] = newDay
    } else {
      itinerary.days.push(newDay)
    }
  })

  // Sort by day number
  itinerary.days.sort((a, b) => a.day - b.day)
  saveItinerary(itinerary)

  return itinerary
}

// Import trip info from parsed data
export function importTripInfo(parsed) {
  const tripInfo = createEmptyTripInfo()

  if (parsed.tripName) tripInfo.tripName = parsed.tripName
  if (parsed.dates) tripInfo.dates = { ...tripInfo.dates, ...parsed.dates }
  if (parsed.duration) tripInfo.duration = parsed.duration
  if (parsed.costs) tripInfo.costs = { ...tripInfo.costs, ...parsed.costs }
  if (parsed.flights) tripInfo.flights = { ...tripInfo.flights, ...parsed.flights }
  if (parsed.visa) tripInfo.visa = { ...tripInfo.visa, ...parsed.visa }
  if (parsed.insurance) tripInfo.insurance = { ...tripInfo.insurance, ...parsed.insurance }
  if (parsed.packingList) tripInfo.packingList = parsed.packingList
  if (parsed.healthSafety) tripInfo.healthSafety = { ...tripInfo.healthSafety, ...parsed.healthSafety }
  if (parsed.notes) tripInfo.notes = parsed.notes

  saveTripInfo(tripInfo)
  return tripInfo
}

// Export to downloadable JSON
export function exportToJSON() {
  const itinerary = loadItinerary()
  return JSON.stringify(itinerary, null, 2)
}

// Clear all data
export function clearItinerary() {
  localStorage.removeItem(STORAGE_KEY)
}

// ============================================
// Multi-Trip Management
// ============================================

const SAVED_TRIPS_KEY = 'saved-trips'
const CURRENT_TRIP_KEY = 'current-trip-id'

// Helper to persist saved trips to server file
function persistSavedTrips(trips) {
  localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(trips))
  // Also save to server file
  fetch(`${API_BASE}/api/saved-trips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trips })
  }).catch(e => console.warn('Could not save trips to server:', e.message))
}

// Get list of all saved trips (metadata only)
export function getSavedTrips() {
  try {
    const data = localStorage.getItem(SAVED_TRIPS_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('Error loading saved trips:', e)
    return []
  }
}

// Sync saved trips from server (call on app startup)
export async function syncSavedTripsFromServer() {
  try {
    const response = await fetch(`${API_BASE}/api/saved-trips`)
    const { trips } = await response.json()

    if (trips && trips.length > 0) {
      localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(trips))
      console.log('Synced saved trips from server file')
      return trips
    } else {
      // No server data - push localStorage to server if we have any
      const local = getSavedTrips()
      if (local.length > 0) {
        await fetch(`${API_BASE}/api/saved-trips`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trips: local })
        })
        console.log('Pushed saved trips to server file')
      }
      return local
    }
  } catch (e) {
    console.warn('Could not sync saved trips with server:', e.message)
    return getSavedTrips()
  }
}

// Save current itinerary as a new trip
export function saveCurrentAs(name) {
  const trips = getSavedTrips()
  const current = loadItinerary()

  const id = Date.now().toString()
  const newTrip = {
    id,
    name,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    data: current
  }

  trips.push(newTrip)
  persistSavedTrips(trips)
  localStorage.setItem(CURRENT_TRIP_KEY, id)

  return newTrip
}

// Load a saved trip as current
export function loadTrip(id) {
  const trips = getSavedTrips()
  const trip = trips.find(t => t.id === id)

  if (!trip) return { error: 'Trip not found' }

  // Save to current itinerary
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trip.data))
  localStorage.setItem(CURRENT_TRIP_KEY, id)

  return trip
}

// Update a saved trip with current data
export function updateSavedTrip(id) {
  const trips = getSavedTrips()
  const index = trips.findIndex(t => t.id === id)

  if (index === -1) return { error: 'Trip not found' }

  const current = loadItinerary()
  trips[index].data = current
  trips[index].lastModified = new Date().toISOString()

  persistSavedTrips(trips)
  return trips[index]
}

// Delete a saved trip
export function deleteSavedTrip(id) {
  const trips = getSavedTrips()
  const filtered = trips.filter(t => t.id !== id)
  persistSavedTrips(filtered)

  // Clear current trip ID if it was the deleted one
  if (getCurrentTripId() === id) {
    localStorage.removeItem(CURRENT_TRIP_KEY)
  }
}

// Rename a saved trip
export function renameSavedTrip(id, newName) {
  const trips = getSavedTrips()
  const trip = trips.find(t => t.id === id)

  if (!trip) return { error: 'Trip not found' }

  trip.name = newName
  trip.lastModified = new Date().toISOString()
  persistSavedTrips(trips)

  return trip
}

// Get current loaded trip ID (if any)
export function getCurrentTripId() {
  return localStorage.getItem(CURRENT_TRIP_KEY)
}

// Clear current and start fresh
export function clearCurrentTrip() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(CURRENT_TRIP_KEY)
}
