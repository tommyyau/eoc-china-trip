import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Directories for research and selections
const RESEARCH_DIR = path.join(__dirname, '..', 'research-output')
const SELECTIONS_DIR = path.join(__dirname, 'data', 'selections')
const ITINERARY_FILE = path.join(__dirname, 'data', 'itinerary.json')
const SAVED_TRIPS_FILE = path.join(__dirname, 'data', 'saved-trips.json')
const IMAGES_DIR = path.join(__dirname, '..', 'china-hiking-tour', 'public', 'images')

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true })
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, IMAGES_DIR)
  },
  filename: (req, file, cb) => {
    const dayNumber = req.body.dayNumber || 0
    const ext = path.extname(file.originalname).toLowerCase()

    // Find next available image number for this day
    const existingFiles = fs.readdirSync(IMAGES_DIR)
    const dayPattern = new RegExp(`^day-${dayNumber}-image-(\\d+)`)
    let maxNum = 0
    existingFiles.forEach(f => {
      const match = f.match(dayPattern)
      if (match) {
        maxNum = Math.max(maxNum, parseInt(match[1]))
      }
    })

    const filename = `day-${dayNumber}-image-${maxNum + 1}${ext}`
    cb(null, filename)
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'))
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
})

// API keys for image search
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '4wGTin267DbXTH31pzcFYbx4FkOoYJflzmauitLlw_c'
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'XMucWQDeDKI8Giqzipmy130K1Y2f2dEMWMULTxiBfR4S82Cnv545RA3M'
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || ''  // Get free key at https://pixabay.com/api/docs/

