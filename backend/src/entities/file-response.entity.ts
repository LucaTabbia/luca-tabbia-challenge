import { Expose } from 'class-transformer';

export interface IFileResponseEntity {
  success: boolean;
  message: string;
  url: string;
  key: string;
}

export class FileResponseEntity implements IFileResponseEntity {
  @Expose()
  success: boolean;

  @Expose()
  message: string;

  @Expose()
  url: string;

  @Expose()
  key: string;

  constructor(data: IFileResponseEntity) {
    this.success = data.success;
    this.message = data.message;
    this.url = data.url;
    this.key = data.key;
  }
}
