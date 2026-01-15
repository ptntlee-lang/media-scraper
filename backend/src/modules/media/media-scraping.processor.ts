import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './media.entity';
import { ScraperService } from './media-scraper.service';
import { QUEUE_NAMES, QUEUE_CONFIG } from '../../constants';

@Processor(QUEUE_NAMES.SCRAPING, {
  concurrency: QUEUE_CONFIG.SCRAPING.CONCURRENCY,
})
@Injectable()
export class ScrapingProcessor extends WorkerHost {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    private scraperService: ScraperService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { url } = job.data;
    
    try {
      const scrapedMedia = await this.scraperService.scrapeUrl(url);
      
      const mediaEntities = scrapedMedia.map(item => {
        const media = new Media();
        media.sourceUrl = url;
        media.mediaUrl = item.url;
        media.type = item.type;
        media.alt = item.alt;
        media.title = item.title;
        return media;
      });

      if (mediaEntities.length > 0) {
        await this.mediaRepository.save(mediaEntities);
      }

      console.log(`✓ Scraped ${mediaEntities.length} items from ${url}`);
    } catch (error) {
      console.error(`✗ Failed to scrape ${url}:`, error.message);
      throw error;
    }
  }
}
