import { Module } from '@nestjs/common';
import { ReplayGateway } from './replay.gateway';

@Module({
  providers: [ReplayGateway],
})
export class ReplayModule {}
