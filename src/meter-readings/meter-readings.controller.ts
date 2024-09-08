import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  Query,
  ParseFilePipe,
  FileTypeValidator,
  FileValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MeterReadingService } from './meter-readings.service';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { Multer } from 'multer';
import {
  GetMeterReadingsQueryDto,
  GetMeterReadingsResponseDto,
} from './dto/get-meter-readings.dto';

class FileNotEmptyValidator extends FileValidator<Record<string, any>> {
  constructor(validationOptions?: Record<string, any>) {
    super(validationOptions);
  }

  isValid(file?: any): boolean | Promise<boolean> {
    return file.size > 0;
  }

  buildErrorMessage(): string {
    return 'File cannot be empty';
  }
}

@ApiTags('meter-readings')
@Controller('meter-readings')
export class MeterReadingController {
  constructor(private readonly meterReadingService: MeterReadingService) {}

  @Get()
  @ApiOperation({ summary: 'Get meter readings' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of meter readings',
    type: GetMeterReadingsResponseDto,
  })
  async getMeterReadings(
    @Query() query: GetMeterReadingsQueryDto,
  ): Promise<GetMeterReadingsResponseDto> {
    const { page, limit } = query;
    const [readings, total] = await this.meterReadingService.getMeterReadings(
      page,
      limit,
    );
    return {
      data: readings,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and process a meter reading file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The meter reading file to upload',
        },
      },
    },
  })
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'csv' }),
          new FileNotEmptyValidator({ message: 'File is empty' }),
        ],
      }),
    )
    file: Multer.File,
  ) {
    await this.meterReadingService.processFile(file.buffer);

    return {
      data: {
        upload: 'success',
      },
    };
  }
}
