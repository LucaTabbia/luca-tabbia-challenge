import { UploadResponse } from "../models/upload-response.model";

export class FileService {
    async uploadFile(file: File): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/files/upload", {
            method: "POST",
            credentials: "include",
            headers: {
                "x-apollo-operation-name": "uploadFile",
            },
            body: formData,
        });
        if (!res.ok) {
            throw new Error(`Upload failed: ${res.statusText}`);
        }
        return res.json() as Promise<UploadResponse>;
    };

    async downloadFile(key: string, filename?: string): Promise<void> {
        const res = await fetch(`/api/files/download?key=${encodeURIComponent(key)}`, {
            method: "GET",
            credentials: "include",
        });

        if (!res.ok) {
            throw new Error(`Download failed: ${res.statusText}`);
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename || key;
        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(url);
    }

}
