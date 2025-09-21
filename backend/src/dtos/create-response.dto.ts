import { Expose } from 'class-transformer';

export interface ICreateResponseDto {
  message: string;
  success: boolean;
}

export class CreateResponseDto implements ICreateResponseDto {
  @Expose()
  success: boolean;

  @Expose()
  message: string;

  constructor(success: boolean, message: string) {
    this.success = success;
    this.message = message;
  }
}
