import { AuthService } from "./auth.service";

const mockFetch: jest.MockedFunction<typeof fetch> = jest.fn();

describe("AuthService", () => {
    let service: AuthService;

    beforeAll(() => {
        global.fetch = mockFetch;
    });

    beforeEach(() => {
        service = new AuthService();
        jest.clearAllMocks();
    });

    describe("signIn", () => {
        const mockEmail = 'test@gmail.com';
        const mockAuth = {email: mockEmail, password: "password" };

        it("should successfully sign in", async () => {
            const id = "user-uuid";
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    message: 'Signed in successfully',
                    email: 'test@gmail.com',
                    id: id,
                }),
            } as Response);

            const result = await service.signIn(mockAuth);

            expect(result.email).toBe(mockEmail);
            expect(result.id).toBe(id);

            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        it("should throw an error on network failure", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Network error"));

            await expect(service.signIn(mockAuth)).rejects.toThrow("Network error");
        });

        it("should throw an error on failed sign in", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                statusText: "Not Found",
            } as Response);

            await expect(service.signIn(mockAuth)).rejects.toThrow(
                "Failed to sign in: Not Found"
            );
        });
    });

    describe("signUp", () => {
        const mockEmail = 'test@gmail.com';
        const mockAuth = { email: mockEmail, password: "password" };

        it("should successfully sign up", async () => {
            const id = "user-uuid";
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    message: 'Signed up successfully',
                    email: 'test@gmail.com',
                    id: id,
                }),
            } as Response);

            const result = await service.signUp(mockAuth);

            expect(result.email).toBe(mockEmail);
            expect(result.id).toBe(id);

            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        it("should throw an error on network failure", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Network error"));

            await expect(service.signUp(mockAuth)).rejects.toThrow("Network error");
        });

        it("should throw an error on failed sign up", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                statusText: "Not Found",
            } as Response);

            await expect(service.signUp(mockAuth)).rejects.toThrow(
                "Failed to sign up: Not Found"
            );
        });
    });
});
