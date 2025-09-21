import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { FileInfoEntity } from './file-info.entity';

export interface IUserEntity {
  id: string;
  email: string;
  password: string;
  files?: FileInfoEntity[];
}

@Entity('user')
export class UserEntity implements IUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => FileInfoEntity, (file) => file.user)
  files?: FileInfoEntity[];

  constructor(data: Partial<IUserEntity>) {
    Object.assign(this, data);
  }
}
