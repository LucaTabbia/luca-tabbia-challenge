import { FileInfo } from "./file-info.model";

export interface FileInfoResponse {
    success: boolean;
    message: string;
    files: FileInfo[];
}