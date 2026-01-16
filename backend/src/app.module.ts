import { Module } from '@nestjs/common';
import { ConfigModule } from './modules/config.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { QueueModule } from './modules/queue.module';
import { LoggerModule } from './modules/logger.module';
import { CacheModule } from './modules/cache.module';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [ConfigModule, PrismaModule, QueueModule, LoggerModule, CacheModule, MediaModule],
})
export class AppModule {}
