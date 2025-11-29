#!/usr/bin/env node
/**
 * Sync titles and descriptions from website's itineraryData.js
 * to the content manager's itinerary.json
 */

const fs = require('fs');
const path = require('path');

// Read the website's itinerary data (it's an ES module, so we need to parse it)
const itineraryJsPath = path.join(__dirname, 'china-hiking-tour/src/data/itineraryData.js');
const itineraryJsonPath = path.join(__dirname, 'content-manager/data/itinerary.json');

// Read the JS file as text and extract the data
const jsContent = fs.readFileSync(itineraryJsPath, 'utf8');

// Extract the array content between the first [ and last ]
const arrayMatch = jsContent.match(/\[\s*([\s\S]*)\s*\];?\s*$/);
if (!arrayMatch) {
  console.error('Could not find itinerary array in JS file');
  process.exit(1);
}

// Parse the JS object notation (it's almost JSON, but with unquoted keys)
// We'll use a simple approach: extract day, title, and description for each entry
const dayRegex = /{\s*day:\s*(\d+),[\s\S]*?title:\s*{\s*en:\s*"([^"]*)"[\s\S]*?description:\s*{\s*en:\s*"([^"]*)"[\s\S]*?}/g;

const websiteData = [];
let match;
while ((match = dayRegex.exec(jsContent)) !== null) {
  websiteData.push({
    day: parseInt(match[1]),
    title: match[2],
    description: match[3]
  });
}

console.log(`Found ${websiteData.length} days in website data:`);
websiteData.forEach(d => console.log(`  Day ${d.day}: ${d.title}`));

// Read the content manager's itinerary.json
const cmsData = JSON.parse(fs.readFileSync(itineraryJsonPath, 'utf8'));

// Update titles and descriptions
let updatedCount = 0;
cmsData.days.forEach(cmsDay => {
  const websiteDay = websiteData.find(w => w.day === cmsDay.day);
  if (websiteDay) {
    console.log(`\nUpdating Day ${cmsDay.day}:`);
    console.log(`  Old title: "${cmsDay.title}"`);
    console.log(`  New title: "${websiteDay.title}"`);

    cmsDay.title = websiteDay.title;

    // Update the enhanced description
    if (!cmsDay.enhanced) {
      cmsDay.enhanced = {};
    }
    cmsDay.enhanced.description = websiteDay.description;

    updatedCount++;
  }
});

// Write back to itinerary.json
fs.writeFileSync(itineraryJsonPath, JSON.stringify(cmsData, null, 2));

console.log(`\n✓ Updated ${updatedCount} days in ${itineraryJsonPath}`);
