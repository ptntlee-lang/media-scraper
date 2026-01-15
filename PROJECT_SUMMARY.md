# Media Scraper - Project Summary

## ✅ Implementation Complete

All requirements have been successfully implemented:

### 1. ✅ API that accepts array of Web URLs
- **Endpoint**: `POST /scrape`
- **Request Body**: `{ "urls": ["https://example.com", ...] }`
- **Implementation**: [backend/src/media/media.controller.ts](backend/src/media/media.controller.ts)

### 2. ✅ Scrape Image and Video URLs
- **Service**: [backend/src/media/scraper.service.ts](backend/src/media/scraper.service.ts)
- **Features**:
  - Extracts `<img>` tags
  - Extracts `<video>` and `<source>` tags
  - Extracts iframe embeds (YouTube, Vimeo, etc.)
  - Normalizes relative URLs
  - Captures alt text and titles

### 3. ✅ Store All Data in SQL Database
- **Database**: PostgreSQL
- **Entity**: [backend/src/media/entities/media.entity.ts](backend/src/media/entities/media.entity.ts)
- **Fields**:
  - `id`: Primary key
  - `sourceUrl`: Original page URL
  - `mediaUrl`: Image/video URL
  - `type`: 'image' or 'video'
  - `alt`: Alt text
  - `title`: Title attribute
  - `createdAt`: Timestamp
- **Indexes**: Type and sourceUrl for fast queries

### 4. ✅ Simple Web Page for Showing Images and Videos
- **Frontend**: Next.js 14 with App Router
- **Components**:
  - [MediaGallery](frontend/src/components/MediaGallery.tsx): Responsive grid layout
  - [UrlForm](frontend/src/components/UrlForm.tsx): Submit URLs
  - [Stats](frontend/src/components/Stats.tsx): Display statistics
  - [Filters](frontend/src/components/Filters.tsx): Search and filter
- **Features**:
  - Responsive grid (1-4 columns)
  - Image previews with fallback
  - Video indicators
  - Links to original media

### 5. ✅ Pagination and Filtering
- **Pagination**:
  - 20 items per page (configurable)
  - Previous/Next buttons
  - Current page indicator
- **Filtering**:
  - By type: All, Images, Videos
  - By search: Title, alt text, URLs
- **Implementation**: [backend/src/media/media.service.ts](backend/src/media/media.service.ts)

### 6. ✅ NestJS Backend + Next.js Frontend
- **Backend**: NestJS with TypeORM
  - Modular architecture
  - Dependency injection
  - Class validation
  - CORS enabled
- **Frontend**: Next.js 14
  - Server components
  - Client components for interactivity
  - TailwindCSS for styling
  - TypeScript for type safety

### 7. ✅ Dockerized with Docker Compose
- **Services**:
  - PostgreSQL (database)
  - Redis (queue)
  - Backend (NestJS API)
  - Frontend (Next.js UI)
- **Configuration**: [docker-compose.yml](docker-compose.yml)
- **Features**:
  - Health checks
  - Resource limits
  - Volume persistence
  - Automatic restart

### 8. ✅ Handle 5000 Concurrent Requests (1 CPU, 1GB RAM)
- **Queue System**: BullMQ with Redis
  - 50 concurrent workers
  - Job retry on failure
  - Memory-efficient processing
- **Optimizations**:
  - Connection pooling
  - Database indexing
  - Container resource limits
  - Redis memory policies
- **Load Test**: [backend/load-test.js](backend/load-test.js)
  - Simulates 5000+ requests
  - Measures throughput and latency
  - Verifies system stability

## 📁 Project Structure

```
media-scraper/
├── README.md                 # Project overview
├── SETUP.md                  # Detailed setup guide
├── docker-compose.yml        # Docker orchestration
├── start.sh                  # Quick start script
├── stop.sh                   # Stop script
│
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── main.ts          # Entry point
│   │   ├── app.module.ts    # Root module
│   │   └── media/
│   │       ├── media.controller.ts   # REST endpoints
│   │       ├── media.service.ts      # Business logic
│   │       ├── media.module.ts       # Module definition
│   │       ├── scraper.service.ts    # Web scraping
│   │       ├── scraping.processor.ts # Queue worker
│   │       ├── entities/
│   │       │   └── media.entity.ts   # Database model
│   │       └── dto/
│   │           └── media.dto.ts      # Data transfer objects
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── load-test.js         # Load testing script
│   └── .env                 # Environment variables
│
└── frontend/                # Next.js UI
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx     # Main page
    │   │   ├── layout.tsx   # Root layout
    │   │   └── globals.css  # Global styles
    │   └── components/
    │       ├── MediaGallery.tsx  # Media grid
    │       ├── UrlForm.tsx       # URL submission
    │       ├── Filters.tsx       # Search/filter
    │       └── Stats.tsx         # Statistics
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    ├── Dockerfile
    └── .env.local           # Environment variables
```

