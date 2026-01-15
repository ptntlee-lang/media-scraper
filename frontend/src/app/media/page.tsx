'use client';

import { useState } from 'react';
import Link from 'next/link';
import MediaGrid from '@/components/media/MediaGrid';
import MediaFiltersComponent from '@/components/media/MediaFilters';
import MediaStatsComponent from '@/components/media/MediaStats';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import { useMedia, useMediaStats } from '@/hooks';
import { MediaFilters } from '@/types/media.type';

export default function MediaPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<MediaFilters>({ type: '', search: '' });

  const { media, meta, loading, error } = useMedia(filters, page);
  const { stats } = useMediaStats();

  const handleFilterChange = (newFilters: MediaFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Media Gallery</h1>
          <Link
            href="/scraper"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Scrape URLs
          </Link>
        </div>

        <MediaStatsComponent stats={stats} />

        <MediaFiltersComponent filters={filters} onChange={handleFilterChange} />

        {loading ? (
          <LoadingSpinner message="Loading media..." />
        ) : error ? (
          <EmptyState message={error} />
        ) : media.length === 0 ? (
          <EmptyState message="No media found. Start by scraping some URLs!" />
        ) : (
          <>
            <MediaGrid media={media} />
            <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </main>
  );
}
