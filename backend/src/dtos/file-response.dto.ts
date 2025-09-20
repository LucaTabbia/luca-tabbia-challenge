import { Expose } from 'class-transformer';

export interface IFileResponseDto {
  success: boolean;
  message: string;
  url: string;
  key: string;
}

export class FileResponseDto implements IFileResponseDto {
  @Expose()
  success: boolean;

  @Expose()
  message: string;

  @Expose()
  url: string;

  @Expose()
  key: string;

  constructor(success: boolean, message: string, url: string, key: string) {
    this.success = success;
    this.message = message;
    this.url = url;
    this.key = key;
  }
}
