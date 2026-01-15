'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { MediaFilters } from '@/types/media';
import { PAGINATION } from '@/lib/constants';

export const useMedia = (filters: MediaFilters, page: number) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['media', page, filters],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: PAGINATION.DEFAULT_LIMIT };
      if (filters.type) params.type = filters.type;
      if (filters.search) params.search = filters.search;

      return await api.getMedia(params);
    },
  });

  return {
    media: data?.data || [],
    meta: data?.meta || {
      total: 0,
      page: PAGINATION.DEFAULT_PAGE,
      limit: PAGINATION.DEFAULT_LIMIT,
      totalPages: 0,
    },
    loading: isLoading,
    error: error ? 'Failed to fetch media' : null,
  };
};
