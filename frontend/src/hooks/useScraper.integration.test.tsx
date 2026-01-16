import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useScraper } from './useScraper';
import * as api from '@/api/index.api';

const mockedApi = jest.mocked(api, { shallow: false });

describe('useScraper Hook - Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('scrapes URLs successfully', async () => {
    const mockResponse = {
      message: 'URLs queued for scraping',
      jobCount: 2,
    };

    mockedApi.scraperApi.scrapeUrls.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useScraper(), { wrapper });

    const urls = ['https://example1.com', 'https://example2.com'];
    result.current.scrapeUrls(urls);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApi.scraperApi.scrapeUrls).toHaveBeenCalledWith(urls);
  });

  it('handles scraping errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Failed to scrape');
    mockedApi.scraperApi.scrapeUrls.mockRejectedValue(error);

    const { result } = renderHook(() => useScraper(), { wrapper });

    result.current.scrapeUrls(['https://example.com']);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeTruthy();

    consoleErrorSpy.mockRestore();
  });

  it('shows loading state during scraping', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    mockedApi.scraperApi.scrapeUrls.mockReturnValue(promise as any);

    const { result } = renderHook(() => useScraper(), { wrapper });

    result.current.scrapeUrls(['https://example.com']);

    await waitFor(() => expect(result.current.loading).toBe(true));

    // Resolve the promise
    resolvePromise!({ message: 'Success', jobCount: 1 });

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('can scrape multiple times', async () => {
    const mockResponse1 = {
      message: 'First scrape',
      jobCount: 1,
    };

    const mockResponse2 = {
      message: 'Second scrape',
      jobCount: 2,
    };

    mockedApi.scraperApi.scrapeUrls
      .mockResolvedValueOnce(mockResponse1)
      .mockResolvedValueOnce(mockResponse2);

    const { result } = renderHook(() => useScraper(), { wrapper });

    // First scrape
    result.current.scrapeUrls(['https://example1.com']);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Reset before second scrape
    result.current.reset();

    // Second scrape
    result.current.scrapeUrls(['https://example2.com', 'https://example3.com']);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApi.scraperApi.scrapeUrls).toHaveBeenCalledTimes(2);
  });
  it('resets error state on new scrape', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Failed');
    mockedApi.scraperApi.scrapeUrls
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce({ message: 'Success', jobCount: 1 });

    const { result } = renderHook(() => useScraper(), { wrapper });

    // First attempt fails
    result.current.scrapeUrls(['https://fail.com']);
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Reset error state
    result.current.reset();

    // Second attempt succeeds
    result.current.scrapeUrls(['https://example.com']);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    consoleErrorSpy.mockRestore();

    expect(result.current.isError).toBe(false);
  });

  it('handles empty URL array', async () => {
    const mockResponse = {
      message: 'No URLs to scrape',
      jobCount: 0,
    };

    mockedApi.scraperApi.scrapeUrls.mockResolvedValue(mockResponse);
    const { result } = renderHook(() => useScraper(), { wrapper });

    result.current.scrapeUrls([]);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockResponse);
  });

  it('provides reset function to clear state', async () => {
    const mockResponse = {
      message: 'Success',
      jobCount: 1,
    };

    mockedApi.scraperApi.scrapeUrls.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useScraper(), { wrapper });

    result.current.scrapeUrls(['https://example.com']);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    result.current.reset();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(false);
    });
  });
});
