import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MeterReadingModule } from './meter-readings/meter-readings.module';
import { MeterReading } from './meter-readings/meter-readings.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'meter_readings',
      entities: [MeterReading],
      synchronize: true, // Set to false in production
    }),
    MeterReadingModule,
  ],
})
export class AppModule {}
