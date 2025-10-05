import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Session, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';

@Injectable()
export class SessionsService {
  private redis: Redis;

  constructor(private prisma: PrismaService) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'infra-redis',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || 'redis',
    });
  }

  async create(
    userId: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<Session> {
    const sessionToken = uuidv4();
    const refreshToken = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const savedSession = await this.prisma.session.create({
      data: {
        userId,
        sessionToken,
        refreshToken,
        expiresAt,
        userAgent,
        ipAddress,
      },
    });

    // Store session in Redis for fast access
    await this.redis.setex(
      `session:${sessionToken}`,
      24 * 60 * 60, // 24 hours in seconds
      JSON.stringify({
        userId,
        sessionId: savedSession.id,
        expiresAt: expiresAt.toISOString(),
      })
    );

    return savedSession;
  }

  async findByToken(sessionToken: string): Promise<Session | null> {
    // First check Redis
    const cachedSession = await this.redis.get(`session:${sessionToken}`);
    if (cachedSession) {
      const sessionData = JSON.parse(cachedSession);
      return this.prisma.session.findUnique({
        where: { id: sessionData.sessionId },
        include: { user: true },
      });
    }

    // Fallback to database
    return this.prisma.session.findFirst({
      where: { sessionToken, isActive: true },
      include: { user: true },
    });
  }

  async refreshSession(sessionToken: string): Promise<Session | null> {
    const session = await this.findByToken(sessionToken);
    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    // Update expiration
    const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    session.expiresAt = newExpiresAt;

    const updatedSession = await this.prisma.session.update({
      where: { id: session.id },
      data: { expiresAt: newExpiresAt },
    });

    // Update Redis
    await this.redis.setex(
      `session:${sessionToken}`,
      24 * 60 * 60,
      JSON.stringify({
        userId: session.userId,
        sessionId: session.id,
        expiresAt: newExpiresAt.toISOString(),
      })
    );

    return updatedSession;
  }

  async revokeSession(sessionToken: string): Promise<void> {
    // Remove from Redis
    await this.redis.del(`session:${sessionToken}`);

    // Deactivate in database
    await this.prisma.session.updateMany({
      where: { sessionToken },
      data: { isActive: false },
    });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    const sessions = await this.prisma.session.findMany({
      where: { userId, isActive: true },
    });

    // Remove all from Redis
    const pipeline = this.redis.pipeline();
    sessions.forEach((session) => {
      pipeline.del(`session:${session.sessionToken}`);
    });
    await pipeline.exec();

    // Deactivate all in database
    await this.prisma.session.updateMany({
      where: { userId },
      data: { isActive: false },
    });
  }

  async cleanupExpiredSessions(): Promise<void> {
    // Remove expired sessions from database
    await this.prisma.session.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
        isActive: false,
      },
    });
  }
}
