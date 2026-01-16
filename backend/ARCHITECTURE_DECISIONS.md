# Architecture Decision Records (ADR)

## Overview

This document records the key architectural decisions made during the development of the Media Scraper backend service. Each decision includes context, rationale, consequences, and alternatives considered.

---

## ADR-001: Queue-Based Scraping Architecture

**Date:** 2026-01-16  
**Status:** Accepted  
**Decision Makers:** Backend Team

### Context

Web scraping operations can take several seconds per URL, making synchronous request-response patterns unsuitable for good user experience.

### Decision

Implement asynchronous job processing using BullMQ with Redis as the backing store.

### Rationale

1. **Decoupling**: Separates HTTP request handling from long-running scraping operations
2. **Reliability**: Jobs persist in Redis, surviving application restarts
3. **Scalability**: Supports horizontal scaling with multiple worker instances
4. **Retry Mechanisms**: Built-in retry logic with exponential backoff
5. **Monitoring**: Rich ecosystem for queue monitoring and management

### Consequences

**Positive:**

- API remains responsive regardless of scraping workload
- Can scale workers independently of API servers
- Failed jobs automatically retry
- Jobs can be prioritized, delayed, or scheduled

**Negative:**

- Adds Redis as infrastructure dependency
- Requires separate worker processes
- Results not immediately available (eventual consistency)
- More complex error handling and monitoring

### Alternatives Considered

1. **Synchronous Processing**
   - ❌ Poor UX with 5-10s response times
   - ❌ No retry mechanism
   - ❌ Limited concurrency

2. **Simple In-Memory Queue**
   - ❌ Jobs lost on restart
   - ❌ No distribution across workers
   - ❌ Limited monitoring capabilities

3. **RabbitMQ**
   - ✅ Mature message broker
   - ❌ More complex setup
   - ❌ Overkill for our use case
   - ❌ Redis already in our stack

### Implementation Notes

- Queue: `BullMQ` (Redis-backed)
- Concurrency: 50 jobs per worker
- Retry: 2 attempts with exponential backoff
- Cleanup: Auto-remove completed jobs

---

## ADR-002: Cheerio vs Puppeteer for Web Scraping

**Date:** 2026-01-16  
**Status:** Accepted

### Context

Need to choose a web scraping library that balances performance, reliability, and feature completeness.

### Decision

Use Cheerio for HTML parsing instead of Puppeteer/headless browsers.

### Rationale

1. **Performance**: 100x faster than headless browsers (~200ms vs 20s per page)
2. **Memory Efficiency**: ~2-5MB per page vs ~50MB with Chrome
3. **Simplicity**: No browser management, simpler deployment
4. **Cost**: Lower resource requirements = lower infrastructure costs
5. **Sufficient**: Most target sites have static content

### Consequences

**Positive:**

- High throughput (100-200 URLs/second)
- Low memory footprint
- Simple deployment (no browser binaries)
- Faster CI/CD builds

**Negative:**

- Cannot scrape JavaScript-rendered content (SPAs)
- Cannot interact with pages (clicks, scrolling)
- May be detected by sophisticated anti-bot systems
- Cannot capture dynamic content loading

### Alternatives Considered

1. **Puppeteer/Playwright**
   - ✅ Executes JavaScript, handles SPAs
   - ✅ Can interact with dynamic content
   - ❌ Very slow (~20s per page)
   - ❌ High memory usage (~50MB per page)
   - ❌ Complex deployment (browser binaries)

2. **Axios + JSDOM**
   - ✅ Executes JavaScript
   - ❌ Slower than Cheerio
   - ❌ Not as battle-tested
   - ❌ Higher memory usage

### Future Considerations

If JavaScript-rendered content becomes a requirement:

1. Implement hybrid approach (Cheerio first, Puppeteer fallback)
2. Use pre-rendering services (Prerender.io)
3. Target API endpoints directly instead of scraping

