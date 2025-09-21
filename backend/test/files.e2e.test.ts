import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  HttpStatus,
  BadRequestException,
  ValidationPipe,
  ConflictException,
} from '@nestjs/common';
import request from 'supertest';
import type { Response } from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { FilesModule } from '@/modules/files.module';
import { Server } from 'node:http';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { SignedUrlRequestDto } from '@/dtos/signed-url-request.dto';
import { FileResponseEntity } from '@/entities/file-response.entity';
import { FileInfoResponseEntity } from '@/entities/file-info-response.entity';
import { FileInfoEntity } from '@/entities/file-info.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileInfoRequestDto } from '@/dtos/file-info-request.dto';
import { CreateResponseEntity } from '@/entities/create-response.entity';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('FilesController (E2E)', () => {
  let app: INestApplication;
  let server: Server;

  const mockFilesRepo = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<Repository<FileInfoEntity>>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), FilesModule],
    })
      .overrideProvider(getRepositoryToken(FileInfoEntity))
      .useValue(mockFilesRepo)
      .compile();

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
      .send(new SignedUrlRequestDto('test.txt', 'text/plain'))
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
      .send(new SignedUrlRequestDto('test.txt', 'image/svg'))
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

  it('/files?userId=user-uuid (GET) should return list of files', async () => {
    const mockFiles: FileInfoEntity[] = [
      {
        id: 'file-uuid-1',
        key: 'file-key-1',
        name: 'file1.txt',
        mimetype: 'text/plain',
        size: 100,
        userId: 'user-uuid',
        user: {
          id: 'user-uuid',
          email: 'test@gmail.com',
          password: 'password',
        },
        createdAt: new Date(),
      },
      {
        id: 'file-uuid-2',
        key: 'file-key-2',
        name: 'file2.txt',
        mimetype: 'text/plain',
        size: 200,
        userId: 'user-uuid',
        user: {
          id: 'user-uuid',
          email: 'test@gmail.com',
          password: 'password',
        },
        createdAt: new Date(),
      },
    ];

    mockFilesRepo.find.mockResolvedValue(mockFiles);

    return request(server)
      .get('/files')
      .query({ userId: 'user-uuid' })
      .expect(HttpStatus.OK)
      .expect((res) => {
        const body = res.body as FileInfoResponseEntity;
        expect(body.success).toBe(true);
        expect(body.message).toBe('Retrieved files successfully');
        expect(body.files.length).toBe(2);
        expect(body.files[0]?.key).toBe('file-key-1');
        expect(body.files[1]?.key).toBe('file-key-2');
      });
  });

  it('/files?userId=user-uuid (GET) should return empty array if no files', async () => {
    mockFilesRepo.find.mockResolvedValue([]);

    return request(server)
      .get('/files')
      .query({ userId: 'user-uuid' })
      .expect(HttpStatus.OK)
      .expect((res) => {
        const body = res.body as FileInfoResponseEntity;
        expect(body.success).toBe(true);
        expect(body.files.length).toBe(0);
      });
  });

  it('/files/create (POST) should create a new file info successfully', async () => {
    const mockRequest: FileInfoRequestDto = {
      key: 'file-key-123',
      userId: 'user-uuid',
      name: 'file.txt',
      mimetype: 'text/plain',
      size: 1234,
    };

    const fileInfo: FileInfoEntity = {
      id: 'file-uuid-1',
      key: 'file-key-1',
      name: 'file1.txt',
      mimetype: 'text/plain',
      size: 100,
      userId: 'user-uuid',
      user: { id: 'user-uuid', email: 'test@gmail.com', password: 'password' },
      createdAt: new Date(),
    };

    mockFilesRepo.findOneBy.mockResolvedValue(null);
    mockFilesRepo.create.mockImplementation((data) => data as FileInfoEntity);
    mockFilesRepo.save.mockResolvedValue(fileInfo);

    return request(server)
      .post('/files/create')
      .send(mockRequest)
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        const body = res.body as CreateResponseEntity;
        expect(body.success).toBe(true);
        expect(body.message).toBe('Created file info successfully');
      });
  });

  it('/files/create (POST) should return conflict if file already exists', async () => {
    const mockRequest: FileInfoRequestDto = {
      key: 'file-key-123',
      userId: 'user-uuid',
      name: 'file.txt',
      mimetype: 'text/plain',
      size: 1234,
    };

    const fileInfo: FileInfoEntity = {
      id: 'file-uuid-1',
      key: 'file-key-1',
      name: 'file1.txt',
      mimetype: 'text/plain',
      size: 100,
      userId: 'user-uuid',
      user: { id: 'user-uuid', email: 'test@gmail.com', password: 'password' },
      createdAt: new Date(),
    };

    mockFilesRepo.findOneBy.mockResolvedValue(fileInfo);

    return request(server)
      .post('/files/create')
      .send(mockRequest)
      .expect(HttpStatus.CONFLICT)
      .expect((res) => {
        const body = res.body as ConflictException;
        expect(body.message).toBe('File already exists');
      });
  });
});
