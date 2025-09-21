import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { modalStyle } from "./AuthModal.styles";
import { ReactNode, useEffect, useState } from "react";
import { AuthRequest } from "../../models/auth-request.model";
import { AuthStatus } from "../../constants/auth-status.enum";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import { AuthResponse } from "../../models/auth-response.model";
import SuccessMessage from "../SuccessMessage/SuccessMessage";
import Loader from "../Loader/Loader";
import { ValidationError } from "../../constants/validation-error.enum";

export default function AuthModal({
    onSignIn,
    onSignUp,
    authStatus,
    setAuthStatus,
    authError,
    authResponse
}: {
    onSignIn: (authRequest: AuthRequest) => void,
    onSignUp: (authRequest: AuthRequest) => void,
    authStatus: AuthStatus,
    setAuthStatus: React.Dispatch<React.SetStateAction<AuthStatus>>
    authError: string | undefined,
    authResponse: AuthResponse | undefined
}) {

    const [isSignIn, setIsSignIn] = useState<boolean>(true);
    const [validationError, setValidationError] = useState<ValidationError>(ValidationError.none);
    const [authRequest, setAuthRequest] = useState<AuthRequest>({
        email: "",
        password: ""
    });
    let content: ReactNode;

    useEffect(() => {
        setValidationError(ValidationError.none)
        setAuthRequest({
            email: "",
            password: ""
        })
    }, [isSignIn])

    function resetAuth() {
        setValidationError(ValidationError.none)
        setAuthRequest({
            email: "",
            password: ""
        })
        setAuthStatus(AuthStatus.unauthenticated)
    }

    function isEmailValid(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !regex.test(email)) {
            return false;
        } else {
            return true;
        }
    }

    function isPasswordValid(password: string): boolean {
        if (!password || password.length < 6) {
            return false;
        } else {
            return true;
        }
    }

    function handleSubmit() {
        const emailValidity = isEmailValid(authRequest.email);
        const passwordValidity = isPasswordValid(authRequest.password);
        if (!emailValidity || !passwordValidity) {
            if (!emailValidity && !passwordValidity) {
                setValidationError(ValidationError.both)
                return
            } else if (!emailValidity) {
                setValidationError(ValidationError.email)
            } else {
                setValidationError(ValidationError.password)
            }
        } else {
            setValidationError(ValidationError.none)
            if (isSignIn) {
                onSignIn(authRequest);
            } else {
                onSignUp(authRequest);
            }
            setAuthRequest({
                email: "",
                password: ""
            })
        }
    }

    switch (authStatus) {
        case AuthStatus.error:
            content = authError ? <ErrorMessage error={authError} onClick={resetAuth} /> : null;
            break;
        case AuthStatus.authenticated:
            content = authResponse ? <SuccessMessage message={authResponse.message} /> : null;
            break;
        case AuthStatus.authenticating:
            content = <Loader />
            break;
        case AuthStatus.unauthenticated:
            content = (<Box sx={modalStyle}>
                <Typography>
                    {isSignIn ? "Accedi" : "Registrati"}
                </Typography>
                <Stack spacing={2} mt={2}>
                    <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        error={[ValidationError.email, ValidationError.both].includes(validationError)}
                        value={authRequest.email}
                        onChange={(e) => setAuthRequest({ ...authRequest, email: e.target.value })}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        error={[ValidationError.password, ValidationError.both].includes(validationError)}
                        value={authRequest.password}
                        onChange={(e) => setAuthRequest({ ...authRequest, password: e.target.value })}
                    />
                    <Button variant="contained" onClick={() => handleSubmit()}>
                        Conferma
                    </Button>
                </Stack>
                <Typography variant="body2" mt={2} align="center">
                    {isSignIn ? (
                        <Typography component="span">
                            Non hai un account?{" "}
                            <Box
                                component="span"
                                sx={{ textDecoration: 'underline', cursor: 'pointer', color: 'primary.main' }}
                                onClick={() => setIsSignIn(false)}
                            >
                                Registrati
                            </Box>
                        </Typography>
                    ) : (
                        <Typography component="span">
                            Hai già un account?{" "}
                            <Box
                                component="span"
                                sx={{ textDecoration: 'underline', cursor: 'pointer', color: 'primary.main' }}
                                onClick={() => setIsSignIn(true)}
                            >
                                Accedi
                            </Box>
                        </Typography>
                    )}
                </Typography>
            </Box>)
            break;
    }

    return (
        <Box sx={modalStyle}>{content}</Box>
    );
}
