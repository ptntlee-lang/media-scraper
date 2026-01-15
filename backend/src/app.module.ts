import { Module } from '@nestjs/common';
import { ConfigModule } from './modules/config.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { QueueModule } from './modules/queue.module';
import { LoggerModule } from './modules/logger.module';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [ConfigModule, PrismaModule, QueueModule, LoggerModule, MediaModule],
})
export class AppModule {}
