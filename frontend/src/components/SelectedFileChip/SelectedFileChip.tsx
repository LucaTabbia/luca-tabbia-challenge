import { Box, Chip, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";



export default function SelectedFileChip({
    file,
    onDelete
}: {
    file: File,
    onDelete: () => void
}) {

    return (
        <Chip
            label={

                file.name.lastIndexOf(".") != -1 ? (
                    <Box
                        sx={{
                            display: "flex",
                            maxWidth: 250,
                            overflow: "hidden",
                            alignItems: "center",
                        }}
                    >
                        <Typography
                            noWrap
                            sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {file.name.slice(0, file.name.lastIndexOf("."))}
                        </Typography>
                        <Typography sx={{ ml: 0.5, flexShrink: 0 }}>
                            {file.name.slice(file.name.lastIndexOf("."))}
                        </Typography>
                    </Box>
                ) : (
                    <Typography
                        noWrap
                        sx={{
                            maxWidth: 250,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {file.name}
                    </Typography>
                )

            }
            color="secondary"
            variant="outlined"
            onDelete={onDelete}
            deleteIcon={<CloseIcon />}
        />
    );
}
