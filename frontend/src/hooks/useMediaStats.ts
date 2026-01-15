'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useMediaStats = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.getStats(),
  });

  return {
    stats: data || {
      total: 0,
      images: 0,
      videos: 0,
    },
    loading: isLoading,
    error: error ? 'Failed to fetch stats' : null,
    refetch,
  };
};
