import { Expose } from 'class-transformer';

export interface IUploadRequestDto {
  filename: string;
  contentType: string;
}

export class UploadRequestDto implements IUploadRequestDto {
  @Expose()
  filename: string;

  @Expose()
  contentType: string;

  constructor(filename: string, contentType: string) {
    this.filename = filename;
    this.contentType = contentType;
  }
}
