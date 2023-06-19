import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  ClientKafka,
  MessagePattern,
  Client,
  Transport,
} from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { EventDto } from 'src/dto/event.dto';
import { AggregatorReceivedEvent } from 'src/entity/aggregator-received-event.entity';
import { Repository } from 'typeorm';
const DEFAULT_TOPIC = 'event';

@Injectable()
export class ConsumerService implements OnModuleInit {
  // @InjectRepository(AggregatorReceivedEvent)
  // private eventsRepository: Repository<AggregatorReceivedEvent>;
  @Client({
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
  })
  client: ClientKafka;

  async onModuleInit() {
    this.client.subscribeToResponseOf(DEFAULT_TOPIC);
    await this.client.connect();
  }

  @MessagePattern(DEFAULT_TOPIC)
  handleMessage(message: EventDto): void {
    console.log('4');
    console.log('Received message:', message);
    const event = new AggregatorReceivedEvent();
    event.payload = {
      message: message.paylod,
    };
    event.from = message.relay.url;
    // await this.eventsRepository.save(event);
  }
}
