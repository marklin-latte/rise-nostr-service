import { Logger, Module } from '@nestjs/common';
import { SendNostrEventCommand } from './commands/send-nostr-event.command';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { WebsocketClientModule } from 'src/infrastructure/websocket-client/websocket-client.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    WebsocketClientModule,
  ],
  providers: [SendNostrEventCommand],
})
export class CommandModule {}
