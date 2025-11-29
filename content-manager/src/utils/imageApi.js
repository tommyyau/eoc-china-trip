// Image Research & Selection API utilities

const API_BASE = 'http://localhost:3001'

/**
 * Load research data for a specific day
 */
export async function loadResearch(dayNumber) {
  const response = await fetch(`${API_BASE}/api/research/${dayNumber}`)
  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error('Failed to load research data')
  }
  const data = await response.json()
  return data.research
}

/**
 * List all days that have research data
 */
export async function listResearchDays() {
  const response = await fetch(`${API_BASE}/api/research`)
  if (!response.ok) throw new Error('Failed to list research days')
  const data = await response.json()
  return data.days
}

/**
 * Search for images using Pexels/Unsplash
 * @param {string} query - Search query
 * @param {string} provider - 'both', 'pexels', or 'unsplash'
 * @param {number} count - Number of images to fetch
 */
export async function searchImages(query, provider = 'both', count = 8) {
  const response = await fetch(`${API_BASE}/api/images/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, provider, count })
  })
  if (!response.ok) throw new Error('Image search failed')
  const data = await response.json()
  return data.images
}

/**
 * Load saved selections for a day
 */
export async function loadSelections(dayNumber) {
  const response = await fetch(`${API_BASE}/api/selections/${dayNumber}`)
  if (!response.ok) throw new Error('Failed to load selections')
  const data = await response.json()
  return data.selections
}

/**
 * Save selections for a day
 * @param {number} dayNumber
 * @param {object} selections - { segments: { segmentId: { name, images: [...] } } }
 */
export async function saveSelections(dayNumber, selections) {
  const response = await fetch(`${API_BASE}/api/selections/${dayNumber}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selections })
  })
  if (!response.ok) throw new Error('Failed to save selections')
  const data = await response.json()
  return data
}

/**
 * Export all selections for website integration
 */
export async function exportAllSelections() {
  const response = await fetch(`${API_BASE}/api/export`)
  if (!response.ok) throw new Error('Failed to export selections')
  const data = await response.json()
  return data.days
}
