import { Button, Stack, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function ErrorMessage({
    onClick,
    error
}: {
    onClick: (() => void) | undefined,
    error: string
}) {

    return (
        <Stack direction="column" spacing={3} alignItems="center">
            <ErrorOutlineIcon color="error" sx={{ fontSize: 60 }} />
            <Typography textAlign="center" sx={{ ml: 0.5, flexShrink: 0 }}>
                {error}
            </Typography>
            {onClick && <Button variant="contained" color="primary" onClick={onClick}>
                Retry
            </Button>}
        </Stack>
    );
}
