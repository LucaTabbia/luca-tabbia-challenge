import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  CssBaseline,
  Modal,
  Paper,
  StyledEngineProvider,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import theme from "./theme";
import { useMemo, useState } from "react";
import { ExampleService } from "./services/example.service";
import FileSection from "./sections/FileSection/FileSection";
import { FileService } from "./services/file.service";
import AuthModal from "./components/AuthModal/AuthModal";
import { AuthService } from "./services/auth.service";
import { AuthRequest } from "./models/auth-request.model";
import { AuthResponse } from "./models/auth-response.model";
import { AuthStatus } from "./constants/auth-status.enum";

function App() {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [authResult, setAuthResult] = useState<AuthResponse | undefined>(undefined);
  const [authError, setAuthError] = useState<string | undefined>(undefined);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(AuthStatus.unauthenticated);

  const exampleService = useMemo(function initExampleService() {
    return new ExampleService();
  }, []);

  const fileService = useMemo(function initFileService() {
    return new FileService();
  }, []);

  const authService = useMemo(function initAuthService() {
    return new AuthService();
  }, []);


  async function signIn(authRequest: AuthRequest) {
    setAuthStatus(AuthStatus.authenticating)
    try {
      const response = await authService.signIn(authRequest)
      if (response) {
        response.message = "Accesso eseguito"
        setAuthResult(response)
        setAuthStatus(AuthStatus.authenticated)
        setTimeout(() => {
          setOpenModal(false);
        }, 2000);
      }
    } catch (err) {
      let message = "Sign in failed: Unknown error";
      if (err instanceof Error) {
        message = err.message;
      }
      console.error("Sign in failed", err);
      setAuthError(message)
      setAuthStatus(AuthStatus.error)
    }
  }

  async function signUp(authRequest: AuthRequest) {
    setAuthStatus(AuthStatus.authenticating)
    try {
      const response = await authService.signUp(authRequest)
      if (response) {
        response.message = "Registrazione eseguita"
        setAuthResult(response)
        setAuthStatus(AuthStatus.authenticated)
        setTimeout(() => {
          setOpenModal(false);
        }, 2000);
      }
    } catch (err) {
      let message = "Sign up failed: Unknown error";
      if (err instanceof Error) {
        message = err.message;
      }
      console.error("Sign up failed", err);
      setAuthError(message)
      setAuthStatus(AuthStatus.error)
    }
  }

  function resetAuth() {
    setAuthError(undefined)
    setAuthResult(undefined)
    setAuthStatus(AuthStatus.unauthenticated)
  }

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                BonusX Interview Challenge
              </Typography>
              {authStatus != AuthStatus.authenticated ?
                <Button color="inherit" onClick={() => setOpenModal(true)}>Login</Button> :
                <Button color="inherit" onClick={() => resetAuth()}>Log out</Button>
              }
            </Toolbar>
          </AppBar>

          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="h4" gutterBottom>
                    Benvenuto nell'applicazione
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Questa è l'impostazione iniziale per l'app con Material-UI
                    configurato correttamente.
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="div">
                      Carica e scarica un file
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      Un utente può caricare un file (.png, .txt, .pdf, .jpeg) su S3 con dimensione massima di 5MB; se il caricamento va a buon fine l'utente può riscaricare il file.
                    </Typography>
                    <FileSection service={fileService} authStatus={authStatus} />
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="div">
                      Funzionalità 2
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      Descrizione della seconda funzionalità
                    </Typography>
                    <Typography variant="body2">
                      Qui puoi aggiungere la tua seconda funzionalità. Tutti i
                      componenti Material-UI sono disponibili.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={async () => {
                        const { message } = await exampleService.getMessage();
                        alert(message);
                      }}
                    >
                      Cliccami per fare una chiamata API
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid size={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Stato dell'applicazione
                  </Typography>
                  <Typography variant="body2">
                    ✅ Material-UI configurato correttamente
                    <br />
                    ✅ Tema personalizzabile
                    <br />
                    ✅ Font Roboto caricato
                    <br />
                    ✅ Layout responsivo
                    <br />✅ Componenti base implementati
                    <br />✅ Requisiti minimi: upload di un file che, se va a buon fine, mostra conferma e poi ti permette di scaricarlo
                    <br />✅ File validation: il file selezionato può avere dimensione massima 5MB ed essere di tipo: .jpeg, .png, .pdf o .txt
                    <br />✅ Signed url: il backend restituisce un signed url sia per download, sia per upload. Il frontend poi lo usa per caricare o scaricare il file
                    <br />✅ Authorization: L'utente può registrarsi o effettuare il login. Le funzionalità sono bloccate fino all'autenticazione.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Container>
          <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <AuthModal onSignIn={signIn} onSignUp={signUp} authResponse={authResult} authStatus={authStatus} setAuthStatus={setAuthStatus} authError={authError} />
          </Modal>
        </Box>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
