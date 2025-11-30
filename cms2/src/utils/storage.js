const API_BASE = '/api'
const LOCAL_STORAGE_KEY = 'cms2-itinerary'

// Load itinerary from server
export async function loadItinerary() {
  const response = await fetch(`${API_BASE}/itinerary`)
  const { data } = await response.json()
  return data
}

// Save itinerary to server
export async function saveItinerary(data) {
  const response = await fetch(`${API_BASE}/itinerary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data })
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to save')
  }
  return response.json()
}

// Load info page from server
export async function loadInfo() {
  const response = await fetch(`${API_BASE}/info`)
  const { data } = await response.json()
  return data
}

// Save info page to server
export async function saveInfo(data) {
  const response = await fetch(`${API_BASE}/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data })
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to save')
  }
  return response.json()
}

// Search images
export async function searchImages(query, provider = 'both', count = 12) {
  const response = await fetch(`${API_BASE}/images/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, provider, count })
  })
  const { images } = await response.json()
  return images
}

// LocalStorage for crash recovery
export function getFromLocalStorage() {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e)
  }
  return null
}

export function saveToLocalStorage(data) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }
}

// Generate unique ID for new segments
export function generateSegmentId(dayIndex, segmentIndex) {
  return `${dayIndex}-${segmentIndex}-${Date.now()}`
}
