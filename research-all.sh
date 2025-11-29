#!/bin/bash

# Script to research all days for the China Hiking Tour

echo "🚀 Starting batch research for all 15 days..."
echo "This will create HTML preview pages for every day."
echo ""

# Check if node daily-research-agent.js exists
if [ ! -f "daily-research-agent.js" ]; then
    echo "❌ daily-research-agent.js not found in current directory"
    exit 1
fi

# Research each day
for day in {1..15}; do
    echo ""
    echo "📅 Researching Day $day..."
    node daily-research-agent.js $day 2>/dev/null

    # Check if HTML file was created
    html_file="research-output/day-$day-research.html"
    if [ -f "$html_file" ]; then
        echo "✅ Day $day complete"
    else
        echo "❌ Day $day failed - HTML file not created"
    fi

    sleep 2  # Brief pause between API requests
done

echo ""
echo "🎉 Batch research complete!"
echo ""
echo "📁 Generated files:"
ls -1 research-output/*.html | while read file; do
    echo "🌐 $file"
done
echo ""
echo "💡 Open any HTML file in your browser to review and select images!"
echo "Example: open research-output/day-1-research.html"