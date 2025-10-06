// Importar OpenTelemetry ANTES que cualquier otra cosa
import './telemetry';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import * as client from 'prom-client';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  // Enable CORS
  await app.register(require('@fastify/cors'), {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Prometheus metrics setup
  const register = new client.Registry();
  client.collectDefaultMetrics({ register });

  // Custom metrics for books service
  const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
  });

  const httpRequestTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
  });

  const booksOperationsTotal = new client.Counter({
    name: 'books_operations_total',
    help: 'Total number of book operations',
    labelNames: ['operation', 'status'], // operation: create, read, update, delete, status: success, failure
    registers: [register],
  });

  const totalBooks = new client.Gauge({
    name: 'total_books_total',
    help: 'Total number of books in the system',
    registers: [register],
  });

  const port = process.env.PORT || 3002;
  await app.listen(port, '0.0.0.0');
  
  console.log(`📚 Books service is running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/v1/health`);
  console.log(`📖 Books API: http://localhost:${port}/api/v1/books`);
}

bootstrap();
