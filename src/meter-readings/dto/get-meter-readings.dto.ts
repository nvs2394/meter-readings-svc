import 'reflect-metadata';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Expose, Transform } from 'class-transformer';

export class GetMeterReadingsQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

export class MeterReadingDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  nmi: string;

  @ApiProperty()
  @Expose()
  timestamp: Date;

  @ApiProperty()
  @Expose()
  consumption: number;
}

export class GetMeterReadingsResponseDto {
  @ApiProperty({ type: [MeterReadingDto] })
  data: MeterReadingDto[];

  @ApiProperty()
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
