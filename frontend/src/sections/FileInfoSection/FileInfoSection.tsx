import { ReactNode, useEffect, useState } from "react";
import { FileService } from "../../services/file.service";
import { Box, Stack, Typography } from "@mui/material";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import * as styles from "./FileInfoSection.styles";
import { SectionStatus } from "../../constants/section-status.enum";
import SuccessMessage from "../../components/SuccessMessage/SuccessMessage";
import { AuthStatus } from "../../constants/auth-status.enum";
import UnauthenticatedMessage from "../../components/UnauthenticatedMessage/UnauthenticatedMessage";
import { AuthResponse } from "../../models/auth-response.model";
import { FileInfoResponse } from "../../models/file-info-response.model";
import { FileInfo } from "../../models/file-info.model";
import Loader from "../../components/Loader/Loader";
import FileInfoCard from "../../components/FileInfoCard/FileInfoCard";



export default function FileInfoSection({
    service,
    authStatus,
    authResponse,
    uploadedFileInfo,
    setUploadedFileInfo
}: {
    service: FileService,
    authStatus: AuthStatus,
    authResponse: AuthResponse | undefined,
    uploadedFileInfo: FileInfo | undefined,
    setUploadedFileInfo: React.Dispatch<React.SetStateAction<FileInfo | undefined>>
}) {

    const [files, setFiles] = useState<FileInfo[]>([]);
    const [result, setResult] = useState<FileInfoResponse | undefined>(undefined);
    const [sectionStatus, setSectionStatus] = useState<SectionStatus>(SectionStatus.init);
    let content: ReactNode;

    const [error, setError] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (authStatus == AuthStatus.authenticated) {
            getFilesList()
        }
    }, [authStatus, authResponse])

    useEffect(() => {
        if (uploadedFileInfo) {
            setFiles([...files, uploadedFileInfo])
            setUploadedFileInfo(undefined)
        }
    }, [uploadedFileInfo])

    async function getFilesList() {
        if (authResponse) {
            setSectionStatus(SectionStatus.loading)
            try {
                const response = await service.getFilesList(authResponse.id)
                response.message = "Lista di file ottenuta"
                if (response) {
                    setSectionStatus(SectionStatus.success)
                    setResult(response)
                    setFiles(response.files)
                    setTimeout(() => {
                        setSectionStatus(SectionStatus.init);
                    }, 2000);
                }
            } catch (err) {
                let message = "Get list failed: Unknown error";
                if (err instanceof Error) {
                    message = err.message;
                }
                console.error("Get list failed", err);
                setError(message)
                setSectionStatus(SectionStatus.error)
            }
        }
    }

    function resetSectionState() {
        setResult(undefined);
        setError(undefined);
        if (sectionStatus != SectionStatus.init) {
            setSectionStatus(SectionStatus.init);
        }
    }


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
                <Stack
                    sx={{
                        flex: 1,
                        width: "100%",
                        overflowY: "scroll",
                        pr: 1,
                    }}
                >
                    {files.length > 0 ? (
                        files.map((file) => (
                            <FileInfoCard key={file.id} fileInfo={file} service={service} />
                        ))
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            Nessun file trovato
                        </Typography>
                    )}
                </Stack>
            );
            break;
    }

    if (authStatus != AuthStatus.authenticated) {
        content = <UnauthenticatedMessage />;
    }

    return (
        <Box sx={styles.listContainer}>{content}</Box >
    );
}

