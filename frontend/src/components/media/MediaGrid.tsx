'use client';

import { Media } from '@/types/media.type';
import MediaCard from './MediaCard';

interface MediaGridProps {
  media: Media[];
}

export default function MediaGrid({ media }: MediaGridProps) {
  if (media.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <p className="text-gray-500 text-lg">No media found. Start by scraping some URLs!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {media.map(item => (
        <MediaCard key={item.id} item={item} />
      ))}
    </div>
  );
}
