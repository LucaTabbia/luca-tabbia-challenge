import { FileInfoEntity } from '@/entities/file-info.entity';
import { Expose, Type } from 'class-transformer';

export interface IFileInfoResponseDto {
  success: boolean;
  message: string;
  files: FileInfoEntity[];
}

export class FileInfoResponseDto implements IFileInfoResponseDto {
  @Expose()
  success: boolean;

  @Expose()
  message: string;

  @Expose()
  @Type(() => FileInfoEntity)
  files: FileInfoEntity[];

  constructor(success: boolean, message: string, files: FileInfoEntity[]) {
    this.success = success;
    this.message = message;
    this.files = files;
  }
}
