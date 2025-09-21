import { FileInfo } from "./file-info.model";

export interface CreateResponse {
    message: string;
    success: boolean;
    fileInfo: FileInfo;
}