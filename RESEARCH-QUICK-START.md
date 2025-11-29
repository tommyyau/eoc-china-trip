# 🚀 Quick Start Guide - Daily Research Agent

## Easy Ways to Research

### 🔍 Research Single Day
```bash
./research-day.sh 1    # Day 1 - Arrival in Xi'an
./research-day.sh 5    # Day 5 - Forbidden City
./research-day.sh 6    # Day 6 - Great Wall
./research-day.sh 13   # Day 13 - Mount Tai
```

### 📊 Research All Days at Once
```bash
./research-all.sh    # Creates HTML pages for all 15 days
```

## 🌐 What You Get

Each day creates:
- **HTML file**: Interactive preview page (e.g., `day-1-research.html`)
- **JSON file**: Raw research data (e.g., `day-1-research.json`)

## 🎯 How to Use the HTML Pages

1. **Open the HTML file**:
   ```bash
   open research-output/day-1-research.html  # Mac
   # or double-click the file in your file explorer
   ```

2. **Browse images**: See sample photos for each activity
3. **Select favorites**: Check boxes next to images you like
4. **Download**: Click "Download Selected" button
5. **Export data**: Click "Generate JSON" for your website

## 📂 File Structure

```
research-output/
├── day-1-research.html   # Day 1 - Interactive preview
├── day-2-research.html   # Day 2 - Interactive preview
├── day-3-research.html   # Day 3 - Terracotta Warriors
├── day-5-research.html   # Day 5 - Forbidden City
├── day-6-research.html   # Day 6 - Great Wall
├── day-13-research.html  # Day 13 - Mount Tai
└── ... (all 15 days)
```

## 🎨 Key Days to Research First

**Must-have attractions:**
- **Day 3**: Terracotta Warriors
- **Day 5**: Forbidden City
- **Day 6**: Great Wall
- **Day 13**: Mount Tai
- **Day 8**: Lushan Mountain summit
- **Day 14**: Confucius sites

**Scenic highlights:**
- **Day 2**: Xi'an City Wall
- **Day 7**: Lushan cable cars & architecture
- **Day 10**: Wuyuan countryside
- **Day 11**: Wangxian Valley night views

## 🔧 Alternative Usage

### Direct Node.js (Advanced)
```bash
# Interactive mode (will ask for day number)
node daily-research-agent.js

# Direct mode with day number
echo "5" | node daily-research-agent.js
```

### Manual HTML Opening
After running research, open HTML files directly:
```bash
# Mac
open research-output/day-5-research.html

# Windows
start research-output/day-5-research.html

# Linux
xdg-open research-output/day-5-research.html
```

## 💡 Pro Tips

1. **Start with key days**: Research major attractions first (Days 3, 5, 6, 13)
2. **Use the HTML interface**: Much easier than clicking search links manually
3. **Batch research**: Run `./research-all.sh` overnight to generate all pages
4. **Alt text ready**: Copy-paste accessibility descriptions from HTML
5. **Hotel info**: Use TripAdvisor links for accommodation details

## 🆘 Troubleshooting

**Module warning?** Ignore it - the tool still works perfectly.

**HTML not opening?** Check that `research-output/` directory was created.

**No images found?** Use the additional search links provided in the HTML page.

---

**Ready to build your China hiking tour image library! 🎉**