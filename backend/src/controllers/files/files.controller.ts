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
import { SignedUrlRequestDto } from '@/dtos/signed-url-request.dto';
import {
  FileInfoResponseDto,
  IFileInfoResponseDto,
} from '@/dtos/file-info-response.dto';
import { FileInfoRequestDto } from '@/dtos/file-info-request.dto';
import {
  CreateResponseDto,
  ICreateResponseDto,
} from '@/dtos/create-response.dto';

@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('upload')
  async getUploadSignedUrl(
    @Body() body: SignedUrlRequestDto,
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
  async getDownloadFileUrl(
    @Query('key') key: string,
  ): Promise<IFileResponseDto> {
    const result = await this.filesService.getDownloadFileUrl(key);
    return Mapper.mapData(FileResponseDto, result);
  }

  @Post('create')
  async createFileInfo(
    @Body() body: FileInfoRequestDto,
  ): Promise<ICreateResponseDto> {
    const result = await this.filesService.createFileInfo(body);
    return Mapper.mapData(CreateResponseDto, result);
  }

  @Get()
  async getFilesByUser(
    @Query('userId') userId: string,
  ): Promise<IFileInfoResponseDto> {
    const result = await this.filesService.getFilesByUser(userId);
    return Mapper.mapData(FileInfoResponseDto, result);
  }
}
