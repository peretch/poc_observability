import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService {
  private booksOperationsTotal: client.Counter<string>;
  private totalBooks: client.Gauge<string>;

  constructor() {
    // Ensure the registry is the same as in main.ts
    const register = client.register;

    this.booksOperationsTotal = new client.Counter({
      name: 'books_operations_total',
      help: 'Total number of book operations',
      labelNames: ['operation', 'status'], // operation: create, read, update, delete, status: success, failure
      registers: [register],
    });

    this.totalBooks = new client.Gauge({
      name: 'total_books_total',
      help: 'Total number of books in the system',
      registers: [register],
    });
  }

  trackBookOperation(operation: string, status: 'success' | 'failure') {
    this.booksOperationsTotal.labels(operation, status).inc();
  }

  updateTotalBooks(count: number) {
    this.totalBooks.set(count);
  }
}
