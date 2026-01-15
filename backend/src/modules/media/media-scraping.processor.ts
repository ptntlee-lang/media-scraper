import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ScraperService } from './media-scraper.service';
import { QUEUE_NAMES, QUEUE_CONFIG } from '../../constants';

@Processor(QUEUE_NAMES.SCRAPING, {
  concurrency: QUEUE_CONFIG.SCRAPING.CONCURRENCY,
})
@Injectable()
export class ScrapingProcessor extends WorkerHost {
  constructor(
    private prisma: PrismaService,
    private scraperService: ScraperService
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { url } = job.data;

    try {
      const scrapedMedia = await this.scraperService.scrapeUrl(url);

      const mediaToCreate = scrapedMedia.map(item => ({
        sourceUrl: url,
        mediaUrl: item.url,
        type: item.type as 'image' | 'video',
        alt: item.alt || null,
        title: item.title || null,
      }));

      if (mediaToCreate.length > 0) {
        await this.prisma.media.createMany({
          data: mediaToCreate,
          skipDuplicates: true,
        });
      }

      console.log(`✓ Scraped ${mediaToCreate.length} items from ${url}`);
    } catch (error) {
      console.error(`✗ Failed to scrape ${url}:`, error.message);
      throw error;
    }
  }
}
