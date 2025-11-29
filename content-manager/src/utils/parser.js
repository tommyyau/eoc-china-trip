// Parser for raw itinerary text
// Extracts days from semi-structured text like Word documents

export function parseItineraryText(rawText) {
  const days = []

  // Split by day patterns (e.g., "17th May", "19th May:", "Day 1:", etc.)
  const dayPattern = /(?:^|\n)(\d{1,2}(?:st|nd|rd|th)?\s+(?:May|June|July|August|September|October|November|December|January|February|March|April)|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|Day\s+\d+)/gi

  // Find all day markers and their positions
  const markers = []
  let match
  while ((match = dayPattern.exec(rawText)) !== null) {
    markers.push({
      date: match[1].trim(),
      index: match.index
    })
  }

  // Extract content between markers
  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].index
    const end = i < markers.length - 1 ? markers[i + 1].index : rawText.length
    const content = rawText.slice(start, end).trim()

    const parsed = parseDayContent(content, i + 1, markers[i].date)
    if (parsed) {
      days.push(parsed)
    }
  }

  return days
}

function parseDayContent(content, dayNumber, dateStr) {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l)

  // Extract date
  const date = extractDate(dateStr)

  // Extract location from first line or content
  const location = extractLocation(content)

  // Extract title (usually first meaningful line)
  const title = extractTitle(lines, location)

  // Extract highlights (bullet points or activity mentions)
  const highlights = extractHighlights(content)

  // Extract meals
  const meals = extractMeals(content)

  // Extract accommodation
  const accommodation = extractAccommodation(content)

  // Full description is the cleaned content
  const description = cleanDescription(content)

  return {
    day: dayNumber,
    date,
    rawText: content,
    title,
    location,
    description,
    highlights,
    meals,
    accommodation
  }
}

function extractDate(dateStr) {
  // Normalize date string
  return dateStr.replace(/(\d+)(st|nd|rd|th)/i, '$1')
}

function extractLocation(content) {
  // Look for common location patterns
  const locationPatterns = [
    /(?:in|to|at)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/,
    /(?:Xi'an|Beijing|Lushan|Jiujiang|Jingdezhen|Wuyuan|Tai'an|Qufu|Qingdao)/i
  ]

  for (const pattern of locationPatterns) {
    const match = content.match(pattern)
    if (match) {
      return match[1] || match[0]
    }
  }

  return ''
}

function extractTitle(lines, location) {
  // First line often contains the title
  if (lines.length > 0) {
    // Remove date prefix if present
    let title = lines[0].replace(/^\d{1,2}(?:st|nd|rd|th)?\s+\w+\s*:?\s*/i, '')
    // Limit length
    if (title.length > 60) {
      title = title.slice(0, 57) + '...'
    }
    return title || `Day in ${location}`
  }
  return `Day in ${location}`
}

function extractHighlights(content) {
  const highlights = []

  // Look for bullet points
  const bulletPattern = /[·•\-\*]\s*([^·•\-\*\n]+)/g
  let match
  while ((match = bulletPattern.exec(content)) !== null) {
    const highlight = match[1].trim()
    if (highlight.length > 5 && highlight.length < 100) {
      highlights.push(highlight)
    }
  }

  // If no bullets, look for key activities
  if (highlights.length === 0) {
    const activityPatterns = [
      /(?:visit|tour|hike|walk|explore|transfer to|arrive at)\s+(?:the\s+)?([^,.]+)/gi
    ]

    for (const pattern of activityPatterns) {
      while ((match = pattern.exec(content)) !== null) {
        const activity = match[1].trim()
        if (activity.length > 3 && activity.length < 80 && !highlights.includes(activity)) {
          highlights.push(activity)
        }
      }
    }
  }

  return highlights.slice(0, 6) // Limit to 6 highlights
}

function extractMeals(content) {
  const mealPatterns = [
    /\(([^)]*(?:breakfast|lunch|dinner)[^)]*)\)/i,
    /meals?[:\s]+([^.]+(?:breakfast|lunch|dinner)[^.]*)/i,
    /(breakfast|lunch|dinner)(?:\s*,\s*(breakfast|lunch|dinner))+/gi
  ]

  for (const pattern of mealPatterns) {
    const match = content.match(pattern)
    if (match) {
      return match[1] || match[0]
    }
  }

  return ''
}

function extractAccommodation(content) {
  const patterns = [
    /check\s*in\s*(?:at|to)?\s*([^,.]+(?:hotel|inn|lodge|house|resort|homestay)[^,.]*)/i,
    /stay\s*(?:at|in)?\s*([^,.]+(?:hotel|inn|lodge|house|resort|homestay)[^,.]*)/i,
    /overnight\s*(?:at|in)?\s*([^,.]+)/i,
    /([^,.]+(?:hotel|inn|lodge|house|resort|homestay)[^,.]*)/i
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return ''
}

function cleanDescription(content) {
  // Remove extra whitespace and clean up
  return content
    .replace(/\s+/g, ' ')
    .replace(/[·•\-\*]\s*/g, '\n• ')
    .trim()
}
