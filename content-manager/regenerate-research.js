#!/usr/bin/env node
/**
 * Regenerate research data with images from all 4 providers
 * (Unsplash, Pexels, Pixabay, Wikimedia)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ITINERARY_FILE = path.join(__dirname, 'data', 'itinerary.json')
const RESEARCH_DIR = path.join(__dirname, '..', 'research-output')
const API_URL = 'http://localhost:3001/api/images/search'

// Delay between API calls to avoid rate limiting
const DELAY_MS = 500

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function searchImages(query, count = 8) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, provider: 'all', count })
    })
    if (!response.ok) {
      console.error(`  ⚠️  Search failed for "${query}": ${response.status}`)
      return []
    }
    const data = await response.json()
    return data.images || []
  } catch (e) {
    console.error(`  ⚠️  Search error for "${query}": ${e.message}`)
    return []
  }
}

function getSearchTerm(segment, dayLocation) {
  // Generate a good search term from segment title and location
  const title = segment.title || ''
  const location = segment.location || dayLocation || ''

  // Clean up the title for better search results
  let searchTerm = title
    .replace(/\(.*?\)/g, '')  // Remove parentheses content like (13.7km)
    .replace(/&/g, 'and')     // Replace & with and
    .trim()

  // Add location context for better results
  if (location && !searchTerm.toLowerCase().includes(location.toLowerCase())) {
    // Extract city name from location
    const city = location.split(/[,->]/).shift().trim()
    if (city && city.length > 2) {
      searchTerm = `${searchTerm} ${city} China`
    }
  } else if (!searchTerm.toLowerCase().includes('china')) {
    searchTerm = `${searchTerm} China`
  }

  return searchTerm
}

async function regenerateResearchForDay(day) {
  console.log(`\n📅 Day ${day.day}: ${day.title}`)
  console.log(`   Location: ${day.location}`)

  const activities = []
  const sampleImages = []

  // Process each segment
  for (const segment of (day.segments || [])) {
    // Skip non-visual segments like check-in, meals
    if (['check-in', 'check-out', 'meal'].includes(segment.type)) {
      continue
    }

    const searchTerm = getSearchTerm(segment, day.location)
    console.log(`   🔍 "${segment.title}" → searching "${searchTerm}"`)

    await sleep(DELAY_MS)
    const images = await searchImages(searchTerm, 8)

    console.log(`      Found ${images.length} images from ${[...new Set(images.map(i => i.source))].join(', ') || 'none'}`)

    // Add to activities list
    activities.push({
      name: segment.title,
      activity: segment.title,
      searchTerm: searchTerm,
      images: images
    })

    // Add to sampleImages for backward compatibility
    if (images.length > 0) {
      sampleImages.push({
        activity: segment.title,
        images: images
      })
    }
  }

  // Create research data structure
  const research = {
    day: day.day,
    title: {
      en: day.title,
      cn: day.title  // Keep same for now
    },
    location: {
      en: day.location,
      cn: day.location
    },
    generatedAt: new Date().toISOString(),
    providers: ['unsplash', 'pexels', 'pixabay', 'wikimedia'],
    activities: activities,
    sampleImages: sampleImages
  }

  // Save research file
  const filePath = path.join(RESEARCH_DIR, `day-${day.day}-research.json`)
  fs.writeFileSync(filePath, JSON.stringify(research, null, 2))
  console.log(`   ✅ Saved to ${filePath}`)

  return research
}

async function main() {
  console.log('🔄 Regenerating research data with images from all providers...\n')

  // Ensure research directory exists
  if (!fs.existsSync(RESEARCH_DIR)) {
    fs.mkdirSync(RESEARCH_DIR, { recursive: true })
  }

  // Load itinerary
  if (!fs.existsSync(ITINERARY_FILE)) {
    console.error('❌ Itinerary file not found:', ITINERARY_FILE)
    process.exit(1)
  }

  const itinerary = JSON.parse(fs.readFileSync(ITINERARY_FILE, 'utf8'))
  const days = itinerary.days || []

  console.log(`Found ${days.length} days in itinerary`)

  let totalImages = 0
  let totalActivities = 0

  for (const day of days) {
    const research = await regenerateResearchForDay(day)
    totalActivities += research.activities.length
    totalImages += research.activities.reduce((sum, a) => sum + (a.images?.length || 0), 0)
  }

  console.log('\n' + '='.repeat(50))
  console.log(`✅ Complete! Regenerated research for ${days.length} days`)
  console.log(`   📊 ${totalActivities} activities with ${totalImages} total images`)
  console.log('='.repeat(50))
}

main().catch(console.error)
