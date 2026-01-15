import { Injectable, Inject, LoggerService } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { SCRAPER } from '../../constants';

export interface ScrapedMedia {
  url: string;
  type: 'image' | 'video';
  alt?: string;
  title?: string;
}

@Injectable()
export class ScraperService {
  constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService) {}

  async scrapeUrl(url: string): Promise<ScrapedMedia[]> {
    this.logger.debug(`Starting to scrape URL: ${url}`, ScraperService.name);

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
          const imgElement = $(element);
          const computedTitle = this.computeImageTitle(imgElement, src, $);

          media.push({
            url: this.normalizeUrl(src, url),
            type: 'image',
            alt: imgElement.attr('alt') || '',
            title: computedTitle,
          });
        }
      });

      // Scrape videos
      $('video source, video').each((_, element) => {
        const src = $(element).attr('src');
        if (src && this.isValidMediaUrl(src, url)) {
          const videoElement = $(element).closest('video');
          const computedTitle = this.computeVideoTitle(videoElement, src, $);

          media.push({
            url: this.normalizeUrl(src, url),
            type: 'video',
            title: computedTitle,
          });
        }
      });

      // Scrape iframe embeds (YouTube, Vimeo, etc.)
      $('iframe').each((_, element) => {
        const src = $(element).attr('src');
        if (
          src &&
          (src.includes('youtube.com') ||
            src.includes('vimeo.com') ||
            src.includes('dailymotion.com'))
        ) {
          const iframeElement = $(element);
          const computedTitle = this.computeIframeTitle(iframeElement, src, $);

          media.push({
            url: this.normalizeUrl(src, url),
            type: 'video',
            title: computedTitle,
          });
        }
      });

      this.logger.debug(
        `Successfully scraped ${url}: found ${media.length} media items (${media.filter(m => m.type === 'image').length} images, ${media.filter(m => m.type === 'video').length} videos)`,
        ScraperService.name
      );

      return media;
    } catch (error) {
      this.logger.warn(`Failed to scrape URL ${url}: ${error.message}`, ScraperService.name);
      return [];
    }
  }

  /**
   * Computes a meaningful title for an image using multiple fallback strategies
   * Priority order:
   * 1. Title attribute
   * 2. Alt text
   * 3. Aria-label
   * 4. Figcaption text (if inside <figure>)
   * 5. Nearby heading (h1-h6)
   * 6. Parent element's text content
   * 7. Filename from URL
   * 8. Default placeholder
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private computeImageTitle(imgElement: any, _src: string, _$: any): string {
    // 1. Check for title attribute
    const titleAttr = imgElement.attr('title');
    if (titleAttr && titleAttr.trim()) {
      return titleAttr.trim();
    }

    // 2. Use alt text if available and meaningful
    const altText = imgElement.attr('alt');
    if (altText && altText.trim() && altText.length > 3) {
      return altText.trim();
    }

    // 3. Check for aria-label
    const ariaLabel = imgElement.attr('aria-label');
    if (ariaLabel && ariaLabel.trim()) {
      return ariaLabel.trim();
    }

    // 4. Check for figcaption if image is inside a figure
    const figure = imgElement.closest('figure');
    if (figure.length) {
      const figcaption = figure.find('figcaption').first();
      if (figcaption.length) {
        const caption = figcaption.text().trim();
        if (caption) {
          return caption;
        }
      }
    }

    // 5. Look for nearby heading (within same parent or sibling)
    const parent = imgElement.parent();
    const headingInParent = parent.find('h1, h2, h3, h4, h5, h6').first();
    if (headingInParent.length) {
      const headingText = headingInParent.text().trim();
      if (headingText) {
        return headingText;
      }
    }

    // Check previous sibling heading
    const prevHeading = imgElement.prevAll('h1, h2, h3, h4, h5, h6').first();
    if (prevHeading.length) {
      const headingText = prevHeading.text().trim();
      if (headingText) {
        return headingText;
      }
    }

    // 6. Try parent's data-title or similar attributes
    const parentDataTitle = parent.attr('data-title') || parent.attr('data-caption');
    if (parentDataTitle && parentDataTitle.trim()) {
      return parentDataTitle.trim();
    }

    // 7. Extract meaningful filename from URL
    const filename = this.extractFilenameFromUrl(_src);
    if (filename) {
      return filename;
    }

    // 8. Default fallback
    return 'Image';
  }

  /**
   * Computes a meaningful title for a video using multiple fallback strategies
   * Priority order:
   * 1. Title attribute
   * 2. Aria-label
   * 3. Data-title attribute
   * 4. Nearby heading (h1-h6)
   * 5. Parent element's text content
   * 6. Filename from URL
   * 7. Video platform detection
   * 8. Default placeholder
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private computeVideoTitle(videoElement: any, _src: string, _$: any): string {
    // 1. Check for title attribute
    const titleAttr = videoElement.attr('title');
    if (titleAttr && titleAttr.trim()) {
      return titleAttr.trim();
    }

    // 2. Check for aria-label
    const ariaLabel = videoElement.attr('aria-label');
    if (ariaLabel && ariaLabel.trim()) {
      return ariaLabel.trim();
    }

    // 3. Check for data-title or similar attributes
    const dataTitle = videoElement.attr('data-title') || videoElement.attr('data-caption');
    if (dataTitle && dataTitle.trim()) {
      return dataTitle.trim();
    }

    // 4. Look for nearby heading (within same parent or sibling)
    const parent = videoElement.parent();
    const headingInParent = parent.find('h1, h2, h3, h4, h5, h6').first();
    if (headingInParent.length) {
      const headingText = headingInParent.text().trim();
      if (headingText) {
        return headingText;
      }
    }

    // Check previous sibling heading
    const prevHeading = videoElement.prevAll('h1, h2, h3, h4, h5, h6').first();
    if (prevHeading.length) {
      const headingText = prevHeading.text().trim();
      if (headingText) {
        return headingText;
      }
    }

    // 5. Try parent's data-title or similar attributes
    const parentDataTitle = parent.attr('data-title') || parent.attr('data-caption');
    if (parentDataTitle && parentDataTitle.trim()) {
      return parentDataTitle.trim();
    }

    // 6. Extract meaningful filename from URL
    const filename = this.extractFilenameFromUrl(_src);
    if (filename) {
      return filename;
    }

    // 7. Detect video platform and provide generic title
    if (_src.includes('youtube.com') || _src.includes('youtu.be')) {
      return 'YouTube Video';
    }
    if (_src.includes('vimeo.com')) {
      return 'Vimeo Video';
    }
    if (_src.includes('dailymotion.com')) {
      return 'Dailymotion Video';
    }

    // 8. Default fallback
    return 'Video';
  }

  /**
   * Computes a meaningful title for an iframe embed using multiple fallback strategies
   * Priority order:
   * 1. Title attribute
   * 2. Aria-label
   * 3. Data-title attribute
   * 4. Nearby heading (h1-h6)
   * 5. Parent element's text content
   * 6. Extract title from URL (for YouTube, Vimeo, etc.)
   * 7. Platform-specific default
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private computeIframeTitle(iframeElement: any, _src: string, _$: any): string {
    // 1. Check for title attribute
    const titleAttr = iframeElement.attr('title');
    if (titleAttr && titleAttr.trim()) {
      return titleAttr.trim();
    }

    // 2. Check for aria-label
    const ariaLabel = iframeElement.attr('aria-label');
    if (ariaLabel && ariaLabel.trim()) {
      return ariaLabel.trim();
    }

    // 3. Check for data-title or similar attributes
    const dataTitle = iframeElement.attr('data-title') || iframeElement.attr('data-caption');
    if (dataTitle && dataTitle.trim()) {
      return dataTitle.trim();
    }

    // 4. Look for nearby heading (within same parent or sibling)
    const parent = iframeElement.parent();
    const headingInParent = parent.find('h1, h2, h3, h4, h5, h6').first();
    if (headingInParent.length) {
      const headingText = headingInParent.text().trim();
      if (headingText) {
        return headingText;
      }
    }

    // Check previous sibling heading
    const prevHeading = iframeElement.prevAll('h1, h2, h3, h4, h5, h6').first();
    if (prevHeading.length) {
      const headingText = prevHeading.text().trim();
      if (headingText) {
        return headingText;
      }
    }

    // 5. Try parent's data-title or similar attributes
    const parentDataTitle = parent.attr('data-title') || parent.attr('data-caption');
    if (parentDataTitle && parentDataTitle.trim()) {
      return parentDataTitle.trim();
    }

    // 6. Try to extract title from URL parameters (YouTube, Vimeo, etc.)
    const extractedTitle = this.extractTitleFromEmbedUrl(_src);
    if (extractedTitle) {
      return extractedTitle;
    }

    // 7. Platform-specific defaults
    if (_src.includes('youtube.com') || _src.includes('youtu.be')) {
      return 'YouTube Video';
    }
    if (_src.includes('vimeo.com')) {
      return 'Vimeo Video';
    }
    if (_src.includes('dailymotion.com')) {
      return 'Dailymotion Video';
    }

    // 8. Default fallback
    return 'Embedded Video';
  }

  /**
   * Extracts and cleans filename from image URL
   * Converts "my-image-file.jpg" to "My Image File"
   */
  private extractFilenameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop() || '';

      // Remove extension
      const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i, '');

      // Convert dashes, underscores to spaces and capitalize
      const cleaned = nameWithoutExt
        .replace(/[-_]/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Handle camelCase
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      // Return if meaningful (more than 2 characters and not just numbers)
      if (cleaned.length > 2 && !/^\d+$/.test(cleaned)) {
        return cleaned;
      }
    } catch {
      // Invalid URL, return empty
    }

    return '';
  }

  /**
   * Attempts to extract a meaningful title from embed URLs
   * Works for YouTube, Vimeo, and other platforms that include title info in URLs
   */
  private extractTitleFromEmbedUrl(url: string): string {
    try {
      const urlObj = new URL(url);

      // YouTube embed URLs
      if (url.includes('youtube.com/embed/') || url.includes('youtu.be/')) {
        // Extract video ID and create a generic title
        const videoId = urlObj.pathname.split('/').pop();
        if (videoId && videoId.length > 5) {
          return `YouTube Video (${videoId})`;
        }
      }

      // Vimeo embed URLs
      if (url.includes('vimeo.com/video/')) {
        const videoId = urlObj.pathname.split('/').pop();
        if (videoId && /^\d+$/.test(videoId)) {
          return `Vimeo Video (${videoId})`;
        }
      }

      // Dailymotion embed URLs
      if (url.includes('dailymotion.com/embed/video/')) {
        const videoId = urlObj.pathname.split('/').pop();
        if (videoId) {
          return `Dailymotion Video (${videoId})`;
        }
      }

      // Check for title in query parameters
      const titleParam = urlObj.searchParams.get('title');
      if (titleParam && titleParam.trim()) {
        return titleParam.trim();
      }
    } catch {
      // Invalid URL, return empty
    }

    return '';
  }

  private isValidMediaUrl(url: string, _baseUrl: string): boolean {
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
