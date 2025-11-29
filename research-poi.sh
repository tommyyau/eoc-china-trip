#!/bin/bash

# POI Research Agent wrapper script
# Usage: ./research-poi.sh <day>
# Example: ./research-poi.sh 3
# Example: ./research-poi.sh all

if [ -z "$1" ]; then
    echo "Usage: ./research-poi.sh <day>"
    echo "       ./research-poi.sh all"
    echo ""
    echo "Examples:"
    echo "  ./research-poi.sh 3     # Research POIs for day 3"
    echo "  ./research-poi.sh all   # Research POIs for all days"
    exit 1
fi

echo "🏛️  Starting POI Research Agent..."
echo ""

node poi-research-agent.js "$1"
