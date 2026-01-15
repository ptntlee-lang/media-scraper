'use client';

import { useState } from 'react';
import { mediaApi } from '@/api';

export const useMediaScraper = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrapeUrls = async (urls: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mediaApi.scrapeUrls(urls);
      return response;
    } catch (err) {
      setError('Failed to submit URLs for scraping');
      console.error('Error scraping URLs:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { scrapeUrls, loading, error };
};
