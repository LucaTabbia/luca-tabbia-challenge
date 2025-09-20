import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
import { UploadRequestDto } from '@/dtos/upload-request.dto';

@Injectable()
export class FilesService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private config: ConfigService) {
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
    fileInfo: UploadRequestDto,
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
}
