import axios from 'axios';
import { API_CONFIG } from '@/constants';
import { MediaResponse, MediaStats, ScrapeRequest, ScrapeResponse } from '@/types';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const mediaApi = {
  scrapeUrls: async (urls: string[]): Promise<ScrapeResponse> => {
    const response = await apiClient.post<ScrapeResponse>(
      API_CONFIG.ENDPOINTS.SCRAPE,
      { urls }
    );
    return response.data;
  },

  getMedia: async (params: {
    page?: number;
    limit?: number;
    type?: string;
    search?: string;
  }): Promise<MediaResponse> => {
    const response = await apiClient.get<MediaResponse>(
      API_CONFIG.ENDPOINTS.MEDIA,
      { params }
    );
    return response.data;
  },

  getStats: async (): Promise<MediaStats> => {
    const response = await apiClient.get<MediaStats>(API_CONFIG.ENDPOINTS.STATS);
    return response.data;
  },
};
