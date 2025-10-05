import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService {
  private authAttemptsTotal: client.Counter<string>;
  private activeSessions: client.Gauge<string>;

  constructor() {
    // Initialize metrics
    this.authAttemptsTotal = new client.Counter({
      name: 'auth_attempts_total',
      help: 'Total number of authentication attempts',
      labelNames: ['type', 'status'], // type: login, register, oauth, status: success, failure
    });

    this.activeSessions = new client.Gauge({
      name: 'active_sessions_total',
      help: 'Number of active user sessions',
    });
  }

  // Track authentication attempts
  trackAuthAttempt(type: 'login' | 'register' | 'oauth', status: 'success' | 'failure') {
    this.authAttemptsTotal.inc({ type, status });
  }

  // Track active sessions
  setActiveSessions(count: number) {
    this.activeSessions.set(count);
  }

  // Get all metrics
  async getMetrics(): Promise<string> {
    const register = new client.Registry();
    register.registerMetric(this.authAttemptsTotal);
    register.registerMetric(this.activeSessions);
    return register.metrics();
  }
}
