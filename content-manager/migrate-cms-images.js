/**
 * Migration Script: Download CMS selection images and save locally
 *
 * This script:
 * 1. Reads all selection files in content-manager/data/selections/
 * 2. Downloads each external image
 * 3. Saves to china-hiking-tour/public/images/
 * 4. Updates the selection files with local paths
 *
 * Run: node migrate-cms-images.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import https from 'https'
import http from 'http'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SELECTIONS_DIR = path.join(__dirname, 'data', 'selections')
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
        console.log(`  Redirecting...`)
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

// Get file extension from URL
function getExtension(url) {
  const urlPath = url.split('?')[0]
  const ext = path.extname(urlPath).toLowerCase()
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
    return ext
  }
  return '.jpg'
}

// Get next available image number for a day
function getNextImageNumber(dayNumber) {
  const existingFiles = fs.readdirSync(IMAGES_DIR)
  const dayPattern = new RegExp(`^day-${dayNumber}-image-(\\d+)`)
  let maxNum = 0
  existingFiles.forEach(f => {
    const match = f.match(dayPattern)
    if (match) {
      maxNum = Math.max(maxNum, parseInt(match[1]))
    }
  })
  return maxNum + 1
}

async function migrate() {
  console.log('=== CMS Image Migration Script ===\n')

  // Get all selection files
  const selectionFiles = fs.readdirSync(SELECTIONS_DIR)
    .filter(f => f.endsWith('-selections.json'))
    .sort((a, b) => {
      const dayA = parseInt(a.match(/day-(\d+)/)?.[1] || 0)
      const dayB = parseInt(b.match(/day-(\d+)/)?.[1] || 0)
      return dayA - dayB
    })

  console.log(`Found ${selectionFiles.length} selection files\n`)

  let totalImages = 0
  let successCount = 0
  let failCount = 0
  let skippedCount = 0

  for (const file of selectionFiles) {
    const filePath = path.join(SELECTIONS_DIR, file)
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const dayNumber = data.day

    console.log(`\n=== Day ${dayNumber} ===`)

    let fileModified = false

    // Process each segment
    if (data.segments) {
      for (const [segmentId, segment] of Object.entries(data.segments)) {
        if (segment.images && segment.images.length > 0) {
          console.log(`  Segment: ${segment.name || segmentId}`)

          for (let i = 0; i < segment.images.length; i++) {
            const img = segment.images[i]

            // Skip if already local
            if (img.url && img.url.startsWith('/images/')) {
              console.log(`    Image ${i + 1}: Already local, skipping`)
              skippedCount++
              continue
            }

            // Skip if no external URL
            if (!img.url || !img.url.startsWith('http')) {
              console.log(`    Image ${i + 1}: No valid URL, skipping`)
              skippedCount++
              continue
            }

            totalImages++

            const ext = getExtension(img.url)
            const imageNum = getNextImageNumber(dayNumber)
            const filename = `day-${dayNumber}-image-${imageNum}${ext}`
            const localPath = path.join(IMAGES_DIR, filename)

            console.log(`    Image ${i + 1}: ${filename}`)
            console.log(`      URL: ${img.url.substring(0, 50)}...`)

            try {
              await downloadImage(img.url, localPath)
              console.log(`      SUCCESS`)

              // Update the image object with local path
              segment.images[i] = {
                ...img,
                id: `local-${Date.now()}-${imageNum}`,
                url: `/images/${filename}`,
                thumb: `/images/${filename}`,
                full: `/images/${filename}`,
                filename,
                source: 'local',
                photographer: img.photographer || 'Local Upload'
              }

              successCount++
              fileModified = true
            } catch (error) {
              console.log(`      FAILED: ${error.message}`)
              failCount++
            }

            // Small delay
            await new Promise(r => setTimeout(r, 300))
          }
        }
      }
    }

    // Save updated file
    if (fileModified) {
      data.lastModified = new Date().toISOString()
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
      console.log(`  Updated ${file}`)
    }
  }

  console.log(`\n=== Migration Summary ===`)
  console.log(`Total external images: ${totalImages}`)
  console.log(`Successfully downloaded: ${successCount}`)
  console.log(`Failed: ${failCount}`)
  console.log(`Already local (skipped): ${skippedCount}`)
  console.log(`\nImages saved to: ${IMAGES_DIR}`)
}

migrate().catch(console.error)
