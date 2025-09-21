import { Stack, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import * as styles from "../../styles";


export default function SuccessMessage({
    message
}: {
    message: string
}) {

    return (
        <Stack spacing={2} sx={styles.stackColumnCenter}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60 }} />
            <Typography textAlign="center" variant="body1">{message}</Typography>
        </Stack>
    );
}
