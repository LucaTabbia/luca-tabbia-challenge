import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from '@/services/files/files.service';
import { FileResponseDto } from '@/dtos/file-response.dto';
import { Mapper } from '@/utils/mapper/mapper';
import { FileResponseEntity } from '@/entities/file-response.entity';
import { HttpException } from '@nestjs/common';
import { Readable, Writable } from 'stream';
import type { Response } from 'express';

class MockWritable extends Writable {
  private _data = '';
  set = jest.fn().mockReturnThis();
  status = jest.fn().mockReturnThis();
  send = jest.fn();

  _write(chunk: Buffer | string, _encoding: string, callback: () => void) {
    this._data += chunk.toString();
    callback();
  }

  getData() {
    return this._data;
  }
}

describe('FilesController', () => {
  let controller: FilesController;
  let filesService: jest.Mocked<FilesService>;
  let mapDataSpy: jest.SpyInstance;

  const mockFilesService: Partial<jest.Mocked<FilesService>> = {
    uploadFile: jest.fn(),
    downloadFile: jest.fn(),
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

  describe('uploadFile', () => {
    it('should return success response when file is uploaded', async () => {
      const key = 'uuid-file.txt';
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

      const resultFromService = new FileResponseEntity({
        success: true,
        message: 'File uploaded successfully',
        key,
      });

      filesService.uploadFile.mockResolvedValue(resultFromService);

      const uploadMock = jest.spyOn(filesService, 'uploadFile');

      const result = await controller.uploadFile(mockFile);

      expect(uploadMock).toHaveBeenCalledWith(mockFile);
      expect(mapDataSpy).toHaveBeenCalledWith(
        FileResponseDto,
        resultFromService,
      );

      expect(result.success).toBe(true);
      expect(result.key).toBe(key);
    });

    it('should throw an error when upload fails', async () => {
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

      filesService.uploadFile.mockRejectedValueOnce(
        new HttpException('File upload failed: File not found', 500),
      );

      const uploadMock = jest.spyOn(filesService, 'uploadFile');

      await expect(controller.uploadFile(mockFile)).rejects.toThrow(
        'File upload failed: File not found',
      );

      expect(uploadMock).toHaveBeenCalledWith(mockFile);
    });
  });

  describe('downloadFile', () => {
    it('should return a stream for the requested file', async () => {
      const key = 'uuid-file.txt';
      const stream = new Readable({
        read() {},
      });

      const res = new MockWritable() as unknown as Response;
      stream.push('content');
      stream.push(null);
      const pipeSpy = jest.spyOn(stream, 'pipe');

      filesService.downloadFile.mockResolvedValue({
        stream,
        contentType: 'text/plain',
      });

      const downloadMock = jest.spyOn(filesService, 'downloadFile');
      const setSpy = jest.spyOn(res, 'set');

      await controller.downloadFile(key, res);

      expect(downloadMock).toHaveBeenCalledWith(key);
      expect(setSpy).toHaveBeenCalledWith({
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${key}"`,
      });
      expect(pipeSpy).toHaveBeenCalledWith(res);
    });

    it('should throw an HttpException when download fails', async () => {
      const key = 'nonexistent-file.txt';

      const res: Partial<Response> = {
        set: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      filesService.downloadFile.mockRejectedValueOnce(
        new HttpException('File download failed: File not found', 500),
      );

      const downloadMock = jest.spyOn(filesService, 'downloadFile');

      await expect(
        controller.downloadFile(key, res as Response),
      ).rejects.toThrow('File download failed: File not found');

      expect(downloadMock).toHaveBeenCalledWith(key);
    });
  });
});
