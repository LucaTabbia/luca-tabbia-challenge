import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  HttpStatus,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import type { Response } from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { FilesModule } from '@/modules/files.module';
import { Server } from 'node:http';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UploadRequestDto } from '@/dtos/upload-request.dto';
import { FileResponseEntity } from '@/entities/file-response.entity';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('FilesController (E2E)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), FilesModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    server = app.getHttpServer() as Server;

    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/files/upload (POST) should retrieve an upload url', async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue(
      'https://fake-s3-url.com/upload',
    );

    return request(server)
      .post('/files/upload')
      .send(new UploadRequestDto('test.txt', 'text/plain'))
      .expect(HttpStatus.CREATED)
      .expect((res: Response) => {
        const body = res.body as FileResponseEntity;
        expect(body.success).toBe(true);
        expect(body.message).toContain('successfully');
        expect(body.url).toBe('https://fake-s3-url.com/upload');
        expect(body.key).toBeDefined();
      });
  });

  it('/files/upload (POST) should throw an error due to missing body', async () => {
    (getSignedUrl as jest.Mock).mockResolvedValueOnce({});

    return request(server).post('/files/upload').expect(HttpStatus.BAD_REQUEST);
  });

  it('/files/upload (POST) should throw an error due to unsupported mimeType', async () => {
    (getSignedUrl as jest.Mock).mockResolvedValueOnce({});

    return request(server)
      .post('/files/upload')
      .send(new UploadRequestDto('test.txt', 'image/svg'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res: Response) => {
        const body = res.body as BadRequestException;
        expect(body.message).toContain('The file type is not supported');
      });
  });

  it('/files/download (GET) should retrieve a download url', async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue(
      'https://fake-s3-url.com/download',
    );

    return request(server)
      .get('/files/download?key=fake-key')
      .expect(HttpStatus.OK)
      .expect((res: Response) => {
        const body = res.body as FileResponseEntity;
        expect(body.success).toBe(true);
        expect(body.message).toContain('successfully');
        expect(body.url).toBe('https://fake-s3-url.com/download');
        expect(body.key).toBeDefined();
      });
  });

  it('/files/download (GET) should throw error if file not found', async () => {
    (getSignedUrl as jest.Mock).mockRejectedValueOnce(
      new Error('File not found'),
    );

    return request(server)
      .get('/files/download?key=nonexistent.txt')
      .expect(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
