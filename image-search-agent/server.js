import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_FILE = path.join(__dirname, 'data', 'sessions.json')

// API keys (optional)
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY
const PEXELS_API_KEY = process.env.PEXELS_API_KEY
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY

const app = express()
app.use(cors())
app.use(express.json())

// ============================================
// PERSISTENCE
// ============================================

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
    }
  } catch (e) {
    console.error('Error loading data:', e.message)
  }
  return { searches: [], ratings: {}, sourceStats: {} }
}

function saveData(data) {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

// ============================================
// RELEVANCE SCORING
// ============================================

function calculateRelevance(image, query) {
  const queryTerms = query.toLowerCase().split(/\s+/)
  let score = 0

  // Resolution score (0-25)
  const pixels = (image.width || 800) * (image.height || 600)
  if (pixels >= 4000000) score += 25      // 4MP+
  else if (pixels >= 2000000) score += 20 // 2MP+
  else if (pixels >= 1000000) score += 15 // 1MP+
  else if (pixels >= 500000) score += 10  // 0.5MP+
  else score += 5

  // Keyword match score (0-25)
  const textToSearch = `${image.alt || ''} ${image.photographer || ''} ${image.tags || ''}`.toLowerCase()
  let matchCount = 0
  queryTerms.forEach(term => {
    if (textToSearch.includes(term)) matchCount++
  })
  score += Math.min(25, Math.round((matchCount / queryTerms.length) * 25))

  // Source score (0-25) - Wikimedia great for landmarks, Unsplash for quality
  const sourceScores = {
    wikimedia: 25,  // Best for landmarks/historical
    unsplash: 22,   // High quality photos
    pexels: 20,     // Good quality
    pixabay: 18,    // Decent quality
    flickr: 15      // Variable quality
  }
  score += sourceScores[image.source] || 10

  // Aspect ratio score (0-25) - Landscape preferred for travel
  const ratio = (image.width || 800) / (image.height || 600)
  if (ratio >= 1.3 && ratio <= 1.8) score += 25      // Ideal landscape
  else if (ratio >= 1.1 && ratio <= 2.0) score += 20 // Good landscape
  else if (ratio >= 0.9 && ratio <= 1.1) score += 15 // Square
  else score += 10                                    // Portrait or extreme

  return Math.min(100, score)
}

// ============================================
// IMAGE SEARCH
// ============================================

async function searchUnsplash(query, count) {
  if (!UNSPLASH_ACCESS_KEY) return []
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`
    const res = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        'Accept-Version': 'v1'
      }
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.results.map(photo => ({
      id: `unsplash-${photo.id}`,
      url: photo.urls.regular,
      thumb: photo.urls.small,
      full: photo.urls.full,
      alt: photo.alt_description || photo.description || query,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      source: 'unsplash',
      sourceUrl: `https://unsplash.com/photos/${photo.id}`,
      width: photo.width,
      height: photo.height,
      tags: photo.tags?.map(t => t.title).join(', ') || ''
    }))
  } catch (e) {
    console.error('Unsplash error:', e.message)
    return []
  }
}

async function searchPexels(query, count) {
  if (!PEXELS_API_KEY) return []
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`
    const res = await fetch(url, {
      headers: { 'Authorization': PEXELS_API_KEY }
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.photos.map(photo => ({
      id: `pexels-${photo.id}`,
      url: photo.src.large,
      thumb: photo.src.medium,
      full: photo.src.original,
      alt: photo.alt || query,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      source: 'pexels',
      sourceUrl: photo.url,
      width: photo.width,
      height: photo.height,
      tags: ''
    }))
  } catch (e) {
    console.error('Pexels error:', e.message)
    return []
  }
}

async function searchPixabay(query, count) {
  if (!PIXABAY_API_KEY) return []
  try {
    const pixCount = Math.max(3, count)
    const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&per_page=${pixCount}&orientation=horizontal&image_type=photo&safesearch=true`
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return data.hits.map(photo => ({
      id: `pixabay-${photo.id}`,
      url: photo.webformatURL,
      thumb: photo.previewURL,
      full: photo.largeImageURL,
      alt: photo.tags || query,
      photographer: photo.user,
      photographerUrl: `https://pixabay.com/users/${photo.user}-${photo.user_id}/`,
      source: 'pixabay',
      sourceUrl: photo.pageURL,
      width: photo.imageWidth,
      height: photo.imageHeight,
      tags: photo.tags || ''
    }))
  } catch (e) {
    console.error('Pixabay error:', e.message)
    return []
  }
}

