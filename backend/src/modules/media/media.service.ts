import { Injectable, Inject, LoggerService } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from '../prisma/prisma.service';
import { GetMediaDto } from './media.dto';
import { QUEUE_NAMES, QUEUE_CONFIG, PAGINATION } from '../../constants';
import { PaginatedResponse } from '../../interfaces';
import { Media, Prisma } from '@prisma/client';

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.SCRAPING)
    private scrapingQueue: Queue,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
  ) {}

  async queueScraping(urls: string[]): Promise<{ message: string; jobCount: number }> {
    this.logger.log(`Queueing ${urls.length} URLs for scraping`, MediaService.name);

    const jobs = urls.map(url => ({
      name: 'scrape-url',
      data: { url },
      opts: {
        removeOnComplete: QUEUE_CONFIG.SCRAPING.REMOVE_ON_COMPLETE,
        removeOnFail: QUEUE_CONFIG.SCRAPING.REMOVE_ON_FAIL,
        attempts: QUEUE_CONFIG.SCRAPING.ATTEMPTS,
      },
    }));

    await this.scrapingQueue.addBulk(jobs);

    this.logger.log(`Successfully queued ${urls.length} scraping jobs`, MediaService.name);

    return {
      message: 'URLs queued for scraping',
      jobCount: urls.length,
    };
  }

  async getMedia(query: GetMediaDto): Promise<PaginatedResponse<Media>> {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      type,
      search,
    } = query;
    const skip = (page - 1) * limit;

    this.logger.debug(
      `Fetching media with filters: page=${page}, limit=${limit}, type=${type || 'all'}, search=${search || 'none'}`,
      MediaService.name
    );

    const where: Prisma.MediaWhereInput = {};

    if (type) {
      where.type = type as 'image' | 'video';
    }

    if (search) {
      where.OR = [
        { alt: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { sourceUrl: { contains: search, mode: 'insensitive' } },
        { mediaUrl: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.media.count({ where }),
    ]);

    this.logger.debug(
      `Found ${total} total media items, returning ${data.length} items for page ${page}`,
      MediaService.name
    );

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStats() {
    this.logger.debug('Fetching media statistics', MediaService.name);

    const [total, images, videos] = await Promise.all([
      this.prisma.media.count(),
      this.prisma.media.count({ where: { type: 'image' } }),
      this.prisma.media.count({ where: { type: 'video' } }),
    ]);

    this.logger.debug(
      `Media stats: total=${total}, images=${images}, videos=${videos}`,
      MediaService.name
    );

    return {
      total,
      images,
      videos,
    };
  }
}
