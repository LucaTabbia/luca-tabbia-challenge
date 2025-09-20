import { ExampleService } from './example.service';
const mockFetch : jest.MockedFunction<typeof fetch> = jest.fn();

describe('ExampleService', () => {
    let service: ExampleService;

    beforeAll(() => {
        global.fetch = mockFetch;
    });

    beforeEach(() => {
        service = new ExampleService();
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('getMessage', () => {
        it('should successfully fetch the message', async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                statusText: "OK",
                json: async () => ({ message: "Hello, World!" }),
            } as Response;

            mockFetch.mockResolvedValueOnce(mockResponse);

            const result = await service.getMessage();

            expect(mockFetch).toHaveBeenCalledWith('/api/hello');

            expect(result).toEqual({ message: "Hello, World!" });
        });

        it('should throw an error on failed response', async () => {
            const mockResponse = {
                ok: false,
                status: 404,
                statusText: "Not Found",
                json: async () => ({ error: "Not Found" }),
            } as Response;

            mockFetch.mockResolvedValueOnce(mockResponse);

            await expect(service.getMessage()).rejects.toThrow('Not Found');
        });
    });
});
