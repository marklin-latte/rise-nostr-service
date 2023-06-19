import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { AggregatorReceivedEvent } from 'src/entity/aggregator-received-event.entity';
import { EventAggregatorService } from './event-aggreator.service';
import { WebsocketClientModule } from 'src/infrastructure/websocket-client/websocket-client.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProducerService } from './event-producer.service';
import { ConsumerService } from './event-consumer.service';

AggregatorReceivedEvent;

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
        entities: [AggregatorReceivedEvent],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Event]),
    WebsocketClientModule,
    ClientsModule.register([
      {
        name: 'EVENT_AGGREGATOR_KAFKA',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'event-aggregator-client',
            brokers: ['localhost:9094'],
          },
          consumer: {
            groupId: 'event-aggregator-consumer',
          },
        },
      },
    ]),
  ],
  providers: [EventAggregatorService, ProducerService, ConsumerService],
})
export class EventAggregateModule {}
