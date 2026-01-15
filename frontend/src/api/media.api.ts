import { apiClient } from './base.api';
import { API_CONFIG } from '../constants';
import { MediaResponse, MediaStats } from '@/types/api.type';

export interface GetMediaParams {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
}

export class MediaApi {
  async getMedia(params: GetMediaParams = {}): Promise<MediaResponse> {
    return apiClient.get<MediaResponse>(API_CONFIG.ENDPOINTS.MEDIA, { params });
  }

  async getStats(): Promise<MediaStats> {
    return apiClient.get<MediaStats>(API_CONFIG.ENDPOINTS.STATS);
  }

  // Future methods can be added here
  // async createMedia(media: CreateMediaRequest): Promise<Media> {
  //   return apiClient.post<Media>(API_CONFIG.ENDPOINTS.MEDIA, media);
  // }

  // async updateMedia(id: number, media: UpdateMediaRequest): Promise<Media> {
  //   return apiClient.put<Media>(`${API_CONFIG.ENDPOINTS.MEDIA}/${id}`, media);
  // }

  // async deleteMedia(id: number): Promise<void> {
  //   return apiClient.delete<void>(`${API_CONFIG.ENDPOINTS.MEDIA}/${id}`);
  // }
}

export const mediaApi = new MediaApi();
