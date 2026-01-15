import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Pagination from './Pagination';

describe('Pagination Component - Unit Tests', () => {
  const defaultProps = {
    page: 1,
    totalPages: 5,
    onPageChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pagination with current page info', () => {
    render(<Pagination {...defaultProps} />);

    expect(screen.getByText(/Page 1 of 5/i)).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    render(<Pagination {...defaultProps} page={1} />);

    const prevButton = screen.getByText('Previous');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination {...defaultProps} page={5} totalPages={5} />);

    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('calls onPageChange with next page when next button clicked', async () => {
    const onPageChange = jest.fn();
    const user = userEvent.setup();
    render(<Pagination {...defaultProps} page={2} onPageChange={onPageChange} />);

    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange with previous page when prev button clicked', async () => {
    const onPageChange = jest.fn();
    const user = userEvent.setup();
    render(<Pagination {...defaultProps} page={3} onPageChange={onPageChange} />);

    const prevButton = screen.getByText('Previous');
    await user.click(prevButton);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('does not render when totalPages is 1 or less', () => {
    const { container } = render(<Pagination {...defaultProps} totalPages={1} />);
    expect(container.firstChild).toBeNull();
  });

  it('displays correct page information', () => {
    render(<Pagination {...defaultProps} page={3} totalPages={10} />);
    expect(screen.getByText(/Page 3 of 10/i)).toBeInTheDocument();
  });
});
