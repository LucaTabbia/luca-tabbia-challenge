import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';
import {
  FileResponseEntity,
  IFileResponseEntity,
} from '@/entities/file-response.entity';
import { v4 as uuidv4 } from 'uuid';

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

  async uploadFile(file: Express.Multer.File): Promise<IFileResponseEntity> {
    const key = `${uuidv4()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: 'application/octet-stream',
    });

    try {
      await this.s3Client.send(command);
      return new FileResponseEntity({
        success: true,
        message: 'File uploaded successfully',
        key: key,
      });
    } catch (error) {
      let message = 'Unknown error';
      if (error instanceof Error) {
        message = error.message;
      }
      throw new HttpException(
        'File upload failed: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async downloadFile(
    key: string,
  ): Promise<{ stream: Readable; contentType: string }> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      const response = await this.s3Client.send(command);

      const stream = response.Body as Readable;
      const contentType = response.ContentType || 'application/octet-stream';

      return { stream, contentType };
    } catch (error) {
      let message = 'Unknown error';
      if (error instanceof Error) {
        message = error.message;
      }
      throw new HttpException(
        'File download failed: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
