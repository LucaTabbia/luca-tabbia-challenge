import { Expose } from 'class-transformer';

export interface IAuthRequestDto {
  email: string;
  password: string;
}

export class AuthRequestDto implements IAuthRequestDto {
  @Expose()
  email: string;

  @Expose()
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}
