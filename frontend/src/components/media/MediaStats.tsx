'use client';

import { MediaStats } from '@/types/media';

interface MediaStatsProps {
  stats: MediaStats;
}

export default function MediaStatsComponent({ stats }: MediaStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-sm text-gray-600 mb-1">Total Media</div>
        <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-sm text-gray-600 mb-1">Images</div>
        <div className="text-3xl font-bold text-blue-600">{stats.images}</div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-sm text-gray-600 mb-1">Videos</div>
        <div className="text-3xl font-bold text-purple-600">{stats.videos}</div>
      </div>
    </div>
  );
}
