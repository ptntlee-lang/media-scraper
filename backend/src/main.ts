import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import setupSwagger from './modules/swagger.module';

/**
 * Bootstrap Application
 *
 * Main entry point for the NestJS application.
 * Configures middleware, validation, CORS, logging, and API documentation.
 *
 * @remarks
 * Configuration Highlights:
 *
 * 1. Logging Strategy:
 *    - Uses Winston for structured logging
 *    - Logs to console and file (logs/combined.log, logs/error.log)
 *    - Supports log levels: debug, info, warn, error
 *    - Production: Set LOG_LEVEL=warn to reduce noise
 *
 * 2. CORS Policy:
 *    - Allows requests from frontend (default: http://localhost:3000)
 *    - Supports credentials for cookie-based auth
 *    - Configure FRONTEND_URL environment variable for production
 *    - Security: Restrict to specific origins in production
 *
 * 3. Validation Strategy:
 *    - Global validation pipe with class-validator
 *    - Whitelist: Strips unknown properties from requests
 *    - Transform: Automatically converts types (e.g., string "1" → number 1)
 *    - Prevents injection attacks via input sanitization
 *
 * 4. API Documentation:
 *    - Swagger UI enabled in development only
 *    - Accessible at /api-docs endpoint
 *    - Auto-generated from decorators and DTOs
 *    - Disabled in production for security
 *
 * Performance Considerations:
 * - Validation adds ~1-2ms overhead per request
 * - CORS preflight requests add latency (cache with Access-Control-Max-Age)
 * - Winston logging is async and non-blocking
 *
 * Security Best Practices:
 * - Disable Swagger in production
 * - Use helmet middleware for security headers
 * - Enable rate limiting in production
 * - Configure appropriate CORS origins
 * - Use HTTPS in production
 *
 * @see AppModule for application configuration
 * @see setupSwagger for Swagger configuration
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use Winston logger as the default logger
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  // Setup Swagger (delegated to ./swagger.module)
  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app, logger);
  } else {
    logger.log('Swagger UI disabled in production mode', 'Bootstrap');
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`🚀 Backend running on http://localhost:${port}`, 'Bootstrap');
}

bootstrap();
