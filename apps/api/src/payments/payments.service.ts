import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BankAccountsService } from '../bank-accounts/bank-accounts.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private bankAccountsService: BankAccountsService,
  ) {}

  async generateQrUrl(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { event: true },
    });
    if (!booking) throw new NotFoundException('Booking không tồn tại');

    const bankAccount = await this.bankAccountsService.findActive();
    if (!bankAccount) throw new NotFoundException('Chưa cấu hình tài khoản ngân hàng');

    const description = `TICKET${bookingId.slice(0, 8).toUpperCase()}`;
    const qrUrl = `https://qr.sepay.vn/img?acc=${bankAccount.accountNumber}&bank=${bankAccount.bankShortName}&amount=${Math.round(booking.totalPrice)}&des=${description}`;

    return {
      qrUrl,
      bankAccount: {
        bankName: bankAccount.bankName,
        accountNumber: bankAccount.accountNumber,
        accountName: bankAccount.accountName,
      },
      amount: booking.totalPrice,
      description,
      booking,
    };
  }

  // Webhook mechanism (ready for Sepay integration)
  async handleWebhook(payload: {
    transferAmount: number;
    content: string;
    transactionDate: string;
  }) {
    // Extract booking ID from transfer content
    const match = payload.content.match(/TICKET([A-Z0-9]{8})/);
    if (!match) return { success: false, message: 'Không tìm thấy mã booking' };

    const bookingPrefix = match[1].toLowerCase();
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: { startsWith: bookingPrefix },
        status: 'PENDING',
      },
    });

    if (!booking) return { success: false, message: 'Booking không tồn tại hoặc đã được xử lý' };

    // Verify amount
    if (payload.transferAmount < booking.totalPrice) {
      return { success: false, message: 'Số tiền chuyển khoản không đủ' };
    }

    // Auto-confirm would go here (currently manual by admin)
    return {
      success: true,
      message: 'Webhook received - chờ admin xác nhận',
      bookingId: booking.id,
    };
  }
}
