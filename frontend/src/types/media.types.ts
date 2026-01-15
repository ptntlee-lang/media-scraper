export type MediaType = 'image' | 'video';

export interface Media {
  id: number;
  sourceUrl: string;
  mediaUrl: string;
  type: MediaType;
  alt?: string;
  title?: string;
  createdAt: string;
}

export interface MediaStats {
  total: number;
  images: number;
  videos: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MediaResponse {
  data: Media[];
  meta: PaginationMeta;
}

export interface MediaFilters {
  type: string;
  search: string;
}

export interface ScrapeRequest {
  urls: string[];
}

export interface ScrapeResponse {
  message: string;
  jobCount: number;
}
