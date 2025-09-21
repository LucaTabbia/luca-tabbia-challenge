import { ReactNode, useState } from "react";
import { FileService } from "../../services/file.service";
import { FileResponse } from "../../models/upload-response.model";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import SelectedFileChip from "../../components/SelectedFileChip/SelectedFileChip";
import * as styles from "../../styles";
import { SectionStatus } from "../../constants/section-status.enum";
import SuccessMessage from "../../components/SuccessMessage/SuccessMessage";
import { AuthStatus } from "../../constants/auth-status.enum";
import UnauthenticatedMessage from "../../components/UnauthenticatedMessage/UnauthenticatedMessage";



export default function FileSection({
    service,
    authStatus
}: {
    service: FileService,
    authStatus: AuthStatus
}) {
    const [file, setFile] = useState<File | undefined>(undefined);
    const [result, setResult] = useState<FileResponse | undefined>(undefined);
    const [sectionStatus, setSectionStatus] = useState<SectionStatus>(SectionStatus.init);
    let content: ReactNode;

    const [error, setError] = useState<string | undefined>(undefined);


    async function uploadFileToS3(file: File) {
        setSectionStatus(SectionStatus.loading)
        try {
            const response = await service.uploadFile(file)
            if (response) {
                response.message = "File caricato con successo"
                setSectionStatus(SectionStatus.success)
                setResult(response)
                setTimeout(() => {
                    setSectionStatus(SectionStatus.init);
                }, 2000);
            }
        } catch (err) {
            let message = "Upload failed: Unknown error";
            if (err instanceof Error) {
                message = err.message;
            }
            console.error("Upload failed", err);
            setError(message)
            setSectionStatus(SectionStatus.error)
        }
    }

    async function downloadFileFromS3(key: string, filename?: string) {
        setSectionStatus(SectionStatus.loading)
        try {
            const response = await service.downloadFile(key, filename);
            if (response) {
                response.message = "File scaricato con successo"
                setSectionStatus(SectionStatus.success)
                setResult(response)
                setTimeout(() => {
                    setSectionStatus(SectionStatus.init);
                }, 2000);
            }
        } catch (err) {
            let message = "Download failed: Unknown error";
            if (err instanceof Error) {
                message = err.message;
            }
            console.error("Download failed", err);
            setError(message)
            setSectionStatus(SectionStatus.error)
        }
    }

    function resetSectionState() {
        setFile(undefined);
        setResult(undefined);
        setError(undefined);
        if (sectionStatus != SectionStatus.init) {
            setSectionStatus(SectionStatus.init);
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFile = e.target.files[0];
            const maxFileSize = 5 * 1024 * 1024;
            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "application/pdf",
                "text/plain",
            ];

            if (selectedFile.size > maxFileSize) {
                setError("The file is too big. Max file size supported is 5MB");
                setSectionStatus(SectionStatus.error)
                e.target.files = null;
                return
            } else if (!allowedTypes.includes(selectedFile.type)) {
                setError("The file type is not supported");
                setSectionStatus(SectionStatus.error)
                e.target.files = null;
                return
            } else {
                setFile(selectedFile);
                e.target.files = null;
                return
            }
        }
    };



    switch (sectionStatus) {
        case SectionStatus.error:
            content = error ? <ErrorMessage error={error} onClick={resetSectionState} /> : null;
            break;
        case SectionStatus.success:
            content = result ? <SuccessMessage message={result.message} /> : null;
            break;
        case SectionStatus.loading:
            content = (
                <Stack spacing={2} sx={styles.stackColumnCenter}>
                    <CircularProgress size={60} />
                    <Typography variant="body1">Caricamento...</Typography>
                </Stack>
            );
            break;
        case SectionStatus.init:
        default:
            content = (
                <Stack spacing={3} sx={styles.stackColumnCenter}>
                    <Button variant="contained" component="label">
                        Select file
                        <input type="file" hidden onChange={handleFileChange} data-testid="file-input" />
                    </Button>
                    {file && <SelectedFileChip file={file} onDelete={resetSectionState} />}
                    <Stack spacing={2} sx={styles.stackRowCenter}>
                        {file && !result && (
                            <Button variant="contained" color="primary" onClick={() => uploadFileToS3(file)}>
                                Upload
                            </Button>
                        )}
                        {result && result.success && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => downloadFileFromS3(result.key, file?.name)}
                            >
                                Download
                            </Button>
                        )}
                    </Stack>
                </Stack>
            );
            break;
    }

    if (authStatus != AuthStatus.authenticated) {
        content = <UnauthenticatedMessage />;
    }

    return (
        <Box sx={styles.boxContainer}>{content}</Box >
    );
}

