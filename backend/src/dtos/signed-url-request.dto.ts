import { Expose } from 'class-transformer';

export interface ISignedUrlRequestDto {
  filename: string;
  contentType: string;
}

export class SignedUrlRequestDto implements ISignedUrlRequestDto {
  @Expose()
  filename: string;

  @Expose()
  contentType: string;

  constructor(filename: string, contentType: string) {
    this.filename = filename;
    this.contentType = contentType;
  }
}