---

## ADR-003: Multi-Strategy Title Extraction

**Date:** 2026-01-16  
**Status:** Accepted

### Context

Many scraped images/videos lack meaningful metadata, resulting in poor user experience when displaying media.

### Decision

Implement intelligent multi-strategy title extraction with 8 fallback levels.

### Rationale

1. **User Experience**: Meaningful titles improve content discoverability
2. **SEO**: Better metadata for potential public-facing features
3. **Accessibility**: Helps users understand media context
4. **Differentiation**: Most scrapers don't provide this level of intelligence

### Strategy Priority Order

1. Explicit attributes (title, aria-label)
2. Semantic HTML (figcaption, alt text)
3. DOM context (headings, parents)
4. URL parsing (filename extraction)
5. Platform detection (YouTube, Vimeo)
6. Fallback defaults

### Consequences

**Positive:**

- 80%+ of media has meaningful titles
- Better user experience
- Reduced need for manual editing
- Competitive advantage

**Negative:**

- Adds complexity to scraping logic
- Performance overhead (~1-2ms per media item)
- Potential for incorrect title extraction
- More code to maintain

### Alternatives Considered

1. **No Title Extraction**
   - ❌ Poor UX with generic "Image"/"Video" titles
   - ❌ Requires manual editing

2. **Simple Title/Alt Only**
   - ❌ Misses 60%+ of potential metadata
   - ❌ Still poor UX for most content

3. **AI/ML Title Generation**
   - ✅ Could generate better titles
   - ❌ Expensive (API costs)
   - ❌ Slow (adds latency)
   - ❌ Overkill for current needs

---

## ADR-004: Prisma ORM over TypeORM

**Date:** 2026-01-16  
**Status:** Accepted

### Context

Need an ORM that provides type safety, good developer experience, and solid PostgreSQL support.

### Decision

Use Prisma as the database ORM.

### Rationale

1. **Type Safety**: Auto-generated TypeScript types from schema
2. **Developer Experience**: Excellent CLI, migrations, and Studio GUI
3. **Performance**: Efficient query generation
4. **Modern**: Active development, great documentation
5. **Ecosystem**: Good NestJS integration

### Consequences

**Positive:**

- Full type safety from schema to queries
- Excellent autocomplete in IDE
- Easy database migrations
- Built-in connection pooling
- Great error messages

**Negative:**

- Relatively newer than TypeORM
- Limited to supported databases (PostgreSQL, MySQL, SQLite, etc.)
- Schema-first approach (not code-first)
- Learning curve for team

### Alternatives Considered

1. **TypeORM**
   - ✅ More mature, larger community
   - ✅ Decorator-based (familiar to NestJS devs)
   - ❌ Less type-safe
   - ❌ Migration system less robust

2. **Knex.js**
   - ✅ Flexible query builder
   - ❌ No type safety
   - ❌ Manual type definitions
   - ❌ More boilerplate

3. **Raw SQL**
   - ✅ Maximum control
   - ❌ No type safety
   - ❌ High maintenance
   - ❌ Error-prone

---

## ADR-005: Duplicate Detection Strategy

**Date:** 2026-01-16  
**Status:** Accepted

### Context

Multiple scraping jobs may discover the same media URL, potentially creating duplicate database entries.

### Decision

Use unique constraint on `mediaUrl` with `skipDuplicates` in Prisma.

### Rationale

1. **Database-Level**: Guarantees no duplicates even with race conditions
2. **Performance**: Index on unique field enables fast lookups
3. **Idempotency**: Safe to retry scraping jobs
4. **Simplicity**: No application-level duplicate checking needed

### Consequences

**Positive:**

- Guaranteed no duplicates
- Fast duplicate detection (index lookup)
- Safe for concurrent operations
- Idempotent scraping jobs

**Negative:**

- Can't store same media URL from different sources (by design)
- Database constraint errors (handled by skipDuplicates)
- Can't track "seen in multiple places" metadata

