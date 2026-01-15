export interface ScrapeRequest {
  urls: string[];
}

export interface ScrapeResponse {
  message: string;
  jobCount: number;
}
