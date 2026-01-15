import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma.service';
import { GetMediaDto } from './media.dto';
import { QUEUE_NAMES, QUEUE_CONFIG, PAGINATION } from '../../constants';
import { PaginatedResponse } from '../../interfaces';
import { Media, Prisma } from '@prisma/client';

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.SCRAPING)
    private scrapingQueue: Queue
  ) {}

  async queueScraping(urls: string[]): Promise<{ message: string; jobCount: number }> {
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
    const [total, images, videos] = await Promise.all([
      this.prisma.media.count(),
      this.prisma.media.count({ where: { type: 'image' } }),
      this.prisma.media.count({ where: { type: 'video' } }),
    ]);

    return {
      total,
      images,
      videos,
    };
  }
}
