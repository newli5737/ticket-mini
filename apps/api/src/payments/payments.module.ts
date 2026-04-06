import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { BankAccountsModule } from '../bank-accounts/bank-accounts.module';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [BankAccountsModule, BookingsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
