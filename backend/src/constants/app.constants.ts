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
 * TIMEOUT (10s):
 * - Balances completeness with responsiveness
 * - Most pages load within 2-3 seconds
 * - Prevents hanging on slow/unresponsive servers
 * - Consider increasing for slow networks
 *
 * USER_AGENT:
 * - Mimics real browser to bypass basic bot detection
 * - Some sites block requests without User-Agent
 * - Update periodically to match current browsers
 * - More sophisticated sites may require full browser (Puppeteer)
 *
 * Security Considerations:
 * - Timeout prevents resource exhaustion attacks
 * - User-Agent helps with some rate limiting systems
 * - Future: Add request rate limiting per domain
 * - Future: Implement robots.txt respect
 *
 * @see ScraperService for usage
 */
export const SCRAPER = {
  /** Request timeout in milliseconds (10 seconds) */
  TIMEOUT: 10000,
  /** User-Agent header to mimic real browser requests */
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
} as const;
