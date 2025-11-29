#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API Keys
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '4wGTin267DbXTH31pzcFYbx4FkOoYJflzmauitLlw_c';
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'XMucWQDeDKI8Giqzipmy130K1Y2f2dEMWMULTxiBfR4S82Cnv545RA3M';

class DailyResearchAgent {
    constructor() {
        this.itineraryData = null;
    }

    async loadItineraryData() {
        const dataPath = path.join(__dirname, 'china-hiking-tour/src/data/itineraryData.js');
        const fileContent = fs.readFileSync(dataPath, 'utf8');
        const jsonMatch = fileContent.match(/export const itineraryData = (\[[\s\S]*\]);/);
        if (jsonMatch) {
            this.itineraryData = eval('(' + jsonMatch[1] + ')');
            return true;
        }
        throw new Error('Could not parse itinerary data');
    }

    getSearchTerms(highlight, location) {
        const clean = String(highlight).replace(/\([^)]*\)/g, '').trim();
        const searchMap = {
            'terracotta warriors': 'terracotta warriors xian china',
            'big wild goose pagoda': 'big wild goose pagoda xian',
            'city wall': 'xian ancient city wall china',
            'muslim quarter': 'xian muslim quarter street food',
            'bell tower': 'xian bell tower china',
            'drum tower': 'xian drum tower china',
            'dumpling': 'chinese dumplings xian',
            'forbidden city': 'forbidden city beijing china palace',
            'fragrant hills': 'fragrant hills beijing autumn',
            'great wall': 'great wall of china badaling',
            'peking duck': 'peking duck beijing restaurant',
            'lushan': 'lushan mountain china scenic',
            'mount tai': 'mount tai china sunrise',
            'jade emperor': 'jade emperor peak mount tai',
            'confucius': 'confucius temple qufu china',
            'wuyuan': 'wuyuan village china rapeseed',
            'huangling': 'huangling terraces china',
            'daming palace': 'daming palace xian ruins',
            'beilin': 'beilin museum xian steles',
            'cable car': 'mountain cable car china',
            'sleeper train': 'china sleeper train soft sleeper',
            'high-speed': 'china high speed rail train',
            'airport': 'china airport terminal',
            'hotel': `${location} china hotel lobby`,
            'welcome dinner': 'chinese banquet dinner',
            'hiking': `${location} china hiking trail`
        };

