import { Expose } from 'class-transformer';
import { IsEmail, MinLength } from 'class-validator';

export interface IAuthRequestDto {
  email: string;
  password: string;
}

export class AuthRequestDto implements IAuthRequestDto {
  @IsEmail()
  @Expose()
  email: string;

  @MinLength(6)
  @Expose()
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}
