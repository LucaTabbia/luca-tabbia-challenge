import { ConfigService } from '@nestjs/config';
import { FilesService } from './files.service';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { FileResponseEntity } from '@/entities/file-response.entity';
import { Readable } from 'node:stream';

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn(() => ({
      send: jest.fn(),
    })),
    PutObjectCommand: jest.fn(),
    GetObjectCommand: jest.fn(),
  };
});

jest.mock('@/utils/mapper/mapper', () => ({
  Mapper: {
    mapData: jest.fn(<T>(_dto: new () => T, data: T): T => data),
  },
}));

type MockedS3Client = {
  send: jest.Mock<Promise<any>, [any]>;
};

describe('FilesService', () => {
  let service: FilesService;
  let configService: ConfigService;
  let s3ClientMock: MockedS3Client;
  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          S3_BUCKET_NAME: 'test-bucket',
          S3_ENDPOINT: 'http://storage.local:9000',
          AWS_REGION: 'us-east-1',
          S3_ACCESS_KEY_ID: 'test-key',
          S3_SECRET_ACCESS_KEY: 'test-secret',
        };
        return values[key];
      }),
    } as unknown as ConfigService;

    service = new FilesService(configService);
    s3ClientMock = { send: jest.fn() as MockedS3Client['send'] };
    (service as unknown as { s3Client: MockedS3Client }).s3Client =
      s3ClientMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload a file and return a successful response', async () => {
      s3ClientMock.send.mockResolvedValueOnce({});

      const mockFile: Express.Multer.File = {
        originalname: 'file.txt',
        buffer: Buffer.from('test'),
        mimetype: 'text/plain',
        size: 4,
        fieldname: 'file',
        encoding: '7bit',
        destination: '',
        filename: '',
        path: '',
        stream: null as unknown as Readable,
      };

      const result = await service.uploadFile(mockFile);

      expect(result).toBeInstanceOf(FileResponseEntity);
      expect(result.success).toBe(true);
      expect(s3ClientMock.send).toHaveBeenCalledWith(
        expect.any(PutObjectCommand),
      );
    });

    it('should handle an error and throw it', async () => {
      s3ClientMock.send.mockRejectedValueOnce(new Error('Upload failed'));

      const mockFile: Express.Multer.File = {
        originalname: 'file.txt',
        buffer: Buffer.from('test'),
        mimetype: 'text/plain',
        size: 4,
        fieldname: 'file',
        encoding: '7bit',
        destination: '',
        filename: '',
        path: '',
        stream: null as unknown as Readable,
      };

      await expect(service.uploadFile(mockFile)).rejects.toThrow(
        'File upload failed: Upload failed',
      );
    });
  });

  describe('downloadFile', () => {
    it('should successfully download a file and retrieve its data', async () => {
      const stream: Readable = new Readable();
      stream.push('hello world');
      stream.push(null);

      s3ClientMock.send.mockResolvedValueOnce({
        Body: stream,
        ContentType: 'text/plain',
      });

      const result = await service.downloadFile('file.txt');

      expect(result).toHaveProperty('stream');
      expect(result).toHaveProperty('contentType', 'text/plain');

      const chunks: string[] = [];
      for await (const chunk of result.stream as AsyncIterable<Buffer>) {
        chunks.push(chunk.toString());
      }
      const data = chunks.join('');
      expect(data).toBe('hello world');

      expect(s3ClientMock.send).toHaveBeenCalledWith(
        expect.any(GetObjectCommand),
      );
    });

    it('should handle an error and throw it', async () => {
      s3ClientMock.send.mockRejectedValueOnce(new Error('Download failed'));

      await expect(service.downloadFile('file.txt')).rejects.toThrow(
        'File download failed: Download failed',
      );
    });
  });
});
