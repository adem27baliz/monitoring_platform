import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('metrics')
@Index(['agentId', 'timestamp'])
export class MetricEntity {
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

  // CPU
  @Column('float')
  cpuUsagePercent: number;

  @Column('float')
  cpuUserPercent: number;

  @Column('float')
  cpuSystemPercent: number;

  // Memory
  @Column('float')
  memoryUsagePercent: number;

  @Column('bigint')
  memoryUsedBytes: number;

  @Column('bigint')
  memoryAvailableBytes: number;

  // Disk
  @Column('float')
  diskReadBps: number;

  @Column('float')
  diskWriteBps: number;

  // Network
  @Column('float')
  networkRxBps: number;

  @Column('float')
  networkTxBps: number;
}
