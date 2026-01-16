/**
 * Queue Names
 *
 * Centralized queue name definitions for type safety and consistency.
 *
 * @remarks
 * Using constants prevents typos and enables IDE autocomplete.
 * Future queues: 'thumbnail-generation', 'duplicate-detection'
 */
export const QUEUE_NAMES = {
  /** Queue for web scraping jobs */
  SCRAPING: 'scraping',
} as const;

/**
 * Queue Configuration
 *
 * Controls BullMQ queue behavior for background job processing.
 *
 * @remarks
 * Architecture Decision: BullMQ over Simple Queues
 * - Redis-backed for persistence and reliability
 * - Survives application restarts
 * - Supports distributed workers
 * - Built-in retry mechanisms and job tracking
 * - Web UI available (@bull-board/express)
 *
 * SCRAPING Queue Configuration:
 *
 * CONCURRENCY (50):
 * - Number of jobs processed simultaneously per worker instance
 * - I/O-bound operations benefit from high concurrency
 * - CPU-bound tasks should use lower concurrency (5-10)
 * - Total throughput = CONCURRENCY × number of worker instances
 * - Monitor Redis memory and network bandwidth
 *
 * ATTEMPTS (2):
 * - Total job attempts including initial execution
 * - Retry 1: Immediate retry after first failure
 * - Retry 2: Final attempt after second failure
 * - Uses exponential backoff between attempts
 * - Network issues often resolve on retry
 *
 * REMOVE_ON_COMPLETE (true):
 * - Automatically removes completed jobs from Redis
 * - Prevents unbounded memory growth
 * - Trade-off: No historical job data
 * - For audit trail, set to false and prune periodically
 *
 * REMOVE_ON_FAIL (100):
 * - Keeps last 100 failed jobs for debugging
 * - Balances debugging needs with memory usage
 * - Failed jobs contain error details and stack traces
 * - Increase for production debugging, decrease for memory constrained environments
 *
 * Performance Characteristics:
 * - Throughput: ~100-200 URLs/second with 50 concurrency
 * - Latency: Job picked up within 100ms typically
 * - Memory: ~50KB per queued job, ~2-5MB per active job
 * - Redis memory: ~50MB per 1M queued jobs
 *
 * Scaling Strategies:
 * 1. Vertical: Increase CONCURRENCY on powerful servers
 * 2. Horizontal: Deploy multiple worker instances
 * 3. Sharding: Use multiple queues for different domains
 * 4. Rate Limiting: Add delays between jobs per domain
 *
 * Monitoring Recommendations:
 * - Track queue length (alert if >10k jobs)
 * - Monitor job completion rate
 * - Alert on high failure rates (>10%)
 * - Track processing latency (p95, p99)
 * - Monitor Redis memory usage
 *
 * @see ScrapingProcessor for job processing logic
 * @see https://docs.bullmq.io for BullMQ documentation
 */
export const QUEUE_CONFIG = {
  SCRAPING: {
    /** Number of jobs processed concurrently per worker */
    CONCURRENCY: 50,
    /** Number of retry attempts (including initial attempt) */
    ATTEMPTS: 2,
    /** Automatically remove completed jobs to save memory */
    REMOVE_ON_COMPLETE: true,
    /** Keep last 100 failed jobs for debugging */
    REMOVE_ON_FAIL: 100,
  },
} as const;
