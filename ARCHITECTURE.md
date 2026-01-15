# Media Scraper - Visual Architecture Guide

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│                      http://localhost:3000                      │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ HTTP Requests
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS FRONTEND (Port 3000)                 │
├─────────────────────────────────────────────────────────────────┤
│  Components:                                                     │
│  • UrlForm.tsx         - Submit URLs for scraping               │
│  • MediaGallery.tsx    - Display images/videos in grid          │
│  • Filters.tsx         - Search and type filtering              │
│  • Stats.tsx           - Show statistics dashboard              │
│                                                                  │
│  Features:                                                       │
│  ✓ Responsive design (mobile, tablet, desktop)                  │
│  ✓ Pagination (20 items per page)                               │
│  ✓ Real-time search                                             │
│  ✓ Type filtering (images/videos)                               │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ REST API Calls
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NESTJS BACKEND (Port 3001)                   │
├─────────────────────────────────────────────────────────────────┤
│  API Endpoints:                                                  │
│  • POST /scrape        - Submit URLs for scraping               │
│  • GET  /media         - Get scraped media (paginated)          │
│  • GET  /stats         - Get statistics                         │
│                                                                  │
│  Services:                                                       │
│  • MediaService        - Business logic                         │
│  • ScraperService      - Web scraping with Cheerio              │
│  • ScrapingProcessor   - Queue worker (50 concurrent)           │
│                                                                  │
│  Features:                                                       │
│  ✓ Input validation with class-validator                        │
│  ✓ Error handling and logging                                   │
│  ✓ CORS enabled for frontend                                    │
│  ✓ TypeORM for database operations                              │
└────────┬──────────────────────────┬─────────────────────────────┘
         │                          │
         │                          │
         ▼                          ▼
┌──────────────────┐      ┌──────────────────────┐
│  POSTGRESQL DB   │      │    REDIS QUEUE       │
│   (Port 5432)    │      │    (Port 6379)       │
├──────────────────┤      ├──────────────────────┤
│                  │      │                      │
│  Media Table:    │      │  BullMQ Queue:       │
│  • id            │      │  • Job queue         │
│  • sourceUrl     │      │  • 50 workers        │
│  • mediaUrl      │      │  • Retry logic       │
│  • type          │      │  • Job tracking      │
│  • alt           │      │                      │
│  • title         │      │  Memory:             │
│  • createdAt     │      │  • 256MB limit       │
│                  │      │  • LRU eviction      │
│  Indexes:        │      │                      │
│  • type          │      │  Performance:        │
│  • sourceUrl     │      │  • 5000+ jobs/sec    │
│                  │      │  • Async processing  │
└──────────────────┘      └──────────────────────┘
```

## 🔄 Data Flow

### 1. Scraping Flow
```
User submits URLs
       ↓
Frontend (POST /scrape)
       ↓
Backend validates URLs
       ↓
Jobs added to Redis Queue
       ↓
50 Workers process jobs in parallel
       ↓
ScraperService fetches & parses HTML
       ↓
Media extracted (images, videos)
       ↓
Data saved to PostgreSQL
       ↓
User refreshes to see results
```

### 2. Display Flow
```
User opens gallery
       ↓
Frontend (GET /media?page=1&limit=20)
       ↓
Backend queries PostgreSQL
       ↓
Results returned (paginated)
       ↓
Frontend displays in grid
       ↓
