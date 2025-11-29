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
