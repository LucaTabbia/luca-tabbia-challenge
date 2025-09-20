import { useEffect, useState } from "react";
import { FileService } from "../../services/file.service";
import { UploadResponse } from "../../models/upload-response.model";
import { Box, Button, Fade, Stack, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import SelectedFileChip from "../../components/SelectedFileChip/SelectedFileChip";
import * as styles from "./FileSection.styles";



export default function FileSection({
    service
}: {
    service: FileService
}) {
    const [file, setFile] = useState<File | undefined>(undefined);
    const [result, setResult] = useState<UploadResponse | undefined>(undefined);
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const [showDownload, setShowDownload] = useState<boolean>(false);
    const [serviceError, setServiceError] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!showSuccess && result) {
            setTimeout(() => {
                setShowDownload(true);
            }, 500);
        }
    }, [showSuccess])


    async function uploadFileToS3(file: File) {
        try {
            const response = await service.uploadFile(file)
            if (response) {
                setShowSuccess(true);
                setResult(response)
                setTimeout(() => {
                    setShowSuccess(false);
                }, 2000);
            }
        } catch (err) {
            let message = "Upload failed: Unknown error";
            if (err instanceof Error) {
                message = err.message;
            }
            console.error("Upload failed", err);
            setServiceError(message)
        }
    }

    async function downloadFileFromS3(key: string, filename?: string) {
        try {
            await service.downloadFile(key, filename);
        } catch (err) {
            let message = "Download failed: Unknown error";
            if (err instanceof Error) {
                message = err.message;
            }
            console.error("Download failed", err);
            setServiceError(message)
        }
    }

    function resetFileState() {
        setFile(undefined);
        setResult(undefined);
        setShowDownload(false);
        setServiceError(undefined);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <Box sx={styles.boxContainer}>
            {!serviceError ? <Stack spacing={3} sx={styles.stackColumnCenter}>
                <Button variant="contained" component="label">
                    Select file
                    <input type="file" hidden onChange={handleFileChange} data-testid="file-input" />
                </Button>

                {file && (
                    <SelectedFileChip file={file} onDelete={() => resetFileState()} />
                )}
                <Stack spacing={2} sx={styles.stackRowCenter}>
                    {!showSuccess && !showDownload && file && !result && (
                        <Button variant="contained" color="primary" onClick={() => uploadFileToS3(file)}>
                            Upload
                        </Button>
                    )}

                    {showDownload && result && result.success && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => downloadFileFromS3(result.key, file?.name)}
                        >
                            Download
                        </Button>
                    )}

                    <Fade in={showSuccess} timeout={500} unmountOnExit>
                        {result ? (
                            <Stack spacing={2} sx={styles.stackRowCenter}>
                                <CheckCircleOutlineIcon
                                    color="success"
                                    sx={{
                                        fontSize: 60,
                                        transform: showSuccess ? "scale(1)" : "scale(0.5)",
                                        transition: "transform 0.5s ease-in-out",
                                    }}
                                />
                                <Typography
                                    variant="body1"
                                    sx={{
                                        opacity: showSuccess ? 1 : 0,
                                        transition: "opacity 0.5s ease-in-out",
                                    }}
                                >
                                    {result.message}
                                </Typography>
                            </Stack>
                        ) : <></>}
                    </Fade>
                </Stack>
            </Stack> : <ErrorMessage error={serviceError} onClick={() => resetFileState()} />}


        </Box>
    );
}
