import { FileService } from "./file.service";

const mockFetch = jest.fn();
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();

describe("FileService", () => {
    let service: FileService;

    beforeAll(() => {
        global.fetch = mockFetch as unknown as typeof fetch;
        global.URL = {
            createObjectURL: mockCreateObjectURL,
            revokeObjectURL: mockRevokeObjectURL,
        } as unknown as typeof URL;

        jest.spyOn(document.body, "appendChild").mockImplementation((node) => node);
    });

    beforeEach(() => {
        service = new FileService();
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe("uploadFile", () => {
        const mockFile = new File(["test content"], "test.txt", { type: "text/plain" });
        const mockResponse = { success: true, message: "File uploaded successfully", key: "123" };

        it("should successfully upload a file", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            const result = await service.uploadFile(mockFile);

            expect(mockFetch).toHaveBeenCalledWith("/api/files/upload", {
                method: "POST",
                credentials: "include",
                headers: { "x-apollo-operation-name": "uploadFile" },
                body: expect.any(FormData),
            });

            expect(result).toEqual(mockResponse);
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
                "Upload failed: Not Found"
            );
        });
    });

    describe("downloadFile", () => {
        const mockKey = "456";
        const mockFilename = "downloaded-file.pdf";
        const mockBlob = new Blob(["downloaded content"], { type: "application/pdf" });
        const mockUrl = "blob:test/123";

        beforeEach(() => {
            jest.spyOn(document, "createElement").mockReturnValue({
                href: "",
                download: "",
                click: jest.fn(),
                remove: jest.fn(),
            } as unknown as HTMLAnchorElement);
            mockCreateObjectURL.mockReturnValue(mockUrl);
        });

        it("should successfully download a file and trigger the download", async () => {
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
            expect(createdElement.click).toHaveBeenCalledTimes(1);
            expect(createdElement.remove).toHaveBeenCalledTimes(1);
            expect(mockRevokeObjectURL).toHaveBeenCalledWith(mockUrl);
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
                "Download failed: Unauthorized"
            );
        });
    });
});
