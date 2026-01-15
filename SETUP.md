# Quick Start Guide

## Prerequisites
- Docker & Docker Compose installed
- At least 1GB RAM available

## Installation & Running

### Option 1: Using Docker Compose (Recommended)

```bash
# Clone or navigate to the project directory
cd media-scraper

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Option 2: Manual Development Setup

#### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Make sure PostgreSQL and Redis are running
# Update .env with your database credentials

# Start development server
npm run start:dev
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Usage

### 1. Submit URLs for Scraping

Visit http://localhost:3000 and enter URLs to scrape (one per line):
```
https://example.com
https://unsplash.com
https://pexels.com
```

### 2. View Scraped Media

The gallery will display all scraped images and videos with:
- Pagination (20 items per page)
- Type filtering (Images/Videos)
- Search functionality
- Source URL information

### 3. API Endpoints

#### POST /scrape
Submit URLs for scraping
```bash
curl -X POST http://localhost:3001/scrape \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://example.com"]}'
```

#### GET /media
Get scraped media with pagination
```bash
curl "http://localhost:3001/media?page=1&limit=20&type=image&search=cat"
```

#### GET /stats
Get statistics
```bash
curl http://localhost:3001/stats
```

## Load Testing

```bash
cd backend

# Install dependencies
npm install

# Run load test (make sure services are running)
npm run test:load

# Or use the shell script
chmod +x run-load-test.sh
./run-load-test.sh
```

The load test will:
- Simulate 5000+ concurrent scraping requests
- Measure response times and throughput
- Verify the system handles load with 1 CPU and 1GB RAM

## Performance Optimization

The system is optimized for low resources:

1. **Queue System**: BullMQ with Redis handles concurrent requests
2. **Worker Concurrency**: 50 parallel workers for scraping
3. **Database Indexing**: Optimized queries with indexes
4. **Memory Limits**: Docker containers have resource constraints
5. **Connection Pooling**: Efficient database connections

## Troubleshooting

### Services not starting
```bash
# Check if ports are available
lsof -i :3000
lsof -i :3001
lsof -i :5432
lsof -i :6379

# Restart services
docker-compose restart
```

### Database connection issues
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Frontend can't connect to backend
- Check NEXT_PUBLIC_API_URL in frontend/.env.local
- Ensure backend is running on port 3001
- Check CORS settings in backend

### Memory issues
```bash
# Check container resource usage
docker stats

# Adjust memory limits in docker-compose.yml if needed
```

## Architecture

```
┌─────────────┐
│   Next.js   │  Frontend (Port 3000)
│  Frontend   │
└──────┬──────┘
       │
       │ HTTP
       │
┌──────▼──────┐
│   NestJS    │  Backend API (Port 3001)
│   Backend   │
└──────┬──────┘
       │
       ├──────► PostgreSQL (Port 5432) - Media Storage
       │
       └──────► Redis (Port 6379) - Queue System
```

## Tech Stack Details

### Backend
- **NestJS**: Enterprise-grade Node.js framework
- **TypeORM**: Database ORM with PostgreSQL
- **BullMQ**: Distributed job queue
- **Cheerio**: Fast HTML parsing
- **Axios**: HTTP client for fetching pages

### Frontend
- **Next.js 14**: React framework with App Router
- **TailwindCSS**: Utility-first CSS
- **TypeScript**: Type safety

### Infrastructure
- **PostgreSQL**: Relational database
- **Redis**: In-memory data store for queuing
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration

## Development Tips

### Hot Reload
Both frontend and backend support hot reload in development mode:
```bash
# Backend
cd backend && npm run start:dev

# Frontend
cd frontend && npm run dev
```

### Database Migrations
```bash
cd backend

# Generate migration
npm run typeorm migration:generate -- -n MigrationName

# Run migrations
npm run typeorm migration:run
```

### Adding New Features
1. Backend: Add new endpoints in `backend/src/media/`
2. Frontend: Add new components in `frontend/src/components/`
3. Update types in respective `*.dto.ts` files

## License
MIT
