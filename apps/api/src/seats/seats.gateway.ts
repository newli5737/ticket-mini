import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SeatsService } from './seats.service';

@WebSocketGateway({
  cors: { origin: ['http://localhost:3000'], credentials: true },
  namespace: '/seats',
})
export class SeatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>(); // socketId -> userId

  constructor(private seatsService: SeatsService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    const userId = this.userSockets.get(client.id);
    if (userId) {
      const unlockedSeats = await this.seatsService.unlockAllByUser(userId);
      for (const seatId of unlockedSeats) {
        this.server.emit('seat_unlocked', { seatId });
      }
      this.userSockets.delete(client.id);
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_event')
  async handleJoinEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { eventId: string; userId: string },
  ) {
    this.userSockets.set(client.id, data.userId);
    client.join(`event:${data.eventId}`);
    const seats = await this.seatsService.findByEvent(data.eventId);
    client.emit('seats_update', seats);
  }

  @SubscribeMessage('lock_seat')
  async handleLockSeat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { seatId: string; eventId: string; userId: string },
  ) {
    const success = await this.seatsService.lockSeat(data.seatId, data.userId);
    if (success) {
      this.server.to(`event:${data.eventId}`).emit('seat_locked', {
        seatId: data.seatId,
        lockedBy: data.userId,
      });
    } else {
      client.emit('lock_failed', {
        seatId: data.seatId,
        reason: 'Ghế đã bị khóa bởi người khác',
      });
    }
  }

  @SubscribeMessage('unlock_seat')
  async handleUnlockSeat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { seatId: string; eventId: string; userId: string },
  ) {
    const success = await this.seatsService.unlockSeat(data.seatId, data.userId);
    if (success) {
      this.server.to(`event:${data.eventId}`).emit('seat_unlocked', { seatId: data.seatId });
    }
  }

  emitSeatSold(eventId: string, seatIds: string[]) {
    for (const seatId of seatIds) {
      this.server.to(`event:${eventId}`).emit('seat_sold', { seatId });
    }
  }
}
