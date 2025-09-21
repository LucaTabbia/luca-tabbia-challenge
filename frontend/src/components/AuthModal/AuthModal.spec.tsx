import { render, screen, fireEvent } from "@testing-library/react";
import AuthModal from "./AuthModal";
import { AuthStatus } from "../../constants/auth-status.enum";
import { AuthResponse } from "../../models/auth-response.model";

describe("AuthModal", () => {
    const mockSignIn = jest.fn();
    const mockSignUp = jest.fn();
    const mockSetAuthStatus = jest.fn();

    const renderModal = (props?: Partial<React.ComponentProps<typeof AuthModal>>) => {
        return render(
            <AuthModal
                onSignIn={mockSignIn}
                onSignUp={mockSignUp}
                authStatus={AuthStatus.unauthenticated}
                setAuthStatus={mockSetAuthStatus}
                authError={undefined}
                authResponse={undefined}
                {...props}
            />
        );
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders sign in form by default", () => {
        renderModal();
        expect(screen.getByText("Accedi")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Conferma" })).toBeInTheDocument();
    });

    it("switches to sign up mode when clicking Registrati", () => {
        renderModal();
        fireEvent.click(screen.getByText("Registrati"));
        expect(screen.getByText("Registrati")).toBeInTheDocument();
    });

    it("shows error when email and password are invalid", () => {
        renderModal();
        fireEvent.click(screen.getByRole("button", { name: "Conferma" }));
        const emailInput = screen.getByLabelText("Email");
        const passwordInput = screen.getByLabelText("Password");
        expect(emailInput).toHaveAttribute("aria-invalid", "true");
        expect(passwordInput).toHaveAttribute("aria-invalid", "true");
    });

    it("calls onSignIn with valid credentials", () => {
        renderModal();
        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@test.com" } });
        fireEvent.change(screen.getByLabelText("Password"), { target: { value: "123456" } });
        fireEvent.click(screen.getByRole("button", { name: "Conferma" }));

        expect(mockSignIn).toHaveBeenCalledWith({
            email: "test@test.com",
            password: "123456",
        });
    });

    it("calls onSignUp when in sign up mode", () => {
        renderModal();
        fireEvent.click(screen.getByText("Registrati"));
        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "new@test.com" } });
        fireEvent.change(screen.getByLabelText("Password"), { target: { value: "abcdef" } });
        fireEvent.click(screen.getByRole("button", { name: "Conferma" }));

        expect(mockSignUp).toHaveBeenCalledWith({
            email: "new@test.com",
            password: "abcdef",
        });
    });

    it("renders error message when authStatus is error", () => {
        renderModal({ authStatus: AuthStatus.error, authError: "Credenziali non valide" });
        expect(screen.getByText("Credenziali non valide")).toBeInTheDocument();
    });

    it("renders success message when authenticated", () => {
        const response: AuthResponse = { id: "1", email: "ok@test.com", message: "Accesso eseguito", success: true };
        renderModal({ authStatus: AuthStatus.authenticated, authResponse: response });
        expect(screen.getByText("Accesso eseguito")).toBeInTheDocument();
    });

    it("renders loader when authenticating", () => {
        renderModal({ authStatus: AuthStatus.authenticating });
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
});
