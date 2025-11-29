#!/usr/bin/env node

// Script to research POIs for all days automatically
// This calls the content manager API to trigger POI research

const BASE_URL = 'http://localhost:3001';

async function researchDay(day) {
  console.log(`\n📍 Day ${day}: Researching POIs...`);

  try {
    const response = await fetch(`${BASE_URL}/api/poi/research/${day}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.pois && data.pois.length > 0) {
      console.log(`   ✓ Found ${data.pois.length} POIs:`);
      data.pois.forEach(poi => {
        console.log(`     - ${poi.name}`);
      });
      return data.pois.length;
    } else {
      console.log(`   ⚠ No POIs found (transfers/meals only)`);
      return 0;
    }
  } catch (error) {
    console.log(`   ✗ Error: ${error.message}`);
    return 0;
  }
}

async function main() {
  console.log('🔍 POI Research for All Days');
  console.log('============================');

  // Check if server is running
  try {
    const health = await fetch(`${BASE_URL}/api/itinerary`);
    if (!health.ok) throw new Error('Server not responding');
  } catch (error) {
    console.error('❌ Content manager server not running on port 3001');
    console.error('   Start it with: cd content-manager && npm run dev');
    process.exit(1);
  }

  let totalPOIs = 0;

  // Research days 0-15
  for (let day = 0; day <= 15; day++) {
    const count = await researchDay(day);
    totalPOIs += count;

    // Small delay between requests to avoid overwhelming OpenAI
    if (day < 15) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log('\n============================');
  console.log(`✅ Complete! Total POIs researched: ${totalPOIs}`);
  console.log('   POI data saved to content-manager/data/poi/');
  console.log('   Review in the Content Manager UI');
}

main();
