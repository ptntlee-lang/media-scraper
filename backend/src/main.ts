import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import setupSwagger from './modules/swagger.module';

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
