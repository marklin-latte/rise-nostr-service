import { Logger } from '@nestjs/common';
import { WebSocket } from 'ws';

export { WebSocketClient };

class WebSocketClient {
  private readonly logger = new Logger(WebSocketClient.name);

  private wsClient: WebSocket;
  async init(wsUrl: string, onMessage: (message: string) => void) {
    this.wsClient = new WebSocket(wsUrl, {
      perMessageDeflate: false,
    });
    this.wsClient.on('message', onMessage);

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
