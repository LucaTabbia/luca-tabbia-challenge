import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FileService } from '../../services/file.service';
import { FileResponse } from '../../models/upload-response.model';
import { FileInfo } from '../../models/file-info.model';
import FileInfoCard from './FileInfoCard';

jest.mock('../../components/ErrorMessage/ErrorMessage', () => {
    return function MockErrorMessage({ error, onClick }: { error: string; onClick?: () => void }) {
        return <div data-testid="error-message" onClick={onClick}>{error}</div>;
    };
});

jest.mock('../../components/SuccessMessage/SuccessMessage', () => {
    return function MockSuccessMessage({ message }: { message: string }) {
        return <div data-testid="success-message">{message}</div>;
    };
});

jest.mock('../Loader/Loader', () => {
    return function MockLoader() {
        return <div data-testid="loader">Caricamento...</div>;
    };
});

jest.mock('../../styles', () => ({
    stackRowCenter: {},
}));

jest.mock('./FileInfoCard.styles', () => ({
    fileCard: {},
    cardContent: {}
}));

jest.mock('@mui/icons-material/Download', () => {
    return function MockDownloadIcon() {
        return <span data-testid="download-icon">Download</span>;
    };
});

jest.useFakeTimers();

describe('FileInfoCard', () => {
    let mockFileService: jest.Mocked<FileService>;
    let fileInfo: FileInfo;
    let mockResponse: FileResponse;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        fileInfo = {
            id: 'file-uuid-1',
            key: 'file-key-1',
            name: 'file1.txt',
            mimetype: 'text/plain',
            size: 2048,
            userId: 'user-uuid',
            createdAt: new Date('2023-01-01T12:00:00Z'),
        };

        mockResponse = {
            success: true,
            message: 'Download success',
            url: 'https://example.com/file1.txt',
            key: 'file-key-1',
        };

        mockFileService = {
            downloadFile: jest.fn(),
            uploadFile: jest.fn(),
            getFilesList: jest.fn(),
            createFileInfo: jest.fn(),
        } as unknown as jest.Mocked<FileService>;
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.clearAllTimers();
        consoleErrorSpy.mockRestore();
    });

    it('renders file info card', () => {
        render(<FileInfoCard fileInfo={fileInfo} service={mockFileService} />);

        expect(screen.getByText('file1.txt')).toBeInTheDocument();
        expect(screen.getByText('text/plain')).toBeInTheDocument();
        expect(screen.getByText('2.00 KB')).toBeInTheDocument();
        expect(screen.getByTestId('icon-button')).toBeInTheDocument();
        expect(screen.getByTestId('download-icon')).toBeInTheDocument();

        const formattedDate = new Date('2023-01-01T12:00:00Z').toLocaleString();
        expect(screen.getByText(formattedDate)).toBeInTheDocument();
    });

    it('shows loader while downloading and success after download', async () => {
        let resolveDownload: (value: FileResponse) => void;
        const downloadPromise = new Promise<FileResponse>((resolve) => {
            resolveDownload = resolve;
        });

        mockFileService.downloadFile.mockReturnValue(downloadPromise);

        render(<FileInfoCard fileInfo={fileInfo} service={mockFileService} />);

        const downloadButton = screen.getByTestId('icon-button');

        await act(async () => {
            fireEvent.click(downloadButton);
        });

        expect(screen.getByTestId('loader')).toBeInTheDocument();
        expect(mockFileService.downloadFile).toHaveBeenCalledWith(fileInfo.key, fileInfo.name);

        await act(async () => {
            resolveDownload!(mockResponse);
        });

        await waitFor(() => {
            expect(screen.getByTestId('success-message')).toBeInTheDocument();
            expect(screen.getByText('File scaricato con successo')).toBeInTheDocument();
        });

        await act(async () => {
            jest.advanceTimersByTime(2000);
        });

        await waitFor(() => {
            expect(screen.queryByTestId('success-message')).not.toBeInTheDocument();
            expect(screen.getByText('file1.txt')).toBeInTheDocument();
        });
    });

    it('shows error message when download fails', async () => {
        let rejectDownload: (error: Error) => void;
        const downloadPromise = new Promise<FileResponse>((_resolve, reject) => {
            rejectDownload = reject;
        });

        mockFileService.downloadFile.mockReturnValue(downloadPromise);

        render(<FileInfoCard fileInfo={fileInfo} service={mockFileService} />);

        const downloadButton = screen.getByTestId('icon-button');

        await act(async () => {
            fireEvent.click(downloadButton);
        });

        expect(screen.getByTestId('loader')).toBeInTheDocument();

        await act(async () => {
            rejectDownload!(new Error('Network error'));
        });

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
            expect(screen.getByText('Network error')).toBeInTheDocument();
        });

        await act(async () => {
            jest.advanceTimersByTime(2000);
        });

        await waitFor(() => {
            expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
            expect(screen.getByText('file1.txt')).toBeInTheDocument();
        });
    });

    it('calls downloadFile with correct parameters when download button is clicked', async () => {
        mockFileService.downloadFile.mockResolvedValue(mockResponse);

        render(<FileInfoCard fileInfo={fileInfo} service={mockFileService} />);

        const downloadButton = screen.getByTestId('icon-button');

        await act(async () => {
            fireEvent.click(downloadButton);
        });

        expect(mockFileService.downloadFile).toHaveBeenCalledTimes(1);
        expect(mockFileService.downloadFile).toHaveBeenCalledWith(fileInfo.key, fileInfo.name);
    });
});