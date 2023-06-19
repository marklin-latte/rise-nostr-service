import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { RelayModule } from './apps/relay-service/relay.module';
import { EventAggregateModule } from './apps/event-aggregator/event-aggregator.module';

async function bootstrap() {
  const relayService = await NestFactory.create(RelayModule);
  relayService.useWebSocketAdapter(new WsAdapter(relayService));
  await relayService.listen(3000);
  console.log(`Relay Service is running on: ${await relayService.getUrl()}`);

  const eventAggregateService = await NestFactory.create(EventAggregateModule);
  await eventAggregateService.listen(4000);
  console.log(
    `EventAggregator service is running on: ${await eventAggregateService.getUrl()}`,
  );
}
bootstrap();