User can filter/search/paginate
```

## 📦 Container Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     DOCKER COMPOSE                          │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐
│    Frontend      │  │    Backend       │  │  PostgreSQL  │
│   Container      │  │   Container      │  │  Container   │
├──────────────────┤  ├──────────────────┤  ├──────────────┤
│ Node:18-alpine   │  │ Node:18-alpine   │  │ Postgres:15  │
│ Next.js app      │  │ NestJS app       │  │              │
│ Port: 3000       │  │ Port: 3001       │  │ Port: 5432   │
│                  │  │                  │  │              │
│ Resources:       │  │ Resources:       │  │ Resources:   │
│ CPU: 0.3 core    │  │ CPU: 0.5 core    │  │ Shared       │
│ RAM: 256MB       │  │ RAM: 512MB       │  │ Volume data  │
└──────────────────┘  └──────────────────┘  └──────────────┘

                    ┌──────────────────┐
                    │     Redis        │
                    │   Container      │
                    ├──────────────────┤
                    │ Redis:7-alpine   │
                    │                  │
                    │ Port: 6379       │
                    │                  │
                    │ Resources:       │
                    │ MaxMemory: 256MB │
                    │ Policy: LRU      │
                    └──────────────────┘

Total Resource Usage: 1 CPU, ~1GB RAM
```

## 🎯 Request Processing

### High Concurrency Handling (5000 Requests)
```
┌────────────────┐
│ 5000 Requests  │
│ arrive at once │
└───────┬────────┘
        │
        ▼
┌────────────────────────────────────┐
│   NestJS accepts all immediately   │
│   (Async, non-blocking)            │
└───────┬────────────────────────────┘
        │
        ▼
┌────────────────────────────────────┐
│  All jobs added to Redis Queue     │
│  (In-memory, very fast)            │
└───────┬────────────────────────────┘
        │
        ▼
┌────────────────────────────────────┐
│  50 Workers process in parallel    │
│  (Prevents memory overflow)        │
└───────┬────────────────────────────┘
        │
        ├──► Worker 1: Scraping URL 1
        ├──► Worker 2: Scraping URL 2
        ├──► Worker 3: Scraping URL 3
        │    ... (47 more workers)
        └──► Worker 50: Scraping URL 50
                │
                ▼
        ┌────────────────────┐
        │  Results saved to  │
        │  PostgreSQL        │
        └────────────────────┘
```

## 🔍 Component Details

### Backend Structure
```
backend/src/
│
├── main.ts (Entry Point)
│   • Bootstrap NestJS app
│   • Enable CORS
│   • Set up validation pipes
│   • Listen on port 3001
│
├── app.module.ts (Root Module)
│   • Configure TypeORM (PostgreSQL)
│   • Configure BullMQ (Redis)
│   • Import MediaModule
│
└── media/ (Feature Module)
    │
    ├── media.controller.ts
    │   • POST /scrape
    │   • GET /media
    │   • GET /stats
    │
    ├── media.service.ts
    │   • queueScraping() - Add jobs to queue
    │   • getMedia() - Query with pagination
    │   • getStats() - Count statistics
    │
    ├── scraper.service.ts
    │   • scrapeUrl() - Fetch & parse HTML
    │   • Extract images from <img>
    │   • Extract videos from <video>
    │   • Extract iframe embeds
    │   • Normalize URLs
    │
    ├── scraping.processor.ts
    │   • BullMQ Worker
    │   • Process jobs from queue
    │   • Call scraper service
    │   • Save results to DB
    │
    ├── entities/media.entity.ts
    │   • TypeORM entity
    │   • Database schema
    │   • Indexes for performance
    │
    └── dto/media.dto.ts
        • Request validation
        • Response types
```

### Frontend Structure
```
frontend/src/
│
├── app/
│   ├── layout.tsx (Root Layout)
│   │   • HTML structure
│   │   • Global styles
│   │   • Metadata
│   │
│   ├── page.tsx (Main Page)
│   │   • State management
│   │   • API calls
│   │   • Component orchestration
│   │
│   └── globals.css
│       • TailwindCSS imports
│
└── components/
    │
    ├── UrlForm.tsx
    │   • Multi-line textarea
    │   • URL validation
    │   • Submit handler
    │
    ├── MediaGallery.tsx
    │   • Responsive grid
    │   • Image/video cards
    │   • Lazy loading
    │   • Error fallbacks
    │
    ├── Filters.tsx
    │   • Search input
    │   • Type dropdown
    │   • Filter state
    │
    └── Stats.tsx
        • Total count
        • Images count
        • Videos count
```

