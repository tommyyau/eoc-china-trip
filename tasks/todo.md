# Task: Location Image Search Agent (Experiment)

## Goal
Create a standalone web app that searches multiple free image sources for China locations, allows rating images, and refines searches based on feedback.

## Architecture

```
image-search-agent/
├── server.js           # Express backend (API calls, persistence)
├── package.json
├── .env.example        # API key template
├── data/
│   └── sessions.json   # Persisted search history & ratings
└── src/
    ├── App.jsx         # Main app
    ├── App.css
    ├── main.jsx
    └── components/
        ├── SearchBar.jsx       # Location input + search
        ├── ImageGrid.jsx       # Display images with ratings
        ├── ImageCard.jsx       # Single image + rating buttons
        ├── RefinementPanel.jsx # Suggested search refinements
        └── SessionHistory.jsx  # Past searches
```

## Image Sources (all free tier friendly)
1. **Wikimedia Commons** - No API key, great for landmarks
2. **Unsplash** - 50 req/hr free tier
3. **Pexels** - 200 req/hr free tier
4. **Pixabay** - Free with key
5. **Flickr** - Creative Commons search (future)

## Relevance Scoring Criteria (auto-calculated)
- **Resolution score** (0-25): Higher resolution = better
- **Keyword match score** (0-25): Title/tags match search terms
- **Source score** (0-25): Wikimedia high for landmarks, Unsplash for quality
- **Aspect ratio score** (0-25): Landscape orientation preferred for travel

## Feedback Loop
- Track user ratings per search term
- Analyze patterns: which keywords/sources get "very relevant"
- Suggest refined search terms based on highly-rated image metadata
- Weight sources that consistently provide better results

---

## Plan

### Phase 1: Project Setup
- [x] Create `image-search-agent/` folder structure
- [x] Initialize package.json with dependencies
- [x] Create Vite config for React frontend
- [x] Create .env.example for optional API keys

### Phase 2: Backend Server
- [x] Create server.js with Express
- [x] Implement image search endpoints (Unsplash, Pexels, Pixabay, Wikimedia)
- [ ] Add Flickr Creative Commons search (future)
- [x] Create persistence layer for sessions/ratings
- [x] Implement relevance scoring algorithm

### Phase 3: Frontend Components
- [x] Create main App with layout
- [x] Build SearchBar component
- [x] Build ImageGrid with lazy loading
- [x] Build ImageCard with rating buttons
- [x] Build SessionHistory sidebar

### Phase 4: Feedback & Refinement System
- [x] Track ratings in sessions.json
- [x] Analyze rating patterns per location
- [x] Build RefinementPanel with suggestions
- [x] Implement search term suggestions based on feedback

### Phase 5: Polish & Testing
- [x] Add duplicate detection (exact URL)
- [x] Add loading states and error handling
- [x] Test with China trip locations
- [x] Document usage

---

## Review

### Summary
Built a complete standalone image search agent with:
- **Backend** (`server.js`): Express server with search, rating, and suggestion APIs
- **Frontend**: React app with search bar, image grid, rating system, and session history
- **Persistence**: JSON file storage for searches, ratings, and source statistics

### Features Implemented
1. **Multi-source Search**: Wikimedia Commons (no key), Unsplash, Pexels, Pixabay
2. **Relevance Scoring**: 0-100 score based on resolution, keyword match, source, aspect ratio
3. **Rating System**: "Very Relevant", "Relevant", "Not Relevant" buttons per image
4. **Session Persistence**: Ratings and search history saved to `data/sessions.json`
5. **Search Refinements**: Suggestions panel with keyword additions based on rating patterns
6. **Duplicate Detection**: Exact URL matching to prevent duplicates
7. **Image Preview**: Click to view full-size image in modal

### How to Use
```bash
cd image-search-agent
npm install
npm run dev
# Opens at http://localhost:5180
```

### API Keys (Optional)
Copy `.env.example` to `.env` and add keys for more sources:
- `UNSPLASH_ACCESS_KEY` - https://unsplash.com/developers
- `PEXELS_API_KEY` - https://www.pexels.com/api/
- `PIXABAY_API_KEY` - https://pixabay.com/api/docs/

Without API keys, only Wikimedia Commons is available (still useful for landmark photos).

### Future Enhancements
- Add Flickr Creative Commons search
- Improve suggestion algorithm with more rating pattern analysis
- Add image download functionality
- Export rated images list