## 🚀 Quick Start

### Using Docker (Recommended)
```bash
# Make scripts executable
chmod +x start.sh stop.sh

# Start all services
./start.sh

# Or manually
docker-compose up -d
```

### Manual Setup
```bash
# Backend
cd backend && npm install && npm run start:dev

# Frontend (in new terminal)
cd frontend && npm install && npm run dev
```

## 📊 API Endpoints

### POST /scrape
Submit URLs for scraping
```bash
curl -X POST http://localhost:3001/scrape \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://example.com"]}'
```

### GET /media
Get scraped media with pagination and filtering
```bash
curl "http://localhost:3001/media?page=1&limit=20&type=image&search=cat"
```

### GET /stats
Get statistics
```bash
curl http://localhost:3001/stats
```

## 🧪 Load Testing

```bash
cd backend
npm install
npm run test:load
```

Expected results:
- ✅ Accepts 5000+ concurrent requests
- ✅ Response time < 1000ms for queuing
- ✅ No memory overflow
- ✅ Graceful handling of failures

## 🏗️ Architecture Highlights

### Backend
1. **Queue System**: BullMQ handles concurrent scraping
2. **Database**: PostgreSQL with TypeORM
3. **Scraping**: Cheerio for fast HTML parsing
4. **API**: RESTful endpoints with validation

### Frontend
1. **Framework**: Next.js 14 with App Router
2. **Styling**: TailwindCSS for responsive design
3. **State**: React hooks for client-side state
4. **API Client**: Axios for HTTP requests

### Infrastructure
1. **Docker**: Multi-stage builds for optimization
2. **Resource Limits**: 1 CPU, 1GB RAM total
3. **Health Checks**: Ensure service availability
4. **Persistence**: PostgreSQL volume for data

## 🔧 Performance Optimizations

1. **Queue Concurrency**: 50 parallel workers
2. **Database Indexing**: Type and URL indexes
3. **Memory Management**: Redis LRU eviction
4. **Connection Pooling**: Efficient DB connections
5. **Docker Optimization**: Multi-stage builds
6. **Async Processing**: Non-blocking scraping

## 📝 Notes

### Scraping Considerations
- Respects timeout (10s per page)
- Handles HTTP errors gracefully
- Normalizes relative URLs
- Filters invalid URLs (data:, .svg)
- Supports iframe embeds

### Scalability
- Horizontal: Add more workers
- Vertical: Increase memory/CPU
- Database: Add read replicas
- Cache: Add Redis caching

### Security
- Input validation with class-validator
- SQL injection protection via TypeORM
- CORS configuration
- Environment variables for secrets

## 🎯 Testing

### Manual Testing
1. Start services: `./start.sh`
2. Visit http://localhost:3000
3. Submit URLs for scraping
4. View gallery with filters

### Load Testing
```bash
cd backend
npm run test:load
```

### Production Testing
```bash
# Build for production
docker-compose -f docker-compose.yml up --build

# Check container resources
docker stats
```

## 🐛 Troubleshooting

See [SETUP.md](SETUP.md) for detailed troubleshooting steps.

Common issues:
- Port conflicts: Check if ports 3000, 3001, 5432, 6379 are available
- Docker not running: Start Docker Desktop
- Memory issues: Increase Docker memory limit
- Database connection: Check PostgreSQL logs

## 📚 Technologies Used

### Backend
- NestJS 10.3
- TypeORM 0.3
- PostgreSQL 15
- BullMQ 5.1
- Redis 7
- Cheerio 1.0
- Axios 1.6

### Frontend
- Next.js 14.1
- React 18.2
- TypeScript 5.3
- TailwindCSS 3.4

### DevOps
- Docker
- Docker Compose
- Autocannon (load testing)

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Project Status**: ✅ All requirements implemented and tested

**Last Updated**: January 15, 2026
