import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Path to website data files
const DATA_FILE = path.join(__dirname, '..', 'china-hiking-tour', 'src', 'data', 'itinerary-v2.json')
const INFO_FILE = path.join(__dirname, '..', 'china-hiking-tour', 'src', 'data', 'info-page.json')
const HOME_FILE = path.join(__dirname, '..', 'china-hiking-tour', 'src', 'data', 'home-page.json')
const ITINERARY_PAGE_FILE = path.join(__dirname, '..', 'china-hiking-tour', 'src', 'data', 'itinerary-page.json')
const IMAGES_DIR = path.join(__dirname, '..', 'china-hiking-tour', 'public', 'images')

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true })
}

// API keys for image search (from .env file)
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY
const PEXELS_API_KEY = process.env.PEXELS_API_KEY
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Serve uploaded images
app.use('/images', express.static(IMAGES_DIR))

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
// ITINERARY PAGE LOAD/SAVE
// ============================================

// GET /api/itinerary-page - Load itinerary page data
app.get('/api/itinerary-page', (req, res) => {
  try {
    if (!fs.existsSync(ITINERARY_PAGE_FILE)) {
      return res.json({ data: null })
    }
    const data = JSON.parse(fs.readFileSync(ITINERARY_PAGE_FILE, 'utf8'))
    res.json({ data })
  } catch (error) {
    console.error('Error loading itinerary page:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/itinerary-page - Save itinerary page data
app.post('/api/itinerary-page', (req, res) => {
  try {
    const { data } = req.body
    if (!data) {
      return res.status(400).json({ error: 'Data is required' })
    }

    fs.writeFileSync(ITINERARY_PAGE_FILE, JSON.stringify(data, null, 2))
    console.log('Saved itinerary page to', ITINERARY_PAGE_FILE)
    res.json({ success: true })
  } catch (error) {
    console.error('Error saving itinerary page:', error)
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

// ============================================
// IMAGE UPLOAD (Local Storage)
// ============================================

// POST /api/images/upload - Upload image from local filesystem
app.post('/api/images/upload', (req, res) => {
  const dayNumber = req.query.dayNumber || 0

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, IMAGES_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase()
      const existingFiles = fs.readdirSync(IMAGES_DIR)
      const dayPattern = new RegExp(`^day-${dayNumber}-image-(\\d+)`)
      let maxNum = 0
      existingFiles.forEach(f => {
        const match = f.match(dayPattern)
        if (match) maxNum = Math.max(maxNum, parseInt(match[1]))
      })
      cb(null, `day-${dayNumber}-image-${maxNum + 1}${ext}`)
    }
  })

  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      cb(null, allowed.includes(file.mimetype))
    },
    limits: { fileSize: 10 * 1024 * 1024 }
  }).single('image')

  upload(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (!req.file) return res.status(400).json({ error: 'No image provided' })

    const filename = req.file.filename
    res.json({
      success: true,
      image: {
        id: `local-${Date.now()}`,
        src: `/images/${filename}`,
        thumb: `/images/${filename}`,
        full: `/images/${filename}`,
        alt: filename.replace(/\.[^.]+$/, '').replace(/-/g, ' '),
        photographer: 'Local Upload',
        source: 'local',
        filename
      }
    })
  })
})

// DELETE /api/images/:filename - Delete uploaded image
app.delete('/api/images/:filename', (req, res) => {
  const { filename } = req.params
  if (!filename.match(/^day-\d+-image-\d+\.(jpg|jpeg|png|gif|webp)$/i)) {
    return res.status(400).json({ error: 'Invalid filename' })
  }
  const filePath = path.join(IMAGES_DIR, filename)
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Not found' })
  }
  fs.unlinkSync(filePath)
  res.json({ success: true })
})

// GET /api/images/list - List uploaded images
app.get('/api/images/list', (req, res) => {
  const files = fs.existsSync(IMAGES_DIR) ? fs.readdirSync(IMAGES_DIR) : []
  const images = files
    .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
    .map(filename => ({
      id: `local-${filename}`,
      src: `/images/${filename}`,
      thumb: `/images/${filename}`,
      full: `/images/${filename}`,
      alt: filename.replace(/\.[^.]+$/, '').replace(/-/g, ' '),
      photographer: 'Local Upload',
      source: 'local',
      filename
    }))
  res.json({ images })
})

const PORT = 3002
app.listen(PORT, () => {
  console.log(`CMS2 API running on http://localhost:${PORT}`)
})
