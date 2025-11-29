# Task: Multi-Trip Management Feature

## Goal
Add the ability to save, load, and manage multiple trip ideas/plans in the content manager.

## Plan

### Todo Items
- [ ] Update storage.js to support multiple saved trips
  - Add functions: `getSavedTrips()`, `saveCurrentAs(name)`, `loadTrip(id)`, `deleteTrip(id)`, `renameTrip(id, name)`
  - Each saved trip has: id, name, createdAt, lastModified, data (the full itinerary)
  - Keep existing storage key for backwards compatibility

- [ ] Add a "Saved Trips" card section to Dashboard
  - Show list of saved trips with name, date modified
  - Buttons: Load, Rename, Delete
  - "Save Current As..." button to save current work
  - "Clear Current" button to reset current trip

- [ ] Add visual indicator showing which trip is currently loaded (if any)

## Notes
- Keep it simple - just localStorage based
- No complex UI - just a card section on Dashboard
