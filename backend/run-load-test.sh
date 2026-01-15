#!/bin/bash

echo "🧪 Media Scraper - Comprehensive Load Test"
echo "=========================================="
echo ""

# Check if services are running
echo "Checking if services are running..."
if ! curl -s http://localhost:3001/stats > /dev/null; then
    echo "❌ Backend is not running. Please start with: docker-compose up"
    exit 1
fi

echo "✅ Backend is running"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run the load test
echo "Starting load test..."
echo ""
node load-test.js

echo ""
echo "🎯 Load test completed!"
echo ""
echo "Check the results above to verify:"
echo "  - API can accept 5000+ concurrent requests"
echo "  - Response times are acceptable (<1000ms for queuing)"
echo "  - No errors or timeouts"
echo "  - Memory usage stays within limits"
