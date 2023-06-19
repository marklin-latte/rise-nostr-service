/* eslint-disable no-console */

import { Logger, Inject, createParamDecorator } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Command, CommandRunner } from 'nest-commander';
import { WebSocketClient } from 'src/infrastructure/websocket-client/client';
import { RelayEvents } from 'src/constant/event.constant';

@Command({
  name: 'close',
  arguments: '',
  description: 'Send nostr close to replay',
})
export class SendNostrCloseCommand extends CommandRunner {
  logger: Logger = new Logger(SendNostrCloseCommand.name);
  @Inject(ConfigService)
  private configService: ConfigService;

  constructor() {
    super();
  }

  async run(inputs: string[]): Promise<void> {
    const subscriptionId = inputs[0];
    const relayWebsocketUrl =
      this.configService.get<string>('relayWebsocketUrl');

    const client = new WebSocketClient();
    await client.init(relayWebsocketUrl, (message) => {
      console.log('Received:', message.toString());
    });
    await client.send(JSON.stringify([RelayEvents.CLOSE, subscriptionId]));
  }
}
