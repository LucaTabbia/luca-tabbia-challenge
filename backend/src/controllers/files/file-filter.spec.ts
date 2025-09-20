import { BadRequestException } from '@nestjs/common';
import type { FileFilterCallback } from 'multer';

const fileFilter = (
    _req: Express.Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'text/plain',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new BadRequestException('The file type is not supported'));
    }
};

describe('File Filter', () => {
    it('should call the callback with true for a supported file type', () => {
        const mockFile = { mimetype: 'image/jpeg' } as Express.Multer.File;
        const callback = jest.fn();

        fileFilter({} as Express.Request, mockFile, callback);

        expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('should call the callback with an error for an unsupported file type', () => {
        const mockFile = { mimetype: 'image/avif' } as Express.Multer.File;
        const callback = jest.fn();

        fileFilter({} as Express.Request, mockFile, callback);

        expect(callback).toHaveBeenCalledWith(
            new BadRequestException('The file type is not supported'),
        );
    });
});
