import { ReactNode, useState } from "react";
import { FileService } from "../../services/file.service";
import { Box, Button, Stack } from "@mui/material";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import SelectedFileChip from "../../components/SelectedFileChip/SelectedFileChip";
import * as styles from "../../styles";
import { SectionStatus } from "../../constants/section-status.enum";
import SuccessMessage from "../../components/SuccessMessage/SuccessMessage";
import { AuthStatus } from "../../constants/auth-status.enum";
import UnauthenticatedMessage from "../../components/UnauthenticatedMessage/UnauthenticatedMessage";
import { AuthResponse } from "../../models/auth-response.model";
import { CreateResponse } from "../../models/create-response.model";
import { FileInfo } from "../../models/file-info.model";
import Loader from "../../components/Loader/Loader";



export default function FileSection({
    service,
    authStatus,
    authResponse,
    setUploadedFileInfo
}: {
    service: FileService,
    authStatus: AuthStatus,
    authResponse: AuthResponse | undefined,
    setUploadedFileInfo: React.Dispatch<React.SetStateAction<FileInfo | undefined>>
}) {
    const [file, setFile] = useState<File | undefined>(undefined);
    const [result, setResult] = useState<CreateResponse | undefined>(undefined);
    const [sectionStatus, setSectionStatus] = useState<SectionStatus>(SectionStatus.init);
    let content: ReactNode;

    const [error, setError] = useState<string | undefined>(undefined);


    async function uploadFileToS3(file: File) {
        if (authResponse) {
            setSectionStatus(SectionStatus.loading)
            try {
                const response = await service.uploadFile(file, authResponse.id)
                if (response) {
                    response.message = "File caricato con successo"
                    setSectionStatus(SectionStatus.success)
                    setUploadedFileInfo(response.fileInfo)
                    setResult(response)
                    setTimeout(() => {
                        setFile(undefined);
                        setError(undefined);
                        setSectionStatus(SectionStatus.init);
                        setResult(undefined);
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
    }

    function resetSectionState() {
        setFile(undefined);
        setError(undefined);
        if (sectionStatus != SectionStatus.init) {
            setSectionStatus(SectionStatus.init);
        }
        setResult(undefined);
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
            content = <Loader />;
            break;
        case SectionStatus.init:
        default:
            content = (
                <Stack spacing={3} sx={styles.stackColumnCenter}>
                    <Button variant="contained" component="label">
                        Select file
                        <input type="file" accept="image/jpeg,image/png,application/pdf,text/plain" hidden onChange={handleFileChange} data-testid="file-input" />
                    </Button>
                    {file && <SelectedFileChip file={file} onDelete={resetSectionState} />}
                    <Stack spacing={2} sx={styles.stackRowCenter}>
                        {file && !result && (
                            <Button variant="contained" color="primary" onClick={() => uploadFileToS3(file)}>
                                Upload
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

