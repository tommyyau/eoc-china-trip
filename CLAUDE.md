# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A bilingual (English/Chinese) React website for the Ealing Outdoor Club's China hiking tour scheduled for May 2026. The site showcases a 15-day itinerary covering Xi'an, Beijing, Lushan, and Mount Tai.

## Commands

All commands run from the `china-hiking-tour/` directory:

```bash
npm run dev      # Start dev server (Vite)
npm run build    # Production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Architecture

**Tech Stack**: React 18 + Vite + React Router v6

**Key Structure**:
- `src/context/LanguageContext.jsx` - Global language state (`'en'` or `'cn'`) via React Context. Use `useLanguage()` hook to access `language` and `toggleLanguage()`.
- `src/data/itineraryData.js` - Central data source for the 15-day itinerary. All content is bilingual with `{ en: "...", cn: "..." }` structure.
- `src/components/Layout.jsx` - Main layout with responsive nav and language toggle.

**Routes**:
- `/` - Home page
- `/itinerary` - Day-by-day itinerary
- `/info` - General information

**Bilingual Pattern**: All user-facing text uses conditional rendering based on `language` from LanguageContext. Data objects store both translations.
