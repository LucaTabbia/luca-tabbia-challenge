import { FileResponse } from "../models/upload-response.model";

export class FileService {
    async uploadFile(file: File): Promise<FileResponse> {
        const res = await fetch("/api/files/upload", {
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
        if (!res.ok) {
            throw new Error(`Failed to get upload url: ${res.statusText}`);
        }

        const data = await res.json() as FileResponse;

        const uploadRes = await fetch(data.url, {
            method: "PUT",
            body: file,
            headers: {
                "Content-Type": file.type,
            },
        });

        if (!uploadRes.ok) {
            throw new Error(`Upload to S3 failed: ${uploadRes.statusText}`);
        }

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


}
