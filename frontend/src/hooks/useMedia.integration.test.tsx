import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMedia } from './useMedia';
import * as api from '@/api/index.api';

const mockedApi = jest.mocked(api, { shallow: false });

describe('useMedia Hook - Integration Tests', () => {
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

  it('fetches media successfully', async () => {
    const mockData = {
      data: [
        {
          id: 1,
          mediaUrl: 'https://example.com/image.jpg',
          type: 'image' as const,
          sourceUrl: 'https://example.com',
          createdAt: '2024-01-01T00:00:00.000Z',
          alt: undefined,
          title: undefined,
        },
      ],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    };

    mockedApi.mediaApi.getMedia.mockResolvedValue(mockData);

    const { result } = renderHook(() => useMedia({ type: '', search: '' }, 1), { wrapper });

    await waitFor(() => expect(result.current.media).toEqual(mockData.data));

    expect(mockedApi.mediaApi.getMedia).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
    });
    expect(result.current.meta).toEqual(mockData.meta);
  });

  it('handles fetch errors', async () => {
    const error = new Error('Failed to fetch');
    mockedApi.mediaApi.getMedia.mockRejectedValue(error);

    const { result } = renderHook(() => useMedia({ type: '', search: '' }, 1), { wrapper });

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.loading).toBe(false);
  });

  it('passes filters to API correctly', async () => {
    const mockData = {
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
    };

    mockedApi.mediaApi.getMedia.mockResolvedValue(mockData);

    const { result } = renderHook(() => useMedia({ type: 'image', search: 'test' }, 1), {
      wrapper,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockedApi.mediaApi.getMedia).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      type: 'image',
      search: 'test',
    });
  });

  it('refetches when page changes', async () => {
    const mockPage1 = {
      data: [
        {
          id: 1,
          mediaUrl: 'https://example.com/image1.jpg',
          type: 'image' as const,
          sourceUrl: 'https://example.com',
          createdAt: '2024-01-01T00:00:00.000Z',
          alt: undefined,
          title: undefined,
        },
      ],
      meta: { total: 2, page: 1, limit: 1, totalPages: 2 },
    };

    const mockPage2 = {
      data: [
        {
          id: 2,
          mediaUrl: 'https://example.com/image2.jpg',
          type: 'image' as const,
          sourceUrl: 'https://example.com',
          createdAt: '2024-01-01T00:00:00.000Z',
          alt: undefined,
          title: undefined,
        },
      ],
      meta: { total: 2, page: 2, limit: 1, totalPages: 2 },
    };

    mockedApi.mediaApi.getMedia.mockResolvedValueOnce(mockPage1).mockResolvedValueOnce(mockPage2);

    const { rerender, result } = renderHook(
      ({ page }) => useMedia({ type: '', search: '' }, page),
      {
        wrapper,
        initialProps: { page: 1 },
      }
    );

    await waitFor(() => expect(result.current.media).toEqual(mockPage1.data));

    rerender({ page: 2 });

    await waitFor(() => expect(result.current.media).toEqual(mockPage2.data));

    expect(mockedApi.mediaApi.getMedia).toHaveBeenCalledTimes(2);
  });

  it('shows loading state initially', () => {
    mockedApi.mediaApi.getMedia.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useMedia({ type: '', search: '' }, 1), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.media).toEqual([]);
  });

  it('omits empty filters from API call', async () => {
    const mockData = {
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
    };

    mockedApi.mediaApi.getMedia.mockResolvedValue(mockData);

    const { result } = renderHook(() => useMedia({ type: '', search: '' }, 1), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Should not include empty type and search
    expect(mockedApi.mediaApi.getMedia).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
    });
  });
});
