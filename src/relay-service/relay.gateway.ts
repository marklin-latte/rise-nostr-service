import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { RelayEvents } from '../constant/event.constant';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entity/event.entity';
import { Injectable } from '@nestjs/common';
import { validateEvent } from 'nostr-tools';

@Injectable()
@WebSocketGateway()
export class RelayGateway implements OnGatewayConnection, OnGatewayDisconnect {
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
    console.log('onGatewayConnection');
  }

  handleDisconnect() {
    console.log('onGatewayDisconnect');
  }

  /**
   * ref: https://github.com/nostr-protocol/nips/blob/master/01.md
   * ref: https://github.com/nostr-protocol/nips/blob/master/11.md
   */
  async [RelayEvents.EVENT](client: any, messages: any): Promise<void> {
    const eventData = messages[1];
    if (!validateEvent(eventData)) {
      throw new Error('Invalid event');
    }
    const event = new Event();
    event.payload = eventData;
    try {
      const result = await this.eventsRepository.save(event);
      console.log(result);
    } catch (error) {
      console.log(error);
    }
    client.send('EVENT_ACK');
  }

  [RelayEvents.REQ](client: any, messages: any): void {
    const subscriptionId = messages[1];
    this.subscriptionClients[subscriptionId] = client;
  }

  [RelayEvents.CLOSE](client: any, message: any): void {
    const subscriptionId = message[1];
    if (this.subscriptionClients[subscriptionId]) {
      delete this.subscriptionClients[subscriptionId];
    }
  }
}
