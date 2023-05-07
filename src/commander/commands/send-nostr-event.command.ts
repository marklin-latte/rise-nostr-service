/* eslint-disable no-console */

import { Logger, Inject } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import { WebSocketClient } from 'src/infrastructure/websocket-client/client';

@Command({
  name: 'send',
  arguments: '<message>',
  description: 'Send nostr event to replay',
})
export class SendNostrEventCommand extends CommandRunner {
  logger: Logger = new Logger(SendNostrEventCommand.name);

  @Inject(WebSocketClient)
  private client: WebSocketClient;
  constructor() {
    super();
  }

  async run(inputs: string[]): Promise<void> {
    const message = inputs[0];
    await this.client.send(message);
  }
}
