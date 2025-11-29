# Daily Research Agent for China Hiking Tour

A simple tool that helps you find images and hotel information for each day of your China hiking tour itinerary. No API keys required!

## What It Does

🔍 **Image Research**: Generates direct search links to Unsplash and Pexels for each day's activities
🖼️ **Visual Preview**: Creates interactive HTML pages with sample images to preview and select
🏨 **Hotel Research**: Finds TripAdvisor and booking.com links for accommodations
📝 **Accessibility**: Suggests appropriate alt text for images
✅ **Image Selection**: Interactive checkboxes to select preferred images
💾 **Export Options**: Download selected images or generate JSON for your itinerary

## How to Use

### 1. Run the Agent

```bash
# Interactive mode - will ask which day to research
node daily-research-agent.js

# Or specify a day directly (1-15)
node daily-research-agent.js 3

# Show help
node daily-research-agent.js --help
```

### 2. Review the Output

The agent will display:
- **Activity Image Searches**: Direct links to Unsplash and Pexels for each activity
- **Suggested Alt Text**: 3 options for accessibility
- **Hotel Research**: TripAdvisor and booking links
- **Additional Searches**: Location-based searches for establishing shots

### 3. Download Images

1. Click on the provided search links
2. Browse through the images
3. Right-click and "Save Image As..." for suitable images
4. Use the suggested alt text (or modify as needed)

### 4. Update Your Itinerary

Once you have images downloaded, you can update your `china-hiking-tour/src/data/itineraryData.js` file with the new image URLs and alt text.

## Example Output

```
🔍 Researching Day 3: Terracotta Warriors & Daming Palace
📍 Location: Xi'an
🎯 Activities: Terracotta Warriors Museum, Daming Palace Heritage Park
🏨 Accommodation: Eastern House Xi'an

📸 Generating image search queries...
  - UNSPLASH: "Terracotta Warriors Museum in Xi'an"
  - PEXELS: "Terracotta Warriors Museum in Xi'an"
  - UNSPLASH: "大明宫国家遗址公园 in 西安"

📋 RESEARCH RESULTS - Day 3
============================================================

🎯 ACTIVITY IMAGE SEARCHES:

1. Activity: Terracotta Warriors Museum in Xi'an
   Suggested Alt Text:
     1. "Terracotta Warriors Museum in Xi'an, China"
     2. "Travel photography of Terracotta Warriors Museum in Xi'an"
     3. "Terracotta Warriors tourist attraction in Xi'an"
   Search Links:
     1. Search "Terracotta Warriors Museum in Xi'an" on Unsplash
        URL: https://unsplash.com/s/photos/Terracotta%20Warriors%20Museum%20Xi'an
        High-quality travel and landscape photography
```

## Saved Research Results

Research results are automatically saved to the `research-output/` directory:

```
research-output/
├── day-1-research.json
├── day-2-research.json
├── day-3-research.json
└── ...
```

Each file contains:
- Complete search queries and results
- Suggested alt text
- Hotel research links
- Timestamp of when research was conducted

## Workflow Suggestions

### Option 1: Day-by-Day Research
Run the agent for each day sequentially (1-15) to build your complete image library:

```bash
for day in {1..15}; do
  echo $day | node daily-research-agent.js
  echo "Press Enter to continue to next day..."
  read
done
```

### Option 2: Batch Research First
Run research for all days first, then spend time reviewing and downloading images:

```bash
for day in {1..15}; do
  echo $day | node daily-research-agent.js >/dev/null 2>&1
done
echo "All days researched! Check research-output/ directory."
```

### Option 3: Priority Research
Focus on key days first (major attractions like Great Wall, Terracotta Warriors, Mount Tai):

```bash
# Key attractions
node daily-research-agent.js 3  # Terracotta Warriors
node daily-research-agent.js 6  # Great Wall
node daily-research-agent.js 13 # Mount Tai
```

## Image Selection Tips

### Quality Considerations
- Choose high-resolution images (at least 1920x1080)
- Look for good lighting and clear subjects
- Avoid images with watermarks or obvious signs of being staged
- Prioritize images that show the scale and grandeur of locations

### Diversity
- Include both wide shots and detail shots
- Mix landscape orientation with some portrait shots
- Include images with people for scale where appropriate
- Get different weather/seasonal conditions if available

### Cultural Sensitivity
- Ensure images respectfully represent Chinese culture
- Avoid stereotypes or overly touristy shots
- Choose images that match the authentic experience you want to convey