async function searchWikimedia(query, count) {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=${count}&format=json&origin=*`
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    const searchResults = data.query?.search || []

    const images = await Promise.all(searchResults.map(async (result) => {
      const title = result.title
      const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|size|extmetadata&format=json&origin=*`
      try {
        const infoRes = await fetch(infoUrl)
        if (!infoRes.ok) return null
        const infoData = await infoRes.json()
        const pages = infoData.query?.pages || {}
        const page = Object.values(pages)[0]
        const imageInfo = page?.imageinfo?.[0]
        if (!imageInfo?.url) return null

        const ext = imageInfo.url.split('.').pop().toLowerCase()
        if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return null

        const metadata = imageInfo.extmetadata || {}
        const fileName = title.replace('File:', '')

        return {
          id: `wikimedia-${page.pageid}`,
          url: imageInfo.url.replace(/\/commons\//, '/commons/thumb/').replace(/(\.\w+)$/, `$1/800px-${fileName}`),
          thumb: imageInfo.url.replace(/\/commons\//, '/commons/thumb/').replace(/(\.\w+)$/, `$1/300px-${fileName}`),
          full: imageInfo.url,
          alt: metadata.ImageDescription?.value?.replace(/<[^>]*>/g, '') || fileName.replace(/\.\w+$/, ''),
          photographer: metadata.Artist?.value?.replace(/<[^>]*>/g, '') || 'Wikimedia Commons',
          photographerUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`,
          source: 'wikimedia',
          sourceUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`,
          width: imageInfo.width,
          height: imageInfo.height,
          tags: metadata.Categories?.value || ''
        }
      } catch {
        return null
      }
    }))

    return images.filter(Boolean)
  } catch (e) {
    console.error('Wikimedia error:', e.message)
    return []
  }
}

// ============================================
// API ROUTES
// ============================================

// GET /api/sessions - Get all search history
app.get('/api/sessions', (req, res) => {
  const data = loadData()
  res.json({ searches: data.searches, sourceStats: data.sourceStats })
})

// POST /api/search - Search for images
app.post('/api/search', async (req, res) => {
  const { query, count = 30 } = req.body
  if (!query) {
    return res.status(400).json({ error: 'Query is required' })
  }

  const data = loadData()
  const perSource = Math.ceil(count / 4)

  // Search all sources in parallel
  const [unsplash, pexels, pixabay, wikimedia] = await Promise.all([
    searchUnsplash(query, perSource),
    searchPexels(query, perSource),
    searchPixabay(query, perSource),
    searchWikimedia(query, perSource)
  ])

  // Combine and deduplicate by URL
  const seenUrls = new Set()
  let allImages = [...wikimedia, ...unsplash, ...pexels, ...pixabay]
    .filter(img => {
      if (seenUrls.has(img.url)) return false
      seenUrls.add(img.url)
      return true
    })

  // Calculate relevance scores
  allImages = allImages.map(img => ({
    ...img,
    relevance: calculateRelevance(img, query)
  }))

  // Sort by relevance
  allImages.sort((a, b) => b.relevance - a.relevance)

  // Apply any learned preferences from ratings
  const queryRatings = data.ratings[query.toLowerCase()] || {}
  allImages = allImages.map(img => ({
    ...img,
    userRating: queryRatings[img.id] || null
  }))

  // Save search to history
  const searchEntry = {
    id: `search-${Date.now()}`,
    query,
    timestamp: new Date().toISOString(),
    resultCount: allImages.length,
    sources: {
      wikimedia: wikimedia.length,
      unsplash: unsplash.length,
      pexels: pexels.length,
      pixabay: pixabay.length
    }
  }
  data.searches.unshift(searchEntry)
  data.searches = data.searches.slice(0, 50) // Keep last 50 searches
  saveData(data)

  res.json({
    images: allImages,
    searchId: searchEntry.id,
    sources: searchEntry.sources
  })
})

