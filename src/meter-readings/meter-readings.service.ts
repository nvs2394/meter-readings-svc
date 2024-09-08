import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeterReading } from './meter-readings.entity';
import { CsvParserService } from './meter-readings-csv.service';
import { MeterReadingDto } from './dto/get-meter-readings.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class MeterReadingService {
  private readonly logger = new Logger(MeterReadingService.name);

  constructor(
    @InjectRepository(MeterReading)
    private meterReadingRepository: Repository<MeterReading>,
    private csvParserService: CsvParserService,
  ) {}

  async getMeterReadings(
    page: number = 1,
    limit: number = 10,
  ): Promise<[MeterReadingDto[], number]> {
    const skip = (page - 1) * limit;

    const [readings, total] = await this.meterReadingRepository.findAndCount({
      skip,
      take: limit,
      order: { timestamp: 'DESC' },
    });

    const readingDtos = plainToInstance(MeterReadingDto, readings, {
      excludeExtraneousValues: true,
    });
    return [readingDtos, total];
  }

  async processFile(fileBuffer: Buffer): Promise<void> {
    try {
      const meterReadings =
        await this.csvParserService.parseCsvFile(fileBuffer);

      await this.saveMeterReadings(meterReadings);
    } catch (error) {
      this.logger.error('Error processing file', error.stack);
      throw error;
    }
  }

  private async saveMeterReadings(
    meterReadings: MeterReading[],
  ): Promise<void> {
    const queryRunner =
      this.meterReadingRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const reading of meterReadings) {
        await queryRunner.manager.upsert(MeterReading, reading, [
          'nmi',
          'timestamp',
        ]);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error saving meter readings', error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
