import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from '@/services/files/files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { Response } from 'express';
import { Mapper } from '@/utils/mapper/mapper';
import { IFileResponseDto, FileResponseDto } from '@/dtos/file-response.dto';

@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<IFileResponseDto> {
    const result = await this.filesService.uploadFile(file);
    return Mapper.mapData(FileResponseDto, result);
  }

  @Get('download')
  async downloadFile(@Query('key') key: string, @Res() res: Response) {
    const { stream, contentType } = await this.filesService.downloadFile(key);
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${key}"`,
    });
    stream.pipe(res);
  }
}
