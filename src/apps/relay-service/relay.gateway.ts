import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { RelayEvents } from '../../constant/event.constant';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../entity/event.entity';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
@WebSocketGateway()
export class RelayGateway implements OnGatewayConnection, OnGatewayDisconnect {
  logger: Logger = new Logger(RelayGateway.name);

  private subscriptionClients: WebSocket[] = [];
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(ws: WebSocket) {
    ws.on('message', (message) => {
      const messages = JSON.parse(message.toString());
      this[messages[0]](ws, messages);
    });
    this.logger.log('New client connected');
  }

  handleDisconnect() {
    this.logger.log('Client disconnected');
  }

  /**
   * ref: https://github.com/nostr-protocol/nips/blob/master/01.md
   * ref: https://github.com/nostr-protocol/nips/blob/master/11.md
   */
  async [RelayEvents.EVENT](client: any, messages: any): Promise<void> {
    const eventData = messages[1];
    const event = new Event();
    event.payload = eventData;
    client.send('EVENT_ACK');
    this.logger.log(`Received event from client`);
    await this.eventsRepository.save(event);

    for (const subscription of this.subscriptionClients) {
      this.logger.log(
        `Sending event to client to ${subscription.subscriptionId}}`,
      );
      await subscription.client.send(JSON.stringify(['EVENT', eventData]));
    }
  }

  [RelayEvents.REQ](client: any, messages: any): void {
    this.logger.log(`Received REQ from client`);
    const subscriptionId = messages[1];
    this.subscriptionClients.push({
      subscriptionId,
      client,
    });
  }

  [RelayEvents.CLOSE](client: any, message: any): void {
    const subscriptionId = message[1];
    if (this.subscriptionClients[subscriptionId]) {
      delete this.subscriptionClients[subscriptionId];
    }
  }
}
