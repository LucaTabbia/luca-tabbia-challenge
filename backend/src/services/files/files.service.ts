import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import {
  FileResponseEntity,
  IFileResponseEntity,
} from '@/entities/file-response.entity';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { SignedUrlRequestDto } from '@/dtos/signed-url-request.dto';
import { FileInfoEntity } from '@/entities/file-info.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FileInfoResponseEntity,
  IFileInfoResponseEntity,
} from '@/entities/file-info-response.entity';
import { FileInfoRequestDto } from '@/dtos/file-info-request.dto';
import {
  CreateResponseEntity,
  ICreateResponseEntity,
} from '@/entities/create-response.entity';

@Injectable()
export class FilesService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(
    private config: ConfigService,
    @InjectRepository(FileInfoEntity)
    private fileRepo: Repository<FileInfoEntity>,
  ) {
    this.bucketName = this.config.get<string>('S3_BUCKET_NAME') || '';
    this.s3Client = new S3Client({
      region: this.config.get<string>('AWS_REGION') || 'us-west-1',
      endpoint: this.config.get<string>('S3_ENDPOINT') || '',
      credentials: {
        accessKeyId: this.config.get<string>('S3_ACCESS_KEY_ID') || '',
        secretAccessKey: this.config.get<string>('S3_SECRET_ACCESS_KEY') || '',
      },
      forcePathStyle: true,
    });
  }

  async getUploadSignedUrl(
    fileInfo: SignedUrlRequestDto,
  ): Promise<IFileResponseEntity> {
    const key = `${uuidv4()}-${fileInfo.filename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: fileInfo.contentType,
    });

    try {
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 300,
      });
      return new FileResponseEntity({
        success: true,
        message: 'Retrieved file url successfully',
        url: url,
        key: key,
      });
    } catch (error) {
      let message = 'Unknown error';
      if (error instanceof Error) {
        message = error.message;
      }
      throw new HttpException(
        'Get signed url failed: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getDownloadFileUrl(key: string): Promise<IFileResponseEntity> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 300,
      });
      return new FileResponseEntity({
        success: true,
        message: 'Retrieved file url successfully',
        url: url,
        key: key,
      });
    } catch (error) {
      let message = 'Unknown error';
      if (error instanceof Error) {
        message = error.message;
      }
      throw new HttpException(
        'Get signed url failed: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createFileInfo(
    fileInfoRequest: FileInfoRequestDto,
  ): Promise<ICreateResponseEntity> {
    try {
      const existing = await this.fileRepo.findOneBy({
        key: fileInfoRequest.key,
      });
      if (existing) throw new ConflictException('File already exists');

      const fileInfo = this.fileRepo.create(
        new FileInfoEntity({
          key: fileInfoRequest.key,
          userId: fileInfoRequest.userId,
          name: fileInfoRequest.name,
          mimetype: fileInfoRequest.mimetype,
          size: fileInfoRequest.size,
        }),
      );

      await this.fileRepo.save(fileInfo);

      return new CreateResponseEntity({
        success: true,
        message: 'Created file info successfully',
      });
    } catch (error) {
      let message = 'Unknown error';
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof Error) {
        message = error.message;
      }
      throw new HttpException(
        'Create file info failed: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getFilesByUser(userId: string): Promise<IFileInfoResponseEntity> {
    try {
      const result = await this.fileRepo.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });

      return new FileInfoResponseEntity({
        success: true,
        message: 'Retrieved files successfully',
        files: result,
      });
    } catch (error) {
      let message = 'Unknown error';
      if (error instanceof Error) {
        message = error.message;
      }
      throw new HttpException(
        'Get files by user failed: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
