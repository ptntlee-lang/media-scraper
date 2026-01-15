import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { ScraperService } from './media-scraper.service';
import { Media } from './media.entity';
import { ScrapingProcessor } from './media-scraping.processor';
import { QUEUE_NAMES } from '../../constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media]),
    BullModule.registerQueue({
      name: QUEUE_NAMES.SCRAPING,
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService, ScraperService, ScrapingProcessor],
  exports: [MediaService, ScraperService],
})
export class MediaModule {}