## Alt Text Guidelines

The agent suggests alt text following these patterns:
1. **Descriptive**: "[Activity] in [Location], China"
2. **Photography style**: "Travel photography of [Activity] in [Location]"
3. **Tourism focus**: "[Activity] tourist attraction in [Location]"

You should customize alt text to:
- Include specific details visible in the image
- Mention colors, weather, time of day if relevant
- Keep descriptions concise but informative

## Hotel Research Tips

- Check TripAdvisor for recent reviews and ratings
- Verify hotel details on booking.com or other travel sites
- Look for images of the actual hotel, not just promotional shots
- Note the hotel's proximity to planned activities

## Integration with Existing Code

Your existing `itineraryData.js` structure is already set up for the images you'll find:

```javascript
images: [
    {
        src: "https://images.unsplash.com/photo-...", // Your new image URL
        alt: { en: "Terracotta Warriors", cn: "兵马俑" }, // Alt text
        caption: { en: "The awe-inspiring Terracotta Army", cn: "令人敬畏的兵马俑军阵" }
    }
]
```

## Troubleshooting

### Common Issues

**"Module type of file is not specified" Warning**
- This is just a warning, the tool still works
- You can ignore it or add `"type": "module"` to package.json if needed

**Search Links Don't Work**
- Copy and paste the URLs manually into your browser
- Some special characters might not encode perfectly in terminal display

**No Images Found for Certain Activities**
- Try the additional recommended searches provided
- Modify search terms to be more general (e.g., "mountain" instead of specific trail names)
- Try searching in Chinese using the suggested terms

## Next Steps After Research

1. **Download Images**: Right-click and save your chosen images
2. **Host Images**: Upload to your preferred image hosting service
3. **Update Data**: Add new image URLs to `itineraryData.js`
4. **Test Display**: Check that images display correctly in your React app
5. **Review Accessibility**: Test that alt text works properly with screen readers

## Alternative Tools

If you prefer a more automated approach, you could also consider:

- **Manual Search**: Direct browsing on Unsplash, Pexels, Pixabay
- **Stock Photo Services**: Shutterstock, Getty Images (if budget allows)
- **Local Photography**: If you have existing photos from these locations

The research agent is designed to be simple and accessible, requiring no setup or API keys while providing structured research for each day of your tour.

## 🌟 New HTML Interactive Features

### What Gets Generated

When you run the agent for any day, it creates two files:

1. **`day-X-research.json`** - Raw research data
2. **`day-X-research.html`** - Interactive preview page

### HTML Page Features

🖼️ **Visual Preview**:
- Sample images for each activity
- Professional grid layout with hover effects
- High-quality previews from Unsplash/Pexels

✅ **Image Selection**:
- Interactive checkboxes for each image
- Real-time selection counter
- "Download Selected" button to download all chosen images

📝 **Accessibility Ready**:
- Pre-written alt text for each image
- Copy-paste ready for screen readers
- Multiple options per image

🔗 **Quick Search Links**:
- Direct Unsplash and Pexels search links
- Chinese language searches included
- TripAdvisor and booking.com hotel links

💾 **Export Options**:
- **Download Selected**: Download all selected images as files
- **Generate JSON**: Export selections in proper format for your itinerary

### How to Use the HTML Interface

1. **Open the HTML file** in your browser
2. **Browse images** for each activity section
3. **Select images** by checking the boxes you like
4. **Click "Download Selected"** to download your chosen images
5. **Click "Generate JSON"** to get properly formatted data
6. **Copy alt text** from the suggested options
7. **Use search links** to find more image options if needed

### Example HTML Workflow

```
🔍 Research Day 5 (Forbidden City)
   ↓
🌐 Open day-5-research.html in browser
   ↓
🖼️ Browse Forbidden City and Fragrant Hills images
   ↓
✅ Select 3 images you like best
   ↓
💾 Click "Download Selected" → Downloads 3 image files
   ↓
📄 Click "Generate JSON" → Creates ready-to-use data
   ↓
📝 Copy alt text suggestions
   ↓
🔄 Update your itineraryData.js with new images and alt text
```

### File Output Example

After running the agent, you'll see:

```
💾 Research results saved to:
   📄 JSON: research-output/day-5-research.json
   🌐 HTML: research-output/day-5-research.html

🚀 Open the HTML file in your browser to review and select images!
```