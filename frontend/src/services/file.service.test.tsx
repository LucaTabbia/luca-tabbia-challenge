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

    describe("uploadFile", () => {
        const mockFile = new File(["test content"], "test.txt", { type: "text/plain" });

        it("should successfully upload a file", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    message: 'File uploaded successfully',
                    key: 'test-file-key-123',
                    url: 'https://fake-s3-url.com/upload',
                }),
            } as Response);

            mockFetch.mockResolvedValueOnce({ ok: true } as Response);

            const result = await service.uploadFile(mockFile);

            expect(result.key).toBe('test-file-key-123');
            expect(result.url).toBe('https://fake-s3-url.com/upload');

            expect(mockFetch).toHaveBeenCalledTimes(2);
        });

        it("should throw an error on network failure", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Network error"));

            await expect(service.uploadFile(mockFile)).rejects.toThrow("Network error");
        });

        it("should throw an error on failed upload response", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                statusText: "Not Found",
            } as Response);

            await expect(service.uploadFile(mockFile)).rejects.toThrow(
                "Failed to get upload url: Not Found"
            );
        });
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
});
