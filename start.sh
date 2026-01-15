
#!/bin/bash

echo "🚀 Starting Media Scraper Services"
echo "=================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Build frontend first to catch image-specific errors early
echo "Building frontend image (no cache)..."
if ! docker compose build --no-cache frontend; then
    echo "❌ Frontend build failed. See logs below."
    docker compose logs --tail=200 frontend
    exit 1
fi

echo "Starting all services..."
if ! docker compose up -d --build; then
    echo "❌ docker compose up failed. See recent logs:"
    docker compose logs --tail=200
    exit 1
fi

echo ""
echo "⏳ Waiting for services to be ready..."

# Poll service endpoints with timeout
timeout=60
interval=3
elapsed=0
backend_ok=0
frontend_ok=0

while [ $elapsed -lt $timeout ]; do
    if [ $backend_ok -eq 0 ]; then
        if curl -s http://localhost:3001/stats > /dev/null; then
            backend_ok=1
            echo "✅ Backend is running at http://localhost:3001"
        fi
    fi

    if [ $frontend_ok -eq 0 ]; then
        if curl -s http://localhost:3000 > /dev/null; then
            frontend_ok=1
            echo "✅ Frontend is running at http://localhost:3000"
        fi
    fi

    if [ $backend_ok -eq 1 ] && [ $frontend_ok -eq 1 ]; then
        break
    fi

    sleep $interval
    elapsed=$((elapsed + interval))
done

if [ $backend_ok -ne 1 ] || [ $frontend_ok -ne 1 ]; then
    echo "\n❌ One or more services failed to respond within ${timeout}s. Showing logs..."
    if [ $backend_ok -ne 1 ]; then
        echo "\n--- Backend logs ---"
        docker compose logs --tail=200 backend
    fi
    if [ $frontend_ok -ne 1 ]; then
        echo "\n--- Frontend logs ---"
        docker compose logs --tail=200 frontend
    fi
    exit 1
fi

echo ""
echo "=================================="
echo "🎉 Services started!"
echo ""
echo "Access the application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo ""
echo "View logs:"
echo "  docker-compose logs -f"
echo ""
echo "Stop services:"
echo "  docker-compose down"
echo "=================================="
