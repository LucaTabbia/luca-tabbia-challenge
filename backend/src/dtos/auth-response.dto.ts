import { Expose } from 'class-transformer';

export interface IAuthResponseDto {
  message: string;
  success: boolean;
  id: string;
  email: string;
}

export class AuthResponseDto implements IAuthResponseDto {
  @Expose()
  success: boolean;

  @Expose()
  message: string;

  @Expose()
  id: string;

  @Expose()
  email: string;

  constructor(success: boolean, message: string, id: string, email: string) {
    this.success = success;
    this.message = message;
    this.id = id;
    this.email = email;
  }
}
