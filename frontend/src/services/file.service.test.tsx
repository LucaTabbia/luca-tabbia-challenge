import { CreateResponse } from "../models/create-response.model";
import { FileInfoResponse } from "../models/file-info-response.model";
import { FileInfo } from "../models/file-info.model";
import { FileService } from "./file.service";

const mockFetch: jest.MockedFunction<typeof fetch> = jest.fn();

jest.spyOn(document.body, "appendChild").mockImplementation((node) => node);
jest.spyOn(document.body, "removeChild").mockImplementation((node) => node);
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();

describe("FileService", () => {
    let service: FileService;

    beforeAll(() => {
        global.fetch = mockFetch;
        global.URL = {
            createObjectURL: mockCreateObjectURL,
            revokeObjectURL: mockRevokeObjectURL,
        } as unknown as typeof URL;
    });

    beforeEach(() => {
        service = new FileService();
        jest.clearAllMocks();
    });

    describe("downloadFile", () => {
        const mockKey = "456";
        const mockFilename = "downloaded-file.pdf";
        const mockBlob = new Blob(["file content"], { type: "text/plain" });
        const mockUrl = "https://fake-s3-url.com/download";

        beforeAll(() => {
            jest.spyOn(document, "createElement").mockReturnValue({
                href: "",
                download: "",
                click: jest.fn(),
                remove: jest.fn(),
            } as unknown as HTMLAnchorElement);
        })

        beforeEach(() => {
            mockCreateObjectURL.mockReturnValue(mockUrl);
        });

        it("should successfully download a file and trigger the download", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ url: mockUrl, key: mockKey }),
            } as Response);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                blob: async () => mockBlob,
            } as Response);

            await service.downloadFile(mockKey, mockFilename);

            expect(mockFetch).toHaveBeenCalledWith(`/api/files/download?key=${mockKey}`, {
                method: "GET",
                credentials: "include",
            });

            expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
            expect(document.createElement).toHaveBeenCalledWith("a");
            expect(document.body.appendChild).toHaveBeenCalled();
            const createdElement = (document.createElement as jest.Mock).mock.results[0].value;
            expect(createdElement.download).toBe(mockFilename);
            expect(mockRevokeObjectURL).toHaveBeenCalledWith(mockUrl);

            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(mockFetch).toHaveBeenNthCalledWith(1, `/api/files/download?key=${mockKey}`, {
                method: "GET",
                credentials: "include",
            });
            expect(mockFetch).toHaveBeenNthCalledWith(2, mockUrl);
        });

        it("should throw an error on network failure", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Network error"));

            await expect(service.downloadFile(mockKey)).rejects.toThrow("Network error");
        });

        it("should throw an error on failed download response", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                statusText: "Unauthorized",
            } as Response);

            await expect(service.downloadFile(mockKey)).rejects.toThrow(
                "Failed to get download url: Unauthorized"
            );
        });
    });


    describe("uploadFile", () => {
        const mockFile = new File(["test content"], "test.txt", { type: "text/plain" });
        const userId = "user-uuid";

        it("should successfully upload a file and create file info", async () => {
            const uploadUrl = "https://fake-s3-url.com/upload";
            const fileKey = "file-key-123";

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    url: uploadUrl,
                    key: fileKey,
                }),
            } as Response);

            mockFetch.mockResolvedValueOnce({ ok: true } as Response);

            const createResponse: CreateResponse = {
                success: true,
                message: "File created successfully",
                fileInfo: {
                    id: "file-uuid",
                    key: fileKey,
                    name: "test.txt",
                    mimetype: "text/plain",
                    size: mockFile.size,
                    userId,
                    createdAt: new Date(),
                } as FileInfo,
            };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => createResponse,
            } as Response);

            const result = await service.uploadFile(mockFile, userId);

            expect(result).toEqual(createResponse);
            expect(mockFetch).toHaveBeenCalledTimes(3);
            expect(mockFetch).toHaveBeenNthCalledWith(1, "/api/files/upload", expect.any(Object));
            expect(mockFetch).toHaveBeenNthCalledWith(2, uploadUrl, expect.any(Object));
            expect(mockFetch).toHaveBeenNthCalledWith(3, "/api/files/create", expect.any(Object));
        });

        it("should throw error if get upload URL fails", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                statusText: "Not Found",
            } as Response);

            await expect(service.uploadFile(mockFile, userId)).rejects.toThrow(
                "Failed to get upload url: Not Found"
            );
        });

        it("should throw error if S3 upload fails", async () => {
            const uploadUrl = "https://fake-s3-url.com/upload";
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ url: uploadUrl, key: "file-key-123" }),
            } as Response);

            mockFetch.mockResolvedValueOnce({ ok: false, statusText: "Forbidden" } as Response);

            await expect(service.uploadFile(mockFile, userId)).rejects.toThrow(
                "Upload to S3 failed: Forbidden"
            );
        });

        it("should throw error if create file info fails", async () => {
            const uploadUrl = "https://fake-s3-url.com/upload";
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ url: uploadUrl, key: "file-key-123" }),
            } as Response);

            mockFetch.mockResolvedValueOnce({ ok: true } as Response);

            mockFetch.mockResolvedValueOnce({ ok: false, statusText: "Conflict" } as Response);

            await expect(service.uploadFile(mockFile, userId)).rejects.toThrow(
                "Failed to create file info: Conflict"
            );
        });
    });

    describe("getFilesList", () => {
        const userId = "user-uuid";
        const fileList: FileInfoResponse = {
            success: true,
            message: "Retrieved files successfully",
            files: [
                {
                    id: "file-uuid-1",
                    key: "file-key-1",
                    name: "file1.txt",
                    mimetype: "text/plain",
                    size: 100,
                    userId,
                    createdAt: new Date(),
                },
            ],
        };

        it("should return list of files successfully", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => fileList,
            } as Response);

            const result = await service.getFilesList(userId);

            expect(result).toEqual(fileList);
            expect(mockFetch).toHaveBeenCalledWith(`/api/files?userId=${encodeURIComponent(userId)}`, expect.any(Object));
        });

        it("should throw error if fetching files fails", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                statusText: "Unauthorized",
            } as Response);

            await expect(service.getFilesList(userId)).rejects.toThrow(
                "Failed to get file list: Unauthorized"
            );
        });
    });
});

