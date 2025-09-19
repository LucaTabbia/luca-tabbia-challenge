import { Expose } from 'class-transformer';

export interface IFileResponseEntity {
  success: boolean;
  message: string;
  key: string;
}

export class FileResponseEntity implements IFileResponseEntity {
  @Expose()
  success: boolean;

  @Expose()
  message: string;

  @Expose()
  key: string;

  constructor(data: IFileResponseEntity) {
    this.success = data.success;
    this.message = data.message;
    this.key = data.key;
  }
}
