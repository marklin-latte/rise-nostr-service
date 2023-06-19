import { Module } from '@nestjs/common';
import { RelayGateway } from './relay.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../../entity/event.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from 'src/config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'cockroachdb',
        url: configService.get<string>('db.url'),
        entities: [Event],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Event]),
  ],
  providers: [RelayGateway],
})
export class RelayModule {}
