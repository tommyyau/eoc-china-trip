import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Directories for research and selections
const RESEARCH_DIR = path.join(__dirname, '..', 'research-output')
const SELECTIONS_DIR = path.join(__dirname, 'data', 'selections')

// API keys for image search
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '4wGTin267DbXTH31pzcFYbx4FkOoYJflzmauitLlw_c'
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'XMucWQDeDKI8Giqzipmy130K1Y2f2dEMWMULTxiBfR4S82Cnv545RA3M'

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

// POST /api/images/search - Proxy search to Pexels/Unsplash
app.post('/api/images/search', async (req, res) => {
  const { query, provider = 'both', count = 8 } = req.body

  if (!query) {
    return res.status(400).json({ error: 'Query is required' })
  }

  try {
    let images = []
    const perProvider = provider === 'both' ? Math.ceil(count / 2) : count

    // Fetch from Unsplash
    if (provider === 'unsplash' || provider === 'both') {
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
            width: photo.width,
            height: photo.height
          })))
        }
      } catch (e) {
        console.error('Unsplash error:', e.message)
      }
    }

    // Fetch from Pexels
    if (provider === 'pexels' || provider === 'both') {
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
            width: photo.width,
            height: photo.height
          })))
        }
      } catch (e) {
        console.error('Pexels error:', e.message)
      }
    }

    res.json({ images })
  } catch (error) {
    console.error('Image search error:', error)
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

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Parser API running on http://localhost:${PORT}`)
})
