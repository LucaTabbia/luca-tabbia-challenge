import { ConfigService } from '@nestjs/config';
import { FilesService } from './files.service';
import { FileResponseEntity } from '@/entities/file-response.entity';
import { SignedUrlRequestDto } from '@/dtos/signed-url-request.dto';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileInfoEntity, IFileInfoEntity } from '@/entities/file-info.entity';
import { Repository } from 'typeorm';
import { FileInfoRequestDto } from '@/dtos/file-info-request.dto';
import { CreateResponseEntity } from '@/entities/create-response.entity';
import { FileInfoResponseEntity } from '@/entities/file-info-response.entity';
import { ConflictException, HttpException } from '@nestjs/common';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('FilesService', () => {
  let service: FilesService;
  let configService: ConfigService;
  let mockFileRepo: jest.Mocked<Repository<FileInfoEntity>>;

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

    mockFileRepo = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<FileInfoEntity>>;

    service = new FilesService(configService, mockFileRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUploadSignedUrl', () => {
    it('should retrieve a signed url for upload and return a successful response', async () => {
      (getSignedUrl as jest.Mock).mockResolvedValue(
        'https://fake-s3-url.com/upload',
      );

      const body = new SignedUrlRequestDto('file.txt', 'text/plain');
      const result = await service.getUploadSignedUrl(body);

      expect(result).toBeInstanceOf(FileResponseEntity);
      expect(result.success).toBe(true);
      expect(result.url).toBe('https://fake-s3-url.com/upload');
    });

    it('should handle an error and throw it', async () => {
      (getSignedUrl as jest.Mock).mockRejectedValueOnce(
        new Error('Failed to retrieve url'),
      );

      const body = new SignedUrlRequestDto('file.txt', 'text/plain');

      await expect(service.getUploadSignedUrl(body)).rejects.toThrow(
        'Get signed url failed: Failed to retrieve url',
      );
    });
  });

  describe('getDownloadFileUrl', () => {
    it('should retrieve a signed url for download and return a successful response', async () => {
      (getSignedUrl as jest.Mock).mockResolvedValue(
        'https://fake-s3-url.com/download',
      );
      const result = await service.getDownloadFileUrl('file.txt');

      expect(result).toBeInstanceOf(FileResponseEntity);
      expect(result.success).toBe(true);
      expect(result.url).toBe('https://fake-s3-url.com/download');
    });

    it('should handle an error and throw it', async () => {
      (getSignedUrl as jest.Mock).mockRejectedValueOnce(
        new Error('Failed to retrieve url'),
      );

      await expect(service.getDownloadFileUrl('file.txt')).rejects.toThrow(
        'Get signed url failed: Failed to retrieve url',
      );
    });
  });

  describe('createFileInfo', () => {
    const mockRequest: FileInfoRequestDto = {
      key: 'file-key-123',
      userId: 'user-uuid',
      name: 'test-file.txt',
      mimetype: 'text/plain',
      size: 1024,
    };

    const mockFileInfo: FileInfoEntity = {
      key: 'file-key-123',
      userId: 'user-uuid',
      name: 'test-file.txt',
      mimetype: 'text/plain',
      size: 1024,
      id: 'file-uuid',
      user: { id: 'user-uuid', email: 'test@gmail.com', password: 'password' },
      createdAt: new Date(),
    };

    it('should create file info successfully', async () => {
      mockFileRepo.findOneBy.mockResolvedValue(null);
      mockFileRepo.create.mockReturnValue(mockFileInfo);
      mockFileRepo.save.mockResolvedValue(mockFileInfo);

      const result: CreateResponseEntity =
        await service.createFileInfo(mockRequest);

      expect(mockFileRepo['findOneBy']).toHaveBeenCalledWith({
        key: mockRequest.key,
      });
      expect(mockFileRepo['create']).toHaveBeenCalled();
      expect(mockFileRepo['save']).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Created file info successfully');
    });

    it('should throw ConflictException if file already exists', async () => {
      mockFileRepo.findOneBy.mockResolvedValue({} as FileInfoEntity);

      await expect(service.createFileInfo(mockFileInfo)).rejects.toThrow(
        ConflictException,
      );
      expect(mockFileRepo['create']).not.toHaveBeenCalled();
      expect(mockFileRepo['save']).not.toHaveBeenCalled();
    });

    it('should throw HttpException on unknown error', async () => {
      mockFileRepo.findOneBy.mockRejectedValue(new Error('DB failure'));

      await expect(service.createFileInfo(mockFileInfo)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getFilesByUser', () => {
    const userId = 'user-uuid';
    const files: IFileInfoEntity[] = [
      {
        key: 'file-key-123',
        userId: 'user-uuid',
        name: 'test-file.txt',
        mimetype: 'text/plain',
        size: 1024,
        id: 'file-uuid',
        user: {
          id: 'user-uuid',
          email: 'test@gmail.com',
          password: 'password',
        },
        createdAt: new Date(),
      },
    ];

    it('should return list of files for user', async () => {
      mockFileRepo.find.mockResolvedValue(files);

      const result: FileInfoResponseEntity =
        await service.getFilesByUser(userId);

      expect(mockFileRepo['find']).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Retrieved files successfully');
      expect(result.files.length).toBe(1);
      expect(result.files[0]?.id).toBe('file-uuid');
    });

    it('should throw HttpException on error', async () => {
      mockFileRepo.find.mockRejectedValue(new Error('DB failure'));

      await expect(service.getFilesByUser(userId)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
