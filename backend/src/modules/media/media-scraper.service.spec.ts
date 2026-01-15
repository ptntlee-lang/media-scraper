import { Test, TestingModule } from '@nestjs/testing';
import { ScraperService } from './media-scraper.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MediaScraperService - Unit Tests', () => {
  let service: ScraperService;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScraperService,
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<ScraperService>(ScraperService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('scrapeUrl', () => {
    it('should scrape images from HTML', async () => {
      const mockHtml = `
        <html>
          <body>
            <img src="https://example.com/image1.jpg" alt="Test Image 1" />
            <img src="https://example.com/image2.png" alt="Test Image 2" />
          </body>
        </html>
      `;

      mockedAxios.get.mockResolvedValue({ data: mockHtml });

      const result = await service.scrapeUrl('https://example.com');

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        type: 'image',
        url: 'https://example.com/image1.jpg',
      });
      expect(result[1]).toMatchObject({
        type: 'image',
        url: 'https://example.com/image2.png',
      });
    });

    it('should scrape videos from HTML', async () => {
      const mockHtml = `
        <html>
          <body>
            <video src="https://example.com/video.mp4"></video>
          </body>
        </html>
      `;

      mockedAxios.get.mockResolvedValue({ data: mockHtml });

      const result = await service.scrapeUrl('https://example.com');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'video',
        url: 'https://example.com/video.mp4',
      });
    });

    it('should handle scraping errors gracefully', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      const result = await service.scrapeUrl('https://example.com');

      expect(result).toEqual([]);
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should filter out invalid URLs and normalize relative URLs', async () => {
      const mockHtml = `
        <html>
          <body>
            <img src="/relative/path.jpg" alt="" title="Image" />
            <img src="data:image/png;base64,..." />
            <img src="https://example.com/valid.jpg" alt="" title="Valid" />
          </body>
        </html>
      `;

      mockedAxios.get.mockResolvedValue({ data: mockHtml });

      const result = await service.scrapeUrl('https://example.com');

      expect(result).toHaveLength(2); // relative URL is normalized, data URL is filtered
      expect(result[0].url).toBe('https://example.com/relative/path.jpg');
      expect(result[1].url).toBe('https://example.com/valid.jpg');
    });
  });
});
