/* eslint-disable no-console */

import { Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Command, CommandRunner } from 'nest-commander';
import { WebSocketClient } from 'src/infrastructure/websocket-client/client';
import { ReplayEvents } from 'src/constant/event.constant';

@Command({
  name: 'req',
  arguments: '<subscriptionId>',
  description: 'Send nostr req to replay',
})
export class SendNostrReqCommand extends CommandRunner {
  logger: Logger = new Logger(SendNostrReqCommand.name);
  @Inject(ConfigService)
  private configService: ConfigService;

  @Inject(WebSocketClient)
  private client: WebSocketClient;
  constructor() {
    super();
  }

  async run(inputs: string[]): Promise<void> {
    const subscriptionId = inputs[0];
    await this.client.send(JSON.stringify([ReplayEvents.REQ, subscriptionId]));
  }
}
