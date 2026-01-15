'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useScraper = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (urls: string[]) => api.scrapeUrls(urls),
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
    loading: mutation.isPending,
    error: mutation.isError ? 'Failed to submit URLs for scraping' : null,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};