## 📊 Database Schema

```
┌─────────────────────────────────────────┐
│              media table                │
├──────────────┬──────────────────────────┤
│ Column       │ Type                     │
├──────────────┼──────────────────────────┤
│ id           │ SERIAL PRIMARY KEY       │
│ sourceUrl    │ VARCHAR (indexed)        │
│ mediaUrl     │ VARCHAR                  │
│ type         │ ENUM('image','video')    │
│              │      (indexed)           │
│ alt          │ VARCHAR (nullable)       │
│ title        │ VARCHAR (nullable)       │
│ createdAt    │ TIMESTAMP                │
└──────────────┴──────────────────────────┘

Indexes:
• PRIMARY KEY (id)
• INDEX idx_type (type)
• INDEX idx_source (sourceUrl)

Example row:
{
  id: 1,
  sourceUrl: "https://example.com",
  mediaUrl: "https://example.com/image.jpg",
  type: "image",
  alt: "Example image",
  title: "Sample",
  createdAt: "2026-01-15T10:30:00Z"
}
```

## 🚀 Deployment Diagram

```
Developer's Machine
        │
        ├─ docker-compose up
        │
        ▼
┌─────────────────────────────────────┐
│   Docker Engine                     │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │ Frontend │  │ Backend  │       │
│  │ :3000    │◄─┤ :3001    │       │
│  └──────────┘  └────┬─────┘       │
│                     │              │
│  ┌──────────┐  ┌───▼──────┐       │
│  │  Redis   │◄─┤PostgreSQL│       │
│  │  :6379   │  │  :5432   │       │
│  └──────────┘  └──────────┘       │
│                                     │
└─────────────────────────────────────┘
        │
        ├─ Expose ports to host
        │
        ▼
┌─────────────────────────────────────┐
│   Host Machine (localhost)          │
├─────────────────────────────────────┤
│  :3000 → Frontend                   │
│  :3001 → Backend API                │
│  :5432 → PostgreSQL (optional)      │
│  :6379 → Redis (optional)           │
└─────────────────────────────────────┘
```

## 🔐 Security Layers

```
┌─────────────────────────────────────┐
│         Security Measures           │
├─────────────────────────────────────┤
│                                     │
│  1. Input Validation                │
│     └─ class-validator (backend)    │
│                                     │
│  2. SQL Injection Prevention        │
│     └─ TypeORM parameterized        │
│                                     │
│  3. CORS Protection                 │
│     └─ Only allow frontend origin   │
│                                     │
│  4. Environment Variables           │
│     └─ No hardcoded secrets         │
│                                     │
│  5. Docker Isolation                │
│     └─ Containerized services       │
│                                     │
│  6. Resource Limits                 │
│     └─ Prevent DoS attacks          │
│                                     │
└─────────────────────────────────────┘
```

## 📈 Performance Optimization

```
┌─────────────────────────────────────┐
│     Performance Features            │
├─────────────────────────────────────┤
│                                     │
│  ✓ Database Indexing                │
│    → Fast queries on type & URL     │
│                                     │
│  ✓ Connection Pooling               │
│    → Reuse DB connections           │
│                                     │
│  ✓ Queue System                     │
│    → Async processing               │
│                                     │
│  ✓ Worker Concurrency               │
│    → 50 parallel workers            │
│                                     │
│  ✓ Redis Caching                    │
│    → In-memory queue                │
│                                     │
│  ✓ Frontend Optimization            │
│    → Lazy loading images            │
│    → Pagination (20 items)          │
│                                     │
│  ✓ Docker Multi-stage Build         │
│    → Smaller images                 │
│                                     │
└─────────────────────────────────────┘
```

---

This visual guide provides a comprehensive understanding of the Media Scraper architecture, making it easy to understand how all components work together!
