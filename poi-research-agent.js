#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load OpenAI API key from content-manager/.env
const envPath = path.join(__dirname, 'content-manager', '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/OPENAI_API_KEY=(.+)/);
    if (match) {
        process.env.OPENAI_API_KEY = match[1].trim();
    }
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

class POIResearchAgent {
    constructor() {
        this.itineraryData = null;
        this.outputDir = path.join(__dirname, 'poi-research-output');
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

    // Filter out non-POI items (transfers, meals, etc.)
    isPOI(highlight) {
        const skipPatterns = [
            /airport transfer/i,
            /welcome dinner/i,
            /welcome meeting/i,
            /high-speed train/i,
            /high-speed rail/i,
            /sleeper train/i,
            /overnight train/i,
            /flight to/i,
            /departure/i,
            /overnight/i,
            /dumpling banquet/i,
            /peking duck/i,
            /acclimatization/i,
            /warm-up/i,
        ];
        return !skipPatterns.some(p => p.test(highlight));
    }

    // Create a slug from name
    slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    // Extract POIs from a specific day
    extractPOIsFromDay(dayNumber) {
        const day = this.itineraryData.find(d => d.day === dayNumber);
        if (!day) return [];

        const location = day.location.en || day.location;
        const highlights = day.highlights.en || day.highlights;

        return highlights
            .filter(h => this.isPOI(h))
            .map(h => ({
                id: this.slugify(h),
                name: h,
                day: dayNumber,
                location: location,
                searchQuery: `${h} ${location} China`
            }));
    }

    // Search Wikipedia for a POI
    async searchWikipedia(query) {
        try {
            // First, search for the article
            const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();

            if (!searchData.query?.search?.length) {
                return null;
            }

            const pageTitle = searchData.query.search[0].title;

            // Get the article extract
            const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=extracts&exintro=true&explaintext=true&format=json&origin=*`;
            const extractResponse = await fetch(extractUrl);
            const extractData = await extractResponse.json();

            const pages = extractData.query?.pages;
            if (!pages) return null;

            const page = Object.values(pages)[0];
            if (!page || page.missing) return null;

            return {
                title: page.title,
                extract: page.extract?.substring(0, 2000) || '',
                url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`
            };
        } catch (error) {
            console.log(`  ⚠️  Wikipedia search error: ${error.message}`);
            return null;
        }
    }

    // Synthesize content using OpenAI
    async synthesizeContent(poi, wikiData) {
        if (!process.env.OPENAI_API_KEY) {
            console.log('  ⚠️  OpenAI API key not set, using placeholder content');
            return {
                summary: `[Placeholder] ${poi.name} is a fascinating destination in ${poi.location}, China.`,
                historicalContext: '[Placeholder] Historical information to be added.',
                practicalTips: '[Placeholder] Practical visitor tips to be added.',
                confidence: 0
            };
        }

        try {
            const prompt = `You are a travel content writer creating engaging descriptions for a hiking tour website.

POI Name: ${poi.name}
Location: ${poi.location}, China
Wikipedia Content: ${wikiData?.extract || 'No Wikipedia data available'}

Generate a JSON response with engaging, accurate content:
{
  "summary": "1-2 paragraphs (150-250 words). Marketing-style description that makes travelers excited to visit. Describe what makes this place special, what visitors will experience, and why it's worth the visit. Be vivid and engaging.",
  "historicalContext": "2-4 sentences of key historical facts. When was it built/established? Why is it significant? Any interesting historical stories?",
  "practicalTips": "3-5 practical tips for visitors. Best times to visit, how long to spend there, what to wear, what to look out for, any insider tips."
}

IMPORTANT:
- Be accurate - only include verifiable facts
- Be engaging - this is marketing content for tourists
- Be concise but informative
- Focus on what makes this place unique and memorable`;

            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are an expert travel writer. Return ONLY valid JSON, no markdown or explanation.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1500
            });

            const content = response.choices[0].message.content;
            const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsed = JSON.parse(jsonStr);

            return {
                summary: parsed.summary || '',
                historicalContext: parsed.historicalContext || '',
                practicalTips: parsed.practicalTips || '',
                confidence: wikiData ? 0.9 : 0.7
            };
        } catch (error) {
            console.log(`  ⚠️  OpenAI synthesis error: ${error.message}`);
            return {
                summary: `${poi.name} is a notable destination in ${poi.location}.`,
                historicalContext: 'Historical information unavailable.',
                practicalTips: 'Please research visitor tips before your visit.',
                confidence: 0.3
            };
        }
    }

    // Research a single POI
    async researchPOI(poi) {
        console.log(`\n  🔍 Researching: ${poi.name}`);

        // Search Wikipedia
        console.log(`     📚 Searching Wikipedia...`);
        const wikiData = await this.searchWikipedia(poi.searchQuery);
        if (wikiData) {
            console.log(`     ✓ Found: ${wikiData.title}`);
        } else {
            console.log(`     ⚠️  No Wikipedia article found`);
        }

        // Synthesize with OpenAI
        console.log(`     🤖 Generating content...`);
        const synthesis = await this.synthesizeContent(poi, wikiData);

        return {
            ...poi,
            ...synthesis,
            links: wikiData ? [
                { type: 'wikipedia', url: wikiData.url, title: 'Wikipedia' }
            ] : [],
            wikiTitle: wikiData?.title || null,
            researchedAt: new Date().toISOString()
        };
    }

    // Research all POIs for a day
    async researchDay(dayNumber) {
        const day = this.itineraryData.find(d => d.day === dayNumber);
        if (!day) {
            console.error(`❌ Day ${dayNumber} not found`);
            return null;
        }

        console.log(`\n🔍 POI Research for Day ${dayNumber}: ${day.title.en}`);
        console.log(`📍 Location: ${day.location.en}`);

        const pois = this.extractPOIsFromDay(dayNumber);
        console.log(`🎯 Found ${pois.length} POIs to research`);

        if (pois.length === 0) {
            console.log('   No POIs found for this day (only transfers/meals)');
            return {
                day: dayNumber,
                date: day.date,
                title: day.title,
                location: day.location,
                pois: []
            };
        }

        const researchedPOIs = [];
        for (const poi of pois) {
            const researched = await this.researchPOI(poi);
            researchedPOIs.push(researched);
            // Small delay to be nice to APIs
            await new Promise(r => setTimeout(r, 500));
        }

        return {
            day: dayNumber,
            date: day.date,
            title: day.title,
            location: day.location,
            pois: researchedPOIs
        };
    }

    // Generate HTML preview
    generateHTML(research) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Day ${research.day}: ${research.title.en} - POI Research</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa; color: #333; line-height: 1.6; }
        .container { max-width: 1000px; margin: 0 auto; padding: 20px; padding-bottom: 100px; }

        .header { background: linear-gradient(135deg, #2c5282 0%, #4299e1 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
        .header h1 { font-size: 1.8rem; margin-bottom: 10px; }
        .header .meta { opacity: 0.9; font-size: 1rem; }
        .header .meta span { margin-right: 20px; }

        .stats { background: white; padding: 20px; border-radius: 12px; margin-bottom: 30px; display: flex; gap: 30px; flex-wrap: wrap; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .stat { text-align: center; }
        .stat-value { font-size: 2rem; font-weight: bold; color: #2c5282; }
        .stat-label { color: #666; font-size: 0.9rem; }

        .poi-card { background: white; margin-bottom: 25px; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .poi-header { background: #2c5282; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; }
        .poi-header h2 { font-size: 1.2rem; }
        .poi-status { display: flex; gap: 10px; align-items: center; }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; }
        .status-badge.approved { background: #48bb78; }
        .status-badge.pending { background: #ed8936; }
        .status-badge.rejected { background: #e53e3e; }

        .poi-content { padding: 20px; }
        .poi-section { margin-bottom: 20px; }
        .poi-section h3 { color: #2c5282; font-size: 0.95rem; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
        .poi-section h3::before { content: ''; width: 4px; height: 16px; background: #4299e1; border-radius: 2px; }

        .editable { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 0.95rem; line-height: 1.6; resize: vertical; font-family: inherit; transition: border-color 0.2s; }
        .editable:focus { border-color: #4299e1; outline: none; }
        .editable.summary { min-height: 150px; }
        .editable.history { min-height: 80px; }
        .editable.tips { min-height: 100px; }

        .links-section { background: #f7fafc; padding: 15px; border-radius: 8px; margin-top: 15px; }
        .links-section h4 { font-size: 0.85rem; color: #666; margin-bottom: 10px; }
        .link-item { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; padding: 8px 12px; background: white; border-radius: 6px; }
        .link-item a { color: #2c5282; text-decoration: none; flex: 1; word-break: break-all; }
        .link-item a:hover { text-decoration: underline; }
        .link-badge { background: #e2e8f0; color: #4a5568; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; }
        .link-remove { background: #e53e3e; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
        .link-remove:hover { background: #c53030; }
        .add-link { display: flex; gap: 8px; margin-top: 10px; }
        .add-link input { flex: 1; padding: 8px; border: 2px solid #e2e8f0; border-radius: 6px; font-size: 0.9rem; }
        .add-link input:focus { border-color: #4299e1; outline: none; }
        .add-link button { background: #4299e1; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; }
        .add-link button:hover { background: #3182ce; }

        .poi-actions { display: flex; gap: 10px; padding: 15px 20px; background: #f7fafc; border-top: 1px solid #e2e8f0; }
        .action-btn { flex: 1; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: bold; transition: all 0.2s; }
        .approve-btn { background: #48bb78; color: white; }
        .approve-btn:hover { background: #38a169; }
        .reject-btn { background: #e53e3e; color: white; }
        .reject-btn:hover { background: #c53030; }
        .reset-btn { background: #e2e8f0; color: #4a5568; }
        .reset-btn:hover { background: #cbd5e0; }

        .confidence { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #666; margin-top: 10px; }
        .confidence-bar { width: 100px; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
        .confidence-fill { height: 100%; border-radius: 4px; }
        .confidence-high { background: #48bb78; }
        .confidence-medium { background: #ed8936; }
        .confidence-low { background: #e53e3e; }

        .bottom-panel { position: fixed; bottom: 0; left: 0; right: 0; background: white; padding: 15px 20px; box-shadow: 0 -4px 20px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; z-index: 100; }
        .panel-stats { font-size: 1rem; }
        .panel-stats strong { color: #48bb78; }
        .panel-actions { display: flex; align-items: center; gap: 10px; }
        .save-status { font-size: 0.9rem; padding: 6px 12px; border-radius: 6px; }
        .save-status.success { background: #c6f6d5; color: #276749; }
        .save-status.error { background: #fed7d7; color: #c53030; }
        .save-status.loading { background: #bee3f8; color: #2b6cb0; }
        .export-btn { background: #48bb78; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 0.95rem; font-weight: bold; }
        .export-btn:hover { background: #38a169; }
        .export-btn:disabled { background: #a0aec0; cursor: not-allowed; }
        .export-btn.secondary { background: #718096; }
        .export-btn.secondary:hover { background: #4a5568; }

        .empty-state { text-align: center; padding: 60px 20px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .empty-state h2 { color: #4a5568; margin-bottom: 10px; }
        .empty-state p { color: #718096; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Day ${research.day}: ${research.title.en}</h1>
            <div class="meta">
                <span>📅 ${research.date}</span>
                <span>📍 ${research.location.en}</span>
                <span>🎯 ${research.pois.length} POIs</span>
            </div>
        </div>

        <div class="stats">
            <div class="stat">
                <div class="stat-value">${research.pois.length}</div>
                <div class="stat-label">POIs Researched</div>
            </div>
            <div class="stat">
                <div class="stat-value" id="approved-count">0</div>
                <div class="stat-label">Approved</div>
            </div>
            <div class="stat">
                <div class="stat-value" id="rejected-count">0</div>
                <div class="stat-label">Rejected</div>
            </div>
            <div class="stat">
                <div class="stat-value" id="pending-count">${research.pois.length}</div>
                <div class="stat-label">Pending Review</div>
            </div>
        </div>

        ${research.pois.length === 0 ? `
        <div class="empty-state">
            <h2>No POIs Found</h2>
            <p>This day only contains transfers, meals, or other non-POI activities.</p>
        </div>
        ` : research.pois.map((poi, idx) => `
        <div class="poi-card" data-poi-id="${poi.id}" data-poi-idx="${idx}">
            <div class="poi-header">
                <h2>🏛️ ${poi.name}</h2>
                <div class="poi-status">
                    <span class="status-badge pending" id="status-${idx}">Pending</span>
                </div>
            </div>
            <div class="poi-content">
                <div class="poi-section">
                    <h3>Summary</h3>
                    <textarea class="editable summary" id="summary-${idx}" placeholder="Marketing-style description...">${poi.summary}</textarea>
                </div>
                <div class="poi-section">
                    <h3>Historical Context</h3>
                    <textarea class="editable history" id="history-${idx}" placeholder="Historical background...">${poi.historicalContext}</textarea>
                </div>
                <div class="poi-section">
                    <h3>Practical Tips</h3>
                    <textarea class="editable tips" id="tips-${idx}" placeholder="Visitor tips...">${poi.practicalTips}</textarea>
                </div>

                <div class="links-section">
                    <h4>🔗 External Links</h4>
                    <div id="links-${idx}">
                        ${poi.links.map((link, linkIdx) => `
                        <div class="link-item" data-link-idx="${linkIdx}">
                            <span class="link-badge">${link.type}</span>
                            <a href="${link.url}" target="_blank">${link.url}</a>
                            <button class="link-remove" onclick="removeLink(${idx}, ${linkIdx})">×</button>
                        </div>
                        `).join('')}
                    </div>
                    <div class="add-link">
                        <input type="url" id="new-link-${idx}" placeholder="https://...">
                        <button onclick="addLink(${idx})">Add Link</button>
                    </div>
                </div>

                <div class="confidence">
                    <span>Confidence:</span>
                    <div class="confidence-bar">
                        <div class="confidence-fill ${poi.confidence >= 0.8 ? 'confidence-high' : poi.confidence >= 0.5 ? 'confidence-medium' : 'confidence-low'}" style="width: ${poi.confidence * 100}%"></div>
                    </div>
                    <span>${Math.round(poi.confidence * 100)}%</span>
                    ${poi.wikiTitle ? `<span style="margin-left: 10px; color: #48bb78;">✓ Wikipedia verified</span>` : ''}
                </div>
            </div>
            <div class="poi-actions">
                <button class="action-btn approve-btn" onclick="setStatus(${idx}, 'approved')">✓ Approve</button>
                <button class="action-btn reject-btn" onclick="setStatus(${idx}, 'rejected')">✗ Reject</button>
                <button class="action-btn reset-btn" onclick="setStatus(${idx}, 'pending')">↺ Reset</button>
            </div>
        </div>
        `).join('')}
    </div>

    <div class="bottom-panel">
        <div class="panel-stats">
            <strong id="panel-approved">0</strong> approved • <span id="panel-pending">${research.pois.length}</span> pending
        </div>
        <div class="panel-actions">
            <span id="save-status" class="save-status"></span>
            <button class="export-btn secondary" onclick="downloadJSON()" id="download-btn">Download JSON</button>
            <button class="export-btn" onclick="saveToContentManager()" id="save-btn">Save to Content Manager</button>
        </div>
    </div>

    <script>
        const DAY_NUMBER = ${research.day};
        const STORAGE_KEY = 'poi-day-' + DAY_NUMBER;
        const originalData = ${JSON.stringify(research.pois)};

        // State
        let poiStatus = {};
        let poiLinks = {};

        // Initialize from localStorage
        document.addEventListener('DOMContentLoaded', () => {
            loadState();
            updateCounts();
        });

        function loadState() {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const data = JSON.parse(saved);
                    poiStatus = data.status || {};
                    poiLinks = data.links || {};

                    // Restore text content
                    if (data.content) {
                        Object.keys(data.content).forEach(idx => {
                            const c = data.content[idx];
                            if (c.summary) document.getElementById('summary-' + idx).value = c.summary;
                            if (c.history) document.getElementById('history-' + idx).value = c.history;
                            if (c.tips) document.getElementById('tips-' + idx).value = c.tips;
                        });
                    }

                    // Restore status badges
                    Object.keys(poiStatus).forEach(idx => {
                        updateStatusBadge(parseInt(idx), poiStatus[idx]);
                    });

                    // Restore links
                    Object.keys(poiLinks).forEach(idx => {
                        renderLinks(parseInt(idx));
                    });
                }
            } catch (e) {
                console.error('Failed to load state:', e);
            }
        }

        function saveState() {
            try {
                const content = {};
                originalData.forEach((poi, idx) => {
                    content[idx] = {
                        summary: document.getElementById('summary-' + idx)?.value,
                        history: document.getElementById('history-' + idx)?.value,
                        tips: document.getElementById('tips-' + idx)?.value
                    };
                });

                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    status: poiStatus,
                    links: poiLinks,
                    content: content
                }));
            } catch (e) {
                console.error('Failed to save state:', e);
            }
        }

        function setStatus(idx, status) {
            poiStatus[idx] = status;
            updateStatusBadge(idx, status);
            updateCounts();
            saveState();
        }

        function updateStatusBadge(idx, status) {
            const badge = document.getElementById('status-' + idx);
            if (!badge) return;
            badge.className = 'status-badge ' + status;
            badge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        }

        function updateCounts() {
            const total = originalData.length;
            let approved = 0, rejected = 0;
            Object.values(poiStatus).forEach(s => {
                if (s === 'approved') approved++;
                if (s === 'rejected') rejected++;
            });
            const pending = total - approved - rejected;

            document.getElementById('approved-count').textContent = approved;
            document.getElementById('rejected-count').textContent = rejected;
            document.getElementById('pending-count').textContent = pending;
            document.getElementById('panel-approved').textContent = approved;
            document.getElementById('panel-pending').textContent = pending;
        }

        function removeLink(poiIdx, linkIdx) {
            if (!poiLinks[poiIdx]) {
                poiLinks[poiIdx] = [...originalData[poiIdx].links];
            }
            poiLinks[poiIdx].splice(linkIdx, 1);
            renderLinks(poiIdx);
            saveState();
        }

        function addLink(poiIdx) {
            const input = document.getElementById('new-link-' + poiIdx);
            const url = input.value.trim();
            if (!url) return alert('Please enter a URL');

            if (!poiLinks[poiIdx]) {
                poiLinks[poiIdx] = [...originalData[poiIdx].links];
            }

            // Detect link type
            let type = 'other';
            if (url.includes('wikipedia.org')) type = 'wikipedia';
            else if (url.includes('tripadvisor.com')) type = 'tripadvisor';
            else if (url.includes('lonelyplanet.com')) type = 'lonelyplanet';
            else if (url.includes('.gov.cn') || url.includes('.gov')) type = 'official';

            poiLinks[poiIdx].push({ type, url, title: type });
            renderLinks(poiIdx);
            input.value = '';
            saveState();
        }

        function renderLinks(poiIdx) {
            const container = document.getElementById('links-' + poiIdx);
            const links = poiLinks[poiIdx] || originalData[poiIdx].links;

            container.innerHTML = links.map((link, linkIdx) =>
                '<div class="link-item" data-link-idx="' + linkIdx + '">' +
                    '<span class="link-badge">' + link.type + '</span>' +
                    '<a href="' + link.url + '" target="_blank">' + link.url + '</a>' +
                    '<button class="link-remove" onclick="removeLink(' + poiIdx + ', ' + linkIdx + ')">×</button>' +
                '</div>'
            ).join('');
        }

        function gatherPOIData() {
            const pois = [];

            originalData.forEach((poi, idx) => {
                const status = poiStatus[idx] || 'pending';
                const links = poiLinks[idx] || poi.links;

                pois.push({
                    id: poi.id,
                    name: poi.name,
                    day: poi.day,
                    location: poi.location,
                    status: status,
                    summary: document.getElementById('summary-' + idx)?.value || poi.summary,
                    historicalContext: document.getElementById('history-' + idx)?.value || poi.historicalContext,
                    practicalTips: document.getElementById('tips-' + idx)?.value || poi.practicalTips,
                    links: links,
                    lastModified: new Date().toISOString()
                });
            });

            return pois;
        }

        function downloadJSON() {
            const pois = gatherPOIData().filter(p => p.status === 'approved');

            if (pois.length === 0) {
                return alert('No approved POIs to download. Please approve at least one POI.');
            }

            const exportData = {
                day: DAY_NUMBER,
                exportedAt: new Date().toISOString(),
                pois: pois
            };

            const json = JSON.stringify(exportData, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'day-' + DAY_NUMBER + '-poi-export.json';
            a.click();
            URL.revokeObjectURL(url);
        }

        async function saveToContentManager() {
            const statusEl = document.getElementById('save-status');
            const saveBtn = document.getElementById('save-btn');

            statusEl.textContent = 'Saving...';
            statusEl.className = 'save-status loading';
            saveBtn.disabled = true;

            try {
                const pois = gatherPOIData();

                const response = await fetch('http://localhost:3001/api/poi/' + DAY_NUMBER, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pois })
                });

                if (!response.ok) {
                    throw new Error('Server returned ' + response.status);
                }

                const result = await response.json();
                statusEl.textContent = '✓ Saved!';
                statusEl.className = 'save-status success';

                setTimeout(() => {
                    statusEl.textContent = '';
                    statusEl.className = 'save-status';
                }, 3000);

            } catch (error) {
                console.error('Save error:', error);
                statusEl.textContent = '✗ Failed - is content-manager running?';
                statusEl.className = 'save-status error';
            }

            saveBtn.disabled = false;
        }

        // Auto-save on text changes
        document.querySelectorAll('.editable').forEach(el => {
            el.addEventListener('change', saveState);
            el.addEventListener('blur', saveState);
        });
    </script>
</body>
</html>`;
    }

    async saveResults(research) {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        // Save HTML
        const htmlPath = path.join(this.outputDir, `day-${research.day}-poi.html`);
        fs.writeFileSync(htmlPath, this.generateHTML(research));

        // Save JSON
        const jsonPath = path.join(this.outputDir, `day-${research.day}-poi.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(research, null, 2));

        console.log(`\n✅ POI Research complete!`);
        console.log(`   📄 HTML: ${htmlPath}`);
        console.log(`   📄 JSON: ${jsonPath}`);

        return htmlPath;
    }

    async run(dayArg) {
        console.log('🏛️  POI Research Agent for China Hiking Tour');
        console.log('📚 Researching Points of Interest...\n');

        if (!process.env.OPENAI_API_KEY) {
            console.log('⚠️  Warning: OPENAI_API_KEY not set. Content will be limited.');
            console.log('   Set it in content-manager/.env\n');
        }

        await this.loadItineraryData();

        if (dayArg === 'all') {
            // Research all days
            for (let i = 1; i <= 15; i++) {
                const research = await this.researchDay(i);
                if (research && research.pois.length > 0) {
                    await this.saveResults(research);
                }
                console.log('---');
            }
        } else {
            const day = parseInt(dayArg);
            if (isNaN(day) || day < 1 || day > 15) {
                console.error('❌ Please specify a day number (1-15) or "all"');
                console.log('Usage: node poi-research-agent.js <day>');
                console.log('Example: node poi-research-agent.js 3');
                console.log('Example: node poi-research-agent.js all');
                process.exit(1);
            }

            const research = await this.researchDay(day);
            if (!research) {
                process.exit(1);
            }

            const htmlPath = await this.saveResults(research);

            console.log(`\n🌐 Opening in browser...`);
            const { exec } = await import('child_process');
            exec(`open "${htmlPath}"`);
        }
    }
}

// Run
const agent = new POIResearchAgent();
agent.run(process.argv[2]);
