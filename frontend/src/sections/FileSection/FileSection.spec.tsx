import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileSection from './FileSection';
import { FileService } from '../../services/file.service';
import { AuthStatus } from '../../constants/auth-status.enum';
import { FileInfo } from '../../models/file-info.model';
import { CreateResponse } from '../../models/create-response.model';
import { AuthResponse } from '../../models/auth-response.model';

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
    let mockUploadResponse: CreateResponse;
    let setUploadedFileInfoMock: jest.Mock;

    const authResponse : AuthResponse= { success: true, message: "Sign in successful", email: "test@gmail.com", id:"user-uuid" };

    beforeEach(() => {
        jest.clearAllMocks();

        mockFileService = {
            uploadFile: jest.fn(),
            downloadFile: jest.fn(),
            getFilesList: jest.fn(),
        } as jest.Mocked<FileService>;

        mockFile = new File(['test content'], 'test-file.txt', { type: 'text/plain' });

        mockUploadResponse = {
            success: true,
            message: 'File uploaded successfully',
            fileInfo: {
                id: 'file-uuid',
                name: 'test-file.txt',
                size: 100,
                mimetype: 'text/plain',
                userId: 'user-uuid',
                key: "key",
                createdAt: new Date().toISOString(),
            } as unknown as FileInfo,
        } as CreateResponse;

        setUploadedFileInfoMock = jest.fn();
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
        render(
            <FileSection
                service={mockFileService}
                authStatus={AuthStatus.authenticated}
                authResponse={authResponse}
                setUploadedFileInfo={setUploadedFileInfoMock}
            />
        );
        expect(screen.getByText('Select file')).toBeInTheDocument();
        expect(screen.getByTestId('file-input')).toBeInTheDocument();
    });

    it('displays selected file chip when file is selected', () => {
        render(
            <FileSection
                service={mockFileService}
                authStatus={AuthStatus.authenticated}
                authResponse={authResponse}
                setUploadedFileInfo={setUploadedFileInfoMock}
            />
        );
        const fileInput = screen.getByTestId('file-input');
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
        expect(screen.getByTestId('selected-file-chip')).toBeInTheDocument();
        expect(screen.getByText('test-file.txt')).toBeInTheDocument();
    });

    it('calls uploadFile service method with file and userId when upload button is clicked', async () => {
        mockFileService.uploadFile.mockResolvedValue(mockUploadResponse);

        render(
            <FileSection
                service={mockFileService}
                authStatus={AuthStatus.authenticated}
                authResponse={authResponse}
                setUploadedFileInfo={setUploadedFileInfoMock}
            />
        );

        fireEvent.change(screen.getByTestId('file-input'), { target: { files: [mockFile] } });

        await act(async () => fireEvent.click(screen.getByText('Upload')));

        expect(mockFileService.uploadFile).toHaveBeenCalledWith(mockFile, 'user-uuid');
        expect(setUploadedFileInfoMock).toHaveBeenCalledWith(mockUploadResponse.fileInfo);
    });

    it('shows success message after successful upload', async () => {
        mockFileService.uploadFile.mockResolvedValue(mockUploadResponse);

        render(
            <FileSection
                service={mockFileService}
                authStatus={AuthStatus.authenticated}
                authResponse={authResponse}
                setUploadedFileInfo={setUploadedFileInfoMock}
            />
        );

        fireEvent.change(screen.getByTestId('file-input'), { target: { files: [mockFile] } });

        await act(async () => fireEvent.click(screen.getByText('Upload')));

        await waitFor(() => {
            expect(screen.getByTestId('success-message')).toBeInTheDocument();
            expect(screen.getByText('File caricato con successo')).toBeInTheDocument();
        });
    });

    it('shows loading message after upload button click', async () => {
        render(
            <FileSection
                service={mockFileService}
                authStatus={AuthStatus.authenticated}
                authResponse={authResponse}
                setUploadedFileInfo={setUploadedFileInfoMock}
            />
        );

        fireEvent.change(screen.getByTestId('file-input'), { target: { files: [mockFile] } });
        await act(async () => fireEvent.click(screen.getByText('Upload')));
    });

    it('displays error message when selected file type is not supported', async () => {
        const unsupportedFile = new File(['test content'], 'test-file.svg', { type: 'image/svg+xml' });

        render(
            <FileSection
                service={mockFileService}
                authStatus={AuthStatus.authenticated}
                authResponse={authResponse}
                setUploadedFileInfo={setUploadedFileInfoMock}
            />
        );

        await act(async () => {
            fireEvent.change(screen.getByTestId('file-input'), { target: { files: [unsupportedFile] } });
        });

        expect(await screen.findByText('The file type is not supported')).toBeInTheDocument();
    });

    it('renders unauthenticated message when authStatus is not authenticated', () => {
        render(
            <FileSection
                service={mockFileService}
                authStatus={AuthStatus.unauthenticated}
                authResponse={undefined}
                setUploadedFileInfo={setUploadedFileInfoMock}
            />
        );
        expect(screen.getByTestId('unauthenticated-message')).toBeInTheDocument();
        expect(screen.getByText('Devi autenticarti')).toBeInTheDocument();
    });
});
