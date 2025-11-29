#!/bin/bash

# Batch research all days with simple image research

echo "🚀 Starting simple research for all 15 days..."
echo "This will create direct links that work without redirects."
echo ""

# Check if simple-image-research.js exists
if [ ! -f "simple-image-research.js" ]; then
    echo "❌ simple-image-research.js not found in current directory"
    exit 1
fi

# Research each day
for day in {1..15}; do
    echo "📅 Researching Day $day..."
    node simple-image-research.js $day > /dev/null 2>&1

    # Check if results were created
    outputFile="simple-research-output/day-$day-simple-research.json"
    if [ -f "$outputFile" ]; then
        echo "✅ Day $day complete: $outputFile"
    else
        echo "❌ Day $day failed - output file not created"
    fi

    sleep 1  # Brief pause between requests
done

echo ""
echo "🎉 Batch research complete!"
echo ""
echo "📁 Generated files:"
ls -1 simple-research-output/*.json | while read file; do
    echo "📄 $file"
done
echo ""
echo "💡 Each file contains direct Unsplash and Pexels links that work!"
echo "💡 Example usage: node simple-image-research.js 5"