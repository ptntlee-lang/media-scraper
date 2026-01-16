'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/index.api';

export const useScraper = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (urls: string[]) => api.scraperApi.scrapeUrls(urls),
    onSuccess: () => {
      // Invalidate and refetch media queries after successful scrape
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: error => {
      console.error('Error scraping URLs:', error);
    },
  });

  return {
    scrapeUrls: mutation.mutate,
    scrapeUrlsAsync: mutation.mutateAsync,
    // Provide several aliases so tests and callers can use expected fields
    loading: mutation.isPending,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    error: mutation.isError ? 'Failed to submit URLs for scraping' : null,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    reset: mutation.reset,
  };
};
