import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { SCRAPER } from '../../constants';

export interface ScrapedMedia {
  url: string;
  type: 'image' | 'video';
  alt?: string;
  title?: string;
}

@Injectable()
export class ScraperService {
  async scrapeUrl(url: string): Promise<ScrapedMedia[]> {
    try {
      const response = await axios.get(url, {
        timeout: SCRAPER.TIMEOUT,
        headers: {
          'User-Agent': SCRAPER.USER_AGENT,
        },
      });

      const $ = cheerio.load(response.data);
      const media: ScrapedMedia[] = [];

      // Scrape images
      $('img').each((_, element) => {
        const src = $(element).attr('src');
        if (src && this.isValidMediaUrl(src, url)) {
          media.push({
            url: this.normalizeUrl(src, url),
            type: 'image',
            alt: $(element).attr('alt') || '',
            title: $(element).attr('title') || '',
          });
        }
      });

      // Scrape videos
      $('video source, video').each((_, element) => {
        const src = $(element).attr('src');
        if (src && this.isValidMediaUrl(src, url)) {
          media.push({
            url: this.normalizeUrl(src, url),
            type: 'video',
            title: $(element).closest('video').attr('title') || '',
          });
        }
      });

      // Scrape iframe embeds (YouTube, Vimeo, etc.)
      $('iframe').each((_, element) => {
        const src = $(element).attr('src');
        if (src && (src.includes('youtube.com') || src.includes('vimeo.com') || src.includes('dailymotion.com'))) {
          media.push({
            url: this.normalizeUrl(src, url),
            type: 'video',
            title: $(element).attr('title') || '',
          });
        }
      });

      return media;
    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
      return [];
    }
  }

  private isValidMediaUrl(url: string, baseUrl: string): boolean {
    if (!url) return false;
    if (url.startsWith('data:')) return false;
    if (url.endsWith('.svg')) return false;
    return true;
  }

  private normalizeUrl(url: string, baseUrl: string): string {
    try {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      if (url.startsWith('//')) {
        return 'https:' + url;
      }
      const base = new URL(baseUrl);
      if (url.startsWith('/')) {
        return `${base.protocol}//${base.host}${url}`;
      }
      return new URL(url, baseUrl).href;
    } catch {
      return url;
    }
  }
}
