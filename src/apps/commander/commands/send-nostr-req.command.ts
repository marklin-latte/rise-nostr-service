/* eslint-disable no-console */

import { Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Command, CommandRunner } from 'nest-commander';
import { WebSocketClient } from 'src/infrastructure/websocket-client/client';
import { RelayEvents } from 'src/constant/event.constant';

@Command({
  name: 'req',
  arguments: '<subscriptionId>',
  description: 'Send nostr req to replay',
})
export class SendNostrReqCommand extends CommandRunner {
  logger: Logger = new Logger(SendNostrReqCommand.name);
  @Inject(ConfigService)
  private configService: ConfigService;

  constructor() {
    super();
  }

  async run(inputs: string[]): Promise<void> {
    const subscriptionId = inputs[0];
    const client = new WebSocketClient();
    const relayWebsocketUrl =
      this.configService.get<string>('relayWebsocketUrl');
    await client.init(relayWebsocketUrl, (message) =>
      console.log(message.toString()),
    );
    await client.send(JSON.stringify([RelayEvents.REQ, subscriptionId]));
  }
}
