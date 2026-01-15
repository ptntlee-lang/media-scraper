'use client';

import { useState, useEffect } from 'react';
import { mediaApi } from '@/api';
import { Media, MediaFilters, PaginationMeta } from '@/types';
import { PAGINATION } from '@/constants';

export const useMedia = (filters: MediaFilters, page: number) => {
  const [media, setMedia] = useState<Media[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: PAGINATION.DEFAULT_PAGE,
    limit: PAGINATION.DEFAULT_LIMIT,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = { page, limit: PAGINATION.DEFAULT_LIMIT };
        if (filters.type) params.type = filters.type;
        if (filters.search) params.search = filters.search;

        const response = await mediaApi.getMedia(params);
        setMedia(response.data);
        setMeta(response.meta);
      } catch (err) {
        setError('Failed to fetch media');
        console.error('Error fetching media:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [page, filters]);

  return { media, meta, loading, error };
};
