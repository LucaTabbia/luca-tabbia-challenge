
import { AuthRequest } from "../models/auth-request.model";
import { AuthResponse } from "../models/auth-response.model";

export class AuthService {
    async signIn(authRequest: AuthRequest): Promise<AuthResponse> {
        const res = await fetch("/api/auth/signIn", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(authRequest),
        });
        if (!res.ok) {
            throw new Error(`Failed to sign in: ${res.statusText}`);
        }

        return await res.json() as AuthResponse;
    };


    async signUp(authRequest: AuthRequest): Promise<AuthResponse> {
        const res = await fetch("/api/auth/signUp", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(authRequest),
        });
        if (!res.ok) {
            throw new Error(`Failed to sign up: ${res.statusText}`);
        }

        return await res.json() as AuthResponse;
    };


}
