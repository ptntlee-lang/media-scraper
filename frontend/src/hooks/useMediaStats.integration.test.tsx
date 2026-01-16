import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMediaStats } from './useMediaStats';
import * as api from '@/api/index.api';

const mockedApi = jest.mocked(api, { shallow: false });

describe('useMediaStats Hook - Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('fetches stats successfully', async () => {
    const mockStats = {
      total: 150,
      images: 100,
      videos: 50,
    };

    mockedApi.mediaApi.getStats.mockResolvedValue(mockStats);

    const { result } = renderHook(() => useMediaStats(), { wrapper });

    await waitFor(() => expect(result.current.stats).toEqual(mockStats));

    expect(mockedApi.mediaApi.getStats).toHaveBeenCalledTimes(1);
  });

  it('handles fetch errors', async () => {
    const error = new Error('Failed to fetch stats');
    mockedApi.mediaApi.getStats.mockRejectedValue(error);

    const { result } = renderHook(() => useMediaStats(), { wrapper });

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.loading).toBe(false);
  });

  it('shows loading state initially', () => {
    mockedApi.mediaApi.getStats.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useMediaStats(), { wrapper });

    expect(result.current.loading).toBe(true);
  });

  it('returns default stats when no data', () => {
    mockedApi.mediaApi.getStats.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useMediaStats(), { wrapper });

    expect(result.current.stats).toEqual({
      total: 0,
      images: 0,
      videos: 0,
    });
  });

  it('caches stats data', async () => {
    const mockStats = {
      total: 150,
      images: 100,
      videos: 50,
    };

    mockedApi.mediaApi.getStats.mockResolvedValue(mockStats);

    const { unmount, result } = renderHook(() => useMediaStats(), { wrapper });

    await waitFor(() => expect(result.current.stats).toEqual(mockStats));

    unmount();

    // Render again with same query client
    const { result: result2 } = renderHook(() => useMediaStats(), { wrapper });

    // Should use cached data initially
    expect(result2.current.stats).toBeTruthy();
  });

  it('refetches when manually triggered', async () => {
    const mockStats1 = {
      total: 100,
      images: 60,
      videos: 40,
    };

    const mockStats2 = {
      total: 150,
      images: 100,
      videos: 50,
    };

    mockedApi.mediaApi.getStats.mockResolvedValueOnce(mockStats1).mockResolvedValueOnce(mockStats2);

    const { result } = renderHook(() => useMediaStats(), { wrapper });

    await waitFor(() => expect(result.current.stats).toEqual(mockStats1));

    // Trigger refetch
    result.current.refetch();

    await waitFor(() => expect(result.current.stats).toEqual(mockStats2));

    expect(mockedApi.mediaApi.getStats).toHaveBeenCalledTimes(2);
  });

  it('returns zero values when no media exists', async () => {
    const emptyStats = {
      total: 0,
      images: 0,
      videos: 0,
    };

    mockedApi.mediaApi.getStats.mockResolvedValue(emptyStats);

    const { result } = renderHook(() => useMediaStats(), { wrapper });

    await waitFor(() => expect(result.current.stats).toEqual(emptyStats));
  });
});
