import { Test, TestingModule } from '@nestjs/testing';
import { MeterReadingService } from '../meter-readings.service';
import { MeterReading } from '../meter-readings.entity';
import { CsvParserService } from '../meter-readings-csv.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';

describe('MeterReadingService', () => {
  let service: MeterReadingService;
  let repository: jest.Mocked<Repository<MeterReading>>;
  let csvParserService: jest.Mocked<CsvParserService>;

  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeterReadingService,
        {
          provide: getRepositoryToken(MeterReading),
          useValue: {
            findAndCount: jest.fn(),
            manager: {
              connection: {
                createQueryRunner: jest.fn(),
              },
            },
          },
        },
        {
          provide: CsvParserService,
          useValue: {
            parseCsvFile: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            debug: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MeterReadingService>(MeterReadingService);
    repository = module.get(getRepositoryToken(MeterReading));
    csvParserService = module.get(CsvParserService);
  });

  describe('getMeterReadings', () => {
    it('should return paginated meter readings as DTOs', async () => {
      const mockReadings = [new MeterReading(), new MeterReading()];
      repository.findAndCount.mockResolvedValueOnce([mockReadings, 2]);

      const [result, total] = await service.getMeterReadings(1, 10);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { timestamp: 'DESC' },
      });

      expect(result.length).toEqual(2);
      expect(total).toEqual(2);
    });
  });

  describe('processFile', () => {
    it('should process the CSV file and save meter readings', async () => {
      const mockBuffer = Buffer.from('mock data');
      const mockMeterReadings = [new MeterReading(), new MeterReading()];

      csvParserService.parseCsvFile.mockResolvedValueOnce(mockMeterReadings);

      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        manager: {
          upsert: jest.fn(),
        },
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
      };
      repository.manager.connection.createQueryRunner = jest
        .fn()
        .mockReturnValue(mockQueryRunner);

      await service.processFile(mockBuffer);

      expect(csvParserService.parseCsvFile).toHaveBeenCalledWith(mockBuffer);

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.upsert).toHaveBeenCalledTimes(
        mockMeterReadings.length,
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should handle errors during transaction and rollback', async () => {
      const mockBuffer = Buffer.from('mock data');
      const mockMeterReadings = [new MeterReading(), new MeterReading()];

      csvParserService.parseCsvFile.mockResolvedValueOnce(mockMeterReadings);

      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        manager: {
          upsert: jest
            .fn()
            .mockRejectedValueOnce(new Error('Mock upsert error')),
        },
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
      };
      repository.manager.connection.createQueryRunner = jest
        .fn()
        .mockReturnValue(mockQueryRunner);

      await expect(service.processFile(mockBuffer)).rejects.toThrow(
        'Mock upsert error',
      );

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });
});
