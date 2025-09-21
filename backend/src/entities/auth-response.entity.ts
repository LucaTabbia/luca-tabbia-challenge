import { Expose } from 'class-transformer';

export interface IAuthResponseEntity {
  message: string;
  success: boolean;
  id: string;
  email: string;
}

export class AuthResponseEntity implements IAuthResponseEntity {
  @Expose()
  success: boolean;

  @Expose()
  message: string;

  @Expose()
  id: string;

  @Expose()
  email: string;

  constructor(data: IAuthResponseEntity) {
    this.success = data.success;
    this.message = data.message;
    this.id = data.id;
    this.email = data.email;
  }
}
