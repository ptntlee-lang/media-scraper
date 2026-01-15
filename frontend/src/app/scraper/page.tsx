'use client';

import Link from 'next/link';
import UrlForm from '@/components/scraper/UrlForm';
import MediaStatsComponent from '@/components/media/MediaStats';
import { useMediaStats, useScraper } from '@/hooks';

export default function ScraperPage() {
  const { stats, refetch: refetchStats } = useMediaStats();
  const { scrapeUrls, loading } = useScraper();

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

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Media Scraper</h1>
          <Link
            href="/media"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            View Gallery
          </Link>
        </div>

        <MediaStatsComponent stats={stats} />

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Submit URLs for Scraping</h2>
          <UrlForm onSubmit={handleScrape} loading={loading} />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">How it works:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Enter one or more URLs (one per line)</li>
            <li>Click "Start Scraping" to queue the URLs for processing</li>
            <li>The backend will extract images and videos from each URL</li>
            <li>
              View the results in the{' '}
              <Link href="/media" className="text-blue-500 hover:underline">
                Media Gallery
              </Link>
            </li>
          </ol>
        </div>
      </div>
    </main>
  );
}
