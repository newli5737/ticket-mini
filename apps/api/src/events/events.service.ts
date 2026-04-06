import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 12, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { artist: { contains: search, mode: 'insensitive' as const } },
            { location: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: 'asc' },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { seats: true } },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return { events, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        seats: { orderBy: [{ section: 'asc' }, { row: 'asc' }, { number: 'asc' }] },
        _count: { select: { seats: true, bookings: true } },
      },
    });
    if (!event) throw new NotFoundException('Sự kiện không tồn tại');
    return event;
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        seats: { orderBy: [{ section: 'asc' }, { row: 'asc' }, { number: 'asc' }] },
        _count: { select: { seats: true, bookings: true } },
      },
    });
    if (!event) throw new NotFoundException('Sự kiện không tồn tại');
    return event;
  }

  async create(data: any) {
    return this.prisma.event.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.event.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.event.delete({ where: { id } });
  }
}
