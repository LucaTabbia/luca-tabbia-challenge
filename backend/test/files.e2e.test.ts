import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import type { Response } from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';
import { FilesModule } from '@/modules/files.module';
import { Server } from 'node:http';

interface UploadResponse {
    success: boolean;
    message: string;
}

jest.mock('@aws-sdk/client-s3');

describe('FilesController (E2E)', () => {
  let app: INestApplication;
  let s3SendMock: jest.Mock;
  let server: Server;

  beforeAll(async () => {
    s3SendMock = jest.fn();
    const MockedS3Client = S3Client as unknown as jest.MockedClass<
      typeof S3Client
    >;
    MockedS3Client.mockImplementation(
      () =>
        ({
          send: s3SendMock,
        }) as unknown as S3Client,
    );

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), FilesModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    server = app.getHttpServer() as Server;

    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/files/upload (POST) should upload a file', async () => {
    s3SendMock.mockResolvedValueOnce({});

    return request(server)
      .post('/files/upload')
      .attach('file', Buffer.from('hello e2e'), 'test.txt')
      .expect(HttpStatus.CREATED)
      .expect((res: Response) => {
        const body = res.body as UploadResponse;
        expect(body.success).toBe(true);
        expect(body.message).toContain('successfully');
      });
  });

  it('/files/download (GET) should download a file', async () => {
    const readable = new Readable();
    readable.push('file content');
    readable.push(null);
    s3SendMock.mockResolvedValueOnce({
      Body: readable,
      ContentType: 'text/plain',
    });

    const response: Response = await request(server)
      .get('/files/download?key=fake-key')
      .expect(HttpStatus.OK);

    expect(response.headers['content-type']).toContain('text/plain');
    expect(response.headers['content-disposition']).toBe(
      'attachment; filename="fake-key"',
    );
    expect(response.text).toBe('file content');
  });

  it('/files/download (GET) should return error if file not found', async () => {
    s3SendMock.mockRejectedValueOnce(new Error('File not found'));

    return request(server)
      .get('/files/download?key=nonexistent.txt')
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect((res: Response) => {
        const body = res.body as UploadResponse;
        expect(body.message).toContain('File download failed');
      });
  });
});
