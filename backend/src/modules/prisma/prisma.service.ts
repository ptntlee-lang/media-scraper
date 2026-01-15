import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString =
      process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/media_scraper';
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    // adapter type is not exposed by @prisma/adapter-pg; suppress the explicit any lint rule on the adapter cast
    super({
      adapter: adapter as any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
