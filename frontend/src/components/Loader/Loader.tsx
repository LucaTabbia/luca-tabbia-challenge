import { CircularProgress, Stack, Typography } from "@mui/material";
import * as styles from "../../styles";


export default function Loader() {

    return (
        <Stack spacing={2} sx={styles.stackColumnCenter}>
            <CircularProgress size={60} />
            <Typography textAlign="center" variant="body1">Caricamento...</Typography>
        </Stack>
    );
}
