import { Expose, Type } from 'class-transformer';
import { FileInfoEntity } from './file-info.entity';

export interface IFileInfoResponseEntity {
  success: boolean;
  message: string;
  files: FileInfoEntity[];
}

export class FileInfoResponseEntity implements IFileInfoResponseEntity {
  @Expose()
  success: boolean;

  @Expose()
  message: string;

  @Expose()
  @Type(() => FileInfoEntity)
  files: FileInfoEntity[];

  constructor(data: FileInfoResponseEntity) {
    this.success = data.success;
    this.message = data.message;
    this.files = data.files;
  }
}
