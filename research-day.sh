#!/bin/bash

# Simple wrapper script to run the research agent for a specific day

if [ $# -eq 0 ]; then
    echo "Usage: ./research-day.sh <day-number>"
    echo "Example: ./research-day.sh 1"
    echo ""
    echo "Available days: 1-15"
    exit 1
fi

day=$1

# Validate day number
if ! [[ "$day" =~ ^[1-9]|1[0-5]$ ]]; then
    echo "❌ Invalid day number: $day"
    echo "Please enter a number between 1 and 15"
    exit 1
fi

echo "🔍 Researching Day $day..."
node daily-research-agent.js $day