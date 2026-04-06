import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SeatsService } from '../seats/seats.service';
import { SeatsGateway } from '../seats/seats.gateway';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private seatsService: SeatsService,
    private seatsGateway: SeatsGateway,
  ) {}

  async create(userId: string, eventId: string, seatIds: string[]) {
    // Verify seats are available
    const seats = await this.prisma.seat.findMany({
      where: { id: { in: seatIds }, eventId, status: 'AVAILABLE' },
    });

    if (seats.length !== seatIds.length) {
      throw new BadRequestException('Một số ghế không còn khả dụng');
    }

    const totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0);
    const expiredAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const booking = await this.prisma.$transaction(async (tx) => {
      // Lock seats in DB
      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: 'LOCKED' },
      });

      // Create booking
      const booking = await tx.booking.create({
        data: {
          userId,
          eventId,
          totalPrice,
          expiredAt,
          seats: {
            create: seats.map((seat) => ({
              seatId: seat.id,
              price: seat.price,
            })),
          },
        },
        include: { seats: { include: { seat: true } }, event: true },
      });

      return booking;
    });

    return booking;
  }

  async findByUser(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        event: true,
        seats: { include: { seat: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        event: true,
        user: { select: { id: true, name: true, email: true } },
        seats: { include: { seat: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking không tồn tại');
    return booking;
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        skip,
        take: limit,
        include: {
          event: true,
          user: { select: { id: true, name: true, email: true } },
          seats: { include: { seat: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.booking.count(),
    ]);
    return { bookings, total, page, totalPages: Math.ceil(total / limit) };
  }

  async confirmPayment(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { seats: true },
    });

    if (!booking) throw new NotFoundException('Booking không tồn tại');
    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Booking không ở trạng thái chờ thanh toán');
    }

    const seatIds = booking.seats.map((bs) => bs.seatId);

    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'PAID' },
      });
      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: 'SOLD' },
      });
    });

    // Broadcast seat_sold via Socket.IO
    this.seatsGateway.emitSeatSold(booking.eventId, seatIds);

    return { message: 'Xác nhận thanh toán thành công' };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async expireBookings() {
    const expired = await this.prisma.booking.findMany({
      where: {
        status: 'PENDING',
        expiredAt: { lt: new Date() },
      },
      include: { seats: true },
    });

    for (const booking of expired) {
      const seatIds = booking.seats.map((bs) => bs.seatId);
      await this.prisma.$transaction(async (tx) => {
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: 'EXPIRED' },
        });
        await tx.seat.updateMany({
          where: { id: { in: seatIds } },
          data: { status: 'AVAILABLE' },
        });
      });
      await this.seatsService.releaseSeats(seatIds);
      console.log(`Booking ${booking.id} expired, released ${seatIds.length} seats`);
    }
  }
}
