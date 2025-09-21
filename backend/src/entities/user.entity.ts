import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export interface IUserEntity {
  id: string;
  email: string;
  password: string;
}

@Entity()
export class User implements IUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  constructor(id: string, email: string, password: string) {
    this.id = id;
    this.email = email;
    this.password = password;
  }
}
