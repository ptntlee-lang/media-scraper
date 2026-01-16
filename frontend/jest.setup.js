import '@testing-library/jest-dom'

// Ensure API methods are mocked as jest functions for tests
const apiModule = require('@/api/index.api');
jest.mock('@/api/index.api');

// Use the manual mock for Next.js Image globally to avoid forwarding Next-specific props to the DOM
// (e.g., fill, unoptimized) which cause React warnings in tests
jest.mock('next/image');

// Provide default jest.fn implementations so tests can call .mockResolvedValue / .mockRejectedValue
if (apiModule && apiModule.mediaApi) {
	apiModule.mediaApi.getMedia = apiModule.mediaApi.getMedia || jest.fn().mockResolvedValue({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
	apiModule.mediaApi.getStats = apiModule.mediaApi.getStats || jest.fn().mockResolvedValue({ total: 0, images: 0, videos: 0 });
}
if (apiModule && apiModule.scraperApi) {
	apiModule.scraperApi.scrapeUrls = apiModule.scraperApi.scrapeUrls || jest.fn().mockResolvedValue({ message: 'OK', jobCount: 0 });
}

// Mock browser alert to avoid jsdom "Not implemented" errors during tests
if (typeof global.alert === 'undefined') {
	global.alert = jest.fn();
}

// NOTE: Previously we filtered specific console.error messages to keep test output clean.
// We removed that behavior to prefer a pure fix: map `next/image` to a strict manual mock
// so unsupported props are never forwarded to the DOM. This keeps test output honest.

// Ensure each test starts with safe default API mocks so queries return defined data unless a test
// deliberately overrides them. This prevents React Query from logging "Query data cannot be undefined."
beforeEach(() => {
  try {
    const module = require('@/api/index.api');
    if (module && module.mediaApi) {
      module.mediaApi.getMedia = module.mediaApi.getMedia || jest.fn();
      module.mediaApi.getMedia.mockReset();
      module.mediaApi.getMedia.mockResolvedValue({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });

      module.mediaApi.getStats = module.mediaApi.getStats || jest.fn();
      module.mediaApi.getStats.mockReset();
      module.mediaApi.getStats.mockResolvedValue({ total: 0, images: 0, videos: 0 });
    }

    if (module && module.scraperApi) {
      module.scraperApi.scrapeUrls = module.scraperApi.scrapeUrls || jest.fn();
      module.scraperApi.scrapeUrls.mockReset();
      module.scraperApi.scrapeUrls.mockResolvedValue({ message: 'OK', jobCount: 0 });
    }
  } catch (e) {
    // ignore in environments where module resolution differs
  }
});

