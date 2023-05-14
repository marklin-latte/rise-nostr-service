import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { RelayModule } from './relay-service/relay.module';

async function bootstrap() {
  const app = await NestFactory.create(RelayModule);
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
