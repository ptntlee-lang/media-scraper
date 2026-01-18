import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import ScraperPage from '../app/scraper/page';
import * as api from '@/api/index.api';

const mockedApi = jest.mocked(api, { shallow: false });

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

describe('Scraper Page - E2E Tests', () => {
  let queryClient: QueryClient;
  let alertMock: jest.SpyInstance;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
    alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    // Ensure stats exist and scraper has a default implementation for most tests
    mockedApi.mediaApi.getStats.mockResolvedValue({ total: 0, images: 0, videos: 0 });
    mockedApi.scraperApi.scrapeUrls.mockResolvedValue({ message: 'OK', jobCount: 0 });
  });

  afterEach(() => {
    alertMock.mockRestore();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('renders scraper form', () => {
    render(<ScraperPage />, { wrapper });

    expect(screen.getByLabelText(/Enter URLs/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Scraping/i })).toBeInTheDocument();
  });

  it('submits URLs and shows success message', async () => {
    const mockResponse = {
      message: 'URLs queued for scraping',
      jobCount: 2,
    };

    mockedApi.scraperApi.scrapeUrls.mockResolvedValue(mockResponse);

    const user = userEvent.setup();
    render(<ScraperPage />, { wrapper });

    const textarea = screen.getByLabelText(/Enter URLs/i);
    const submitButton = screen.getByRole('button', { name: /Start Scraping/i });

    await user.type(textarea, 'https://example1.com,https://example2.com');
    await user.click(submitButton);

    await waitFor(() =>
      expect(mockedApi.scraperApi.scrapeUrls).toHaveBeenCalledWith([
        'https://example1.com',
        'https://example2.com',
      ])
    );

    expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('queued'));
  });

  it('shows loading state during submission', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    mockedApi.scraperApi.scrapeUrls.mockReturnValue(promise as any);

    const user = userEvent.setup();
    render(<ScraperPage />, { wrapper });

    const textarea = screen.getByLabelText(/Enter URLs/i);
    await user.type(textarea, 'https://example.com');
    await user.click(screen.getByRole('button', { name: /Start Scraping/i }));

    await screen.findByText(/Submitting/i);

    // Resolve to clean up
    resolvePromise!({ message: 'Success', jobCount: 1 });
  });

  it('displays error message on submission failure', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Failed to scrape');
    mockedApi.scraperApi.scrapeUrls.mockImplementation(() => Promise.reject(error));

    const user = userEvent.setup();
    render(<ScraperPage />, { wrapper });

    const textarea = screen.getByLabelText(/Enter URLs/i);
    await user.type(textarea, 'https://example.com');
    await user.click(screen.getByRole('button', { name: /Start Scraping/i }));

    await waitFor(() => expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('Error')));

    consoleErrorSpy.mockRestore();
  });

  it('clears form after successful submission', async () => {
    const mockResponse = {
      message: 'Success',
      jobCount: 1,
    };

    mockedApi.scraperApi.scrapeUrls.mockResolvedValue(mockResponse);

    const user = userEvent.setup();
    render(<ScraperPage />, { wrapper });

    const textarea = screen.getByLabelText(/Enter URLs/i) as HTMLTextAreaElement;
    await user.type(textarea, 'https://example.com');
    await user.click(screen.getByRole('button', { name: /Start Scraping/i }));

    await waitFor(() => expect(textarea.value).toBe(''));
  });

  it('validates URLs before submission', async () => {
    const user = userEvent.setup();
    render(<ScraperPage />, { wrapper });

    // Submit empty form
    await user.click(screen.getByRole('button', { name: /Start Scraping/i }));

    expect(alertMock).toHaveBeenCalled();
    expect(mockedApi.scraperApi.scrapeUrls).not.toHaveBeenCalled();
  });

  it('allows multiple submissions', async () => {
    const mockResponse1 = { message: 'First success', jobCount: 1 };
    const mockResponse2 = { message: 'Second success', jobCount: 1 };

    mockedApi.scraperApi.scrapeUrls
      .mockResolvedValueOnce(mockResponse1)
      .mockResolvedValueOnce(mockResponse2);

    const user = userEvent.setup();
    render(<ScraperPage />, { wrapper });

    const textarea = screen.getByLabelText(/Enter URLs/i);

    // First submission
    await user.type(textarea, 'https://example1.com');
    await user.click(screen.getByRole('button', { name: /Start Scraping/i }));

    await waitFor(() => expect(mockedApi.scraperApi.scrapeUrls).toHaveBeenCalledTimes(1));

    // Second submission
    await user.type(textarea, 'https://example2.com');
    await user.click(screen.getByRole('button', { name: /Start Scraping/i }));

    await waitFor(() => expect(mockedApi.scraperApi.scrapeUrls).toHaveBeenCalledTimes(2));
  });

  it('displays job count in success message', async () => {
    const mockResponse = {
      message: 'URLs queued for scraping',
      jobCount: 5,
    };

    mockedApi.scraperApi.scrapeUrls.mockResolvedValue(mockResponse);

    const user = userEvent.setup();
    render(<ScraperPage />, { wrapper });

    const textarea = screen.getByLabelText(/Enter URLs/i);
    await user.type(textarea, 'https://example.com');
    await user.click(screen.getByRole('button', { name: /Start Scraping/i }));

    await waitFor(() => expect(alertMock).toHaveBeenCalledWith(expect.stringMatching(/queued/)));
  });
});
