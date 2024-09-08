import { Test, TestingModule } from '@nestjs/testing';
import { CsvParserService } from '../meter-readings-csv.service';
import { Logger } from '@nestjs/common';

describe('CsvParserService', () => {
  let service: CsvParserService;

  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CsvParserService],
    }).compile();

    service = module.get<CsvParserService>(CsvParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should correctly parse a valid CSV file', async () => {
    const csvData = `200,NEM1201009,E1E2,1,E1,N1,01009,kWh,30,20050610\n300,20050301,0.461,0.810,1.234,1.507\n`;
    const fileBuffer = Buffer.from(csvData);

    const meterReadings = await service.parseCsvFile(fileBuffer);

    expect(meterReadings).toBeDefined();
    expect(meterReadings.length).toBeGreaterThan(0);

    expect(meterReadings[0].nmi).toEqual('NEM1201009');
    expect(meterReadings[0].consumption).toBe(0.461);
  });

  it('should handle invalid interval length in 200 record', async () => {
    const csvData = `200,NEM1201009,E1E2,1,E1,N1,01009,kWh,invalidIntervalLength,20050610\n`;
    const fileBuffer = Buffer.from(csvData);

    await expect(service.parseCsvFile(fileBuffer)).rejects.toThrow(
      'Invalid interval length',
    );
  });

  it('should handle invalid date in 300 record', async () => {
    const csvData = `200,NEM1201009,E1E2,1,E1,N1,01009,kWh,30,20050610\n300,invalidDate,0.461,0.810,1.234\n`;
    const fileBuffer = Buffer.from(csvData);

    await expect(service.parseCsvFile(fileBuffer)).rejects.toThrow(
      'Invalid date',
    );
  });

  it('should handle error during parsing', async () => {
    const csvData = `200,NEM1201009,E1E2,1,E1,N1,01009,kWh,30,20050610\n300,20050301,0.461,invalidConsumption\n`;
    const fileBuffer = Buffer.from(csvData);

    const mockLoggerError = jest.spyOn(service['logger'], 'error');

    await expect(service.parseCsvFile(fileBuffer)).rejects.toThrow(
      'Invalid consumption value',
    );

    expect(mockLoggerError).toHaveBeenCalled();
  });

  it('should handle empty file', async () => {
    const fileBuffer = Buffer.from('');

    const meterReadings = await service.parseCsvFile(fileBuffer);

    expect(meterReadings.length).toEqual(0);
  });
});
