import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '../config.module';
import { LoggerModule } from '../logger.module';
import { QueueModule } from '../queue.module';

describe('MediaService - Integration Tests', () => {
  let service: MediaService;
  let prismaService: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule, LoggerModule, QueueModule],
      providers: [MediaService, PrismaService],
    }).compile();

    service = module.get<MediaService>(MediaService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('Integration with Prisma', () => {
    it('should interact with database through Prisma', async () => {
      // This test would require a test database
      // For now, we'll just verify the service can call Prisma methods
      const getMediaSpy = jest.spyOn(prismaService.media, 'findMany');

      try {
        await service.getMedia({ page: 1, limit: 10 });
      } catch (error) {
        // Expected to fail without database connection
      }

      expect(getMediaSpy).toHaveBeenCalled();
    });
  });

  describe('Integration with Queue', () => {
    it('should queue scraping jobs', async () => {
      const urls = ['https://example.com'];

      const result = await service.queueScraping(urls);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('jobCount');
      expect(typeof result.jobCount).toBe('number');
    });
  });
});
