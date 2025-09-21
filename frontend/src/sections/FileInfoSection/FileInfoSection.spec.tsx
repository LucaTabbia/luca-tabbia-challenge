import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileInfoSection from './FileInfoSection';
import { FileService } from '../../services/file.service';
import { AuthStatus } from '../../constants/auth-status.enum';
import { FileInfo } from '../../models/file-info.model';
import { FileInfoResponse } from '../../models/file-info-response.model';
import { AuthResponse } from '../../models/auth-response.model';

jest.mock('../../services/file.service');

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

jest.mock('../../components/UnauthenticatedMessage/UnauthenticatedMessage', () => {
    return function MockUnauthenticatedMessage() {
        return <div data-testid="unauthenticated-message">Devi autenticarti</div>;
    };
});

jest.mock('../../components/Loader/Loader', () => {
    return function MockLoader() {
        return <div data-testid="loader">Caricamento...</div>;
    };
});

jest.mock('../../components/FileInfoCard/FileInfoCard', () => {
    return function MockFileInfoCard({ fileInfo }: { fileInfo: FileInfo }) {
        return <div data-testid="file-info-card">{fileInfo.name}</div>;
    };
});

jest.mock('./FileInfoSection.styles', () => ({
    listContainer: {},
}));

jest.useFakeTimers();

describe('FileInfoSection', () => {
    let mockFileService: jest.Mocked<FileService>;
    let consoleErrorSpy: jest.SpyInstance;
    const authResponse: AuthResponse = {
        success: true,
        message: "Sign in successful",
        email: "test@gmail.com",
        id: "user-uuid"
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock console.error per evitare output durante i test di errore
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        mockFileService = {
            getFilesList: jest.fn(),
            uploadFile: jest.fn(),
            downloadFile: jest.fn(),
            createFileInfo: jest.fn(),
        } as unknown as jest.Mocked<FileService>;
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.clearAllTimers();
        consoleErrorSpy.mockRestore();
    });

    it('renders unauthenticated message when authStatus is not authenticated', () => {
        render(
            <FileInfoSection
                service={mockFileService}
                authStatus={AuthStatus.unauthenticated}
                authResponse={undefined}
                uploadedFileInfo={undefined}
                setUploadedFileInfo={jest.fn()}
            />
        );

        expect(screen.getByTestId('unauthenticated-message')).toBeInTheDocument();
    });

    it('shows loader and then list of files on successful fetch', async () => {
        const files: FileInfo[] = [
            {
                id: '1',
                name: 'file1.txt',
                size: 100,
                mimetype: 'text/plain',
                createdAt: new Date(),
                userId: "user-uuid",
                key: "file1-uuid"
            },
            {
                id: '2',
                name: 'file2.txt',
                size: 200,
                mimetype: 'text/plain',
                createdAt: new Date(),
                userId: "user-uuid",
                key: "file2-uuid"
            },
        ];
        const response: FileInfoResponse = { success: true, message: 'ok', files };

        mockFileService.getFilesList.mockResolvedValue(response);

        render(
            <FileInfoSection
                service={mockFileService}
                authStatus={AuthStatus.authenticated}
                authResponse={authResponse}
                uploadedFileInfo={undefined}
                setUploadedFileInfo={jest.fn()}
            />
        );

        // Verifica che il loader sia presente inizialmente
        expect(screen.getByTestId('loader')).toBeInTheDocument();

        // Attendi che la chiamata API si completi
        await waitFor(() => {
            expect(mockFileService.getFilesList).toHaveBeenCalledWith(authResponse.id);
        });

        // Verifica che il messaggio di successo sia mostrato
        await waitFor(() => {
            expect(screen.getByTestId('success-message')).toBeInTheDocument();
        });

        // Avanza i timer per nascondere il messaggio di successo
        act(() => {
            jest.advanceTimersByTime(2000);
        });

        // Verifica che i file siano mostrati
        await waitFor(() => {
            expect(screen.getAllByTestId('file-info-card')).toHaveLength(2);
            expect(screen.getByText('file1.txt')).toBeInTheDocument();
            expect(screen.getByText('file2.txt')).toBeInTheDocument();
        });
    });

    it('shows error message if fetching files fails', async () => {
        mockFileService.getFilesList.mockRejectedValue(new Error('Network error'));

        render(
            <FileInfoSection
                service={mockFileService}
                authStatus={AuthStatus.authenticated}
                authResponse={authResponse}
                uploadedFileInfo={undefined}
                setUploadedFileInfo={jest.fn()}
            />
        );

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toHaveTextContent('Network error');
        });
    });

    it('displays "Nessun file trovato" when no files are returned', async () => {
        mockFileService.getFilesList.mockResolvedValue({ success: true, message: 'ok', files: [] });

        render(
            <FileInfoSection
                service={mockFileService}
                authStatus={AuthStatus.authenticated}
                authResponse={authResponse}
                uploadedFileInfo={undefined}
                setUploadedFileInfo={jest.fn()}
            />
        );

        // Attendi che la chiamata API si completi
        await waitFor(() => {
            expect(mockFileService.getFilesList).toHaveBeenCalledWith(authResponse.id);
        });

        // Avanza i timer per nascondere il messaggio di successo
        act(() => {
            jest.advanceTimersByTime(2000);
        });

        await waitFor(() => {
            expect(screen.getByText('Nessun file trovato')).toBeInTheDocument();
        });
    });

    it('adds newly uploaded file when uploadedFileInfo prop changes', async () => {
        const uploadedFile: FileInfo = {
            id: '3',
            name: 'file3.txt',
            size: 300,
            mimetype: 'text/plain',
            createdAt: new Date(),
            userId: "user-uuid",
            key: "file3-uuid"
        };
        const setUploadedFileInfoMock = jest.fn();

        // Inizia con la lista vuota
        mockFileService.getFilesList.mockResolvedValue({ success: true, message: 'ok', files: [] });

        const { rerender } = render(
            <FileInfoSection
                service={mockFileService}
                authStatus={AuthStatus.authenticated}
                authResponse={authResponse}
                uploadedFileInfo={undefined}
                setUploadedFileInfo={setUploadedFileInfoMock}
            />
        );

        // Attendi che l'inizializzazione sia completa
        await waitFor(() => {
            expect(mockFileService.getFilesList).toHaveBeenCalledWith(authResponse.id);
        });

        // Avanza i timer per nascondere il messaggio di successo
        act(() => {
            jest.advanceTimersByTime(2000);
        });

        // Rerender con il nuovo file
        rerender(
            <FileInfoSection
                service={mockFileService}
                authStatus={AuthStatus.authenticated}
                authResponse={authResponse}
                uploadedFileInfo={uploadedFile}
                setUploadedFileInfo={setUploadedFileInfoMock}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('file3.txt')).toBeInTheDocument();
            expect(setUploadedFileInfoMock).toHaveBeenCalledWith(undefined);
        });
    });
});