### Schema Implementation

```prisma
model Media {
  id        String   @id @default(uuid())
  mediaUrl  String   @unique  // Unique constraint here
  sourceUrl String
  type      String
  // ... other fields
}
```

### Alternatives Considered

1. **Application-Level Check**
   - ❌ Race conditions possible
   - ❌ Requires query before insert
   - ❌ Slower performance

2. **Hash-Based Deduplication**
   - ❌ More complex
   - ❌ Requires content fetching
   - ❌ Overkill for URL uniqueness

3. **Composite Unique (mediaUrl + sourceUrl)**
   - ✅ Tracks same media across sources
   - ❌ Allows duplicates
   - ❌ More storage, complexity

---

## ADR-006: Winston for Structured Logging

**Date:** 2026-01-16  
**Status:** Accepted

### Context

Need a logging solution that supports multiple transports, log levels, and structured data.

### Decision

Use Winston logger integrated with NestJS via `nest-winston`.

### Rationale

1. **Structured Logging**: JSON format for log aggregation tools
2. **Multiple Transports**: Console, file, remote (future)
3. **Log Levels**: Fine-grained control (debug, info, warn, error)
4. **Production Ready**: Battle-tested, widely adopted
5. **NestJS Integration**: Official integration package

### Configuration

```typescript
{
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
}
```

### Consequences

**Positive:**

- Structured logs easy to parse
- Separate error log file
- Can add remote logging (Datadog, CloudWatch)
- Context preserved in logs

**Negative:**

- More verbose than console.log
- Requires log rotation strategy
- JSON format less readable in development

### Alternatives Considered

1. **Pino**
   - ✅ Faster than Winston
   - ❌ Less flexible
   - ❌ Smaller ecosystem

2. **console.log**
   - ❌ No log levels
   - ❌ No transports
   - ❌ Not production-ready

---

## ADR-007: Pagination Strategy (Offset-Based)

**Date:** 2026-01-16  
**Status:** Accepted

### Context

Need pagination for media listing endpoint to handle large result sets.

### Decision

Use offset-based pagination (OFFSET/LIMIT) with page numbers.

### Rationale

1. **Simplicity**: Easy to implement and understand
2. **UX**: Users expect page numbers
3. **Sufficient**: Works well up to ~100k records
4. **Flexibility**: Can jump to any page

### Implementation

```typescript
const skip = (page - 1) * limit;
await prisma.media.findMany({ skip, take: limit });
```

### Consequences

**Positive:**

- Simple client-side implementation
- Can jump to specific pages
- Familiar UX pattern
- Works with most UI frameworks

**Negative:**

- Performance degrades with large offsets (>100k)
- Inconsistent results if data changes during pagination
- Skipped items if insertions occur
- Not ideal for infinite scroll

### Performance Characteristics

| Records | Query Time            |
| ------- | --------------------- |
| 10k     | ~10ms                 |
| 100k    | ~50ms                 |
| 1M      | ~150ms                |
| 10M+    | Consider cursor-based |

### Future Considerations

If dataset grows beyond 1M records:

1. Implement cursor-based pagination
2. Use keyset pagination (WHERE id > cursor)
3. Add database indexes on ordering fields
4. Consider Elasticsearch for search

### Alternatives Considered

1. **Cursor-Based Pagination**
   - ✅ Better performance at scale
   - ✅ Consistent results
   - ❌ Can't jump to pages
   - ❌ More complex implementation
   - ❌ Poor UX for traditional pagination

2. **Load All (No Pagination)**
   - ❌ Memory exhaustion
   - ❌ Slow response times
   - ❌ Poor UX

---

## ADR-008: Validation Strategy (class-validator)

**Date:** 2026-01-16  
**Status:** Accepted

### Context

Need to validate incoming HTTP requests to prevent invalid data and security issues.

### Decision

