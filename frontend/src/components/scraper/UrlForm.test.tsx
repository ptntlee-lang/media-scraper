import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import UrlForm from './UrlForm';

describe('UrlForm Component - Unit Tests', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with textarea and submit button', () => {
    render(<UrlForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/Enter URLs/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Scraping/i })).toBeInTheDocument();
  });

  it('allows user to type URLs', async () => {
    const user = userEvent.setup();
    render(<UrlForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByLabelText(/Enter URLs/i);
    await user.type(textarea, 'https://example.com');

    expect(textarea).toHaveValue('https://example.com');
  });

  it('submits single URL when form is submitted', async () => {
    const user = userEvent.setup();
    render(<UrlForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByLabelText(/Enter URLs/i);
    const submitButton = screen.getByRole('button', { name: /Start Scraping/i });

    await user.type(textarea, 'https://example.com');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(['https://example.com']);
  });

  it('submits multiple URLs separated by newlines', async () => {
    const user = userEvent.setup();
    render(<UrlForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByLabelText(/Enter URLs/i) as HTMLTextAreaElement;

    await user.type(
      textarea,
      'https://example1.com{Enter}https://example2.com{Enter}https://example3.com'
    );
    await user.click(screen.getByRole('button', { name: /Start Scraping/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith([
      'https://example1.com',
      'https://example2.com',
      'https://example3.com',
    ]);
  });

  it('clears textarea after successful submission', async () => {
    const user = userEvent.setup();
    render(<UrlForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByLabelText(/Enter URLs/i);
    await user.type(textarea, 'https://example.com');
    await user.click(screen.getByRole('button', { name: /Start Scraping/i }));

    expect(textarea).toHaveValue('');
  });

  it('shows alert when submitting empty form', async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<UrlForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /Start Scraping/i });
    await user.click(submitButton);

    expect(alertSpy).toHaveBeenCalledWith('Please enter at least one URL');
    expect(mockOnSubmit).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('filters out empty lines from URLs', async () => {
    const user = userEvent.setup();
    render(<UrlForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByLabelText(/Enter URLs/i);

    await user.type(
      textarea,
      'https://example1.com{Enter}{Enter}{Enter}https://example2.com{Enter}'
    );
    await user.click(screen.getByRole('button', { name: /Start Scraping/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith(['https://example1.com', 'https://example2.com']);
  });

  it('shows loading state when loading prop is true', () => {
    render(<UrlForm onSubmit={mockOnSubmit} loading={true} />);

    expect(screen.getByText('Submitting...')).toBeInTheDocument();
    const submitButton = screen.getByRole('button', { name: /Submitting/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when not loading', () => {
    render(<UrlForm onSubmit={mockOnSubmit} loading={false} />);

    const submitButton = screen.getByRole('button', { name: /Start Scraping/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('trims whitespace from URLs', async () => {
    const user = userEvent.setup();
    render(<UrlForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByLabelText(/Enter URLs/i);

    await user.type(textarea, '  https://example1.com  {Enter}  https://example2.com  ');
    await user.click(screen.getByRole('button', { name: /Start Scraping/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith(['https://example1.com', 'https://example2.com']);
  });
});
