export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  ENDPOINTS: {
    SCRAPE: '/scrape',
    MEDIA: '/media',
    STATS: '/stats',
  },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const MEDIA_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  ALL: '',
} as const;
