/* eslint-disable no-console */

import { Logger, Inject, createParamDecorator } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Command, CommandRunner } from 'nest-commander';
import { EventTypes } from 'src/constant/nip01.constant';
import { WebSocketClient } from 'src/infrastructure/websocket-client/client';
import * as crypto from 'crypto';

@Command({
  name: 'event',
  arguments: '<message>',
  description: 'Send nostr event to replay',
})
export class SendNostrEventCommand extends CommandRunner {
  logger: Logger = new Logger(SendNostrEventCommand.name);
  @Inject(ConfigService)
  private configService: ConfigService;

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
        null,
        sha256Hash,
        toPkcs8der(this.configService.get<string>('nostrPrivateKey')),
      )
      .toString('hex', 0, 128);

    const client = new WebSocketClient();
    const relayWebsocketUrl =
      this.configService.get<string>('relayWebsocketUrl');
    await client.init(relayWebsocketUrl, (message) =>
      console.log(message.toString()),
    );
    await client.send(JSON.stringify(['EVENT', payload]));
  }
}

// Ref: https://stackoverflow.com/questions/71916954/crypto-sign-function-to-sign-a-message-with-given-private-key
const toPkcs8der = (rawB64) => {
  const rawPrivate = Buffer.from(rawB64, 'base64').subarray(0, 32);
  const prefixPrivateEd25519 = Buffer.from(
    '302e020100300506032b657004220420',
    'hex',
  );
  const der = Buffer.concat([prefixPrivateEd25519, rawPrivate]);
  return crypto.createPrivateKey({ key: der, format: 'der', type: 'pkcs8' });
};
