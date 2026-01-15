import { Media } from './media';

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

export * from './media';
export * from './scraper';
