import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MeterReadingController } from './meter-readings.controller';
import { MeterReadingService } from './meter-readings.service';
import { MeterReading } from './meter-readings.entity';
import { CsvParserService } from './meter-readings-csv.service';

@Module({
  imports: [TypeOrmModule.forFeature([MeterReading])],
  controllers: [MeterReadingController],
  providers: [MeterReadingService, CsvParserService],
})
export class MeterReadingModule {}
