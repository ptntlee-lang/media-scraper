# Media Scraper

A high-performance web scraping application that extracts images and videos from URLs, stores them in a database, and displays them in a paginated gallery.

## Features

- **Bulk URL Processing**: Accept multiple URLs via API
- **Media Extraction**: Scrapes images and videos from web pages
- **Database Storage**: PostgreSQL for reliable data persistence
- **Responsive Gallery**: Next.js frontend with pagination and filtering
- **High Concurrency**: Handles 5000+ concurrent requests with BullMQ queue
- **Dockerized**: Complete Docker Compose setup

## Tech Stack

- **Backend**: NestJS, TypeORM, PostgreSQL, BullMQ, Redis
- **Frontend**: Next.js 14, React, TailwindCSS
- **Scraping**: Cheerio, Axios
- **Infrastructure**: Docker, Docker Compose

## Quick Start

```bash
# Start all services
docker-compose up -d

# Backend will be available at: http://localhost:3001
# Frontend will be available at: http://localhost:3000
```

## API Endpoints

### POST /scrape
Submit URLs for scraping
```json
{
  "urls": ["https://example.com", "https://example2.com"]
}
```

### GET /media
Get scraped media with pagination and filtering
```
Query params:
- page: number (default: 1)
- limit: number (default: 20)
- type: 'image' | 'video' (optional)
- search: string (optional)
```

## Load Testing

```bash
cd backend
npm run test:load
```

This will simulate 5000 concurrent scraping requests.

## System Requirements

- Docker & Docker Compose
- 1 CPU, 1GB RAM (minimum)

## Project Structure

```
media-scraper/
├── backend/          # NestJS API
├── frontend/         # Next.js UI
└── docker-compose.yml
```
