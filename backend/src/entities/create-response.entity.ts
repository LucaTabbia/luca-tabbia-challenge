import { Expose } from 'class-transformer';

export interface ICreateResponseEntity {
  message: string;
  success: boolean;
}

export class CreateResponseEntity implements ICreateResponseEntity {
  @Expose()
  success: boolean;

  @Expose()
  message: string;

  constructor(data: ICreateResponseEntity) {
    this.success = data.success;
    this.message = data.message;
  }
}
