import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';

@Injectable()
export class SeatsService {
  private redis: Redis;

  constructor(private prisma: PrismaService) {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async findByEvent(eventId: string) {
    const seats = await this.prisma.seat.findMany({
      where: { eventId },
      orderBy: [{ section: 'asc' }, { row: 'asc' }, { number: 'asc' }],
    });

    // Check Redis for locked seats
    const seatsWithLockStatus = await Promise.all(
      seats.map(async (seat) => {
        const lockedBy = await this.redis.get(`seat:${seat.id}`);
        return {
          ...seat,
          status: lockedBy ? 'LOCKED' as const : seat.status,
          lockedBy: lockedBy || null,
        };
      }),
    );

    return seatsWithLockStatus;
  }

  async lockSeat(seatId: string, userId: string): Promise<boolean> {
    const seat = await this.prisma.seat.findUnique({ where: { id: seatId } });
    if (!seat || seat.status === 'SOLD') return false;

    // Try to set lock in Redis (NX = only if not exists, EX = TTL 300s)
    const result = await this.redis.set(`seat:${seatId}`, userId, 'EX', 300, 'NX');
    return result === 'OK';
  }

  async unlockSeat(seatId: string, userId: string): Promise<boolean> {
    const lockedBy = await this.redis.get(`seat:${seatId}`);
    if (lockedBy !== userId) return false;
    await this.redis.del(`seat:${seatId}`);
    return true;
  }

  async unlockAllByUser(userId: string): Promise<string[]> {
    const keys = await this.redis.keys('seat:*');
    const unlockedSeats: string[] = [];
    for (const key of keys) {
      const lockedBy = await this.redis.get(key);
      if (lockedBy === userId) {
        await this.redis.del(key);
        unlockedSeats.push(key.replace('seat:', ''));
      }
    }
    return unlockedSeats;
  }

  async markAsSold(seatIds: string[]) {
    await this.prisma.seat.updateMany({
      where: { id: { in: seatIds } },
      data: { status: 'SOLD' },
    });
    // Clean up Redis locks
    for (const id of seatIds) {
      await this.redis.del(`seat:${id}`);
    }
  }

  async releaseSeats(seatIds: string[]) {
    await this.prisma.seat.updateMany({
      where: { id: { in: seatIds } },
      data: { status: 'AVAILABLE' },
    });
    for (const id of seatIds) {
      await this.redis.del(`seat:${id}`);
    }
  }
}
