import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { Expose } from 'class-transformer';

export interface IFileInfoEntity {
  id: string;
  user: UserEntity;
  userId: string;
  key: string;
  name: string;
  size: number;
  mimetype: string;
  createdAt: Date;
}

@Entity('file_info')
export class FileInfoEntity implements IFileInfoEntity {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.files)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column()
  @Expose()
  userId: string;

  @Column()
  @Expose()
  key: string;

  @Column()
  @Expose()
  name: string;

  @Column()
  @Expose()
  size: number;

  @Column()
  @Expose()
  mimetype: string;

  @CreateDateColumn()
  @Expose()
  createdAt: Date;

  constructor(data: Partial<IFileInfoEntity>) {
    Object.assign(this, data);
  }
}
