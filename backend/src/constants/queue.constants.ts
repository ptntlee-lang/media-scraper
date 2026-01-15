export const QUEUE_NAMES = {
  SCRAPING: 'scraping',
} as const;

export const QUEUE_CONFIG = {
  SCRAPING: {
    CONCURRENCY: 50,
    ATTEMPTS: 2,
    REMOVE_ON_COMPLETE: true,
    REMOVE_ON_FAIL: 100,
  },
} as const;
