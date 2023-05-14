import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { ReplayEvents } from '../constant/event.constant';

@WebSocketGateway(8080)
export class ReplayGateway implements OnGatewayConnection, OnGatewayDisconnect {
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

  [ReplayEvents.EVENT](client: any, data: any): void {
    console.log(data);
    client.send('EVENT_ACK');
  }

  [ReplayEvents.REQ](client: any, data: any): void {
    console.log(data);
  }

  [ReplayEvents.CLOSE](client: any, data: any): void {
    console.log(data);
  }
}
