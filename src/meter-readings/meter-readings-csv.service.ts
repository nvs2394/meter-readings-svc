import { Injectable, Logger } from '@nestjs/common';
import { Readable } from 'stream';
import * as csv from 'csv-parser';
import { MeterReading } from './meter-readings.entity';

@Injectable()
export class CsvParserService {
  private readonly logger = new Logger(CsvParserService.name);

  private currentNMI: string | null = null;
  private currentIntervalLength: number | null = null;

  async parseCsvFile(fileBuffer: Buffer): Promise<MeterReading[]> {
    const meterReadings: MeterReading[] = [];

    const stream = this.createReadableStream(fileBuffer);

    return new Promise((resolve, reject) => {
      this.logger.debug('Starting CSV parsing...');

      stream
        .pipe(
          csv({
            headers: false,
            mapHeaders: ({ index }) => index.toString(),
          }),
        )
        .on('data', (row: unknown) => {
          try {
            this.processRow(row, meterReadings);
          } catch (error) {
            this.logger.error('Error during row processing:', error);
            reject(error);
          }
        })
        .on('end', () => this.handleParsingComplete(meterReadings, resolve))
        .on('error', (error) => this.handleParsingError(error, reject));
    });
  }

  private createReadableStream(fileBuffer: Buffer): Readable {
    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null);
    return stream;
  }

  private processRow(row: unknown, meterReadings: MeterReading[]): void {
    this.logger.debug(`Row structure: ${JSON.stringify(row)}`);
    const rowArray = Object.values(row) as string[];

    if (!Array.isArray(rowArray)) {
      this.logger.error('Parsed row is not an array. Check CSV formatting.');
      return;
    }

    if (rowArray[0] === '200') {
      this.process200Record(rowArray);
    } else if (
      rowArray[0] === '300' &&
      this.currentNMI &&
      this.currentIntervalLength
    ) {
      this.process300Record(rowArray, meterReadings);
    }
  }

  private process200Record(rowArray: string[]): void {
    this.currentNMI = rowArray[1];
    this.currentIntervalLength = parseInt(rowArray[8]);
    this.logger.debug(
      `Detected '200' record: NMI = ${this.currentNMI}, Interval Length = ${this.currentIntervalLength}`,
    );

    if (isNaN(this.currentIntervalLength)) {
      throw new Error(`Invalid interval length: ${rowArray[8]}`);
    }
  }

  private process300Record(
    rowArray: string[],
    meterReadings: MeterReading[],
  ): void {
    const date = rowArray[1];
    this.logger.debug(`Detected '300' record with date: ${date}`);

    for (let i = 2; i < rowArray.length; i++) {
      const value = parseFloat(rowArray[i]);
      if (!isNaN(value)) {
        const timestamp = this.calculateTimestamp(
          date,
          i - 2,
          this.currentIntervalLength!,
        );
        this.logger.debug(`Timestamp: ${timestamp}, Consumption: ${value}`);
        meterReadings.push(
          this.createMeterReading(this.currentNMI!, timestamp, value),
        );
      } else {
        throw new Error(`Invalid consumption value: ${rowArray[i]}`);
      }
    }
  }

  private createMeterReading(
    nmi: string,
    timestamp: Date,
    consumption: number,
  ): MeterReading {
    const meterReading = new MeterReading();
    meterReading.nmi = nmi;
    meterReading.timestamp = timestamp;
    meterReading.consumption = consumption;
    return meterReading;
  }

  private handleParsingComplete(
    meterReadings: MeterReading[],
    resolve: (value: MeterReading[]) => void,
  ): void {
    this.logger.debug(`Total meter readings parsed: ${meterReadings.length}`);
    resolve(meterReadings);
  }

  private handleParsingError(
    error: Error,
    reject: (reason?: any) => void,
  ): void {
    this.logger.error('Error processing file', error.stack);
    reject(error);
  }

  private calculateTimestamp(
    date: string,
    intervalIndex: number,
    intervalLength: number,
  ): Date {
    const year = parseInt(date.slice(0, 4), 10);
    const month = parseInt(date.slice(4, 6), 10) - 1;
    const day = parseInt(date.slice(6, 8), 10);
    const baseDate = new Date(year, month, day);

    if (isNaN(baseDate.getTime())) {
      throw new Error(`Invalid date: ${date}`);
    }

    const minutes = intervalIndex * intervalLength;
    baseDate.setMinutes(baseDate.getMinutes() + minutes);
    return baseDate;
  }
}
