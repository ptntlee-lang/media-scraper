import { mediaApi } from './media.api';
import { scraperApi } from './scraper.api';

// Main API object that combines all API modules
export const api = {
  media: mediaApi,
  scraper: scraperApi,
};

// Re-export individual APIs for direct access if needed
export { mediaApi } from './media.api';
export { scraperApi } from './scraper.api';

// Re-export the base client for advanced usage
export { apiClient } from './base.api';

// Type exports for convenience
export type { GetMediaParams } from './media.api';
export type { ScrapeUrlsRequest } from './scraper.api';
