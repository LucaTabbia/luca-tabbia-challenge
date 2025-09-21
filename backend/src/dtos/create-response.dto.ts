import { FileInfoEntity } from '@/entities/file-info.entity';
import { Expose, Type } from 'class-transformer';

export interface ICreateResponseDto {
  message: string;
  success: boolean;
  fileInfo: FileInfoEntity
}

export class CreateResponseDto implements ICreateResponseDto {
  @Expose()
  success: boolean;

  @Expose()
  message: string;

  @Expose()
  @Type(() => FileInfoEntity)
  fileInfo: FileInfoEntity;

  constructor(success: boolean, message: string, fileInfo: FileInfoEntity) {
    this.success = success;
    this.message = message;
    this.fileInfo = fileInfo
  }
}
