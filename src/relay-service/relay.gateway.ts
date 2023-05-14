import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { ReplayEvents } from '../constant/event.constant';
import * as crypto from 'crypto';

@WebSocketGateway()
export class RelayGateway implements OnGatewayConnection, OnGatewayDisconnect {
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
  [ReplayEvents.EVENT](client: any, data: any): void {
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
