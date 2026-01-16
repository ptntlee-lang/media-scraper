# Backend (NestJS)

This backend exposes scraping and media APIs. Swagger UI is available when the server is running.

## Quick Start

```bash
cd backend
npm install
npm run start:dev
```

Then open the Swagger UI in your browser at `http://localhost:3001/api-docs`.

## Swagger API Docs

- URL: `http://localhost:3001/api-docs`
- The OpenAPI JSON is available at: `http://localhost:3001/api-json`

## Testing

### Unit Tests

```bash
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests only
npm test                 # Run all tests
npm run test:cov         # Run with coverage
```

### Load Testing

Test the system's ability to handle high concurrent load:

```bash
npm run test:load
```

**What it tests:**

- API throughput (request acceptance rate)
- 5000 concurrent URL scraping requests
- Stress test with 10,000 URLs
- Sustained load over 60 seconds
- Memory efficiency and stability

**Expected Results:**

- API can accept 150-200 requests/second
- 5000 URLs queued in ~25-30 seconds
- Processing rate: ~100-200 URLs/second
- Memory usage: <900 MB on 1GB RAM system
- Success rate: >95%

**See also:** `LOAD_TEST_ANALYSIS.md` for detailed performance analysis and system capacity assessment.

### Performance Requirements

The system is designed to handle:

- ✅ **5000 concurrent scraping requests** on 1 CPU, 1GB RAM
- Queue-based architecture prevents memory overflow
- BullMQ processes 50 jobs concurrently
- Total processing time: ~26-30 seconds for 5000 URLs

## Available Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run start`     | Start production server                  |
| `npm run start:dev` | Start development server with hot reload |
| `npm run build`     | Build for production                     |
| `npm run lint`      | Lint and fix code                        |
| `npm test`          | Run all tests                            |
| `npm run test:load` | Run load/performance tests               |

## Documentation

- **API Documentation**: See `API_DOCUMENTATION.md` for complete API reference with examples
- **Architecture Decisions**: See `ARCHITECTURE_DECISIONS.md` for design rationale
- **Load Test Analysis**: See `LOAD_TEST_ANALYSIS.md` for performance benchmarks
- **Inline Documentation**: JSDoc comments throughout codebase

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/media_scraper"

# Redis (Queue)
REDIS_HOST="localhost"
REDIS_PORT="6379"

# Application
PORT="3001"
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# Logging
LOG_LEVEL="info"  # debug, info, warn, error
```

### Queue Configuration

Edit `/src/constants/queue.constants.ts`:

```typescript
export const QUEUE_CONFIG = {
  SCRAPING: {
    CONCURRENCY: 50, // Concurrent jobs per worker
    ATTEMPTS: 2, // Retry attempts
    REMOVE_ON_COMPLETE: true,
    REMOVE_ON_FAIL: 100,
  },
};
```

## Monitoring

### Queue Monitoring

Install Bull Board for web UI monitoring:

```bash
npm install @bull-board/express @bull-board/api
```

### Health Check

```bash
curl http://localhost:3001/stats
```

### Logs

```bash
tail -f logs/combined.log  # All logs
tail -f logs/error.log     # Errors only
```

## Notes

- Swagger is configured in `src/main.ts` using `@nestjs/swagger` and mounted at `/api-docs`.
- If you changed the port via `PORT` env var, replace `3001` with your configured port.
- For production, consider securing the Swagger UI behind auth or enabling it only in non-production environments.
- Swagger is automatically disabled in production mode for security.
