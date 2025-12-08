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

---

# Task: Add Home Page to CMS2

## Goal
Extend CMS2 to manage the Home page content (images, text, stats, destinations).

## Plan

- [x] Create `home-page.json` with editable content extracted from Home.jsx
- [x] Add API endpoints to server.js for home page (GET/POST /api/home)
- [x] Add storage functions for home page in storage.js
- [x] Create `HomeEditor.jsx` component in CMS2
- [x] Add Home tab to CMS2 App.jsx
- [x] Update Home.jsx to load content from CMS data file

## Files Created
- `china-hiking-tour/src/data/home-page.json` - Home page content (hero, intro, stats, map, destinations, CTA)
- `cms2/src/components/HomeEditor.jsx` - Editor with collapsible sections for all home page content

## Files Modified
- `cms2/server.js` - Added GET/POST `/api/home` endpoints
- `cms2/src/utils/storage.js` - Added `loadHome()` and `saveHome()` functions
- `cms2/src/App.jsx` - Added Home tab and state management for home data
- `china-hiking-tour/src/pages/Home.jsx` - Now loads all content from `home-page.json`

## Review

**Summary:**
Extended the CMS2 system to support editing the Home page. All three website pages (Home, Itinerary, Info) are now editable through CMS2.

**Home Page Editor Features:**
- Collapsible sections for: Hero, Introduction, Stats, Map, Destinations, CTA
- Image search integration for hero and CTA background images
- Editable destination cards with image, color picker, and day range
- All content is bilingual (English/Chinese)

**How to Use:**
```bash
cd cms2
npm run dev
# Opens at http://localhost:5177
# Click "Home Page" tab to edit home content
```

---

# Task: Fix Chinese PDF Generation Error

## Problem
When generating the PDF in Chinese mode, users encountered:
- Error: "Cannot read properties of undefined (reading 'title')"
- Reports that Chinese characters were unreadable/mixed up

## Root Cause Analysis
1. **Undefined title bug:** Day 0 (departure from Heathrow) was being included in the Xi'an region filter since `getRegion(0)` returns 'xian'. Also, segments may have undefined elements that weren't being filtered out.

2. **Font issues:** The code was using a variable font (`NotoSansSC[wght].ttf`) which may not be fully compatible with jsPDF's font handling. Variable fonts use a different format than static fonts.

## Fixes Applied

### 1. Filter out Day 0 and undefined days
```javascript
// Before
const getDaysByRegion = (regionId) => {
    return itineraryData.filter(day => day.region === regionId);
};

// After - Filter out Day 0 and undefined entries
const getDaysByRegion = (regionId) => {
    return itineraryData.filter(day => day && day.day > 0 && day.region === regionId);
};
```

### 2. Filter out undefined segments
```javascript
// Before
if (day.segments && day.segments.length > 0) {
    for (const segment of day.segments) {

// After - Filter out undefined segments
const validSegments = (day.segments || []).filter(seg => seg && seg.title);
if (validSegments.length > 0) {
    for (const segment of validSegments) {
```

### 3. Defensive check for day title
```javascript
// Before
doc.text(t(day.title) || '', PAGE.marginX, currentY);

// After
const dayTitle = day.title ? t(day.title) : '';
doc.text(dayTitle, PAGE.marginX, currentY);
```

### 4. Switch to static font file
```javascript
// Before - Variable font (~18MB)
const CHINESE_FONT_URL = 'https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/google-fonts/NotoSansSC%5Bwght%5D.ttf';

// After - Static subset OTF (~8MB)
const CHINESE_FONT_URL = 'https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/SC/NotoSansSC-Regular.otf';
```

## Files Modified
- `china-hiking-tour/src/components/PDFDownload.jsx` - All fixes above

## Review
- Build passes successfully
- **Chinese PDF disabled** - jsPDF requires fonts processed through their fontconverter tool
- Raw TTF/OTF fonts produce garbled characters regardless of source
- Current solution: Shows alert message and generates English PDF when Chinese is requested

## Root Cause (Updated)
The jsPDF library requires fonts to be processed through their [fontconverter tool](https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html). This tool:
1. Parses the TTF file to extract glyph information
2. Creates a JavaScript file with base64-encoded font data
3. Includes metadata that jsPDF needs for proper rendering

Simply base64-encoding a raw TTF or OTF file does NOT work - the characters render as garbage because jsPDF is missing the glyph mapping information.

## Solution: html2pdf.js

Switched from jsPDF's text() method to html2pdf.js which:
1. Renders HTML using browser's native font rendering (handles Chinese automatically)
2. Uses html2canvas to capture the rendered HTML as an image
3. Embeds the image into a PDF

This bypasses all jsPDF font issues since the browser handles font rendering.

### Changes Made
- Rewrote `PDFDownload.jsx` to use html2pdf.js instead of jsPDF direct text rendering
- Creates a styled HTML container with all itinerary content
- Uses CSS for styling (cover page, region headers, day cards, segments, info page)
- Font family set to Chinese fonts for CN mode: "Noto Sans SC", "PingFang SC", "Microsoft YaHei"
- Font family set to Helvetica for EN mode

### How It Works
1. Creates hidden HTML container with styled content
2. html2pdf.js renders it using html2canvas (scale: 2 for quality)
3. Converts canvas to JPEG (quality: 0.92)
4. Embeds into PDF with automatic page breaks
5. Removes container and triggers download
