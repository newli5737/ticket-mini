import { Module } from '@nestjs/common';
import { SeatsController } from './seats.controller';
import { SeatsService } from './seats.service';
import { SeatsGateway } from './seats.gateway';

@Module({
  controllers: [SeatsController],
  providers: [SeatsService, SeatsGateway],
  exports: [SeatsService, SeatsGateway],
})
export class SeatsModule {}
