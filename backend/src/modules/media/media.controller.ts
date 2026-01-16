import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Inject,
  LoggerService,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MediaService } from './media.service';
import { ScrapeUrlsDto, GetMediaDto } from './media.dto';
import { ApiTags, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';

/**
 * Media Controller
 *
 * Handles all HTTP endpoints for media scraping and retrieval.
 * This controller provides three main operations:
 * 1. Queue URLs for scraping
 * 2. Retrieve scraped media with filtering
 * 3. Get statistics about scraped media
 *
 * @remarks
 * All scraping operations are asynchronous and use BullMQ for background processing.
 * This ensures the API remains responsive even when scraping large numbers of URLs.
 */
@ApiTags('media')
@Controller()
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
  ) {}

  /**
   * Queue URLs for Media Scraping
   *
   * Accepts an array of URLs and queues them for background processing.
   * Each URL will be scraped for images and videos using configurable concurrency.
   *
   * @param scrapeUrlsDto - Object containing array of URLs to scrape
   * @returns Promise with confirmation message and job count
   *
   * @example
   * ```typescript
   * POST /scrape
   * {
   *   "urls": [
   *     "https://example.com/page1",
   *     "https://example.com/page2"
   *   ]
   * }
   *
   * Response:
   * {
   *   "message": "URLs queued for scraping",
   *   "jobCount": 2
   * }
   * ```
   *
   * @remarks
   * - Jobs are processed asynchronously with configurable concurrency (default: 50)
   * - Each job attempts up to 2 times on failure
   * - Duplicate media URLs are automatically skipped
   * - Invalid URLs will log warnings but won't fail the entire batch
   *
   * @see MediaService.queueScraping
   * @see ScraperService.scrapeUrl
   */
  @Post('scrape')
  @ApiOperation({ summary: 'Queue URLs for scraping' })
  @ApiBody({ type: ScrapeUrlsDto })
  async scrapeUrls(@Body() scrapeUrlsDto: ScrapeUrlsDto) {
    this.logger.log(
      `Received scraping request for ${scrapeUrlsDto.urls.length} URLs`,
      MediaController.name
    );
    const result = await this.mediaService.queueScraping(scrapeUrlsDto.urls);
    this.logger.log(`Queued ${scrapeUrlsDto.urls.length} scraping jobs`, MediaController.name);
    return result;
  }

  /**
   * Get Scraped Media with Filtering and Pagination
   *
   * Retrieves scraped media items with support for pagination, type filtering, and text search.
   * Results are ordered by creation date (newest first) for optimal user experience.
   *
   * @param query - Query parameters for filtering and pagination
   * @returns Promise with paginated media results and metadata
   *
   * @example
   * ```typescript
   * // Get first page of all media
   * GET /media?page=1&limit=20
   *
   * // Get only images
   * GET /media?type=image&page=1&limit=20
   *
   * // Search media by title/alt text
   * GET /media?search=landscape&page=1&limit=20
   *
   * // Combined filters
   * GET /media?type=video&search=tutorial&page=2&limit=50
   *
   * Response:
   * {
   *   "data": [
   *     {
   *       "id": "123",
   *       "mediaUrl": "https://example.com/image.jpg",
   *       "sourceUrl": "https://example.com",
   *       "type": "image",
   *       "title": "Beautiful Landscape",
   *       "alt": "Mountain view",
   *       "createdAt": "2026-01-16T10:00:00Z"
   *     }
   *   ],
   *   "meta": {
   *     "total": 150,
   *     "page": 1,
   *     "limit": 20,
   *     "totalPages": 8
   *   }
   * }
   * ```
   *
   * @remarks
   * Performance Considerations:
   * - Default limit is 20, maximum is 100 to prevent memory issues
   * - Search uses case-insensitive LIKE queries with indexes on searchable fields
   * - Pagination uses OFFSET/LIMIT which performs well up to ~100k records
   * - For large datasets (>1M records), consider cursor-based pagination
   *
   * @see MediaService.getMedia
   */
  @Get('media')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30) // Cache for 30 seconds
  @ApiOperation({ summary: 'Get scraped media with optional filters' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getMedia(@Query() query: GetMediaDto) {
    this.logger.debug(
      `Fetching media with filters: ${JSON.stringify(query)}`,
      MediaController.name
    );
    return this.mediaService.getMedia(query);
  }

  /**
   * Get Media Scraping Statistics
   *
   * Returns aggregate statistics about all scraped media in the database.
   * Useful for dashboard displays and monitoring scraping progress.
   *
   * @returns Promise with statistics object containing totals by type
   *
   * @example
   * ```typescript
   * GET /stats
   *
   * Response:
   * {
   *   "total": 1523,
   *   "images": 1245,
   *   "videos": 278
   * }
   * ```
   *
   * @remarks
   * Performance Considerations:
   * - Uses parallel queries with Promise.all for optimal performance
   * - Statistics queries use COUNT() which is optimized by Postgres
   * - For very large datasets (>10M records), consider caching results
   * - Response time typically <50ms for datasets under 1M records
   *
   * @see MediaService.getStats
   */
  @Get('stats')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60) // Cache for 60 seconds
  @ApiOperation({ summary: 'Get media scraping statistics' })
  async getStats() {
    this.logger.debug('Fetching media stats', MediaController.name);
    return this.mediaService.getStats();
  }
}
