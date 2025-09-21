import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileSection from './FileSection';
import { FileService } from '../../services/file.service';
import { FileResponse } from '../../models/upload-response.model';
import { AuthStatus } from '../../constants/auth-status.enum';

jest.mock('../../services/file.service');

jest.mock('../../components/ErrorMessage/ErrorMessage', () => {
    return function MockErrorMessage({ error, onClick }: { error: string; onClick: () => void }) {
        return (
            <div data-testid="error-message">
                <span>{error}</span>
                <button onClick={onClick} data-testid="error-reset-button">Reset</button>
            </div>
        );
    };
});

jest.mock('../../components/SelectedFileChip/SelectedFileChip', () => {
    return function MockSelectedFileChip({ file, onDelete }: { file: File; onDelete: () => void }) {
        return (
            <div data-testid="selected-file-chip">
                <span>{file.name}</span>
                <button onClick={onDelete} data-testid="delete-file-button">Delete</button>
            </div>
        );
    };
});

jest.mock('../../components/SuccessMessage/SuccessMessage', () => {
    return function MockSuccessMessage({ message }: { message: string }) {
        return (
            <div data-testid="success-message">
                <span>{message}</span>
            </div>
        );
    };
});

jest.mock('../../components/UnauthenticatedMessage/UnauthenticatedMessage', () => {
    return function MockUnauthenticatedMessage() {
        return <div data-testid="unauthenticated-message">Devi autenticarti</div>;
    };
});

jest.mock('../../styles', () => ({
    boxContainer: {},
    stackColumnCenter: {},
    stackRowCenter: {},
}));

jest.useFakeTimers();

describe('FileSection', () => {
    let mockFileService: jest.Mocked<FileService>;
    let mockFile: File;
    let mockUploadResponse: FileResponse;

    beforeEach(() => {
        jest.clearAllMocks();

        mockFileService = {
            uploadFile: jest.fn(),
            downloadFile: jest.fn(),
        } as jest.Mocked<FileService>;

        mockFile = new File(['test content'], 'test-file.txt', { type: 'text/plain' });

        mockUploadResponse = {
            success: true,
            message: 'File uploaded successfully',
            key: 'test-file-key-123',
            url: "example.url"
        };
    });

    afterEach(async () => {
        await act(() => {
            jest.runOnlyPendingTimers();
        });
        jest.useRealTimers();
        jest.useFakeTimers();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('renders the file selection button', () => {
        render(<FileSection service={mockFileService} authStatus={AuthStatus.authenticated} />);
        expect(screen.getByText('Select file')).toBeInTheDocument();
        expect(screen.getByTestId('file-input')).toBeInTheDocument();
    });

    it('displays selected file chip when file is selected', () => {
        render(<FileSection service={mockFileService} authStatus={AuthStatus.authenticated} />);
        const fileInput = screen.getByTestId('file-input');
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
        expect(screen.getByTestId('selected-file-chip')).toBeInTheDocument();
        expect(screen.getByText('test-file.txt')).toBeInTheDocument();
    });

    it('calls uploadFile service method when upload button is clicked', async () => {
        mockFileService.uploadFile.mockResolvedValue(mockUploadResponse);
        render(<FileSection service={mockFileService} authStatus={AuthStatus.authenticated} />);
        fireEvent.change(screen.getByTestId('file-input'), { target: { files: [mockFile] } });
        await act(async () => fireEvent.click(screen.getByText('Upload')));
        expect(mockFileService.uploadFile).toHaveBeenCalledWith(mockFile);
    });

    it('shows success message after successful upload', async () => {
        mockFileService.uploadFile.mockResolvedValue(mockUploadResponse);
        render(<FileSection service={mockFileService} authStatus={AuthStatus.authenticated} />);
        fireEvent.change(screen.getByTestId('file-input'), { target: { files: [mockFile] } });
        await act(async () => fireEvent.click(screen.getByText('Upload')));
        await waitFor(() => {
            expect(screen.getByTestId('success-message')).toBeInTheDocument();
            expect(screen.getByText('File caricato con successo')).toBeInTheDocument();
        });
    });

    it('shows success message after successful download', async () => {
        mockFileService.uploadFile.mockResolvedValue(mockUploadResponse);
        mockFileService.downloadFile.mockResolvedValue(mockUploadResponse);
        render(<FileSection service={mockFileService} authStatus={AuthStatus.authenticated} />);
        fireEvent.change(screen.getByTestId('file-input'), { target: { files: [mockFile] } });
        await act(async () => fireEvent.click(screen.getByText('Upload')));
        await waitFor(() => {
            expect(screen.getByTestId('success-message')).toBeInTheDocument();
            expect(screen.getByText('File caricato con successo')).toBeInTheDocument();
        });
        act(() => {
            jest.advanceTimersByTime(2000);
        });
        expect(screen.getByText('Download')).toBeInTheDocument();
        await act(async () => fireEvent.click(screen.getByText('Download')));
        await waitFor(() => {
            expect(screen.getByText('File scaricato con successo')).toBeInTheDocument();
        });
    });

    it('shows loading message after upload button click', async () => {
        render(<FileSection service={mockFileService} authStatus={AuthStatus.authenticated} />);
        fireEvent.change(screen.getByTestId('file-input'), { target: { files: [mockFile] } });
        await act(async () => fireEvent.click(screen.getByText('Upload')));
        await waitFor(() => {
            expect(screen.getByText('Caricamento...')).toBeInTheDocument();
        });
    });

    it('displays error message when selected file type is not supported', async () => {
        const unsupportedFile = new File(['test content'], 'test-file.svg', { type: 'image/svg+xml' });
        render(<FileSection service={mockFileService} authStatus={AuthStatus.authenticated} />);
        await act(async () => {
            fireEvent.change(screen.getByTestId('file-input'), { target: { files: [unsupportedFile] } });
        });
        expect(await screen.findByText("The file type is not supported")).toBeInTheDocument();
    });

    it('renders unauthenticated message when authStatus is not authenticated', () => {
        render(<FileSection service={mockFileService} authStatus={AuthStatus.unauthenticated} />);
        expect(screen.getByTestId('unauthenticated-message')).toBeInTheDocument();
        expect(screen.getByText('Devi autenticarti')).toBeInTheDocument();
    });
});
