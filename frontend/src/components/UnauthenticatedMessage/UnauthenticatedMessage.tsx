import { Stack, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import * as styles from "../../styles";

export default function UnauthenticatedMessage() {
    return (
        <Stack spacing={2} sx={styles.stackColumnCenter}>
            <LockOutlinedIcon color="error" sx={{ fontSize: 60 }} />
            <Typography textAlign="center" variant="body1">
                Non hai eseguito l'accesso. Devi accedere per poter utilizzare questa funzione!
            </Typography>
        </Stack>
    );
}
