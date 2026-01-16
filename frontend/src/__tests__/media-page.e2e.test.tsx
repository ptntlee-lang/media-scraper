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

describe('Media Page - E2E Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    jest.clearAllMocks();

    // Ensure stats are defined for tests unless a test overrides the value
    mockedApi.mediaApi.getStats.mockResolvedValue({ total: 0, images: 0, videos: 0 });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('renders media gallery page', async () => {
    const mockMedia = {
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };

    mockedApi.mediaApi.getMedia.mockResolvedValue(mockMedia);

    render(<MediaPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Media Gallery/i)).toBeInTheDocument();
    });
  });

  it('displays media items in grid', async () => {
    const mockMedia = {
      data: [
        {
          id: 1,
          mediaUrl: 'https://example.com/image1.jpg',
          type: 'image' as const,
          sourceUrl: 'https://example.com',
          createdAt: '2024-01-01T00:00:00.000Z',
          alt: 'Image 1',
          title: 'Title 1',
        },
        {
          id: 2,
          mediaUrl: 'https://example.com/video.mp4',
          type: 'video' as const,
          sourceUrl: 'https://example.com',
          createdAt: '2024-01-01T00:00:00.000Z',
          alt: undefined,
          title: 'Title 2',
        },
      ],
      meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
    };

    mockedApi.mediaApi.getMedia.mockResolvedValue(mockMedia);

    render(<MediaPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Title 1')).toBeInTheDocument();
      expect(screen.getByText('Title 2')).toBeInTheDocument();
    });
  });

  it('filters media by image type', async () => {
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
          title: 'Image Only',
        },
      ],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    };

    mockedApi.mediaApi.getMedia
      .mockResolvedValueOnce(mockAllMedia)
      .mockResolvedValueOnce(mockImageMedia);

    const user = userEvent.setup();
    render(<MediaPage />, { wrapper });

    await waitFor(() => expect(mockedApi.mediaApi.getMedia).toHaveBeenCalled());

    const typeFilter = screen.getByLabelText(/Filter by Type/i);
    await user.selectOptions(typeFilter, 'image');

    await screen.findByText('Image Only');
  });

  it('filters media by video type', async () => {
    const mockAllMedia = {
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };

    const mockVideoMedia = {
      data: [
        {
          id: 1,
          mediaUrl: 'https://example.com/video.mp4',
          type: 'video' as const,
          sourceUrl: 'https://example.com',
          createdAt: '2024-01-01T00:00:00.000Z',
          alt: undefined,
          title: 'Video Only',
        },
      ],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    };

    mockedApi.mediaApi.getMedia
      .mockResolvedValueOnce(mockAllMedia)
      .mockResolvedValueOnce(mockVideoMedia);

    const user = userEvent.setup();
    render(<MediaPage />, { wrapper });

    await waitFor(() => expect(mockedApi.mediaApi.getMedia).toHaveBeenCalled());

    const typeFilter = screen.getByLabelText(/Filter by Type/i);
    await user.selectOptions(typeFilter, 'video');

    await waitFor(() => {
      expect(screen.getByText('Video Only')).toBeInTheDocument();
    });
  });

  it('searches media by keyword', async () => {
    const mockSearchResults = {
      data: [
        {
          id: 1,
          mediaUrl: 'https://example.com/sunset.jpg',
          type: 'image' as const,
          sourceUrl: 'https://example.com',
          createdAt: '2024-01-01T00:00:00.000Z',
          alt: 'Beautiful sunset',
          title: 'Sunset Photo',
        },
      ],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    };

    mockedApi.mediaApi.getMedia
      .mockResolvedValueOnce({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } })
      .mockResolvedValue(mockSearchResults);

    const user = userEvent.setup();
    render(<MediaPage />, { wrapper });

    await waitFor(() => {
      expect(mockedApi.mediaApi.getMedia).toHaveBeenCalled();
    });

    const searchInput = screen.getByPlaceholderText(/Search/i);
    await user.type(searchInput, 'sunset');

    await waitFor(() =>
      expect(mockedApi.mediaApi.getMedia).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'sunset' })
      )
    );
    await screen.findByText(/Sunset Photo/i, {}, { timeout: 2000 });
  });

  it('navigates between pages', async () => {
    const mockPage1 = {
      data: [
        {
          id: 1,
          mediaUrl: 'https://example.com/image1.jpg',
          type: 'image' as const,
          sourceUrl: 'https://example.com',
          createdAt: '2024-01-01T00:00:00.000Z',
          alt: undefined,
          title: 'Page 1 Item',
        },
      ],
      meta: { page: 1, limit: 20, total: 40, totalPages: 2 },
    };

    const mockPage2 = {
      data: [
        {
          id: 21,
          mediaUrl: 'https://example.com/image21.jpg',
          type: 'image' as const,
          sourceUrl: 'https://example.com',
          createdAt: '2024-01-01T00:00:00.000Z',
          alt: undefined,
          title: 'Page 2 Item',
        },
      ],
      meta: { page: 2, limit: 20, total: 40, totalPages: 2 },
    };

    mockedApi.mediaApi.getMedia.mockResolvedValueOnce(mockPage1).mockResolvedValueOnce(mockPage2);

    const user = userEvent.setup();
    render(<MediaPage />, { wrapper });

    await screen.findByText('Page 1 Item');

    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    await screen.findByText('Page 2 Item');
  });

  it('shows empty state when no media found', async () => {
    const mockMedia = {
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };

    mockedApi.mediaApi.getMedia.mockResolvedValue(mockMedia);

    render(<MediaPage />, { wrapper });
    await screen.findByText(/No media found/i);
  });

  it('displays loading state', () => {
    mockedApi.mediaApi.getMedia.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<MediaPage />, { wrapper });

    expect(screen.getByText(/Loading media...|Loading/i)).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    const error = new Error('Failed to fetch media');
    mockedApi.mediaApi.getMedia.mockRejectedValue(error);

    render(<MediaPage />, { wrapper });
    await screen.findByText(/Failed to fetch media/i);
  });

  it('combines filters and search', async () => {
    const mockFilteredMedia = {
      data: [
        {
          id: 1,
          mediaUrl: 'https://example.com/cat.jpg',
          type: 'image' as const,
          sourceUrl: 'https://example.com',
          createdAt: '2024-01-01T00:00:00.000Z',
          alt: 'Cat photo',
          title: 'Cat Image',
        },
      ],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    };

    mockedApi.mediaApi.getMedia
      .mockResolvedValueOnce({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } })
      .mockResolvedValueOnce(mockFilteredMedia);

    const user = userEvent.setup();
    render(<MediaPage />, { wrapper });

    await waitFor(() => {
      expect(mockedApi.mediaApi.getMedia).toHaveBeenCalled();
    });

    // Apply type filter
    const typeFilter = screen.getByLabelText(/Filter by Type/i);
    await user.selectOptions(typeFilter, 'image');

    // Apply search
    const searchInput = screen.getByPlaceholderText(/Search/i);
    await user.type(searchInput, 'cat');

    await waitFor(
      () => {
        expect(mockedApi.mediaApi.getMedia).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'image',
            search: expect.stringContaining('cat'),
          })
        );
      },
      { timeout: 2000 }
    );
  });
});
