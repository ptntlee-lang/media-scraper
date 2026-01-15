import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Media } from './media.entity';
import { GetMediaDto } from './media.dto';
import { QUEUE_NAMES, QUEUE_CONFIG, PAGINATION } from '../../constants';
import { PaginatedResponse } from '../../interfaces';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    @InjectQueue(QUEUE_NAMES.SCRAPING)
    private scrapingQueue: Queue,
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
    const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, type, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.mediaRepository.createQueryBuilder('media');

    if (type) {
      queryBuilder.andWhere('media.type = :type', { type });
    }

    if (search) {
      queryBuilder.andWhere(
        '(media.alt ILIKE :search OR media.title ILIKE :search OR media.sourceUrl ILIKE :search OR media.mediaUrl ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy('media.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

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
      this.mediaRepository.count(),
      this.mediaRepository.count({ where: { type: 'image' } }),
      this.mediaRepository.count({ where: { type: 'video' } }),
    ]);

    return {
      total,
      images,
      videos,
    };
  }
}
