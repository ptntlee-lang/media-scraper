import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Inject, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from '../prisma/prisma.service';
import { ScraperService } from './media-scraper.service';
import { QUEUE_NAMES, QUEUE_CONFIG } from '../../constants';

@Processor(QUEUE_NAMES.SCRAPING, {
  concurrency: QUEUE_CONFIG.SCRAPING.CONCURRENCY,
})
@Injectable()
export class ScrapingProcessor extends WorkerHost {
  constructor(
    private prisma: PrismaService,
    private scraperService: ScraperService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { url } = job.data;

    this.logger.log(`Processing scraping job for URL: ${url}`, ScrapingProcessor.name);

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

        this.logger.log(
          `Successfully scraped and saved ${mediaToCreate.length} media items from ${url}`,
          ScrapingProcessor.name
        );
      } else {
        this.logger.warn(`No media items found while scraping ${url}`, ScrapingProcessor.name);
      }
    } catch (error) {
      this.logger.error(
        `Failed to process scraping job for ${url}: ${error.message}`,
        error.stack,
        ScrapingProcessor.name
      );
      throw error;
    }
  }
}
