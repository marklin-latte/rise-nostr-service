import { WebSocketGateway } from '@nestjs/websockets';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WebSocketClient } from 'src/infrastructure/websocket-client/client';
import { ProducerService } from './event-producer.service';

@Injectable()
@WebSocketGateway()
export class EventAggregatorService implements OnModuleInit {
  logger: Logger = new Logger(EventAggregatorService.name);
  private subscriptionId = '1s';

  @Inject(ProducerService)
  private producerService: ProducerService;

  async onModuleInit() {
    const relayUrls = ['ws://127.0.0.1:3000'];

    for (const relayUrl of relayUrls) {
      const client = new WebSocketClient();
      await client.init(relayUrl, async (message) => {
        this.logger.log(`Received from:${relayUrl} ${message.toString()}`);
        await this.producerService.sendToTopic('event', {
          payload: message.toString(),
          relay: {
            url: relayUrl,
          },
        });
      });
      this.logger.log(`Connecting to:${relayUrl}`);
      await client.send(JSON.stringify(['REQ', this.subscriptionId]));
      this.logger.log(`Sent REQ to:${relayUrl}`);
    }
  }
}
