#!/bin/bash

echo "🛑 Stopping Media Scraper Services"
echo "=================================="
echo ""

docker-compose down

echo ""
echo "✅ Services stopped"
echo ""
echo "To remove all data (including database):"
echo "  docker-compose down -v"
