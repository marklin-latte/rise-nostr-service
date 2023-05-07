import { CommandFactory } from 'nest-commander';
import { CommandModule } from './commander.module';

async function bootstrap() {
  await CommandFactory.run(CommandModule, {
    logger: console,
  });
}

bootstrap();
