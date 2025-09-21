export class FileInfoRequest {
    key: string;
    userId: string;
    name: string;
    mimetype: string;
    size: number;

    constructor(data: FileInfoRequest) {
        this.key = data.key;
        this.userId = data.userId;
        this.name = data.name;
        this.mimetype = data.mimetype;
        this.size = data.size;
    }
}