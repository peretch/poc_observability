import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MetricsModule } from '../metrics/metrics.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, MetricsModule, AuthModule],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