        const lowerClean = clean.toLowerCase();
        for (const [key, term] of Object.entries(searchMap)) {
            if (lowerClean.includes(key)) {
                return term;
            }
        }
        return `${clean} ${location} china tourism`;
    }

    async fetchUnsplashImages(query, count = 6) {
        try {
            const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
                    'Accept-Version': 'v1'
                }
            });

            if (!response.ok) {
                console.log(`  ⚠️  Unsplash API error: ${response.status}`);
                return [];
            }

            const data = await response.json();
            return data.results.map(photo => ({
                id: photo.id,
                url: photo.urls.regular,
                thumb: photo.urls.small,
                full: photo.urls.full,
                alt: photo.alt_description || photo.description || query,
                photographer: photo.user.name,
                photographerUrl: photo.user.links.html,
                source: 'unsplash',
                sourceUrl: photo.links.html,
                downloadUrl: photo.urls.full,
                width: photo.width,
                height: photo.height
            }));
        } catch (error) {
            console.log(`  ⚠️  Unsplash fetch error: ${error.message}`);
            return [];
        }
    }

    async fetchPexelsImages(query, count = 6) {
        try {
            const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': PEXELS_API_KEY
                }
            });

            if (!response.ok) {
                console.log(`  ⚠️  Pexels API error: ${response.status}`);
                return [];
            }

            const data = await response.json();
            return data.photos.map(photo => ({
                id: photo.id,
                url: photo.src.large,
                thumb: photo.src.medium,
                full: photo.src.original,
                alt: photo.alt || query,
                photographer: photo.photographer,
                photographerUrl: photo.photographer_url,
                source: 'pexels',
                sourceUrl: photo.url,
                downloadUrl: photo.src.original,
                width: photo.width,
                height: photo.height
            }));
        } catch (error) {
            console.log(`  ⚠️  Pexels fetch error: ${error.message}`);
            return [];
        }
    }

    async researchDay(dayNumber) {
        const day = this.itineraryData.find(d => d.day === dayNumber);
        if (!day) {
            console.error(`❌ Day ${dayNumber} not found`);
            return null;
        }

        const location = day.location.en || day.location;
        const highlights = day.highlights.en || day.highlights;
        const accommodation = day.accommodation.en || day.accommodation;

        console.log(`\n🔍 Researching Day ${day.day}: ${day.title.en}`);
        console.log(`📍 Location: ${location}`);
        console.log(`🎯 Activities: ${highlights.join(', ')}`);
        console.log(`🏨 Accommodation: ${accommodation}`);

        const research = {
            day: day.day,
            date: day.date,
            title: day.title,
            location: day.location,
            description: day.description,
            highlights: day.highlights,
            meals: day.meals,
            accommodation: day.accommodation,
            activities: [],
            hotelSearch: `https://www.tripadvisor.com/Search?q=${encodeURIComponent(accommodation + ' ' + location)}`
        };

        // Fetch images for each activity
        for (const highlight of highlights) {
            const searchTerm = this.getSearchTerms(highlight, location);
            console.log(`\n  📸 Fetching images for: ${highlight}`);
            console.log(`     Search term: "${searchTerm}"`);

            const [unsplashImages, pexelsImages] = await Promise.all([
                this.fetchUnsplashImages(searchTerm, 4),
                this.fetchPexelsImages(searchTerm, 4)
            ]);

            const allImages = [...unsplashImages, ...pexelsImages];
            console.log(`     Found ${allImages.length} images (${unsplashImages.length} Unsplash, ${pexelsImages.length} Pexels)`);

            research.activities.push({
                name: highlight,
                searchTerm: searchTerm,
                images: allImages,
                suggestedAlt: [
                    `${highlight} in ${location}, China`,
                    `${highlight} - travel photography`,
                    `${highlight} tourist attraction`
                ]
            });
        }

        return research;
    }

    generateHTML(research) {
        const totalImages = research.activities.reduce((sum, a) => sum + a.images.length, 0);

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Day ${research.day}: ${research.title.en} - Image Research</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f2f5; color: #333; line-height: 1.6; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; padding-bottom: 100px; }

        .header { background: linear-gradient(135deg, #1a5f7a 0%, #159895 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
        .header h1 { font-size: 2rem; margin-bottom: 10px; }
        .header .meta { opacity: 0.9; font-size: 1.1rem; }
        .header .meta span { margin-right: 20px; }

        .stats { background: white; padding: 20px; border-radius: 12px; margin-bottom: 30px; display: flex; gap: 30px; flex-wrap: wrap; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .stat { text-align: center; }
        .stat-value { font-size: 2rem; font-weight: bold; color: #1a5f7a; }
        .stat-label { color: #666; font-size: 0.9rem; }

        .description { background: white; padding: 20px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .description h3 { margin-bottom: 10px; color: #1a5f7a; }

        /* Search Section */
        .search-section { background: white; padding: 20px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .search-section h3 { color: #1a5f7a; margin-bottom: 15px; }
        .search-controls { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 15px; }
        .search-controls input[type="text"] { flex: 1; min-width: 200px; padding: 10px 15px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem; }
        .search-controls input[type="text"]:focus { border-color: #1a5f7a; outline: none; }
        .search-controls select { padding: 10px 15px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem; background: white; }
        .search-btn { padding: 10px 25px; background: #1a5f7a; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; }
        .search-btn:hover { background: #13475a; }
        .search-btn:disabled { background: #ccc; cursor: not-allowed; }
        .search-results { display: none; }
        .search-results.active { display: block; }
        .search-results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e0e0e0; }
        .search-results-header h4 { color: #666; }
        .clear-search-btn { background: #e0e0e0; color: #666; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
        .clear-search-btn:hover { background: #ccc; }

        /* Saved Images Section */
        .saved-section { background: white; padding: 20px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 2px dashed #27ae60; }
        .saved-section h3 { color: #27ae60; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
        .saved-section .clear-all-btn { background: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
        .saved-section .clear-all-btn:hover { background: #c0392b; }
        .saved-empty { color: #888; font-style: italic; padding: 20px; text-align: center; }

        /* Hotel Section Enhanced */
        .hotel-section { background: white; padding: 20px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #ff5722; }
        .hotel-section h3 { color: #1a5f7a; margin-bottom: 15px; }
        .hotel-search-links { margin-bottom: 20px; }
        .hotel-link { display: inline-block; background: #ff5722; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin-right: 10px; margin-bottom: 10px; }
        .hotel-link:hover { background: #e64a19; }
        .hotel-confirm { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 15px; }
        .hotel-confirm h4 { color: #666; margin-bottom: 10px; font-size: 0.95rem; }
        .hotel-url-input { display: flex; gap: 10px; margin-bottom: 15px; }
        .hotel-url-input input { flex: 1; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 0.9rem; }
        .hotel-url-input input:focus { border-color: #ff5722; outline: none; }
        .hotel-url-input button { padding: 10px 15px; background: #ff5722; color: white; border: none; border-radius: 6px; cursor: pointer; white-space: nowrap; }
        .hotel-url-input button:hover { background: #e64a19; }
        .hotel-saved-url { background: #e8f5e9; padding: 10px 15px; border-radius: 6px; margin-bottom: 15px; display: none; }
        .hotel-saved-url.active { display: flex; justify-content: space-between; align-items: center; }
        .hotel-saved-url a { color: #27ae60; word-break: break-all; }
        .hotel-saved-url .remove-url { background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 1.2rem; padding: 0 5px; }
        .hotel-image-input { display: flex; gap: 10px; }
        .hotel-image-input input { flex: 1; padding: 10px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 0.9rem; }
        .hotel-image-input button { padding: 10px 15px; background: #1a5f7a; color: white; border: none; border-radius: 6px; cursor: pointer; white-space: nowrap; }
        .hotel-images-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin-top: 15px; }
        .hotel-image-card { position: relative; border-radius: 8px; overflow: hidden; }
        .hotel-image-card img { width: 100%; height: 150px; object-fit: cover; }
        .hotel-image-card .remove-img { position: absolute; top: 5px; right: 5px; background: rgba(231,76,60,0.9); color: white; border: none; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 1rem; line-height: 1; }
        .hotel-image-card.selected { outline: 3px solid #27ae60; }

        .activity { background: white; margin-bottom: 30px; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .activity-header { background: #1a5f7a; color: white; padding: 15px 20px; }
        .activity-header h2 { font-size: 1.3rem; }
        .activity-header .search-term { opacity: 0.8; font-size: 0.9rem; margin-top: 5px; }

        .image-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; padding: 20px; }

        .image-card { border: 2px solid #e0e0e0; border-radius: 8px; overflow: hidden; transition: all 0.2s; position: relative; }
        .image-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .image-card.selected { border-color: #27ae60; background: #e8f5e9; }
        .image-card.selected::after { content: '✓ Selected'; position: absolute; top: 10px; right: 10px; background: #27ae60; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; }

        .image-container { position: relative; padding-bottom: 66.67%; background: #f5f5f5; }
        .image-container img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; cursor: pointer; }

        .image-info { padding: 12px; }
        .image-source { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .image-source .badge { background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; }
        .image-source .badge.pexels { background: #fff3e0; color: #e65100; }
        .image-source .badge.saved { background: #e8f5e9; color: #27ae60; }
        .photographer { font-size: 0.85rem; color: #666; }
        .photographer a { color: #1a5f7a; text-decoration: none; }
        .photographer a:hover { text-decoration: underline; }

        .image-alt { font-size: 0.8rem; color: #888; margin-top: 8px; font-style: italic; }

        .select-btn { width: 100%; padding: 10px; border: none; background: #1a5f7a; color: white; cursor: pointer; font-size: 0.9rem; transition: background 0.2s; }
        .select-btn:hover { background: #13475a; }
        .image-card.selected .select-btn { background: #27ae60; }
        .image-card.selected .select-btn:hover { background: #219a52; }
        .save-btn { width: 100%; padding: 10px; border: none; background: #27ae60; color: white; cursor: pointer; font-size: 0.9rem; transition: background 0.2s; }
        .save-btn:hover { background: #219a52; }

        .selection-panel { position: fixed; bottom: 0; left: 0; right: 0; background: white; padding: 15px 20px; box-shadow: 0 -4px 20px rgba(0,0,0,0.15); display: flex; justify-content: space-between; align-items: center; z-index: 100; }
        .selection-count { font-size: 1.1rem; }
        .selection-count strong { color: #27ae60; }
        .export-btn { background: #27ae60; color: white; border: none; padding: 12px 25px; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; }
        .export-btn:hover { background: #219a52; }
        .export-btn:disabled { background: #ccc; cursor: not-allowed; }

        .lightbox { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 200; justify-content: center; align-items: center; }
        .lightbox.active { display: flex; }
        .lightbox img { max-width: 90%; max-height: 90%; object-fit: contain; }
        .lightbox-close { position: absolute; top: 20px; right: 30px; color: white; font-size: 2rem; cursor: pointer; }

        .alt-suggestions { margin-top: 15px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
        .alt-suggestions h4 { margin-bottom: 10px; color: #666; font-size: 0.9rem; }
        .alt-suggestions ul { list-style: none; }
        .alt-suggestions li { padding: 5px 0; font-size: 0.85rem; color: #555; }
        .alt-suggestions li::before { content: '→ '; color: #1a5f7a; }

        .loading { display: inline-block; width: 20px; height: 20px; border: 3px solid #f3f3f3; border-top: 3px solid #1a5f7a; border-radius: 50%; animation: spin 1s linear infinite; margin-left: 10px; vertical-align: middle; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Day ${research.day}: ${research.title.en}</h1>
            <div class="meta">
                <span>📅 ${research.date}</span>
                <span>📍 ${research.location.en}</span>
                <span>🏨 ${research.accommodation.en}</span>
            </div>
        </div>

        <div class="stats">
            <div class="stat">
                <div class="stat-value">${research.activities.length}</div>
                <div class="stat-label">Activities</div>
            </div>
            <div class="stat">
                <div class="stat-value">${totalImages}</div>
                <div class="stat-label">Images Found</div>
            </div>
            <div class="stat">
                <div class="stat-value" id="selected-count">0</div>
                <div class="stat-label">Selected</div>
            </div>
        </div>

        <div class="description">
            <h3>📝 Day Description</h3>
            <p>${research.description.en}</p>
        </div>

        <!-- Search for New Images -->
        <div class="search-section">
            <h3>🔍 Search for Additional Images</h3>
            <div class="search-controls">
                <input type="text" id="search-input" placeholder="Enter search terms (e.g., Xi'an city wall sunset)">
                <select id="search-provider">
                    <option value="both">Both Providers</option>
                    <option value="unsplash">Unsplash Only</option>
                    <option value="pexels">Pexels Only</option>
                </select>
                <button class="search-btn" onclick="searchImages()">Search</button>
            </div>
            <div class="search-results" id="search-results">
                <div class="search-results-header">
                    <h4 id="search-results-title">Search Results</h4>
                    <button class="clear-search-btn" onclick="clearSearchResults()">Clear Results</button>
                </div>
                <div class="image-grid" id="search-results-grid"></div>
            </div>
        </div>

        <!-- Saved Images -->
        <div class="saved-section">
            <h3>
                <span>💾 Saved Images (<span id="saved-count">0</span>)</span>
                <button class="clear-all-btn" onclick="clearAllSaved()">Clear All</button>
            </h3>
            <div id="saved-images-container">
                <div class="saved-empty" id="saved-empty">No images saved yet. Search and save images above, or save from the activities below.</div>
                <div class="image-grid" id="saved-images-grid"></div>
            </div>
        </div>

        <!-- Hotel Section -->
        <div class="hotel-section">
            <h3>🏨 Hotel: ${research.accommodation.en}</h3>
            <p style="margin-bottom: 15px; color: #666;">Research the accommodation and save verified details for export.</p>

            <div class="hotel-search-links">
                <a href="${research.hotelSearch}" target="_blank" class="hotel-link">🔍 TripAdvisor</a>
                <a href="https://www.booking.com/searchresults.html?ss=${encodeURIComponent(research.accommodation.en + ' ' + research.location.en)}" target="_blank" class="hotel-link">🏨 Booking.com</a>
                <a href="https://www.google.com/search?q=${encodeURIComponent(research.accommodation.en + ' ' + research.location.en + ' reviews')}" target="_blank" class="hotel-link">🔎 Google</a>
                <a href="https://www.google.com/search?tbm=isch&q=${encodeURIComponent(research.accommodation.en + ' ' + research.location.en + ' hotel')}" target="_blank" class="hotel-link">🖼️ Google Images</a>
            </div>

            <div class="hotel-confirm">
                <h4>📍 Confirm Hotel URL (paste from TripAdvisor, Booking.com, etc.)</h4>
                <div class="hotel-saved-url" id="hotel-saved-url">
                    <a href="" id="hotel-url-link" target="_blank"></a>
                    <button class="remove-url" onclick="removeHotelUrl()">×</button>
                </div>
                <div class="hotel-url-input" id="hotel-url-input-container">
                    <input type="url" id="hotel-url" placeholder="Paste hotel URL here...">
                    <button onclick="saveHotelUrl()">Save URL</button>
                </div>

                <h4 style="margin-top: 15px;">🖼️ Add Hotel Images (paste image URLs)</h4>
                <div class="hotel-image-input">
                    <input type="url" id="hotel-image-url" placeholder="Paste hotel image URL here...">
                    <button onclick="addHotelImage()">Add Image</button>
                </div>
                <div class="hotel-images-grid" id="hotel-images-grid"></div>
            </div>
        </div>

        ${research.activities.map((activity, actIdx) => `
        <div class="activity">
            <div class="activity-header">
                <h2>🎯 ${activity.name}</h2>
                <div class="search-term">Search: "${activity.searchTerm}" • ${activity.images.length} images found</div>
            </div>
            <div class="image-grid">
                ${activity.images.map((img, imgIdx) => `
                <div class="image-card" data-activity="${actIdx}" data-image="${imgIdx}" data-url="${img.url}" data-full="${img.full}" data-alt="${img.alt}" data-photographer="${img.photographer}" data-source="${img.source}">
                    <div class="image-container">
                        <img src="${img.url}" alt="${img.alt}" loading="lazy" onclick="openLightbox('${img.full}')">
                    </div>
                    <div class="image-info">
                        <div class="image-source">
                            <span class="badge ${img.source}">${img.source}</span>
                            <span class="photographer">📸 <a href="${img.photographerUrl}" target="_blank">${img.photographer}</a></span>
                        </div>
                        <div class="image-alt">${img.alt}</div>
                    </div>
                    <button class="select-btn" onclick="toggleSelect(this)">Select This Image</button>
                </div>
                `).join('')}
            </div>
            <div class="alt-suggestions">
                <h4>Suggested Alt Text for ${activity.name}:</h4>
                <ul>
                    ${activity.suggestedAlt.map(alt => `<li>${alt}</li>`).join('')}
                </ul>
            </div>
        </div>
        `).join('')}
    </div>

    <div class="selection-panel">
        <div class="selection-count">
            <strong id="panel-count">0</strong> images selected
        </div>
        <div>
            <button class="export-btn" onclick="exportSelections()" id="export-btn" disabled>Export Selected Images</button>
        </div>
    </div>

    <div class="lightbox" id="lightbox" onclick="closeLightbox()">
        <span class="lightbox-close">&times;</span>
        <img src="" alt="" id="lightbox-img">
    </div>

    <script>
        // API Keys (same as used by research agent)
        const UNSPLASH_KEY = '4wGTin267DbXTH31pzcFYbx4FkOoYJflzmauitLlw_c';
        const PEXELS_KEY = 'XMucWQDeDKI8Giqzipmy130K1Y2f2dEMWMULTxiBfR4S82Cnv545RA3M';
        const DAY_NUMBER = ${research.day};
        const STORAGE_KEY = 'day-' + DAY_NUMBER + '-research';

        // State
        const selectedImages = new Set();
        let savedImages = [];
        let hotelUrl = '';
        let hotelImages = [];

        // Load saved state on page load
        document.addEventListener('DOMContentLoaded', () => {
            loadSavedState();
            renderSavedImages();
            renderHotelData();
        });

        function loadSavedState() {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const data = JSON.parse(saved);
                    savedImages = data.savedImages || [];
                    hotelUrl = data.hotelUrl || '';
                    hotelImages = data.hotelImages || [];
                }
            } catch (e) {
                console.error('Failed to load saved state:', e);
            }
        }

        function saveState() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    savedImages,
                    hotelUrl,
                    hotelImages
                }));
            } catch (e) {
                console.error('Failed to save state:', e);
            }
        }

        // Search functionality
        async function searchImages() {
            const query = document.getElementById('search-input').value.trim();
            if (!query) return alert('Please enter search terms');

            const provider = document.getElementById('search-provider').value;
            const btn = document.querySelector('.search-btn');
            btn.disabled = true;
            btn.innerHTML = 'Searching... <span class="loading"></span>';

            let results = [];

            try {
                if (provider === 'unsplash' || provider === 'both') {
                    const unsplash = await fetchUnsplash(query);
                    results = results.concat(unsplash);
                }
                if (provider === 'pexels' || provider === 'both') {
                    const pexels = await fetchPexels(query);
                    results = results.concat(pexels);
                }

                renderSearchResults(results, query);
            } catch (e) {
                alert('Search failed: ' + e.message);
            }

            btn.disabled = false;
            btn.textContent = 'Search';
        }

        async function fetchUnsplash(query) {
            const url = 'https://api.unsplash.com/search/photos?query=' + encodeURIComponent(query) + '&per_page=6&orientation=landscape';
            const res = await fetch(url, {
                headers: { 'Authorization': 'Client-ID ' + UNSPLASH_KEY }
            });
            if (!res.ok) throw new Error('Unsplash API error');
            const data = await res.json();
            return data.results.map(p => ({
                id: 'unsplash-' + p.id,
                url: p.urls.regular,
                thumb: p.urls.small,
                full: p.urls.full,
                alt: p.alt_description || p.description || query,
                photographer: p.user.name,
                photographerUrl: p.user.links.html,
                source: 'unsplash'
            }));
        }

        async function fetchPexels(query) {
            const url = 'https://api.pexels.com/v1/search?query=' + encodeURIComponent(query) + '&per_page=6&orientation=landscape';
            const res = await fetch(url, {
                headers: { 'Authorization': PEXELS_KEY }
            });
            if (!res.ok) throw new Error('Pexels API error');
            const data = await res.json();
            return data.photos.map(p => ({
                id: 'pexels-' + p.id,
                url: p.src.large,
                thumb: p.src.medium,
                full: p.src.original,
                alt: p.alt || query,
                photographer: p.photographer,
                photographerUrl: p.photographer_url,
                source: 'pexels'
            }));
        }

        function renderSearchResults(results, query) {
            const container = document.getElementById('search-results');
            const grid = document.getElementById('search-results-grid');
            const title = document.getElementById('search-results-title');

            title.textContent = 'Found ' + results.length + ' images for "' + query + '"';
            grid.innerHTML = results.map(img => createSearchImageCard(img)).join('');
            container.classList.add('active');
        }

        function createSearchImageCard(img) {
            return '<div class="image-card" data-id="' + img.id + '" data-url="' + img.url + '" data-full="' + img.full + '" data-alt="' + escapeHtml(img.alt) + '" data-photographer="' + escapeHtml(img.photographer) + '" data-source="' + img.source + '">' +
                '<div class="image-container">' +
                    '<img src="' + img.url + '" alt="' + escapeHtml(img.alt) + '" loading="lazy" onclick="openLightbox(\\'' + img.full + '\\')">' +
                '</div>' +
                '<div class="image-info">' +
                    '<div class="image-source">' +
                        '<span class="badge ' + img.source + '">' + img.source + '</span>' +
                        '<span class="photographer">' + escapeHtml(img.photographer) + '</span>' +
                    '</div>' +
                    '<div class="image-alt">' + escapeHtml(img.alt) + '</div>' +
                '</div>' +
                '<button class="save-btn" onclick="saveImageFromSearch(this)">💾 Save to Collection</button>' +
            '</div>';
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text || '';
            return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        }

        function clearSearchResults() {
            document.getElementById('search-results').classList.remove('active');
            document.getElementById('search-results-grid').innerHTML = '';
        }

        // Save image functionality
        function saveImageFromSearch(btn) {
            const card = btn.closest('.image-card');
            const img = {
                id: card.dataset.id,
                url: card.dataset.url,
                full: card.dataset.full,
                alt: card.dataset.alt,
                photographer: card.dataset.photographer,
                source: card.dataset.source
            };

            if (savedImages.find(s => s.id === img.id)) {
                alert('Image already saved!');
                return;
            }

            savedImages.push(img);
            saveState();
            renderSavedImages();
            updateCount();
            btn.textContent = '✓ Saved!';
            btn.disabled = true;
        }

        function saveImageFromActivity(btn) {
            const card = btn.closest('.image-card');
            const img = {
                id: card.dataset.activity + '-' + card.dataset.image + '-' + Date.now(),
                url: card.dataset.url,
                full: card.dataset.full,
                alt: card.dataset.alt,
                photographer: card.dataset.photographer,
                source: card.dataset.source
            };

            if (savedImages.find(s => s.url === img.url)) {
                alert('Image already saved!');
                return;
            }

            savedImages.push(img);
            saveState();
            renderSavedImages();
            alert('Image saved to collection!');
        }

        function renderSavedImages() {
            const grid = document.getElementById('saved-images-grid');
            const empty = document.getElementById('saved-empty');
            const count = document.getElementById('saved-count');

            count.textContent = savedImages.length;

            if (savedImages.length === 0) {
                empty.style.display = 'block';
                grid.innerHTML = '';
                return;
            }

            empty.style.display = 'none';
            grid.innerHTML = savedImages.map((img, idx) =>
                '<div class="image-card" data-saved-idx="' + idx + '" data-url="' + img.url + '" data-full="' + img.full + '" data-alt="' + escapeHtml(img.alt) + '" data-photographer="' + escapeHtml(img.photographer) + '" data-source="' + img.source + '">' +
                    '<div class="image-container">' +
                        '<img src="' + img.url + '" alt="' + escapeHtml(img.alt) + '" loading="lazy" onclick="openLightbox(\\'' + img.full + '\\')">' +
                    '</div>' +
                    '<div class="image-info">' +
                        '<div class="image-source">' +
                            '<span class="badge saved">SAVED</span>' +
                            '<span class="photographer">' + escapeHtml(img.photographer) + '</span>' +
                        '</div>' +
                        '<div class="image-alt">' + escapeHtml(img.alt) + '</div>' +
                    '</div>' +
                    '<button class="select-btn" onclick="toggleSavedSelect(this)">Select for Export</button>' +
                    '<button style="width:100%;padding:8px;border:none;background:#e74c3c;color:white;cursor:pointer;" onclick="removeSavedImage(' + idx + ')">Remove</button>' +
                '</div>'
            ).join('');
        }

        function toggleSavedSelect(btn) {
            const card = btn.closest('.image-card');
            const key = 'saved-' + card.dataset.savedIdx;

            if (selectedImages.has(key)) {
                selectedImages.delete(key);
                card.classList.remove('selected');
                btn.textContent = 'Select for Export';
            } else {
                selectedImages.add(key);
                card.classList.add('selected');
                btn.textContent = 'Selected ✓';
            }
            updateCount();
        }

        function removeSavedImage(idx) {
            savedImages.splice(idx, 1);
            saveState();
            renderSavedImages();
            // Remove from selection if selected
            selectedImages.delete('saved-' + idx);
            updateCount();
        }

        function clearAllSaved() {
            if (!confirm('Remove all saved images?')) return;
            savedImages = [];
            saveState();
            renderSavedImages();
            // Clear saved selections
            selectedImages.forEach(key => {
                if (key.startsWith('saved-')) selectedImages.delete(key);
            });
            updateCount();
        }

        // Hotel functionality
        function saveHotelUrl() {
            const input = document.getElementById('hotel-url');
            const url = input.value.trim();
            if (!url) return alert('Please enter a URL');

            hotelUrl = url;
            saveState();
            renderHotelData();
            updateCount();
            input.value = '';
        }

        function removeHotelUrl() {
            hotelUrl = '';
            saveState();
            renderHotelData();
            updateCount();
        }

        function addHotelImage() {
            const input = document.getElementById('hotel-image-url');
            const url = input.value.trim();
            if (!url) return alert('Please enter an image URL');

            hotelImages.push({ url: url, alt: '${research.accommodation.en.replace(/'/g, "\\'")}' });
            saveState();
            renderHotelData();
            updateCount();
            input.value = '';
        }

        function removeHotelImage(idx) {
            hotelImages.splice(idx, 1);
            saveState();
            renderHotelData();
            updateCount();
        }

        function renderHotelData() {
            // URL
            const urlContainer = document.getElementById('hotel-saved-url');
            const urlInput = document.getElementById('hotel-url-input-container');
            const urlLink = document.getElementById('hotel-url-link');

            if (hotelUrl) {
                urlContainer.classList.add('active');
                urlLink.href = hotelUrl;
                urlLink.textContent = hotelUrl;
                urlInput.style.display = 'none';
            } else {
                urlContainer.classList.remove('active');
                urlInput.style.display = 'flex';
            }

            // Images
            const grid = document.getElementById('hotel-images-grid');
            grid.innerHTML = hotelImages.map((img, idx) =>
                '<div class="hotel-image-card">' +
                    '<img src="' + img.url + '" alt="' + escapeHtml(img.alt) + '" onclick="openLightbox(\\'' + img.url + '\\')">' +
                    '<button class="remove-img" onclick="removeHotelImage(' + idx + ')">×</button>' +
                '</div>'
            ).join('');
        }

        // Activity image selection
        function toggleSelect(btn) {
            const card = btn.closest('.image-card');
            const key = card.dataset.activity + '-' + card.dataset.image;

            if (selectedImages.has(key)) {
                selectedImages.delete(key);
                card.classList.remove('selected');
                btn.textContent = 'Select This Image';
            } else {
                selectedImages.add(key);
                card.classList.add('selected');
                btn.textContent = 'Selected ✓';
            }
            updateCount();
        }

        function updateCount() {
            const count = selectedImages.size;
            document.getElementById('selected-count').textContent = count;
            document.getElementById('panel-count').textContent = count;
            // Enable export if there's ANY data to export
            const hasData = count > 0 || savedImages.length > 0 || hotelUrl || hotelImages.length > 0;
            document.getElementById('export-btn').disabled = !hasData;
        }

        function openLightbox(url) {
            document.getElementById('lightbox-img').src = url;
            document.getElementById('lightbox').classList.add('active');
        }

        function closeLightbox() {
            document.getElementById('lightbox').classList.remove('active');
        }

        // Export with all data
        function exportSelections() {
            const exportData = {
                day: DAY_NUMBER,
                activityImages: [],
                savedImages: [],
                hotel: {
                    name: '${research.accommodation.en.replace(/'/g, "\\'")}',
                    url: hotelUrl,
                    images: hotelImages
                }
            };

            // Activity images (only selected ones)
            document.querySelectorAll('.activity .image-card.selected').forEach(card => {
                exportData.activityImages.push({
                    src: card.dataset.url,
                    full: card.dataset.full,
                    alt: { en: card.dataset.alt, cn: card.dataset.alt },
                    caption: { en: card.dataset.alt, cn: card.dataset.alt },
                    photographer: card.dataset.photographer,
                    source: card.dataset.source
                });
            });

            // ALL saved images (from search) - these are always exported
            savedImages.forEach(img => {
                exportData.savedImages.push({
                    src: img.url,
                    full: img.full,
                    alt: { en: img.alt, cn: img.alt },
                    caption: { en: img.alt, cn: img.alt },
                    photographer: img.photographer,
                    source: img.source
                });
            });

            const json = JSON.stringify(exportData, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'day-' + DAY_NUMBER + '-complete-export.json';
            a.click();
            URL.revokeObjectURL(url);
        }

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') closeLightbox();
        });

        // Allow Enter key to search
        document.getElementById('search-input').addEventListener('keypress', e => {
            if (e.key === 'Enter') searchImages();
        });
    </script>
</body>
</html>`;
    }

    async saveResults(research) {
        const outputDir = path.join(__dirname, 'research-output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Save HTML
        const htmlPath = path.join(outputDir, `day-${research.day}-research.html`);
        fs.writeFileSync(htmlPath, this.generateHTML(research));

        // Save JSON
        const jsonPath = path.join(outputDir, `day-${research.day}-research.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(research, null, 2));

        console.log(`\n✅ Research complete!`);
        console.log(`   📄 HTML: ${htmlPath}`);
        console.log(`   📄 JSON: ${jsonPath}`);

        return htmlPath;
    }

    async run(dayNumber) {
        console.log('🚀 Daily Research Agent for China Hiking Tour');
        console.log('📸 Fetching real images from Unsplash & Pexels...\n');

        await this.loadItineraryData();

        const day = parseInt(dayNumber);
        if (isNaN(day) || day < 1 || day > 15) {
            console.error('❌ Please specify a day number (1-15)');
            console.log('Usage: node daily-research-agent.js <day>');
            console.log('Example: node daily-research-agent.js 5');
            process.exit(1);
        }

        const research = await this.researchDay(day);
        if (!research) {
            process.exit(1);
        }

        const htmlPath = await this.saveResults(research);

        console.log(`\n🌐 Opening in browser...`);

        // Open in browser
        const { exec } = await import('child_process');
        exec(`open "${htmlPath}"`);
    }
}

// Run
const agent = new DailyResearchAgent();
agent.run(process.argv[2]);