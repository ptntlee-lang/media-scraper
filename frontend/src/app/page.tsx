'use client';

import { useState } from 'react';
import UrlForm from '@/components/UrlForm';
import MediaGallery from '@/components/MediaGallery';
import Filters from '@/components/Filters';
import Stats from '@/components/Stats';
import LoadingSpinner from '@/components/LoadingSpinner';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import { useMedia, useMediaStats, useMediaScraper } from '@/hooks';
import { MediaFilters } from '@/types';

export default function Home() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<MediaFilters>({ type: '', search: '' });

  const { media, meta, loading, error } = useMedia(filters, page);
  const { stats, refetch: refetchStats } = useMediaStats();
  const { scrapeUrls, loading: scraping } = useMediaScraper();

  const handleScrape = async (urls: string[]) => {
    try {
      await scrapeUrls(urls);
      alert(`Successfully queued ${urls.length} URLs for scraping!`);
      setTimeout(() => {
        refetchStats();
      }, 2000);
    } catch (error) {
      alert('Error submitting URLs for scraping');
    }
  };

  const handleFilterChange = (newFilters: MediaFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Media Scraper
        </h1>

        <Stats stats={stats} />

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <UrlForm onSubmit={handleScrape} loading={scraping} />
        </div>

        <Filters filters={filters} onChange={handleFilterChange} />

        {loading ? (
          <LoadingSpinner message="Loading media..." />
        ) : error ? (
          <EmptyState message={error} />
        ) : media.length === 0 ? (
          <EmptyState message="No media found. Start by scraping some URLs!" />
        ) : (
          <>
            <MediaGallery media={media} />
            <Pagination 
              page={page} 
              totalPages={meta.totalPages} 
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </main>
  );
}
