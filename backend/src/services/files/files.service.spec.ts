import { ConfigService } from '@nestjs/config';
import { FilesService } from './files.service';
import { FileResponseEntity } from '@/entities/file-response.entity';
import { UploadRequestDto } from '@/dtos/upload-request.dto';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';


jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

jest.mock('@/utils/mapper/mapper', () => ({
  Mapper: {
    mapData: jest.fn(<T>(_dto: new () => T, data: T): T => data),
  },
}));


describe('FilesService', () => {
  let service: FilesService;
  let configService: ConfigService;
  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          S3_BUCKET_NAME: 'test-bucket',
          S3_ENDPOINT: 'http://storage.local:9000',
          AWS_REGION: 'us-west-1',
          S3_ACCESS_KEY_ID: 'test-key',
          S3_SECRET_ACCESS_KEY: 'test-secret',
        };
        return values[key];
      }),
    } as unknown as ConfigService;

    service = new FilesService(configService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUploadSignedUrl', () => {
    it('should retrive a signed url for upload and return a successful response', async () => {
      (getSignedUrl as jest.Mock).mockResolvedValue('https://fake-s3-url.com/upload');

      const body = new UploadRequestDto('file.txt', 'text/plain');
      const result = await service.getUploadSignedUrl(body);

      expect(result).toBeInstanceOf(FileResponseEntity);
      expect(result.success).toBe(true);
      expect(result.url).toBe('https://fake-s3-url.com/upload');
    });

    it('should handle an error and throw it', async () => {
      (getSignedUrl as jest.Mock).mockRejectedValueOnce(new Error('Failed to retrieve url'));

      const body = new UploadRequestDto(
        'file.txt',
        'text/plain'
      )

      await expect(service.getUploadSignedUrl(body)).rejects.toThrow(
        'Get signed url failed: Failed to retrieve url',
      );
    });
  });

  describe('getDownloadFileUrl', () => {
    it('should retrive a signed url for download and return a successful response', async () => {
      (getSignedUrl as jest.Mock).mockResolvedValue('https://fake-s3-url.com/download');
      const result = await service.getDownloadFileUrl('file.txt');

      expect(result).toBeInstanceOf(FileResponseEntity);
      expect(result.success).toBe(true);
      expect(result.url).toBe('https://fake-s3-url.com/download');

    });

    it('should handle an error and throw it', async () => {
      (getSignedUrl as jest.Mock).mockRejectedValueOnce(new Error('Failed to retrieve url'));

      await expect(service.getDownloadFileUrl('file.txt')).rejects.toThrow(
        'Get signed url failed: Failed to retrieve url',
      );
    });
  });
});
