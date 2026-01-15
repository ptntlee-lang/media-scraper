import { INestApplication, LoggerService } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication, logger?: LoggerService) {
  try {
    // Basic Swagger document config
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Media Scraper API')
      .setDescription('API for scraping and serving media')
      .setVersion('1.0')
      .build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api-docs', app, swaggerDocument);
    logger?.log && logger.log('Swagger UI available at /api-docs', 'Swagger');
  } catch (err) {
    logger?.warn && logger.warn('Failed to initialize Swagger UI', err?.message || err, 'Swagger');
  }
}

export default setupSwagger;
