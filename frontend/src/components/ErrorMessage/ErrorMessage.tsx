import { Box, Button, Stack, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function ErrorMessage({
    onClick,
    error
}: {
    onClick: () => void,
    error: string
}) {

    return (
        <Box
            sx={{
                p: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
            }}
        >
            <Stack direction="column" spacing={3} alignItems="center">
                <ErrorOutlineIcon color="error" sx={{ fontSize: 60 }} />
                <Typography sx={{ ml: 0.5, flexShrink: 0 }}>
                    {error}
                </Typography>
                <Button variant="contained" color="primary" onClick={onClick}>
                    Retry
                </Button>
            </Stack>
        </Box>
    );
}
