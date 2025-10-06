import { Controller, Get, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import * as client from 'prom-client';

@Controller()
export class MetricsController {
  @Get('metrics')
  async getMetrics(@Res() reply: FastifyReply) {
    // Use the default registry
    const register = client.register;
    reply.header('Content-Type', register.contentType);
    reply.send(await register.metrics());
  }
}
