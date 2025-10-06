import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class BooksService {
  constructor(
    private prisma: PrismaService,
    private metricsService: MetricsService,
  ) {}

  async create(createBookDto: CreateBookDto, userId: string) {
    try {
      const book = await this.prisma.book.create({
        data: {
          ...createBookDto,
          userId,
        },
      });

      // Update metrics
      this.metricsService.trackBookOperation('create', 'success');
      await this.updateTotalBooksMetric();

      return book;
    } catch (error) {
      this.metricsService.trackBookOperation('create', 'failure');
      throw error;
    }
  }

  async findAll(userId: string) {
    try {
      const books = await this.prisma.book.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      this.metricsService.trackBookOperation('read', 'success');
      return books;
    } catch (error) {
      this.metricsService.trackBookOperation('read', 'failure');
      throw error;
    }
  }

  async findOne(id: string, userId: string) {
    try {
      const book = await this.prisma.book.findUnique({
        where: { id },
      });

      if (!book) {
        throw new NotFoundException('Book not found');
      }

      if (book.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      this.metricsService.trackBookOperation('read', 'success');
      return book;
    } catch (error) {
      this.metricsService.trackBookOperation('read', 'failure');
      throw error;
    }
  }

  async update(id: string, updateBookDto: UpdateBookDto, userId: string) {
    try {
      // First check if book exists and belongs to user
      const existingBook = await this.findOne(id, userId);

      const book = await this.prisma.book.update({
        where: { id },
        data: updateBookDto,
      });

      this.metricsService.trackBookOperation('update', 'success');
      return book;
    } catch (error) {
      this.metricsService.trackBookOperation('update', 'failure');
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    try {
      // First check if book exists and belongs to user
      await this.findOne(id, userId);

      await this.prisma.book.delete({
        where: { id },
      });

      // Update metrics
      this.metricsService.trackBookOperation('delete', 'success');
      await this.updateTotalBooksMetric();

      return { message: 'Book deleted successfully' };
    } catch (error) {
      this.metricsService.trackBookOperation('delete', 'failure');
      throw error;
    }
  }

  private async updateTotalBooksMetric() {
    try {
      const totalBooks = await this.prisma.book.count();
      this.metricsService.updateTotalBooks(totalBooks);
    } catch (error) {
      console.error('Failed to update total books metric:', error);
    }
  }
}
