'use client';

import Link from 'next/link';
import MediaStatsComponent from '@/components/media/MediaStats';
import { useMediaStats } from '@/hooks/index.hook';

export default function Home() {
  const { stats } = useMediaStats();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Media Scraper</h1>
          <p className="text-xl text-gray-600 mb-8">Extract images and videos from any website</p>
        </div>

        <MediaStatsComponent stats={stats} />

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Link href="/scraper">
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-4xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold mb-2">Scrape URLs</h2>
              <p className="text-gray-600">
                Submit URLs to extract images and videos from websites
              </p>
            </div>
          </Link>

          <Link href="/media">
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-4xl mb-4">🖼️</div>
              <h2 className="text-2xl font-bold mb-2">View Gallery</h2>
              <p className="text-gray-600">Browse and search through all scraped media</p>
            </div>
          </Link>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold mb-4">Features</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Extract images and videos from any URL</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Filter by media type (images or videos)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Search by title, alt text, or URL</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Background processing with job queues</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Pagination for large collections</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
