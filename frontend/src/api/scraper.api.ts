import { apiClient } from './base.api';
import { API_CONFIG } from '../constants';
import { ScrapeResponse } from '@/types/api.type';

export interface ScrapeUrlsRequest {
  urls: string[];
}

export class ScraperApi {
  async scrapeUrls(urls: string[]): Promise<ScrapeResponse> {
    return apiClient.post<ScrapeResponse>(API_CONFIG.ENDPOINTS.SCRAPE, { urls });
  }

  // Future methods can be added here
  // async getScrapeJob(jobId: string): Promise<ScrapeJob> {
  //   return apiClient.get<ScrapeJob>(`${API_CONFIG.ENDPOINTS.SCRAPE}/${jobId}`);
  // }

  // async getScrapeJobs(): Promise<ScrapeJob[]> {
  //   return apiClient.get<ScrapeJob[]>(API_CONFIG.ENDPOINTS.SCRAPE);
  // }

  // async cancelScrapeJob(jobId: string): Promise<void> {
  //   return apiClient.delete<void>(`${API_CONFIG.ENDPOINTS.SCRAPE}/${jobId}`);
  // }
}

export const scraperApi = new ScraperApi();
