import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('qr/:bookingId')
  generateQr(@Param('bookingId') bookingId: string) {
    return this.paymentsService.generateQrUrl(bookingId);
  }

  // Webhook endpoint (no auth - called by Sepay)
  @Post('webhook')
  handleWebhook(@Body() payload: any) {
    return this.paymentsService.handleWebhook(payload);
  }
}
