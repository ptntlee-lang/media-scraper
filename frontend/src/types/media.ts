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

export interface MediaFilters {
  type: string;
  search: string;
}
