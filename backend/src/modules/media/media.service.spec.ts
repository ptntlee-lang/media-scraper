import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import { PrismaService } from '../prisma/prisma.service';
import { Queue } from 'bullmq';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Media } from '@prisma/client';

describe('MediaService - Unit Tests', () => {
  let service: MediaService;
  let prismaService: PrismaService;
  let mockQueue: jest.Mocked<Queue>;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    mockQueue = {
      add: jest.fn(),
      getJobCounts: jest.fn(),
    } as unknown as jest.Mocked<Queue>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: PrismaService,
          useValue: {
            media: {
              findMany: jest.fn(),
              count: jest.fn(),
              groupBy: jest.fn(),
            },
          },
        },
        {
          provide: 'BullQueue_scraping',
          useValue: mockQueue,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('queueScraping', () => {
    it('should queue URLs for scraping', async () => {
      const urls = ['https://example.com', 'https://test.com'];
      const mockAddBulk = jest.fn().mockResolvedValue([]);
      mockQueue.addBulk = mockAddBulk;

      const result = await service.queueScraping(urls);

      expect(result.message).toBe('URLs queued for scraping');
      expect(result.jobCount).toBe(2);
      expect(mockAddBulk).toHaveBeenCalledTimes(1);
    });

    it('should handle empty URL array', async () => {
      const mockAddBulk = jest.fn().mockResolvedValue([]);
      mockQueue.addBulk = mockAddBulk;
      const result = await service.queueScraping([]);

      expect(result.jobCount).toBe(0);
      expect(mockAddBulk).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMedia', () => {
    it('should return paginated media', async () => {
      const mockMedia = [
        { id: 1, url: 'https://example.com/image.jpg', type: 'image' },
        { id: 2, url: 'https://example.com/video.mp4', type: 'video' },
      ];

      jest
        .spyOn(prismaService.media, 'findMany')
        .mockResolvedValue(mockMedia as unknown as Media[]);
      jest.spyOn(prismaService.media, 'count').mockResolvedValue(10);

      const result = await service.getMedia({ page: 1, limit: 20 });

      expect(result.data).toEqual(mockMedia);
      expect(result.meta.total).toBe(10);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
    });

    it('should filter by type', async () => {
      jest.spyOn(prismaService.media, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.media, 'count').mockResolvedValue(0);

      await service.getMedia({ page: 1, limit: 20, type: 'image' });

      expect(prismaService.media.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'image' }),
        })
      );
    });
  });

  describe('getStats', () => {
    it('should return media statistics', async () => {
      jest
        .spyOn(prismaService.media, 'count')
        .mockResolvedValueOnce(150) // total
        .mockResolvedValueOnce(100) // images
        .mockResolvedValueOnce(50); // videos

      const result = await service.getStats();

      expect(result.total).toBe(150);
      expect(result.images).toBe(100);
      expect(result.videos).toBe(50);
      expect(prismaService.media.count).toHaveBeenCalledTimes(3);
    });
  });
});
