import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AggregatorReceivedEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  from: string;

  @Column({
    type: 'jsonb',
  })
  payload: object;
}