// Ensure selections directory exists
if (!fs.existsSync(SELECTIONS_DIR)) {
  fs.mkdirSync(SELECTIONS_DIR, { recursive: true })
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Check for API key on startup
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-key-here') {
  console.error('\n⚠️  Please set your OpenAI API key in .env file')
  console.error('   Edit: content-manager/.env')
  console.error('   Set:  OPENAI_API_KEY=sk-...\n')
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Parse itinerary into days with segments
app.post('/api/parse', async (req, res) => {
  const { rawText } = req.body

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-key-here') {
    return res.status(400).json({ error: 'OpenAI API key not configured. Edit .env file.' })
  }

  if (!rawText) {
    return res.status(400).json({ error: 'Raw text required' })
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert at parsing travel itineraries. Extract structured data with SEGMENTS for each day.

Return a JSON array of days. Each day should have SEGMENTS that break down the day's activities, transfers, meals, etc.

Structure for each day:
{
  "day": 1,
  "date": "May 17",
  "title": "Short descriptive title (e.g., 'Xi'an to Beijing' or 'Exploring the Great Wall')",
  "location": "Primary location(s) for the day",
  "rawText": "ONLY the specific lines/paragraphs from the input that describe THIS day - not the whole document. Extract just the portion between where this day starts and where the next day begins.",
  "segments": [
    {
      "time": "Morning/Midday/Afternoon/Evening/Night",
      "type": "activity|transfer|check-in|check-out|meal|free-time",
      "title": "Segment title",
      "location": "Location for this segment",
      "description": "Details about this segment",
      "duration": "Estimated duration (e.g., '2 hours', '4-6 hours')",
      "from": "For transfers: departure location",
      "to": "For transfers: arrival location",
      "mode": "For transfers: train|flight|bus|coach|walk|cable-car|boat",
      "highlights": ["Key points for activities"],
      "walkDetails": {
        "distance": "e.g., 13.7km",
        "elevation": "e.g., 500m gain",
        "difficulty": "easy|moderate|challenging"
      }
    }
  ],
  "meals": "Breakfast, Lunch, Dinner",
  "accommodation": {
    "name": "Hotel name",
    "rating": "4-star",
    "location": "City"
  }
}

IMPORTANT:
- Break each day into logical segments (morning activity, lunch, afternoon activity, transfer, dinner, etc.)
- Mark transfers clearly with type="transfer" and include from/to/mode/duration
- For hiking/walking activities, include walkDetails
- Day 0 should be departure day (flight from origin)
- Be thorough - capture all activities and transitions
- For rawText: Extract ONLY the text portion for that specific day. Do NOT include the entire document. If Day 3 starts at "Day 3: Beijing" and Day 4 starts at "Day 4: Great Wall", rawText for Day 3 should only contain the text between those two markers.`
        },
        {
          role: 'user',
          content: `Parse this itinerary into days with segments. Return ONLY valid JSON (no markdown, no explanation):\n\n${rawText}`
        }
      ],
      temperature: 0.1,
      max_tokens: 8000
    })

    const content = response.choices[0].message.content

    let parsed
    try {
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsed = JSON.parse(jsonStr)
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse LLM response as JSON', raw: content })
    }

    res.json({ days: Array.isArray(parsed) ? parsed : [parsed] })

  } catch (error) {
    console.error('OpenAI error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Parse trip info (costs, visa, flights, etc.)
app.post('/api/parse-trip-info', async (req, res) => {
  const { rawText } = req.body

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-key-here') {
    return res.status(400).json({ error: 'OpenAI API key not configured. Edit .env file.' })
  }

  if (!rawText) {
    return res.status(400).json({ error: 'Raw text required' })
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert at extracting trip information from travel documents. Extract NON-ITINERARY information like costs, visa requirements, what's included, flights, etc.

Return a JSON object with this structure:
{
  "tripName": "Name of the trip",
  "duration": "e.g., 14 days and 13 nights",
  "dates": {
    "start": "Start date if mentioned",
    "end": "End date if mentioned"
  },
  "costs": {
    "perPerson": "Price per person (e.g., £1,600)",
    "singleSupplement": "Single room supplement if mentioned",
    "currency": "GBP/USD/EUR",
    "included": [
      "List of what's included (accommodation, meals, transport, guides, tickets, insurance, etc.)"
    ],
    "excluded": [
      "List of what's NOT included (flights, single supplement, personal expenses, etc.)"
    ]
  },
  "flights": {
    "outbound": {
      "from": "Departure airport",
      "to": "Arrival airport",
      "date": "Date",
      "time": "Time",
      "airline": "Airline name"
    },
    "return": {
      "from": "Departure airport",
      "to": "Arrival airport",
      "date": "Date",
      "time": "Time",
      "airline": "Airline name"
    },
    "notes": "Any flight-related notes"
  },
  "visa": {
    "required": true,
    "type": "Visa type if mentioned",
    "notes": "Visa-related notes"
  },
  "insurance": {
    "included": true/false,
    "notes": "Insurance details"
  },
  "hotelStandard": "e.g., 4-star hotels, mountain lodges",
  "groupSize": "If mentioned",
  "guides": "Guide information",
  "notes": "Any other general trip notes"
}

Only include fields that have actual information. Use null for missing data.`
        },
        {
          role: 'user',
          content: `Extract trip information from this text. Return ONLY valid JSON (no markdown, no explanation):\n\n${rawText}`
        }
      ],
      temperature: 0.1,
      max_tokens: 4000
    })

    const content = response.choices[0].message.content

    let parsed
    try {
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsed = JSON.parse(jsonStr)
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse LLM response as JSON', raw: content })
    }

    res.json({ tripInfo: parsed })

  } catch (error) {
    console.error('OpenAI error:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============================================
// IMAGE RESEARCH & SELECTION ENDPOINTS
// ============================================

// GET /api/research - List all available research days
app.get('/api/research', (req, res) => {
  try {
    if (!fs.existsSync(RESEARCH_DIR)) {
      return res.json({ days: [] })
    }
    const files = fs.readdirSync(RESEARCH_DIR)
    const days = files
      .filter(f => f.match(/^day-(\d+)-research\.json$/))
      .map(f => parseInt(f.match(/^day-(\d+)-research\.json$/)[1]))
      .sort((a, b) => a - b)
    res.json({ days })
  } catch (error) {
    console.error('Error listing research:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/research/:day - Load research data for a specific day
app.get('/api/research/:day', (req, res) => {
  try {
    const day = parseInt(req.params.day)
    const filePath = path.join(RESEARCH_DIR, `day-${day}-research.json`)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `Research data for day ${day} not found` })
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    res.json({ research: data })
  } catch (error) {
    console.error('Error loading research:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/images/search - Proxy search to multiple image providers
app.post('/api/images/search', async (req, res) => {
  const { query, provider = 'all', count = 8 } = req.body

  if (!query) {
    return res.status(400).json({ error: 'Query is required' })
  }

  try {
    let images = []

    // Calculate how many images per provider based on selection
    const providers = provider === 'all'
      ? ['unsplash', 'pexels', 'pixabay', 'wikimedia']
      : provider === 'both'
        ? ['unsplash', 'pexels']  // Legacy support
        : [provider]
    const perProvider = Math.ceil(count / providers.length)

    // Fetch from Unsplash
    if (providers.includes('unsplash')) {
      try {
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perProvider}&orientation=landscape`
        const response = await fetch(url, {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
            'Accept-Version': 'v1'
          }
        })
        if (response.ok) {
          const data = await response.json()
          images = images.concat(data.results.map(photo => ({
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
            height: photo.height
          })))
        }
      } catch (e) {
        console.error('Unsplash error:', e.message)
      }
    }

    // Fetch from Pexels
    if (providers.includes('pexels')) {
      try {
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perProvider}&orientation=landscape`
        const response = await fetch(url, {
          headers: {
            'Authorization': PEXELS_API_KEY
          }
        })
        if (response.ok) {
          const data = await response.json()
          images = images.concat(data.photos.map(photo => ({
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
            height: photo.height
          })))
        }
      } catch (e) {
        console.error('Pexels error:', e.message)
      }
    }

    // Fetch from Pixabay (minimum 3 per request required by API)
    if (providers.includes('pixabay') && PIXABAY_API_KEY) {
      try {
        const pixabayCount = Math.max(3, perProvider)
        const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&per_page=${pixabayCount}&orientation=horizontal&image_type=photo&safesearch=true`
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          images = images.concat(data.hits.map(photo => ({
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
            height: photo.imageHeight
          })))
        }
      } catch (e) {
        console.error('Pixabay error:', e.message)
      }
    }

    // Fetch from Wikimedia Commons (no API key needed)
    if (providers.includes('wikimedia')) {
      try {
        // Use Wikimedia Commons API to search for images
        const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=${perProvider}&format=json&origin=*`
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          const searchResults = data.query?.search || []

          // Get image info for each result
          const imagePromises = searchResults.map(async (result) => {
            const title = result.title
            const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|size|extmetadata&format=json&origin=*`
            try {
              const infoRes = await fetch(infoUrl)
              if (infoRes.ok) {
                const infoData = await infoRes.json()
                const pages = infoData.query?.pages || {}
                const page = Object.values(pages)[0]
                const imageInfo = page?.imageinfo?.[0]
                if (imageInfo && imageInfo.url) {
                  const ext = imageInfo.url.split('.').pop().toLowerCase()
                  // Only include actual images (not SVG, PDF, etc.)
                  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
                    const metadata = imageInfo.extmetadata || {}
                    return {
                      id: `wikimedia-${page.pageid}`,
                      url: imageInfo.url.replace(/\/commons\//, '/commons/thumb/').replace(/(\.\w+)$/, '$1/800px-' + title.replace('File:', '')),
                      thumb: imageInfo.url.replace(/\/commons\//, '/commons/thumb/').replace(/(\.\w+)$/, '$1/300px-' + title.replace('File:', '')),
                      full: imageInfo.url,
                      alt: metadata.ImageDescription?.value?.replace(/<[^>]*>/g, '') || title.replace('File:', '').replace(/\.\w+$/, ''),
                      photographer: metadata.Artist?.value?.replace(/<[^>]*>/g, '') || 'Wikimedia Commons',
                      photographerUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`,
                      source: 'wikimedia',
                      sourceUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`,
                      width: imageInfo.width,
                      height: imageInfo.height,
                      license: metadata.LicenseShortName?.value || 'CC'
                    }
                  }
                }
              }
            } catch (e) {
              // Skip this image on error
            }
            return null
          })

          const wikimediaImages = (await Promise.all(imagePromises)).filter(Boolean)
          images = images.concat(wikimediaImages)
        }
      } catch (e) {
        console.error('Wikimedia error:', e.message)
      }
    }

    res.json({ images })
  } catch (error) {
    console.error('Image search error:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============================================
// IMAGE UPLOAD ENDPOINTS
// ============================================

// POST /api/upload-image - Upload an image from local filesystem
// Use query param for dayNumber since body isn't available during multer processing
app.post('/api/upload-image', (req, res) => {
  // Get dayNumber from query before multer runs
  const dayNumber = req.query.dayNumber || req.body?.dayNumber || 0

  // Create a custom storage that uses the dayNumber
  const customStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, IMAGES_DIR)
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase()
      const existingFiles = fs.readdirSync(IMAGES_DIR)
      const dayPattern = new RegExp(`^day-${dayNumber}-image-(\\d+)`)
      let maxNum = 0
      existingFiles.forEach(f => {
        const match = f.match(dayPattern)
        if (match) {
          maxNum = Math.max(maxNum, parseInt(match[1]))
        }
      })
      const filename = `day-${dayNumber}-image-${maxNum + 1}${ext}`
      cb(null, filename)
    }
  })

  const customUpload = multer({
    storage: customStorage,
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'))
      }
    },
    limits: { fileSize: 10 * 1024 * 1024 }
  }).single('image')

  customUpload(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err)
      return res.status(400).json({ error: err.message })
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    const filename = req.file.filename
    const url = `/images/${filename}`

    console.log(`Image uploaded: ${filename} -> ${IMAGES_DIR}`)

    res.json({
      success: true,
      image: {
        id: `local-${Date.now()}`,
        filename,
        url,
        thumb: url,
        full: url,
        alt: req.body?.alt || filename.replace(/\.[^.]+$/, '').replace(/-/g, ' '),
        photographer: 'Local Upload',
        source: 'local'
      }
    })
  })
})

// DELETE /api/delete-image/:filename - Delete an uploaded image
app.delete('/api/delete-image/:filename', (req, res) => {
  try {
    const filename = req.params.filename

    // Security: only allow deleting files that match our naming pattern
    if (!filename.match(/^day-\d+-image-\d+\.(jpg|jpeg|png|gif|webp)$/i)) {
      return res.status(400).json({ error: 'Invalid filename format' })
    }

    const filePath = path.join(IMAGES_DIR, filename)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Image not found' })
    }

    fs.unlinkSync(filePath)
    console.log(`Image deleted: ${filename}`)

    res.json({ success: true, deleted: filename })
  } catch (error) {
    console.error('Delete error:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/images/list - List all uploaded images
app.get('/api/images/list', (req, res) => {
  try {
    if (!fs.existsSync(IMAGES_DIR)) {
      return res.json({ images: [] })
    }

    const files = fs.readdirSync(IMAGES_DIR)
    const images = files
      .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
      .map(filename => ({
        id: `local-${filename}`,
        filename,
        url: `/images/${filename}`,
        thumb: `/images/${filename}`,
        full: `/images/${filename}`,
        alt: filename.replace(/\.[^.]+$/, '').replace(/-/g, ' '),
        photographer: 'Local Upload',
        source: 'local'
      }))

    res.json({ images })
  } catch (error) {
    console.error('List images error:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/selections/:day - Load saved selections for a day
app.get('/api/selections/:day', (req, res) => {
  try {
    const day = parseInt(req.params.day)
    const filePath = path.join(SELECTIONS_DIR, `day-${day}-selections.json`)

    if (!fs.existsSync(filePath)) {
      return res.json({ selections: null })
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    res.json({ selections: data })
  } catch (error) {
    console.error('Error loading selections:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/selections/:day - Save selections for a day
app.post('/api/selections/:day', (req, res) => {
  try {
    const day = parseInt(req.params.day)
    const { selections } = req.body

    if (!selections) {
      return res.status(400).json({ error: 'Selections data is required' })
    }

    const data = {
      day,
      lastModified: new Date().toISOString(),
      ...selections
    }

    const filePath = path.join(SELECTIONS_DIR, `day-${day}-selections.json`)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

    res.json({ success: true, path: filePath })
  } catch (error) {
    console.error('Error saving selections:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/export - Export all selections for website integration
app.get('/api/export', (req, res) => {
  try {
    if (!fs.existsSync(SELECTIONS_DIR)) {
      return res.json({ days: [] })
    }

    const files = fs.readdirSync(SELECTIONS_DIR)
    const days = files
      .filter(f => f.match(/^day-(\d+)-selections\.json$/))
      .map(f => {
        const data = JSON.parse(fs.readFileSync(path.join(SELECTIONS_DIR, f), 'utf8'))
        // Transform to itineraryData.js format
        const allImages = []
        if (data.segments) {
          Object.values(data.segments).forEach(segment => {
            if (segment.images) {
              allImages.push(...segment.images.map(img => ({
                src: img.url,
                alt: img.alt || { en: img.altText || '', cn: '' },
                caption: img.caption || { en: '', cn: '' }
              })))
            }
          })
        }
        return {
          day: data.day,
          images: allImages,
          segments: data.segments
        }
      })
      .sort((a, b) => a.day - b.day)

    res.json({ days })
  } catch (error) {
    console.error('Error exporting:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============================================
// ITINERARY PERSISTENCE ENDPOINTS
// ============================================

// GET /api/itinerary - Load itinerary from file
app.get('/api/itinerary', (req, res) => {
  try {
    if (!fs.existsSync(ITINERARY_FILE)) {
      return res.json({ itinerary: null })
    }
    const data = JSON.parse(fs.readFileSync(ITINERARY_FILE, 'utf8'))
    res.json({ itinerary: data })
  } catch (error) {
    console.error('Error loading itinerary:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/itinerary - Save itinerary to file
app.post('/api/itinerary', (req, res) => {
  try {
    const { itinerary } = req.body
    if (!itinerary) {
      return res.status(400).json({ error: 'Itinerary data is required' })
    }

    // Add metadata
    const data = {
      ...itinerary,
      metadata: {
        ...itinerary.metadata,
        lastModified: new Date().toISOString(),
        savedToFile: true
      }
    }

    fs.writeFileSync(ITINERARY_FILE, JSON.stringify(data, null, 2))
    console.log('Itinerary saved to', ITINERARY_FILE)
    res.json({ success: true, path: ITINERARY_FILE })
  } catch (error) {
    console.error('Error saving itinerary:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============================================
// SAVED TRIPS ENDPOINTS
// ============================================

// GET /api/saved-trips - Load all saved trips from file
app.get('/api/saved-trips', (req, res) => {
  try {
    if (!fs.existsSync(SAVED_TRIPS_FILE)) {
      return res.json({ trips: [] })
    }
    const data = JSON.parse(fs.readFileSync(SAVED_TRIPS_FILE, 'utf8'))
    res.json({ trips: data })
  } catch (error) {
    console.error('Error loading saved trips:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/saved-trips - Save all trips to file
app.post('/api/saved-trips', (req, res) => {
  try {
    const { trips } = req.body
    if (!trips) {
      return res.status(400).json({ error: 'Trips data is required' })
    }
    fs.writeFileSync(SAVED_TRIPS_FILE, JSON.stringify(trips, null, 2))
    console.log('Saved trips written to', SAVED_TRIPS_FILE)
    res.json({ success: true, path: SAVED_TRIPS_FILE })
  } catch (error) {
    console.error('Error saving trips:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============================================
// POI RESEARCH ENDPOINTS
// ============================================

const POI_DIR = path.join(__dirname, 'data', 'poi')

// Ensure POI directory exists
if (!fs.existsSync(POI_DIR)) {
  fs.mkdirSync(POI_DIR, { recursive: true })
}

// GET /api/poi - List all POI research days
app.get('/api/poi', (req, res) => {
  try {
    if (!fs.existsSync(POI_DIR)) {
      return res.json({ days: [] })
    }
    const files = fs.readdirSync(POI_DIR)
    const days = files
      .filter(f => f.match(/^day-(\d+)-poi\.json$/))
      .map(f => parseInt(f.match(/^day-(\d+)-poi\.json$/)[1]))
      .sort((a, b) => a - b)
    res.json({ days })
  } catch (error) {
    console.error('Error listing POI research:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/poi/:day - Load POI research for a specific day
app.get('/api/poi/:day', (req, res) => {
  try {
    const day = parseInt(req.params.day)
    const filePath = path.join(POI_DIR, `day-${day}-poi.json`)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `POI research for day ${day} not found` })
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    res.json({ poi: data })
  } catch (error) {
    console.error('Error loading POI research:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/poi/:day - Save POI research for a day
app.post('/api/poi/:day', (req, res) => {
  try {
    const day = parseInt(req.params.day)
    const { pois } = req.body

    if (!pois) {
      return res.status(400).json({ error: 'POI data is required' })
    }

    const data = {
      day,
      lastModified: new Date().toISOString(),
      pois
    }

    const filePath = path.join(POI_DIR, `day-${day}-poi.json`)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

    res.json({ success: true, path: filePath })
  } catch (error) {
    console.error('Error saving POI research:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/poi/research/:day - Trigger POI research for a day
app.post('/api/poi/research/:day', async (req, res) => {
  const day = parseInt(req.params.day)

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-key-here') {
    return res.status(400).json({ error: 'OpenAI API key not configured' })
  }

  try {
    // Load itinerary data to get highlights
    const itineraryPath = path.join(__dirname, '..', 'china-hiking-tour', 'src', 'data', 'itineraryData.js')
    const fileContent = fs.readFileSync(itineraryPath, 'utf8')
    const jsonMatch = fileContent.match(/export const itineraryData = (\[[\s\S]*\]);/)
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Could not parse itinerary data' })
    }
    const itineraryData = eval('(' + jsonMatch[1] + ')')
    const dayData = itineraryData.find(d => d.day === day)

    if (!dayData) {
      return res.status(404).json({ error: `Day ${day} not found` })
    }

    const location = dayData.location.en || dayData.location
    const highlights = dayData.highlights.en || dayData.highlights

    // Filter to POIs only (exclude transfers, meals, etc.)
    const skipPatterns = [
      /airport transfer/i, /welcome dinner/i, /welcome meeting/i,
      /high-speed train/i, /high-speed rail/i, /sleeper train/i,
      /overnight train/i, /flight to/i, /departure/i, /overnight/i,
      /dumpling banquet/i, /peking duck/i, /acclimatization/i, /warm-up/i
    ]
    const poiNames = highlights.filter(h => !skipPatterns.some(p => p.test(h)))

    if (poiNames.length === 0) {
      return res.json({ pois: [], message: 'No POIs found for this day' })
    }

    console.log(`Researching ${poiNames.length} POIs for Day ${day}...`)

    const researchedPOIs = []
    for (const poiName of poiNames) {
      console.log(`  Researching: ${poiName}`)

      // Search Wikipedia
      let wikiData = null
      try {
        const searchQuery = `${poiName} ${location} China`
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&origin=*`
        const searchRes = await fetch(searchUrl)
        const searchJson = await searchRes.json()

        if (searchJson.query?.search?.length) {
          const pageTitle = searchJson.query.search[0].title
          const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=extracts&exintro=true&explaintext=true&format=json&origin=*`
          const extractRes = await fetch(extractUrl)
          const extractJson = await extractRes.json()
          const pages = extractJson.query?.pages
          if (pages) {
            const page = Object.values(pages)[0]
            if (page && !page.missing) {
              wikiData = {
                title: page.title,
                extract: page.extract?.substring(0, 2000) || '',
                url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`
              }
            }
          }
        }
      } catch (e) {
        console.log(`    Wikipedia search failed: ${e.message}`)
      }

      // Synthesize with OpenAI
      let synthesis = { summary: '', historicalContext: '', practicalTips: '', confidence: 0.5 }
      try {
        const prompt = `You are a travel content writer creating engaging descriptions for a hiking tour website.

POI Name: ${poiName}
Location: ${location}, China
Wikipedia Content: ${wikiData?.extract || 'No Wikipedia data available'}

Generate a JSON response with engaging, accurate content:
{
  "summary": "1-2 paragraphs (150-250 words). Marketing-style description that makes travelers excited to visit.",
  "historicalContext": "2-4 sentences of key historical facts.",
  "practicalTips": "3-5 practical tips for visitors as a single string, separated by periods."
}

Be accurate, engaging, and concise.`

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert travel writer. Return ONLY valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })

        const content = response.choices[0].message.content
        const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const parsed = JSON.parse(jsonStr)
        synthesis = {
          summary: parsed.summary || '',
          historicalContext: parsed.historicalContext || '',
          practicalTips: parsed.practicalTips || '',
          confidence: wikiData ? 0.9 : 0.7
        }
      } catch (e) {
        console.log(`    OpenAI synthesis failed: ${e.message}`)
      }

      researchedPOIs.push({
        id: poiName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        name: poiName,
        day: day,
        location: location,
        status: 'pending',
        summary: synthesis.summary,
        historicalContext: synthesis.historicalContext,
        practicalTips: synthesis.practicalTips,
        confidence: synthesis.confidence,
        links: wikiData ? [{ type: 'wikipedia', url: wikiData.url, title: 'Wikipedia' }] : [],
        researchedAt: new Date().toISOString()
      })

      // Small delay between POIs
      await new Promise(r => setTimeout(r, 500))
    }

    // Save to file
    const data = {
      day,
      lastModified: new Date().toISOString(),
      pois: researchedPOIs
    }
    const filePath = path.join(POI_DIR, `day-${day}-poi.json`)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

    console.log(`Completed research for Day ${day}: ${researchedPOIs.length} POIs`)
    res.json({ pois: researchedPOIs })

  } catch (error) {
    console.error('POI research error:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/poi/export/all - Export all approved POIs for website integration
app.get('/api/poi/export/all', (req, res) => {
  try {
    if (!fs.existsSync(POI_DIR)) {
      return res.json({ pois: {} })
    }

    const files = fs.readdirSync(POI_DIR)
    const allPois = {}

    files
      .filter(f => f.match(/^day-(\d+)-poi\.json$/))
      .forEach(f => {
        const data = JSON.parse(fs.readFileSync(path.join(POI_DIR, f), 'utf8'))
        if (data.pois) {
          data.pois.forEach(poi => {
            if (poi.status === 'approved') {
              allPois[poi.id] = {
                name: poi.name,
                day: poi.day,
                location: poi.location,
                summary: poi.summary,
                historicalContext: poi.historicalContext,
                practicalTips: poi.practicalTips,
                links: poi.links
              }
            }
          })
        }
      })

    res.json({ pois: allPois })
  } catch (error) {
    console.error('Error exporting POIs:', error)
    res.status(500).json({ error: error.message })
  }
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Parser API running on http://localhost:${PORT}`)
})
