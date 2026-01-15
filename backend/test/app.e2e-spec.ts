import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Media API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      })
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/scrape (POST)', () => {
    it('should queue URLs for scraping', () => {
      return request(app.getHttpServer())
        .post('/scrape')
        .send({ urls: ['https://example.com'] })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('jobIds');
          expect(Array.isArray(res.body.jobIds)).toBe(true);
        });
    });

    it('should reject invalid URLs', () => {
      return request(app.getHttpServer())
        .post('/scrape')
        .send({ urls: ['not-a-url'] })
        .expect(400);
    });

    it('should reject empty URL array', () => {
      return request(app.getHttpServer())
        .post('/scrape')
        .send({ urls: [] })
        .expect(400);
    });

    it('should reject missing urls field', () => {
      return request(app.getHttpServer())
        .post('/scrape')
        .send({})
        .expect(400);
    });
  });

  describe('/media (GET)', () => {
    it('should return paginated media', () => {
      return request(app.getHttpServer())
        .get('/media')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.pagination).toHaveProperty('total');
          expect(res.body.pagination).toHaveProperty('page');
          expect(res.body.pagination).toHaveProperty('limit');
          expect(res.body.pagination).toHaveProperty('totalPages');
        });
    });

    it('should filter by type', () => {
      return request(app.getHttpServer())
        .get('/media?type=image')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
        });
    });

    it('should support pagination', () => {
      return request(app.getHttpServer())
        .get('/media?page=2&limit=10')
        .expect(200)
        .expect((res) => {
          expect(res.body.pagination.page).toBe(2);
          expect(res.body.pagination.limit).toBe(10);
        });
    });

    it('should support search', () => {
      return request(app.getHttpServer())
        .get('/media?search=test')
        .expect(200);
    });

    it('should reject invalid type filter', () => {
      return request(app.getHttpServer())
        .get('/media?type=invalid')
        .expect(400);
    });
  });

  describe('/stats (GET)', () => {
    it('should return media statistics', () => {
      return request(app.getHttpServer())
        .get('/stats')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalMedia');
          expect(res.body).toHaveProperty('byType');
          expect(res.body).toHaveProperty('queue');
          expect(res.body.byType).toHaveProperty('image');
          expect(res.body.byType).toHaveProperty('video');
        });
    });
  });

  describe('CORS', () => {
    it('should allow cross-origin requests', () => {
      return request(app.getHttpServer())
        .get('/stats')
        .set('Origin', 'http://localhost:3000')
        .expect(200)
        .expect((res) => {
          expect(res.headers['access-control-allow-origin']).toBeDefined();
        });
    });
  });
});
