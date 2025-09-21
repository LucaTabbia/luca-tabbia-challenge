import { Expose } from 'class-transformer';

export interface IFileInfoRequestDto {
    userId: string;
    key: string;
    name: string;
    size: number;
    mimetype: string;
}

export class FileInfoRequestDto implements IFileInfoRequestDto {
    @Expose()
    userId: string;

    @Expose()
    key: string;

    @Expose()
    name: string;

    @Expose()
    size: number;

    @Expose()
    mimetype: string;

    constructor(
        userId: string,
        key: string,
        name: string,
        size: number,
        mimetype: string,
    ) {
        this.userId = userId;
        this.key = key;
        this.name = name;
        this.size = size;
        this.mimetype = mimetype;
    }
}
