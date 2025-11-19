#!/bin/bash

echo "Starting DobryPrivat scraper..."
echo "This will scrape all profiles from dobryprivat.cz"
echo ""

cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "../node_modules" ]; then
    echo "Installing dependencies..."
    cd ..
    npm install
    cd scrapers
fi

# Run the scraper
npx tsx dobryprivat-scraper.ts

echo ""
echo "Scraping complete! Check ./scraped-dobryprivat/ for results"
