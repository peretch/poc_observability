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

  // Enable CORS for OAuth callbacks
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

  // Custom metrics for auth service
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

  const authAttemptsTotal = new client.Counter({
    name: 'auth_attempts_total',
    help: 'Total number of authentication attempts',
    labelNames: ['type', 'status'], // type: login, register, oauth, status: success, failure
    registers: [register],
  });

  const activeSessions = new client.Gauge({
    name: 'active_sessions_total',
    help: 'Number of active user sessions',
    registers: [register],
  });


  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Auth service is running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔐 OAuth endpoints: http://localhost:${port}/api/v1/auth`);
}

bootstrap();