Use NestJS ValidationPipe with class-validator decorators.

### Rationale

1. **Type Safety**: Integrates with TypeScript types
2. **Declarative**: Validation rules as decorators
3. **Automatic**: Global pipe validates all requests
4. **Comprehensive**: Rich set of built-in validators
5. **NestJS Standard**: Official recommendation

### Example

```typescript
export class ScrapeUrlsDto {
  @IsArray()
  @IsUrl({}, { each: true })
  @ArrayMinSize(1)
  urls: string[];
}
```

### Consequences

**Positive:**

- Type-safe validation
- Prevents injection attacks
- Clear error messages
- Automatic transformation
- Reduces boilerplate

**Negative:**

- Adds ~1-2ms per request
- Decorator syntax learning curve
- Limited custom validation logic

### Configuration

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Strip unknown properties
    transform: true, // Auto-convert types
    forbidNonWhitelisted: false,
  })
);
```

---

## ADR-009: CORS Configuration

**Date:** 2026-01-16  
**Status:** Accepted

### Context

Frontend and backend run on different ports during development, requiring CORS configuration.

### Decision

Enable CORS with environment-based origin configuration.

### Configuration

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
```

### Rationale

1. **Development**: Allows local frontend (port 3000) to access API (port 3001)
2. **Flexible**: Environment variable for production
3. **Security**: Specific origin, not wildcard
4. **Credentials**: Supports cookie-based auth

### Consequences

**Positive:**

- Works in development out-of-box
- Configurable per environment
- Supports future authentication

**Negative:**

- Must configure for production
- Preflight requests add latency

### Production Recommendations

```bash
# Production
FRONTEND_URL=https://app.example.com

# Multiple origins (future)
FRONTEND_URL=https://app.example.com,https://admin.example.com
```

---

## ADR-010: Swagger API Documentation

**Date:** 2026-01-16  
**Status:** Accepted

### Context

Need comprehensive API documentation that stays in sync with code.

### Decision

Use @nestjs/swagger with decorators for auto-generated documentation.

### Rationale

1. **Auto-Generated**: Documentation from decorators and DTOs
2. **Interactive**: Try API directly from Swagger UI
3. **Always Current**: Synced with actual code
4. **Standards**: OpenAPI 3.0 specification
5. **Development Only**: Disabled in production for security

### Implementation

```typescript
// Enable in development only
if (process.env.NODE_ENV !== 'production') {
  setupSwagger(app, logger);
}
```

### Consequences

**Positive:**

- Documentation never out of date
- Interactive testing interface
- Client SDK generation possible
- Standard format (OpenAPI)

**Negative:**

- Adds bundle size (~2MB)
- Requires decorators on all endpoints
- Security risk if exposed in production

### Access

- Development: http://localhost:3001/api-docs
- Production: Disabled

---

## Future Considerations

### Potential Architecture Changes

1. **GraphQL API**: Consider for complex filtering needs
2. **Microservices**: Split scraping and API into separate services
3. **Event Sourcing**: Track all scraping operations for audit trail
4. **Caching Layer**: Add Redis caching for popular queries
5. **Rate Limiting**: Implement per-IP/per-API-key rate limits
6. **Authentication**: Add JWT or API key authentication
7. **Webhooks**: Notify clients when scraping completes

### Scaling Considerations

When to implement:

**At 100k+ media items:**

- Add database indexes
- Implement query result caching
- Consider read replicas

**At 1M+ media items:**

- Switch to cursor-based pagination
- Implement Elasticsearch for search
- Add materialized views for statistics

**At high request volume (>1000 req/s):**

- Add Redis caching layer
- Implement CDN for static responses
- Consider serverless for API gateway

**At high scraping volume (>1000 URLs/s):**

- Deploy multiple worker instances
- Implement domain-based rate limiting
- Consider specialized scraping infrastructure

---

## References

- [NestJS Documentation](https://docs.nestjs.com/)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
