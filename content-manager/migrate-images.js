/**
 * Migration Script: Download external images and save locally
 *
 * This script:
 * 1. Reads itineraryData.js to find all external image URLs
 * 2. Downloads each image
 * 3. Saves to china-hiking-tour/public/images/ with naming: day-X-image-Y.jpg
 * 4. Updates itineraryData.js with local paths
 *
 * Run: node migrate-images.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import https from 'https'
import http from 'http'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ITINERARY_FILE = path.join(__dirname, '..', 'china-hiking-tour', 'src', 'data', 'itineraryData.js')
const IMAGES_DIR = path.join(__dirname, '..', 'china-hiking-tour', 'public', 'images')

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true })
}

// Download image from URL
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http

    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location
        console.log(`  Redirecting to: ${redirectUrl.substring(0, 50)}...`)
        downloadImage(redirectUrl, filepath).then(resolve).catch(reject)
        return
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`))
        return
      }

      const file = fs.createWriteStream(filepath)
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve(filepath)
      })
      file.on('error', (err) => {
        fs.unlink(filepath, () => {})
        reject(err)
      })
    })

    request.on('error', reject)
    request.setTimeout(30000, () => {
      request.destroy()
      reject(new Error('Timeout'))
    })
  })
}

// Get file extension from URL or content-type
function getExtension(url) {
  // Try to get from URL
  const urlPath = url.split('?')[0]
  const ext = path.extname(urlPath).toLowerCase()
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
    return ext
  }
  // Default to .jpg for Unsplash/Pexels
  return '.jpg'
}

async function migrate() {
  console.log('=== Image Migration Script ===\n')

  // Read the itinerary file
  console.log('Reading itineraryData.js...')
  const fileContent = fs.readFileSync(ITINERARY_FILE, 'utf8')

  // Extract the data array using regex
  const match = fileContent.match(/export const itineraryData = (\[[\s\S]*\]);?/)
  if (!match) {
    console.error('Could not parse itineraryData.js')
    process.exit(1)
  }

  // Parse the JavaScript array (using eval is ok here since it's our own file)
  let itineraryData
  try {
    itineraryData = eval('(' + match[1] + ')')
  } catch (e) {
    console.error('Failed to parse itinerary data:', e.message)
    process.exit(1)
  }

  console.log(`Found ${itineraryData.length} days\n`)

  // Track all images to download
  const downloads = []
  let totalImages = 0

  // Collect all images
  for (const day of itineraryData) {
    if (day.images && day.images.length > 0) {
      day.images.forEach((img, idx) => {
        if (img.src && img.src.startsWith('http')) {
          totalImages++
          downloads.push({
            dayNumber: day.day,
            imageIndex: idx + 1,
            url: img.src,
            alt: img.alt,
            caption: img.caption
          })
        }
      })
    }
  }

  console.log(`Found ${totalImages} external images to download\n`)

  // Download each image
  let successCount = 0
  let failCount = 0
  const results = []

  for (const download of downloads) {
    const ext = getExtension(download.url)
    const filename = `day-${download.dayNumber}-image-${download.imageIndex}${ext}`
    const filepath = path.join(IMAGES_DIR, filename)

    console.log(`Day ${download.dayNumber}, Image ${download.imageIndex}: ${filename}`)
    console.log(`  URL: ${download.url.substring(0, 60)}...`)

    try {
      await downloadImage(download.url, filepath)
      console.log(`  SUCCESS - saved to ${filename}`)
      successCount++
      results.push({
        ...download,
        localPath: `/images/${filename}`,
        filename,
        success: true
      })
    } catch (error) {
      console.log(`  FAILED - ${error.message}`)
      failCount++
      results.push({
        ...download,
        success: false,
        error: error.message
      })
    }

    // Small delay between downloads
    await new Promise(r => setTimeout(r, 500))
  }

  console.log(`\n=== Download Summary ===`)
  console.log(`Success: ${successCount}`)
  console.log(`Failed: ${failCount}`)

  // Update itineraryData.js with local paths
  if (successCount > 0) {
    console.log(`\nUpdating itineraryData.js with local paths...`)

    let updatedContent = fileContent

    for (const result of results) {
      if (result.success) {
        // Replace the old URL with local path
        updatedContent = updatedContent.replace(
          `"${result.url}"`,
          `"${result.localPath}"`
        )
        updatedContent = updatedContent.replace(
          `'${result.url}'`,
          `'${result.localPath}'`
        )
      }
    }

    // Write updated file
    fs.writeFileSync(ITINERARY_FILE, updatedContent)
    console.log('itineraryData.js updated!')
  }

  // Report failed downloads
  if (failCount > 0) {
    console.log(`\n=== Failed Downloads ===`)
    for (const result of results) {
      if (!result.success) {
        console.log(`Day ${result.dayNumber}, Image ${result.imageIndex}: ${result.error}`)
        console.log(`  URL: ${result.url}`)
      }
    }
  }

  console.log(`\n=== Migration Complete ===`)
  console.log(`Images saved to: ${IMAGES_DIR}`)
}

migrate().catch(console.error)
