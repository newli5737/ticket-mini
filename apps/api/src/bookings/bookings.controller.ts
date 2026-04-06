import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() body: { eventId: string; seatIds: string[] }) {
    return this.bookingsService.create(req.user.sub, body.eventId, body.seatIds);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMyBookings(@Request() req) {
    return this.bookingsService.findByUser(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.bookingsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(':id/confirm')
  confirmPayment(@Param('id') id: string) {
    return this.bookingsService.confirmPayment(id);
  }
}
