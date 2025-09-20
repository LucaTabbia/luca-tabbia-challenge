import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from '@/services/files/files.service';
import { FileResponseDto } from '@/dtos/file-response.dto';
import { Mapper } from '@/utils/mapper/mapper';
import { FileResponseEntity } from '@/entities/file-response.entity';
import { HttpException } from '@nestjs/common';
import { UploadRequestDto } from '@/dtos/upload-request.dto';
import { BadRequestException } from '@nestjs/common';

describe('FilesController', () => {
  let controller: FilesController;
  let filesService: jest.Mocked<FilesService>;
  let mapDataSpy: jest.SpyInstance;

  const mockFilesService: Partial<jest.Mocked<FilesService>> = {
    getUploadSignedUrl: jest.fn(),
    getDownloadFileUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [{ provide: FilesService, useValue: mockFilesService }],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    filesService = module.get(FilesService);

    mapDataSpy = jest
      .spyOn(Mapper, 'mapData')
      .mockImplementation((_cls, data) => data);
  });

  describe('getUploadSignedUrl', () => {
    it('should return success response when upload url is retrieved', async () => {
      const key = 'uuid-file.txt';
      const body = new UploadRequestDto('file.txt', 'text/plain');

      const resultFromService = new FileResponseEntity({
        success: true,
        message: 'Retrieved file url successfully',
        key: 'uuid-file.txt',
        url: 'example.url',
      });

      filesService.getUploadSignedUrl.mockResolvedValue(resultFromService);

      const uploadMock = jest.spyOn(filesService, 'getUploadSignedUrl');

      const result = await controller.getUploadSignedUrl(body);

      expect(uploadMock).toHaveBeenCalledWith(body);
      expect(mapDataSpy).toHaveBeenCalledWith(
        FileResponseDto,
        resultFromService,
      );

      expect(result.success).toBe(true);
      expect(result.key).toBe(key);
    });

    it('should throw an error when fails to retrieve url', async () => {
      const body = new UploadRequestDto('file.txt', 'text/plain');

      filesService.getUploadSignedUrl.mockRejectedValueOnce(
        new HttpException('Get signed url failed: File not found', 500),
      );

      const uploadMock = jest.spyOn(filesService, 'getUploadSignedUrl');

      await expect(controller.getUploadSignedUrl(body)).rejects.toThrow(
        'Get signed url failed: File not found',
      );
      expect(uploadMock).toHaveBeenCalledWith(body);
    });

    it('should throw an error when for an unsupported file type', async () => {
      const body = new UploadRequestDto('file.txt', 'text/plain');

      filesService.getUploadSignedUrl.mockRejectedValueOnce(
        new BadRequestException('The file type is not supported'),
      );

      const uploadMock = jest.spyOn(filesService, 'getUploadSignedUrl');

      await expect(controller.getUploadSignedUrl(body)).rejects.toThrow(
        'The file type is not supported',
      );
      expect(uploadMock).toHaveBeenCalledWith(body);
    });
  });

  describe('getDownloadFileUrl', () => {
    it('should return success response when download url is retrieved', async () => {
      const key = 'uuid-file.txt';

      const resultFromService = new FileResponseEntity({
        success: true,
        message: 'Retrieved file url successfully',
        key: 'uuid-file.txt',
        url: 'example.url',
      });

      filesService.getDownloadFileUrl.mockResolvedValue(resultFromService);

      const downloadMock = jest.spyOn(filesService, 'getDownloadFileUrl');

      const result = await controller.getDownloadFileUrl(key);

      expect(downloadMock).toHaveBeenCalledWith(key);
      expect(mapDataSpy).toHaveBeenCalledWith(
        FileResponseDto,
        resultFromService,
      );

      expect(result.success).toBe(true);
      expect(result.key).toBe(key);
    });

    it('should throw an error when fails to retrieve url', async () => {
      const key = 'uuid-file.txt';

      filesService.getDownloadFileUrl.mockRejectedValueOnce(
        new HttpException('Get signed url failed: File not found', 500),
      );

      const downloadMock = jest.spyOn(filesService, 'getDownloadFileUrl');

      await expect(controller.getDownloadFileUrl(key)).rejects.toThrow(
        'Get signed url failed: File not found',
      );
      expect(downloadMock).toHaveBeenCalledWith(key);
    });
  });
});
