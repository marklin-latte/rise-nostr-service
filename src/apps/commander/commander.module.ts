import { Module } from '@nestjs/common';
import { SendNostrEventCommand } from './commands/send-nostr-event.command';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
  ],
  providers: [SendNostrEventCommand],
})
export class CommandModule {}
