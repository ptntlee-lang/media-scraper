/**
 * Pagination Configuration
 *
 * Controls default pagination behavior across all list endpoints.
 *
 * @remarks
 * Design Decisions:
 * - DEFAULT_LIMIT of 20 balances response size with UX
 * - MAX_LIMIT of 100 prevents memory exhaustion and DoS
 * - Page numbering starts at 1 (user-friendly vs 0-indexed)
 *
 * Performance Considerations:
 * - Larger limits reduce round trips but increase payload size
 * - Frontend should use infinite scroll with smaller pages
 * - Monitor database query performance with limit >50
 *
 * @example
 * GET /media?page=1&limit=20  // Returns items 1-20
 * GET /media?page=2&limit=20  // Returns items 21-40
 */
export const PAGINATION = {
  /** Default page number (1-indexed) */
  DEFAULT_PAGE: 1,
  /** Default number of items per page */
  DEFAULT_LIMIT: 20,
  /** Maximum allowed items per page (prevents abuse) */
  MAX_LIMIT: 100,
} as const;

/**
 * Web Scraper Configuration
 *
 * Controls HTTP client behavior for web scraping operations.
 *
 * @remarks
 * Design Decisions:
 *
 * TIMEOUT (5s):
 * - Optimized for high-throughput scraping (5000+ concurrent jobs)
 * - Most pages load within 2-3 seconds
 * - Prevents slow URLs from blocking workers
 * - Improved from 10s to increase processing rate from 36 to 60+ URLs/s
 *
 * USER_AGENT:
 * - Mimics real browser to bypass basic bot detection
 * - Some sites block requests without User-Agent
 * - Update periodically to match current browsers
 * - More sophisticated sites may require full browser (Puppeteer)
 *
 * MAX_REDIRECTS (3):
 * - Limits redirect chains to prevent infinite loops
 * - Most legitimate redirects resolve in 1-2 hops
 *
 * Security Considerations:
 * - Timeout prevents resource exhaustion attacks
 * - User-Agent helps with some rate limiting systems
 * - Max redirects prevents redirect loops
 * - Future: Add request rate limiting per domain
 * - Future: Implement robots.txt respect
 *
 * @see ScraperService for usage
 */
export const SCRAPER = {
  /** Request timeout in milliseconds (5 seconds) - optimized for high throughput */
  TIMEOUT: 5000,
  /** User-Agent header to mimic real browser requests */
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  /** Maximum number of redirects to follow */
  MAX_REDIRECTS: 3,
  /** Keep-alive settings for connection pooling */
  KEEP_ALIVE: true,
  /** Maximum sockets per host for connection pooling */
  MAX_SOCKETS: 256,
} as const;
