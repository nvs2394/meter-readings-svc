import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsNotEmpty, IsDate, IsNumber, Length } from 'class-validator';

@Entity('meter_readings')
@Unique(['nmi', 'timestamp'])
export class MeterReading {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10 })
  @IsNotEmpty()
  @Length(10, 10)
  nmi: string;

  @Column({ type: 'timestamp' })
  @IsNotEmpty()
  @IsDate()
  timestamp: Date;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  @IsNotEmpty()
  @IsNumber()
  consumption: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
