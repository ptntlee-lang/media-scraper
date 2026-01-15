import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { MediaService } from './media.service';
import { ScrapeUrlsDto, GetMediaDto } from './media.dto';

@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('scrape')
  async scrapeUrls(@Body() scrapeUrlsDto: ScrapeUrlsDto) {
    return this.mediaService.queueScraping(scrapeUrlsDto.urls);
  }

  @Get('media')
  async getMedia(@Query() query: GetMediaDto) {
    return this.mediaService.getMedia(query);
  }

  @Get('stats')
  async getStats() {
    return this.mediaService.getStats();
  }
}
