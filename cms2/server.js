import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Path to website data files
const DATA_FILE = path.join(__dirname, '..', 'china-hiking-tour', 'src', 'data', 'itinerary-v2.json')
const INFO_FILE = path.join(__dirname, '..', 'china-hiking-tour', 'src', 'data', 'info-page.json')
const HOME_FILE = path.join(__dirname, '..', 'china-hiking-tour', 'src', 'data', 'home-page.json')

// API keys for image search (from .env file)
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY
const PEXELS_API_KEY = process.env.PEXELS_API_KEY
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// ============================================
// ITINERARY LOAD/SAVE
// ============================================

// GET /api/itinerary - Load itinerary data
app.get('/api/itinerary', (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return res.json({ data: null })
    }
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
    res.json({ data })
  } catch (error) {
    console.error('Error loading itinerary:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/itinerary - Save itinerary data
app.post('/api/itinerary', (req, res) => {
  try {
    const { data } = req.body
    if (!data) {
      return res.status(400).json({ error: 'Data is required' })
    }

    // Update metadata
    data.metadata = {
      ...data.metadata,
      version: 2,
      lastModified: new Date().toISOString()
    }

    // Ensure directory exists
    const dir = path.dirname(DATA_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
    console.log('Saved to', DATA_FILE)
    res.json({ success: true })
  } catch (error) {
    console.error('Error saving itinerary:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============================================
// INFO PAGE LOAD/SAVE
// ============================================

// GET /api/info - Load info page data
app.get('/api/info', (req, res) => {
  try {
    if (!fs.existsSync(INFO_FILE)) {
      return res.json({ data: null })
    }
    const data = JSON.parse(fs.readFileSync(INFO_FILE, 'utf8'))
    res.json({ data })
  } catch (error) {
    console.error('Error loading info:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/info - Save info page data
app.post('/api/info', (req, res) => {
  try {
    const { data } = req.body
    if (!data) {
      return res.status(400).json({ error: 'Data is required' })
    }

    fs.writeFileSync(INFO_FILE, JSON.stringify(data, null, 2))
    console.log('Saved info to', INFO_FILE)
    res.json({ success: true })
  } catch (error) {
    console.error('Error saving info:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============================================
// HOME PAGE LOAD/SAVE
// ============================================

// GET /api/home - Load home page data
app.get('/api/home', (req, res) => {
  try {
    if (!fs.existsSync(HOME_FILE)) {
      return res.json({ data: null })
    }
    const data = JSON.parse(fs.readFileSync(HOME_FILE, 'utf8'))
    res.json({ data })
  } catch (error) {
    console.error('Error loading home:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/home - Save home page data
app.post('/api/home', (req, res) => {
  try {
    const { data } = req.body
    if (!data) {
      return res.status(400).json({ error: 'Data is required' })
    }

    fs.writeFileSync(HOME_FILE, JSON.stringify(data, null, 2))
    console.log('Saved home to', HOME_FILE)
    res.json({ success: true })
  } catch (error) {
    console.error('Error saving home:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============================================
// IMAGE SEARCH
// ============================================

// POST /api/images/search - Search images from multiple providers
app.post('/api/images/search', async (req, res) => {
  const { query, provider = 'all', count = 15 } = req.body

  if (!query) {
    return res.status(400).json({ error: 'Query is required' })
  }

  try {
    let images = []

    // Calculate providers to use
    const providers = provider === 'all'
      ? ['unsplash', 'pexels', 'pixabay', 'wikimedia']
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
            src: photo.urls.regular,
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
          headers: { 'Authorization': PEXELS_API_KEY }
        })
        if (response.ok) {
          const data = await response.json()
          images = images.concat(data.photos.map(photo => ({
            id: `pexels-${photo.id}`,
            src: photo.src.large,
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

    // Fetch from Pixabay
    if (providers.includes('pixabay') && PIXABAY_API_KEY) {
      try {
        const pixabayCount = Math.max(3, perProvider) // Pixabay requires minimum 3
        const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&per_page=${pixabayCount}&orientation=horizontal&image_type=photo&safesearch=true`
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          images = images.concat(data.hits.map(photo => ({
            id: `pixabay-${photo.id}`,
            src: photo.webformatURL,
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
        const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=${perProvider}&format=json&origin=*`
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          const searchResults = data.query?.search || []

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
                  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
                    const metadata = imageInfo.extmetadata || {}
                    const fileName = title.replace('File:', '')
                    return {
                      id: `wikimedia-${page.pageid}`,
                      src: imageInfo.url.replace(/\/commons\//, '/commons/thumb/').replace(/(\.\w+)$/, '$1/800px-' + fileName),
                      thumb: imageInfo.url.replace(/\/commons\//, '/commons/thumb/').replace(/(\.\w+)$/, '$1/300px-' + fileName),
                      full: imageInfo.url,
                      alt: metadata.ImageDescription?.value?.replace(/<[^>]*>/g, '') || fileName.replace(/\.\w+$/, ''),
                      photographer: metadata.Artist?.value?.replace(/<[^>]*>/g, '') || 'Wikimedia Commons',
                      photographerUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`,
                      source: 'wikimedia',
                      sourceUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`,
                      width: imageInfo.width,
                      height: imageInfo.height
                    }
                  }
                }
              }
            } catch (e) {
              // Skip on error
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

const PORT = 3002
app.listen(PORT, () => {
  console.log(`CMS2 API running on http://localhost:${PORT}`)
})
