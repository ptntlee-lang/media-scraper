'use client';

import Image from 'next/image';
import { Media } from '@/types';

interface MediaGalleryProps {
  media: Media[];
}

export default function MediaGallery({ media }: MediaGalleryProps) {
  if (media.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <p className="text-gray-500 text-lg">No media found. Start by scraping some URLs!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {media.map((item) => (
        <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
          <div className="relative h-48 bg-gray-100">
            {item.type === 'image' ? (
              <Image
                src={item.mediaUrl}
                alt={item.alt || 'Scraped image'}
                fill
                className="object-cover"
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.png';
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">Video</p>
                </div>
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-1 text-xs font-semibold rounded ${
                item.type === 'image' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {item.type}
              </span>
            </div>
            {item.title && (
              <p className="text-sm font-medium text-gray-900 mb-1 truncate" title={item.title}>
                {item.title}
              </p>
            )}
            {item.alt && (
              <p className="text-xs text-gray-600 mb-2 truncate" title={item.alt}>
                {item.alt}
              </p>
            )}
            <a
              href={item.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:text-blue-700 block truncate"
              title={item.mediaUrl}
            >
              View Original
            </a>
            <p className="text-xs text-gray-400 mt-1 truncate" title={item.sourceUrl}>
              From: {new URL(item.sourceUrl).hostname}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
