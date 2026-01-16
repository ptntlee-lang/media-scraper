import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MediaStatsComponent from './MediaStats';
import { MediaStats } from '@/types/media.type';

describe('MediaStats Component - Unit Tests', () => {
  const mockStats: MediaStats = {
    total: 150,
    images: 100,
    videos: 50,
  };

  it('renders all stat cards', () => {
    render(<MediaStatsComponent stats={mockStats} />);

    expect(screen.getByText('Total Media')).toBeInTheDocument();
    expect(screen.getByText('Images')).toBeInTheDocument();
    expect(screen.getByText('Videos')).toBeInTheDocument();
  });

  it('displays correct stat values', () => {
    render(<MediaStatsComponent stats={mockStats} />);

    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('displays zero values correctly', () => {
    const emptyStats: MediaStats = {
      total: 0,
      images: 0,
      videos: 0,
    };

    render(<MediaStatsComponent stats={emptyStats} />);

    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBe(3);
  });

  it('renders with proper styling classes', () => {
    const { container } = render(<MediaStatsComponent stats={mockStats} />);

    // Check for grid layout
    expect(container.querySelector('.grid')).toBeInTheDocument();
  });
});
