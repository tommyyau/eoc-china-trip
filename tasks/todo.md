# Task: Sync Website Itinerary Data to Content Manager

## Problem
- The website has titles and descriptions for each day in `itineraryData.js`
- The content manager's `itinerary.json` needs to be updated with this data

## Plan
- [x] Create a sync script to read from website's itineraryData.js
- [x] Update content manager's itinerary.json with titles and descriptions
- [x] Run the sync and verify the data

## Changes Made
Created: `sync-website-to-cms.js` - A sync script that:
- Reads titles and descriptions from `china-hiking-tour/src/data/itineraryData.js`
- Updates `content-manager/data/itinerary.json` with the English versions

## Review
**Summary:**
- Synced 15 days (Day 1-15) from the website to the content manager
- Day 0 (Departure from Heathrow) was not updated as it doesn't exist in the website data
- Titles and descriptions are now synchronized

**Example updates:**
- Day 2: "Exploring Xi'an" → "Xi'an City Walk & Ancient Wall"
- Day 5: "Cultural Exploration and Warm-up Hike in Beijing" → "Forbidden City & Fragrant Hills Warm-up"
- Day 9: "Natural Wonders and the Porcelain Capital" → "Mount Shizhong & Jingdezhen"

---

# Task: CMS2 Implementation

## Goal
Build a simple, focused CMS that directly edits website-ready data - no transformation layer needed.

## Completed Tasks
- [x] Phase 1: Setup - Create cms2/ with Vite + React + Express server
- [x] Phase 2: Data Layer - Create storage.js with load/save functions
- [x] Phase 3: Core Components - Build DayList, DayEditor, SegmentCard, ImageManager, ImageSearch
- [x] Phase 4: Export Website Data - Create itinerary-v2.json from current website data
- [x] Phase 5: Website Integration - Update cmsData.js to read new format

## Files Created
- `cms2/` - New CMS2 app folder
  - `package.json`, `vite.config.js`, `index.html`
  - `server.js` - Express server with image search and save endpoints
  - `src/App.jsx`, `App.css` - Main layout with sidebar
  - `src/components/DayList.jsx` - Day navigation
  - `src/components/DayEditor.jsx` - Edit day properties and segments
  - `src/components/SegmentCard.jsx` - Edit individual segments
  - `src/components/ImageManager.jsx` - Manage images per segment
  - `src/components/ImageSearch.jsx` - Search Pexels/Unsplash
  - `src/utils/storage.js` - API functions
  - `export-data.js` - One-time export script
- `china-hiking-tour/src/data/itinerary-v2.json` - New data file (16 days, 50 segments, 49 images)

## Files Modified
- `china-hiking-tour/src/data/cmsData.js` - Reads from itinerary-v2.json

## How to Use

```bash
cd cms2
npm run dev
# Opens at http://localhost:5177
```

- Click a day to edit
- Expand segments to edit details
- Use "Search Images" to find/add images
- Drag to reorder images
- Click "Save" to persist changes

---

# Task: Create Beautiful PDF Itinerary Download

## Requirements
- **Portrait orientation**
- **Branding:** "China 2026 Hiking Trip"
- **English only** (Chinese translation later)
- **Compressed images** for smaller file size
- **Show all sections expanded** with first image per segment
- **Region day blocks** showing which days are in each region
- **Include visa & cost information** at the bottom

## Plan

- [x] Research PDF library options (jsPDF with autoTable or html2canvas, or react-pdf)
- [x] Update PDFDownload.jsx to generate a beautiful formatted PDF:
  - [x] Cover page with branding and hero image
  - [x] Table of Contents with region overview
  - [x] For each region: header with day range, then day cards
  - [x] Each day: first image, title, date, location, description, highlights, meals, accommodation
  - [x] Final section: Visa info and Cost breakdown
  - [x] Page numbers in footer
- [x] Handle image loading and compression
- [x] Test PDF generation and file size

## Data Sources
- Itinerary: `china-hiking-tour/src/data/cmsData.js` (reads from `itinerary-v2.json`)
- Regions: `china-hiking-tour/src/data/destinationRegions.js`
- Info: `china-hiking-tour/src/data/info-page.json`

## Changes Made
Rewrote `china-hiking-tour/src/components/PDFDownload.jsx` with:

**Cover Page:**
- Hero image (Great Wall) with dark overlay
- "China 2026 Hiking Trip" title
- "15 Days of Adventure" subtitle
- Date range (May 8 - May 22, 2026)
- Region overview table (Xi'an Days 1-4, Beijing Days 5-6, etc.)
- Ealing Outdoor Club footer

**Itinerary Pages:**
- Region headers with colored banners showing day range
- Day cards with:
  - Day badge (red)
  - Date and location
  - Title
  - First image from segment (compressed to 70% JPEG quality, max 500px width)
  - Description text
  - Highlights (up to 4)
  - Meals and accommodation footer

**Information Page:**
- Blue header banner
- Visa section with bullet points
- Cost section with price badge and includes/excludes lists

**Features:**
- Progress indicator during generation ("Loading images 5/16...")
- Page numbers on all pages
- Branding footer on content pages
- Image compression for smaller file size
- Automatic page breaks when content overflows

## Review
The PDF generates successfully with all 16 days, images, and info section. File size is reasonable due to JPEG compression.
