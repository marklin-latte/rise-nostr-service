import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { ReplayEvents } from '../constant/event.constant';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entity/event.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway()
export class RelayGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(ws: WebSocket) {
    ws.on('message', (message) => {
      const [event, payload] = JSON.parse(message.toString());
      this[event](ws, payload);
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
  async [ReplayEvents.EVENT](client: any, data: any): Promise<void> {
    const event = new Event();
    event.payload = data;
    try {
      const result = await this.eventsRepository.save(event);
      console.log(result);
    } catch (error) {
      console.log(error);
    }
    client.send('EVENT_ACK');
  }

  // used to request events for receiving events from other clients
  [ReplayEvents.REQ](client: any, data: any): void {
    console.log(data);
  }

  [ReplayEvents.CLOSE](client: any, data: any): void {
    console.log(data);
  }
}