// POST /api/rate - Rate an image
app.post('/api/rate', (req, res) => {
  const { query, imageId, rating } = req.body
  if (!query || !imageId || !rating) {
    return res.status(400).json({ error: 'query, imageId, and rating are required' })
  }

  const data = loadData()
  const queryKey = query.toLowerCase()

  if (!data.ratings[queryKey]) {
    data.ratings[queryKey] = {}
  }
  data.ratings[queryKey][imageId] = rating

  // Update source stats
  const source = imageId.split('-')[0]
  if (!data.sourceStats[source]) {
    data.sourceStats[source] = { veryRelevant: 0, relevant: 0, notRelevant: 0 }
  }
  data.sourceStats[source][rating]++

  saveData(data)
  res.json({ success: true })
})

// GET /api/suggestions - Get search refinement suggestions
app.get('/api/suggestions', (req, res) => {
  const { query } = req.query
  if (!query) {
    return res.status(400).json({ error: 'Query is required' })
  }

  const data = loadData()
  const suggestions = []

  // Analyze ratings for similar queries
  const queryTerms = query.toLowerCase().split(/\s+/)
  const relatedSearches = data.searches.filter(s => {
    const searchTerms = s.query.toLowerCase().split(/\s+/)
    return queryTerms.some(t => searchTerms.includes(t))
  })

  // Find highly rated images for related queries
  const highlyRatedTags = []
  relatedSearches.forEach(search => {
    const ratings = data.ratings[search.query.toLowerCase()] || {}
    Object.entries(ratings).forEach(([imageId, rating]) => {
      if (rating === 'veryRelevant') {
        // Extract tags from image ID patterns
        const source = imageId.split('-')[0]
        highlyRatedTags.push(source)
      }
    })
  })

  // Suggest adding location qualifiers
  const chinaQualifiers = ['china', 'chinese', 'travel', 'tourism', 'landmark', 'historic', 'scenic']
  chinaQualifiers.forEach(qual => {
    if (!query.toLowerCase().includes(qual)) {
      suggestions.push({
        type: 'add_qualifier',
        suggestion: `${query} ${qual}`,
        reason: `Adding "${qual}" may improve results`
      })
    }
  })

  // Suggest based on source performance
  const bestSource = Object.entries(data.sourceStats)
    .sort((a, b) => (b[1].veryRelevant || 0) - (a[1].veryRelevant || 0))[0]
  if (bestSource) {
    suggestions.push({
      type: 'source_tip',
      suggestion: `${bestSource[0]} has your most highly-rated images`,
      reason: `${bestSource[1].veryRelevant || 0} images rated "very relevant"`
    })
  }

  res.json({ suggestions: suggestions.slice(0, 5) })
})

// GET /api/stats - Get rating statistics
app.get('/api/stats', (req, res) => {
  const data = loadData()

  let totalRatings = 0
  let ratingCounts = { veryRelevant: 0, relevant: 0, notRelevant: 0 }

  Object.values(data.ratings).forEach(queryRatings => {
    Object.values(queryRatings).forEach(rating => {
      totalRatings++
      ratingCounts[rating]++
    })
  })

  res.json({
    totalSearches: data.searches.length,
    totalRatings,
    ratingCounts,
    sourceStats: data.sourceStats
  })
})

const PORT = 3003
app.listen(PORT, () => {
  console.log(`Image Search Agent API running on http://localhost:${PORT}`)
  console.log('Available sources:')
  console.log(`  - Wikimedia Commons: YES (no key needed)`)
  console.log(`  - Unsplash: ${UNSPLASH_ACCESS_KEY ? 'YES' : 'NO (add UNSPLASH_ACCESS_KEY to .env)'}`)
  console.log(`  - Pexels: ${PEXELS_API_KEY ? 'YES' : 'NO (add PEXELS_API_KEY to .env)'}`)
  console.log(`  - Pixabay: ${PIXABAY_API_KEY ? 'YES' : 'NO (add PIXABAY_API_KEY to .env)'}`)
})
