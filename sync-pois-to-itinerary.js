#!/usr/bin/env node

// Sync POI data from poi files into itinerary.json

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ITINERARY_PATH = path.join(__dirname, 'content-manager/data/itinerary.json');
const POI_DIR = path.join(__dirname, 'content-manager/data/poi');

function main() {
  console.log('🔄 Syncing POI data to itinerary.json...\n');

  // Load itinerary
  const itinerary = JSON.parse(fs.readFileSync(ITINERARY_PATH, 'utf8'));

  // Get all POI files
  const poiFiles = fs.readdirSync(POI_DIR)
    .filter(f => f.match(/^day-(\d+)-poi\.json$/));

  let updated = 0;

  for (const file of poiFiles) {
    const dayNum = parseInt(file.match(/^day-(\d+)-poi\.json$/)[1]);
    const poiData = JSON.parse(fs.readFileSync(path.join(POI_DIR, file), 'utf8'));

    // Find the day in itinerary
    const dayIndex = itinerary.days.findIndex(d => d.day === dayNum);
    if (dayIndex === -1) {
      console.log(`  ⚠ Day ${dayNum} not found in itinerary`);
      continue;
    }

    // Convert POI format for itinerary
    const pointsOfInterest = poiData.pois.map(poi => ({
      name: poi.name,
      summary: poi.summary,
      history: poi.historicalContext,
      tips: poi.practicalTips,
      links: poi.links || [],
      status: poi.status || 'pending',
      confidence: poi.confidence,
      images: poi.images || []
    }));

    // Update the day
    itinerary.days[dayIndex].pointsOfInterest = pointsOfInterest;
    itinerary.days[dayIndex].lastModified = new Date().toISOString();

    console.log(`  ✓ Day ${dayNum}: ${pointsOfInterest.length} POIs`);
    updated++;
  }

  // Update metadata
  itinerary.metadata.lastModified = new Date().toISOString();

  // Save
  fs.writeFileSync(ITINERARY_PATH, JSON.stringify(itinerary, null, 2));

  console.log(`\n✅ Updated ${updated} days in itinerary.json`);
  console.log('   Open the Content Manager to review the POIs');
}

main();
