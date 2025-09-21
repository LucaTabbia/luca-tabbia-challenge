import { Expose, Type } from 'class-transformer';
import { FileInfoEntity } from './file-info.entity';

export interface ICreateResponseEntity {
  message: string;
  success: boolean;
  fileInfo: FileInfoEntity
}

export class CreateResponseEntity implements ICreateResponseEntity {
  @Expose()
  success: boolean;

  @Expose()
  message: string;

  @Expose()
  @Type(() => FileInfoEntity)
  fileInfo: FileInfoEntity;

  constructor(data: ICreateResponseEntity) {
    this.success = data.success;
    this.message = data.message;
    this.fileInfo = data.fileInfo;
  }
}
