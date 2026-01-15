'use client';

import { useQuery } from '@tanstack/react-query';
import * as api from '@/api/index.api';

export const useMediaStats = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.mediaApi.getStats(),
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
