import { CreateResponse } from "../models/create-response.model";
import { FileInfoRequest } from "../models/file-info-request.model";
import { FileInfoResponse } from "../models/file-info-response.model";
import { FileResponse } from "../models/upload-response.model";

export class FileService {
    async uploadFile(file: File, userId: string): Promise<CreateResponse> {
        const getUrlResponse = await fetch("/api/files/upload", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                filename: file.name,
                contentType: file.type,
            }),
        });
        if (!getUrlResponse.ok) {
            throw new Error(`Failed to get upload url: ${getUrlResponse.statusText}`);
        }

        const getUrlData = await getUrlResponse.json() as FileResponse;

        const uploadRes = await fetch(getUrlData.url, {
            method: "PUT",
            body: file,
            headers: {
                "Content-Type": file.type,
            },
        });

        if (!uploadRes.ok) {
            throw new Error(`Upload to S3 failed: ${uploadRes.statusText}`);
        }

        const createRequest = new FileInfoRequest({
            key: getUrlData.key,
            userId: userId,
            name: file.name,
            mimetype: file.type,
            size: file.size,
        })

        const createResponse = await fetch(`/api/files/create`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(createRequest)
        });

        if (!createResponse.ok) {
            throw new Error(`Failed to create file info: ${createResponse.statusText}`);
        }

        const data = await createResponse.json() as CreateResponse;
        return data;
    };


    async downloadFile(key: string, filename?: string): Promise<FileResponse> {
        const res = await fetch(`/api/files/download?key=${encodeURIComponent(key)}`, {
            method: "GET",
            credentials: "include",
        });

        if (!res.ok) {
            throw new Error(`Failed to get download url: ${res.statusText}`);
        }

        const data = await res.json() as FileResponse;

        const downloadRes = await fetch(data.url);

        if (!downloadRes.ok) {
            throw new Error(`Download from S3 failed: ${downloadRes.statusText}`);
        }

        const blob = await downloadRes.blob();
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = filename || key;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadLink.href);

        return data;
    }

    async getFilesList(userId: string): Promise<FileInfoResponse> {
        const res = await fetch(`/api/files?userId=${encodeURIComponent(userId)}`, {
            method: "GET",
            credentials: "include",
        });

        if (!res.ok) {
            throw new Error(`Failed to get file list: ${res.statusText}`);
        }

        const data = await res.json() as FileInfoResponse;
        return data;
    }


}
