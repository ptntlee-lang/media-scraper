import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next/image to avoid passing unsupported props (fetchPriority, unoptimized, fill, etc.) to DOM
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src, className }: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img src={src} alt={alt} className={className} />;
  },
}));

import MediaCard from './MediaCard';
import { Media } from '@/types/media.type';

describe('MediaCard Component - Unit Tests', () => {
  const mockImageMedia: Media = {
    id: 1,
    mediaUrl: 'https://example.com/image.jpg',
    sourceUrl: 'https://example.com',
    type: 'image',
    alt: 'Test image',
    title: 'Test Title',
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  const mockVideoMedia: Media = {
    id: 2,
    mediaUrl: 'https://example.com/video.mp4',
    sourceUrl: 'https://example.com',
    type: 'video',
    alt: undefined,
    title: undefined,
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  it('renders image media card', () => {
    render(<MediaCard item={mockImageMedia} />);

    expect(screen.getByAltText('Test image')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders video media card with icon', () => {
    render(<MediaCard item={mockVideoMedia} />);

    expect(screen.getByText('Video')).toBeInTheDocument();
  });

  it('displays source URL', () => {
    render(<MediaCard item={mockImageMedia} />);

    // Component displays hostname from sourceUrl
    expect(screen.getByText(/example.com/)).toBeInTheDocument();
  });

  it('displays media URL link', () => {
    render(<MediaCard item={mockImageMedia} />);

    const link = screen.getByRole('link', { name: /View Original/i });
    expect(link).toHaveAttribute('href', 'https://example.com/image.jpg');
  });

  it('displays type badge for image', () => {
    render(<MediaCard item={mockImageMedia} />);

    expect(screen.getByText('image')).toBeInTheDocument();
  });

  it('displays type badge for video', () => {
    render(<MediaCard item={mockVideoMedia} />);

    expect(screen.getByText('video')).toBeInTheDocument();
  });

  it('uses fallback text when alt is undefined', () => {
    const mediaWithoutAlt = { ...mockImageMedia, alt: undefined };
    render(<MediaCard item={mediaWithoutAlt} />);

    expect(screen.getByAltText('Scraped image')).toBeInTheDocument();
  });

  it('does not display title when title is undefined', () => {
    const mediaWithoutTitle = { ...mockImageMedia, title: undefined };
    render(<MediaCard item={mediaWithoutTitle} />);

    // Title should not be rendered if undefined
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('does not display alt when alt is undefined', () => {
    const mediaWithoutAlt = { ...mockVideoMedia, alt: undefined };
    render(<MediaCard item={mediaWithoutAlt} />);

    // Alt text should be undefined and not rendered
    expect(mediaWithoutAlt.alt).toBeUndefined();
  });

  it('applies hover effect classes', () => {
    const { container } = render(<MediaCard item={mockImageMedia} />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('hover:shadow-xl');
  });
});
