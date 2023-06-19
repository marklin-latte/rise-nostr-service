import { Injectable } from '@nestjs/common';
import { ClientKafka, Transport, Client } from '@nestjs/microservices';

@Injectable()
export class ProducerService {
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

  async sendToTopic(topic: string, message: any): Promise<void> {
    await this.client.connect();
    await this.client.send(topic, message);
  }
}
