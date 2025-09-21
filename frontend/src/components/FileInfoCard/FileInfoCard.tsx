import { ReactNode, useState } from "react";
import { FileService } from "../../services/file.service";
import { FileResponse } from "../../models/upload-response.model";
import { Card, CardContent, IconButton, Stack, Typography } from "@mui/material";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import * as styles from "../../styles";
import * as cardStyles from "./FileInfoCard.styles";
import { SectionStatus } from "../../constants/section-status.enum";
import SuccessMessage from "../../components/SuccessMessage/SuccessMessage";
import { FileInfo } from "../../models/file-info.model";
import Loader from "../Loader/Loader";
import DownloadIcon from "@mui/icons-material/Download";


export default function FileInfoCard({
    fileInfo,
    service
}: {
    fileInfo: FileInfo,
    service: FileService,
}) {

    const [result, setResult] = useState<FileResponse | undefined>(undefined);
    const [sectionStatus, setSectionStatus] = useState<SectionStatus>(SectionStatus.init);
    let content: ReactNode;

    const [error, setError] = useState<string | undefined>(undefined);

    async function downloadFileFromS3() {
        setSectionStatus(SectionStatus.loading)
        try {
            const response = await service.downloadFile(fileInfo.key, fileInfo.name);
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
            setTimeout(() => {
                setSectionStatus(SectionStatus.init);
            }, 2000);
        }
    }

    switch (sectionStatus) {
        case SectionStatus.error:
            content = error ? <ErrorMessage error={error} onClick={undefined} /> : null;
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
                <Card
                    sx={cardStyles.fileCard}
                >
                    <CardContent
                        sx={cardStyles.cardContent}
                    >
                        <Typography variant="subtitle1">{fileInfo.name}</Typography>
                        <Stack sx={styles.stackRowCenter} direction={"row"}>
                            <Typography variant="body2" color="text.secondary">
                                {fileInfo.mimetype}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {(fileInfo.size / 1024).toFixed(2)} KB
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {new Date(fileInfo.createdAt).toLocaleString()}
                            </Typography>
                        </Stack>
                    </CardContent>
                    <IconButton color="primary" onClick={downloadFileFromS3} data-testid="icon-button">
                        <DownloadIcon />
                    </IconButton>
                </Card>
            );
            break;
    }
    return (
        content
    );
}

