import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('anomalies')
@Index(['agentId', 'timestamp'])
export class AnomalyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  agentId: string;

  @Column()
  hostname: string;

  @Column('bigint')
  timestamp: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column('float')
  score: number;

  @Column()
  confidence: string;

  // Snapshot of metrics at time of anomaly
  @Column('float')
  cpuPercent: number;

  @Column('float')
  memoryPercent: number;

  @Column('float')
  diskReadBps: number;

  @Column('float')
  diskWriteBps: number;

  // Raw model details stored as JSON
  @Column('jsonb')
  modelDetails: object;
}
