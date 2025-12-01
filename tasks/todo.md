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
- [ ] Create `image-search-agent/` folder structure
- [ ] Initialize package.json with dependencies
- [ ] Create Vite config for React frontend
- [ ] Create .env.example for optional API keys

### Phase 2: Backend Server
- [ ] Create server.js with Express
- [ ] Implement image search endpoints (reuse cms2 logic)
- [ ] Add Flickr Creative Commons search
- [ ] Create persistence layer for sessions/ratings
- [ ] Implement relevance scoring algorithm

### Phase 3: Frontend Components
- [ ] Create main App with layout
- [ ] Build SearchBar component
- [ ] Build ImageGrid with lazy loading
- [ ] Build ImageCard with rating buttons
- [ ] Build SessionHistory sidebar

### Phase 4: Feedback & Refinement System
- [ ] Track ratings in sessions.json
- [ ] Analyze rating patterns per location
- [ ] Build RefinementPanel with suggestions
- [ ] Implement search term suggestions based on feedback

### Phase 5: Polish & Testing
- [ ] Add duplicate detection (exact URL)
- [ ] Add loading states and error handling
- [ ] Test with China trip locations
- [ ] Document usage

---

## Review
(To be filled after completion)
