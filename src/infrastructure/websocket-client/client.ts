import {
  BadRequestException,
  Inject,
  OnModuleInit,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebSocket } from 'ws';

export { WebSocketClient };

@Injectable()
class WebSocketClient implements OnModuleInit {
  private readonly logger = new Logger(WebSocketClient.name);

  @Inject(ConfigService)
  private configService: ConfigService;
  private wsClient: WebSocket;

  async onModuleInit(): Promise<void> {
    const relayWebsocketUrl =
      this.configService.get<string>('relayWebsocketUrl');
    this.wsClient = new WebSocket(relayWebsocketUrl, {
      perMessageDeflate: false,
    });
    this.wsClient.on('message', (message) => {
      console.log('Received:', message.toString());
    });

    await this.waitForConnection();
  }

  async send(message: string): Promise<void> {
    await this.wsClient.send(message);
    this.logger.log(`Message sent: ${message}`);
  }

  private async waitForConnection(): Promise<void> {
    return new Promise((resolve) => {
      this.wsClient.on('open', () => {
        this.logger.log('Connection established');
        resolve();
      });
    });
  }
}
