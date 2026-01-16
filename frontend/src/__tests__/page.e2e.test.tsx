import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import MediaPage from '../app/media/page';
import * as api from '@/api/index.api';

const mockedApi = jest.mocked(api, { shallow: false });

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('Home Page - E2E Tests', () => {
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

  it('renders the home page with initial state', async () => {
    const mockMedia = {
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };

    const mockStats = { total: 0, images: 0, videos: 0 };

    mockedApi.mediaApi.getMedia.mockResolvedValue(mockMedia);
    mockedApi.mediaApi.getStats.mockResolvedValue(mockStats);

    render(<MediaPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Media Gallery/i)).toBeInTheDocument();
    });
  });

  it('displays media items when data is loaded', async () => {
    const mockMedia = {
      data: [
        {
          id: 1,
          mediaUrl: 'https://example.com/image1.jpg',
          type: 'image' as const,
          sourceUrl: 'https://example.com',
          createdAt: '2024-01-01T00:00:00.000Z',
          alt: 'Image 1',
          title: 'Test Image 1',
        },
        {
          id: 2,
          mediaUrl: 'https://example.com/image2.jpg',
          type: 'image' as const,
          sourceUrl: 'https://example.com',
          createdAt: '2024-01-01T00:00:00.000Z',
          alt: 'Image 2',
          title: 'Test Image 2',
        },
      ],
      meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
    };

    const mockStats = { total: 2, images: 2, videos: 0 };

    mockedApi.mediaApi.getMedia.mockResolvedValue(mockMedia);
    mockedApi.mediaApi.getStats.mockResolvedValue(mockStats);

    render(<MediaPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Test Image 1')).toBeInTheDocument();
      expect(screen.getByText('Test Image 2')).toBeInTheDocument();
    });
  });

  it('displays stats correctly', async () => {
    const mockMedia = {
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };

    const mockStats = { total: 150, images: 100, videos: 50 };

    mockedApi.mediaApi.getMedia.mockResolvedValue(mockMedia);
    mockedApi.mediaApi.getStats.mockResolvedValue(mockStats);

    render(<MediaPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });
  });

  it('filters media by type', async () => {
    const mockAllMedia = {
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };

    const mockImageMedia = {
      data: [
        {
          id: 1,
          mediaUrl: 'https://example.com/image.jpg',
          type: 'image' as const,
          sourceUrl: 'https://example.com',
          createdAt: '2024-01-01T00:00:00.000Z',
          alt: undefined,
          title: 'Only Image',
        },
      ],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    };

    const mockStats = { total: 2, images: 1, videos: 1 };

    mockedApi.mediaApi.getMedia
      .mockResolvedValueOnce(mockAllMedia)
      .mockResolvedValueOnce(mockImageMedia);
    mockedApi.mediaApi.getStats.mockResolvedValue(mockStats);

    const user = userEvent.setup();
    render(<MediaPage />, { wrapper });

    await waitFor(() => {
      expect(mockedApi.mediaApi.getMedia).toHaveBeenCalled();
    });

    const typeFilter = screen.getByLabelText(/Filter by Type/i);
    await user.selectOptions(typeFilter, 'image');

    await waitFor(() => {
      expect(mockedApi.mediaApi.getMedia).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'image' })
      );
    });
  });

  it('searches media by text', async () => {
    const mockMedia = {
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };

    const mockStats = { total: 0, images: 0, videos: 0 };

    mockedApi.mediaApi.getMedia.mockResolvedValue(mockMedia);
    mockedApi.mediaApi.getStats.mockResolvedValue(mockStats);

    const user = userEvent.setup();
    render(<MediaPage />, { wrapper });

    await waitFor(() => {
      expect(mockedApi.mediaApi.getMedia).toHaveBeenCalled();
    });

    const searchInput = screen.getByPlaceholderText(/Search/i);
    await user.type(searchInput, 'test query');

    // Wait for debounce if implemented
    await waitFor(
      () => {
        expect(mockedApi.mediaApi.getMedia).toHaveBeenCalledWith(
          expect.objectContaining({ search: expect.stringContaining('test') })
        );
      },
      { timeout: 2000 }
    );
  });

  it('paginates through media', async () => {
    const mockPage1 = {
      data: [
        {
          id: 1,
          mediaUrl: 'https://example.com/image1.jpg',
          type: 'image' as const,
          sourceUrl: 'https://example.com',
          createdAt: '2024-01-01T00:00:00.000Z',
          alt: undefined,
          title: 'Page 1',
        },
      ],
      meta: { page: 1, limit: 20, total: 40, totalPages: 2 },
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
          title: 'Page 2',
        },
      ],
      meta: { page: 2, limit: 20, total: 40, totalPages: 2 },
    };

    const mockStats = { total: 40, images: 40, videos: 0 };

    mockedApi.mediaApi.getMedia.mockResolvedValueOnce(mockPage1).mockResolvedValueOnce(mockPage2);
    mockedApi.mediaApi.getStats.mockResolvedValue(mockStats);

    const user = userEvent.setup();
    render(<MediaPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Page 2')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching', () => {
    mockedApi.mediaApi.getMedia.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );
    mockedApi.mediaApi.getStats.mockImplementation(() => new Promise(() => {}));

    render(<MediaPage />, { wrapper });

    // Should show loading indicators
    expect(screen.getByText(/Loading/i) || screen.getAllByRole('status').length > 0).toBeTruthy();
  });

  it('displays error message on fetch failure', async () => {
    const error = new Error('Network error');
    mockedApi.mediaApi.getMedia.mockRejectedValue(error);
    mockedApi.mediaApi.getStats.mockRejectedValue(error);

    render(<MediaPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch media/i)).toBeInTheDocument();
    });
  });

  it('shows empty state when no media exists', async () => {
    const mockMedia = {
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };

    const mockStats = { total: 0, images: 0, videos: 0 };

    mockedApi.mediaApi.getMedia.mockResolvedValue(mockMedia);
    mockedApi.mediaApi.getStats.mockResolvedValue(mockStats);

    render(<MediaPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/No media found/i) || screen.getByText(/empty/i)).toBeInTheDocument();
    });
  });
});
