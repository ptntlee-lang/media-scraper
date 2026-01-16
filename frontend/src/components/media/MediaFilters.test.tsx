import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import MediaFiltersComponent from './MediaFilters';
import { MediaFilters } from '@/types/media.type';

describe('MediaFilters Component - Unit Tests', () => {
  const defaultFilters: MediaFilters = {
    type: '',
    search: '',
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search bar and type filter', () => {
    render(<MediaFiltersComponent filters={defaultFilters} onChange={mockOnChange} />);

    expect(screen.getByPlaceholderText(/Search by title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter by Type/i)).toBeInTheDocument();
  });

  it('calls onChange when search text changes', async () => {
    const user = userEvent.setup();
    render(<MediaFiltersComponent filters={defaultFilters} onChange={mockOnChange} />);

    const searchInput = screen.getByPlaceholderText(/Search by title/i);
    await user.type(searchInput, 'test');

    // Should be called for each character typed
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('calls onChange when type filter changes', async () => {
    const user = userEvent.setup();
    render(<MediaFiltersComponent filters={defaultFilters} onChange={mockOnChange} />);

    const typeSelect = screen.getByLabelText(/Filter by Type/i);
    await user.selectOptions(typeSelect, 'image');

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultFilters,
      type: 'image',
    });
  });

  it('displays current filter values', () => {
    const filters: MediaFilters = {
      type: 'video',
      search: 'test query',
    };

    render(<MediaFiltersComponent filters={filters} onChange={mockOnChange} />);

    const searchInput = screen.getByPlaceholderText(/Search by title/i) as HTMLInputElement;
    const typeSelect = screen.getByLabelText(/Filter by Type/i) as HTMLSelectElement;

    expect(searchInput.value).toBe('test query');
    expect(typeSelect.value).toBe('video');
  });

  it('shows all type options', () => {
    render(<MediaFiltersComponent filters={defaultFilters} onChange={mockOnChange} />);

    expect(screen.getByRole('option', { name: 'All Types' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Images' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Videos' })).toBeInTheDocument();
  });

  it('preserves other filter values when updating search', async () => {
    const user = userEvent.setup();
    const filters: MediaFilters = {
      type: 'image',
      search: '',
    };

    render(<MediaFiltersComponent filters={filters} onChange={mockOnChange} />);

    const searchInput = screen.getByPlaceholderText(/Search by title/i);
    await user.type(searchInput, 'a');

    expect(mockOnChange).toHaveBeenCalledWith({
      type: 'image',
      search: expect.any(String),
    });
  });

  it('preserves other filter values when updating type', async () => {
    const user = userEvent.setup();
    const filters: MediaFilters = {
      type: '',
      search: 'existing search',
    };

    render(<MediaFiltersComponent filters={filters} onChange={mockOnChange} />);

    const typeSelect = screen.getByLabelText(/Filter by Type/i);
    await user.selectOptions(typeSelect, 'video');

    expect(mockOnChange).toHaveBeenCalledWith({
      type: 'video',
      search: 'existing search',
    });
  });
});
