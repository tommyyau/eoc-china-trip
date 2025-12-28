# CMS2 - Content Management System

A simple CMS for editing the China Hiking Tour website content.

## Setup

```bash
cd cms2
npm install
```

Create a `.env` file with your Pexels API key:
```
PEXELS_API_KEY=your_key_here
```

## Running

```bash
npm run dev
```

Opens at http://localhost:5177

## Features

### Tabs

| Tab | Data File | Description |
|-----|-----------|-------------|
| **Itinerary** | `itinerary-v2.json` | Edit days, segments, images |
| **Info Page** | `info-page.json` | Edit visa, pricing, logistics |
| **Home Page** | `home-page.json` | Edit hero, stats, destinations |
| **Itinerary Page** | `itinerary-page.json` | Edit page-level content |

### Editing

- Click a day in the sidebar to edit
- Expand segments to edit title, description, highlights, duration
- Use "Search Images" to find images via Pexels API
- Drag to reorder images
- Click "Save" to persist changes to JSON files

### Data Storage

- All data is stored in `china-hiking-tour/src/data/*.json`
- Auto-saves to localStorage for crash recovery
- Click "Reload" to discard local changes and reload from server

## Architecture

- **Frontend**: React + Vite
- **Backend**: Express server (serves API + proxies Pexels)
- **Data**: JSON files in the website's `src/data/` folder
