import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FilesController } from '@/controllers/files/files.controller';
import { FilesService } from '@/services/files/files.service';

@Module({
  imports: [ConfigModule],
  providers: [FilesService],
  controllers: [FilesController],
  exports: [FilesService],
})
export class FilesModule {}
