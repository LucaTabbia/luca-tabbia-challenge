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
  Paper,
  StyledEngineProvider,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import theme from "./theme";
import { useMemo } from "react";
import { ExampleService } from "./services/example.service";
import FileSection from "./sections/FileSection/FileSection";
import { FileService } from "./services/file.service";

function App() {
  const exampleService = useMemo(function initExampleService() {
    return new ExampleService();
  }, []);

  const fileService = useMemo(function initFileService() {
    return new FileService();
  }, []);

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
              <Button color="inherit">Login</Button>
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
                    <FileSection service={fileService} />
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
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
