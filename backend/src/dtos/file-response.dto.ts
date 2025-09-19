import { Expose } from 'class-transformer';

export interface IFileResponseDto {
  success: boolean;
  message: string;
  key: string;
}

export class FileResponseDto implements IFileResponseDto {
  @Expose()
  success: boolean;

  @Expose()
  message: string;

  @Expose()
  key: string;

  constructor(success: boolean, message: string, key: string) {
    this.success = success;
    this.message = message;
    this.key = key;
  }
}
