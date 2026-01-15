import { Controller, Post, Get, Body, Query, Inject, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MediaService } from './media.service';
import { ScrapeUrlsDto, GetMediaDto } from './media.dto';

@Controller()
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
  ) {}

  @Post('scrape')
  async scrapeUrls(@Body() scrapeUrlsDto: ScrapeUrlsDto) {
    this.logger.log(
      `Received scraping request for ${scrapeUrlsDto.urls.length} URLs`,
      MediaController.name
    );
    const result = await this.mediaService.queueScraping(scrapeUrlsDto.urls);
    this.logger.log(`Queued ${scrapeUrlsDto.urls.length} scraping jobs`, MediaController.name);
    return result;
  }

  @Get('media')
  async getMedia(@Query() query: GetMediaDto) {
    this.logger.debug(
      `Fetching media with filters: ${JSON.stringify(query)}`,
      MediaController.name
    );
    return this.mediaService.getMedia(query);
  }

  @Get('stats')
  async getStats() {
    this.logger.debug('Fetching media stats', MediaController.name);
    return this.mediaService.getStats();
  }
}
