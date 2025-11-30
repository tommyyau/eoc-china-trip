// Export script: Converts CMS1 data to CMS2 format (itinerary-v2.json)
// Run once: node export-data.js

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Paths
const CMS1_ITINERARY = path.join(__dirname, '..', 'content-manager', 'data', 'itinerary.json')
const SELECTIONS_DIR = path.join(__dirname, '..', 'content-manager', 'data', 'selections')
const OUTPUT_FILE = path.join(__dirname, '..', 'china-hiking-tour', 'src', 'data', 'itinerary-v2.json')

// Load CMS1 itinerary
const itinerary = JSON.parse(fs.readFileSync(CMS1_ITINERARY, 'utf8'))

// Load all selection files
function loadSelections() {
  const selections = {}
  for (let day = 1; day <= 14; day++) {
    const filePath = path.join(SELECTIONS_DIR, `day-${day}-selections.json`)
    if (fs.existsSync(filePath)) {
      selections[day] = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    }
  }
  return selections
}

const selectionsByDay = loadSelections()

// Get region from day number
function getRegion(dayNum) {
  if (dayNum <= 4) return 'xian'
  if (dayNum <= 6) return 'beijing'
  if (dayNum <= 11) return 'lushan'
  if (dayNum <= 14) return 'taishan'
  return 'qingdao'
}

// Get images for a segment
function getSegmentImages(dayNum, segmentId, selections) {
  if (!selections || !selections.segments) return []

  const idParts = segmentId.split('-')
  const segmentPrefix = idParts.slice(0, 2).join('-')

  const allImages = []
  const seenUrls = new Set()

  for (const [selectionId, segmentData] of Object.entries(selections.segments)) {
    const selectionPrefix = selectionId.split('-').slice(0, 2).join('-')

    if (selectionId === segmentId || selectionPrefix === segmentPrefix) {
      if (segmentData.images && Array.isArray(segmentData.images)) {
        for (const img of segmentData.images) {
          if (!seenUrls.has(img.url)) {
            seenUrls.add(img.url)
            allImages.push({
              id: img.id || `img-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              src: img.url,
              thumb: img.thumb,
              full: img.full,
              alt: img.alt || '',
              photographer: img.photographer,
              photographerUrl: img.photographerUrl,
              source: img.source,
              sourceUrl: img.sourceUrl,
            })
          }
        }
      }
    }
  }

  return allImages
}

// Transform a day
function transformDay(cmsDay) {
  const dayNum = cmsDay.day + 1 // CMS is 0-indexed
  const selections = selectionsByDay[cmsDay.day]

  // Transform segments
  const segments = (cmsDay.segments || []).map(seg => {
    const images = getSegmentImages(dayNum, seg.id, selections)

    return {
      id: seg.id,
      time: seg.time || 'Morning',
      type: seg.type || 'activity',
      title: seg.title || '',
      description: seg.description || '',
      duration: seg.duration || '',
      location: seg.location || '',
      // Transfer fields
      mode: seg.mode || '',
      from: seg.from || '',
      to: seg.to || '',
      // Walk details
      walkDetails: seg.walkDetails || null,
      // Highlights
      highlights: seg.highlights || [],
      // Images
      images,
    }
  })

  return {
    day: dayNum,
    date: cmsDay.date || '',
    title: cmsDay.title || '',
    location: cmsDay.location || '',
    region: getRegion(dayNum),
    description: cmsDay.enhanced?.description || '',
    segments,
    meals: cmsDay.meals || '',
    accommodation: {
      name: cmsDay.accommodation?.name || '',
      rating: cmsDay.accommodation?.rating || '',
    },
  }
}

// Transform all data
function exportData() {
  console.log('Exporting CMS1 data to CMS2 format...')

  const days = itinerary.days.map(transformDay)

  const output = {
    metadata: {
      version: 2,
      exportedFrom: 'CMS1',
      exportedAt: new Date().toISOString(),
    },
    days,
  }

  // Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2))
  console.log(`Exported ${days.length} days to ${OUTPUT_FILE}`)

  // Summary
  let totalSegments = 0
  let totalImages = 0
  for (const day of days) {
    totalSegments += day.segments.length
    for (const seg of day.segments) {
      totalImages += seg.images.length
    }
  }
  console.log(`Total segments: ${totalSegments}`)
  console.log(`Total images: ${totalImages}`)
}

exportData()
