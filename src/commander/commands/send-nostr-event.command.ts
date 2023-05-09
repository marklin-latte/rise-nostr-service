/* eslint-disable no-console */

import { Logger, Inject, createParamDecorator } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Command, CommandRunner } from 'nest-commander';
import { EventTypes } from 'src/constant/nip01.constant';
import { WebSocketClient } from 'src/infrastructure/websocket-client/client';
import * as crypto from 'crypto';

@Command({
  name: 'send',
  arguments: '<message>',
  description: 'Send nostr event to replay',
})
export class SendNostrEventCommand extends CommandRunner {
  logger: Logger = new Logger(SendNostrEventCommand.name);
  @Inject(ConfigService)
  private configService: ConfigService;

  @Inject(WebSocketClient)
  private client: WebSocketClient;
  constructor() {
    super();
  }

  async run(inputs: string[]): Promise<void> {
    const message = inputs[0];
    // ref: https://github.com/nostr-protocol/nips/blob/master/01.md
    const payload = {
      id: null,
      pubkey: this.configService.get<string>('nostrPublicKey'),
      created_at: Math.round(Date.now() / 1000),
      kind: EventTypes.TEXT_NOTE,
      tags: [],
      content: message,
      sig: null,
    };
    const eventData = [
      0,
      payload.pubkey,
      payload.created_at,
      payload.kind,
      payload.tags,
      payload.content,
    ];
    // write a 32-bytes lowercase hex-encoded sha256 of the serialized event data
    payload.id = crypto
      .createHash('sha256')
      .update(JSON.stringify(eventData))
      .digest('hex')
      .toLowerCase()
      .slice(0, 64); // 32 bytes = 64 characters in hex encoding
    // 64-bytes hex of the signature of the sha256 hash of the serialized event data, which is the same as the "id" field
    const sha256Hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(eventData))
      .digest();
    payload.sig = crypto
      .sign(
        'sha256',
        sha256Hash,
        this.configService.get<string>('nostrPrivateKey'),
      )
      .toString('hex', 0, 128);

    await this.client.send(JSON.stringify(['EVENT', JSON.stringify(payload)]));
  }
}
