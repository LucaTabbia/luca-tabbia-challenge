import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FilesController } from '@/controllers/files/files.controller';
import { FilesService } from '@/services/files/files.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileInfoEntity } from '@/entities/file-info.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([FileInfoEntity])],
  providers: [FilesService],
  controllers: [FilesController],
  exports: [FilesService],
})
export class FilesModule {}
