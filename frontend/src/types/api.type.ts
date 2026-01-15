import { Media } from './media.type';

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

export * from './media.type';
export * from './scraper.type';
