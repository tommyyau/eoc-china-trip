# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## General Rules

1. **First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md**
2. **The plan should have a list of todo items that you can check off as you complete them**
3. **Before you begin working, check in with me and I will verify the plan.**
4. **Then, begin working on the todo items, marking them as complete as you go.**
5. **Please every step of the way just give me a high level explanation of what changes you made**
6. **Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.**
7. **Finally, add a review section to the todo.md file with a summary of the changes you made and any other relevant information.**
8. **DO NOT BE LAZY. NEVER BE LAZY. IF THERE IS A BUG FIND THE ROOT CAUSE AND FIX IT. NO TEMPORARY FIXES. YOU ARE A SENIOR DEVELOPER. NEVER BE LAZY**
9. **MAKE ALL FIXES AND CODE CHANGES AS SIMPLE AS HUMANLY POSSIBLE. THEY SHOULD ONLY IMPACT NECESSARY CODE RELEVANT TO THE TASK AND NOTHING ELSE. IT SHOULD IMPACT AS LITTLE CODE AS POSSIBLE. YOUR GOAL IS TO NOT INTRODUCE ANY BUGS. IT'S ALL ABOUT SIMPLICITY**

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
