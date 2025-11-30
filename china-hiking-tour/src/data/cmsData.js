// CMS Data Loader - Reads from CMS2 format (itinerary-v2.json)
import data from './itinerary-v2.json';

// Get coordinates for a location (used for map display)
function getCoordinates(location) {
  const coords = {
    'heathrow': [-0.4543, 51.4700],
    "xi'an": [108.9398, 34.3416],
    'xian': [108.9398, 34.3416],
    'beijing': [116.4074, 39.9042],
    'lushan': [115.9927, 29.5627],
    'jiujiang': [115.9930, 29.7051],
    'jingdezhen': [117.1784, 29.2686],
    'wuyuan': [117.8613, 29.2486],
    'wangxian': [117.9, 29.4],
    'shangrao': [117.9432, 28.4549],
    "tai'an": [117.1290, 36.1949],
    'mount tai': [117.1070, 36.2561],
    'qufu': [116.9914, 35.5963],
    'qingdao': [120.3826, 36.0671],
  };

  const loc = (location || '').toLowerCase();
  for (const [key, value] of Object.entries(coords)) {
    if (loc.includes(key)) return value;
  }
  return [108.9398, 34.3416]; // Default to Xi'an
}

// Calculate region from day number (authoritative source)
function getRegion(dayNum) {
  if (dayNum <= 4) return 'xian';
  if (dayNum <= 6) return 'beijing';
  if (dayNum <= 10) return 'lushan';
  if (dayNum === 11) return 'shangrao';
  if (dayNum <= 14) return 'taishan';
  return 'qingdao';
}

// Get mode icon name for lucide-react
function getModeIcon(mode) {
  switch (mode?.toLowerCase()) {
    case 'flight': return 'Plane';
    case 'train': return 'Train';
    case 'coach': return 'Bus';
    case 'high-speed rail': return 'Train';
    case 'cable car': return 'CableCar';
    default: return 'Car';
  }
}

// Transform CMS2 day to website format
function transformDay(day, previousAccommodation) {
  // Add modeIcon to each segment
  const segments = (day.segments || []).map(seg => ({
    ...seg,
    modeIcon: getModeIcon(seg.mode),
  }));

  // Get all images for the day (flattened for carousel)
  const allImages = segments.flatMap(seg => seg.images || []);

  // Find first transfer segment for featured transit display
  const mainTransfer = segments.find(s => s.type === 'transfer' && s.mode);

  // Mark if this is a new accommodation
  const isNewStay = previousAccommodation !== day.accommodation?.name && day.accommodation?.name !== '';

  return {
    day: day.day,
    date: day.date,
    title: day.title,
    location: day.location,
    region: getRegion(day.day),
    coordinates: getCoordinates(day.location),

    // Core content
    description: day.description || '',
    highlights: day.segments?.flatMap(s => s.highlights || []) || [],

    // Segments for timeline
    segments,

    // Featured transit (if any significant travel)
    featuredTransit: mainTransfer ? {
      mode: mainTransfer.mode,
      modeIcon: mainTransfer.modeIcon,
      from: mainTransfer.from,
      to: mainTransfer.to,
      duration: mainTransfer.duration,
      title: mainTransfer.title,
    } : null,

    // Accommodation
    accommodation: {
      ...day.accommodation,
      isNewStay,
    },

    // Meals
    meals: day.meals || '',

    // POI research content (empty for now)
    pointsOfInterest: [],

    // All images for legacy carousel support
    images: allImages.length > 0 ? allImages : [{
      src: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?q=80&w=2070&auto=format&fit=crop',
      alt: 'China landscape',
      caption: day.title,
    }],
  };
}

// Transform all data
function transformData() {
  const days = [];
  let previousAccommodation = '';

  for (const day of data.days) {
    const transformedDay = transformDay(day, previousAccommodation);
    days.push(transformedDay);

    // Track accommodation for next day comparison
    if (day.accommodation?.name) {
      previousAccommodation = day.accommodation.name;
    }
  }

  return days;
}

// Export transformed data
export const itineraryData = transformData();

// Export raw data for debugging
export const rawCMSData = data;
