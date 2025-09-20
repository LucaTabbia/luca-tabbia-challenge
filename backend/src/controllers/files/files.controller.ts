import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { FilesService } from '@/services/files/files.service';
import { Mapper } from '@/utils/mapper/mapper';
import { IFileResponseDto, FileResponseDto } from '@/dtos/file-response.dto';
import { UploadRequestDto } from '@/dtos/upload-request.dto';

@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) { }

  @Post('upload')
  async getUploadSignedUrl(
    @Body() body: UploadRequestDto,
  ): Promise<IFileResponseDto> {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'text/plain',
    ];

    if (!allowedMimeTypes.includes(body.contentType)) {
      throw new BadRequestException('The file type is not supported');
    }

    const result = await this.filesService.getUploadSignedUrl(body);

    return Mapper.mapData(FileResponseDto, result);
  }

  @Get('download')
  async getDownloadFileUrl(@Query('key') key: string): Promise<IFileResponseDto> {
    const result = await this.filesService.getDownloadFileUrl(key);
    return Mapper.mapData(FileResponseDto, result);
  }
}
