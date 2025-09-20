import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileSection from './FileSection';
import { FileService } from '../../services/file.service';
import { UploadResponse } from '../../models/upload-response.model';

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

jest.mock('./FileSection.styles', () => ({
    boxContainer: {},
    stackColumnCenter: {},
    stackRowCenter: {},
}));

jest.useFakeTimers();

describe('FileSection', () => {
    let mockFileService: jest.Mocked<FileService>;
    let mockFile: File;
    let mockUploadResponse: UploadResponse;

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
        render(<FileSection service={mockFileService} />);

        expect(screen.getByText('Select file')).toBeInTheDocument();
        expect(screen.getByTestId('file-input')).toBeInTheDocument();
    });

    it('displays selected file chip when file is selected', () => {
        render(<FileSection service={mockFileService} />);

        const fileInput = screen.getByTestId('file-input');
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        expect(screen.getByTestId('selected-file-chip')).toBeInTheDocument();
        expect(screen.getByText('test-file.txt')).toBeInTheDocument();
    });

    it('shows upload button when file is selected', () => {
        render(<FileSection service={mockFileService} />);

        const fileInput = screen.getByTestId('file-input');
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        expect(screen.getByText('Upload')).toBeInTheDocument();
    });

    it('calls uploadFile service method when upload button is clicked', async () => {
        mockFileService.uploadFile.mockResolvedValue(mockUploadResponse);

        render(<FileSection service={mockFileService} />);

        const fileInput = screen.getByTestId('file-input');
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        const uploadButton = screen.getByText('Upload');

        await act(async () => {
            fireEvent.click(uploadButton);
        });

        expect(mockFileService.uploadFile).toHaveBeenCalledWith(mockFile);
    });

    it('shows success message and icon after successful upload', async () => {
        mockFileService.uploadFile.mockResolvedValue(mockUploadResponse);

        render(<FileSection service={mockFileService} />);

        const fileInput = screen.getByTestId('file-input');
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        const uploadButton = screen.getByText('Upload');

        await act(async () => {
            fireEvent.click(uploadButton);
        });

        await waitFor(() => {
            expect(screen.getByTestId('CheckCircleOutlineIcon')).toBeInTheDocument();
            expect(screen.getByText('File uploaded successfully')).toBeInTheDocument();
        });
    });

    it('hides success message after 2 seconds and shows download button after additional delay', async () => {
        mockFileService.uploadFile.mockResolvedValue(mockUploadResponse);

        render(<FileSection service={mockFileService} />);

        const fileInput = screen.getByTestId('file-input');
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        const uploadButton = screen.getByText('Upload');

        await act(async () => {
            fireEvent.click(uploadButton);
        });

        await waitFor(() => {
            expect(screen.getByText('File uploaded successfully')).toBeInTheDocument();
        });

        await act(async () => {
            jest.advanceTimersByTime(2000);
        });

        await act(async () => {
            jest.advanceTimersByTime(500);
        });

        await waitFor(() => {
            expect(screen.getByText('Download')).toBeInTheDocument();
        });
    });

    it('calls downloadFile service method when download button is clicked', async () => {
        mockFileService.uploadFile.mockResolvedValue(mockUploadResponse);
        mockFileService.downloadFile.mockResolvedValue(undefined);

        render(<FileSection service={mockFileService} />);

        const fileInput = screen.getByTestId('file-input');
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        const uploadButton = screen.getByText('Upload');

        await act(async () => {
            fireEvent.click(uploadButton);
        });

        await waitFor(() => {
            expect(screen.getByText('File uploaded successfully')).toBeInTheDocument();
        });

        await act(async () => {
            jest.advanceTimersByTime(2500);
        });

        await waitFor(() => {
            expect(screen.getByText('Download')).toBeInTheDocument();
        });

        const downloadButton = screen.getByText('Download');

        await act(async () => {
            fireEvent.click(downloadButton);
        });

        expect(mockFileService.downloadFile).toHaveBeenCalledWith('test-file-key-123', 'test-file.txt');
    });

    it('displays error message when upload fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        const errorMessage = 'Upload failed: Network error';
        mockFileService.uploadFile.mockRejectedValue(new Error(errorMessage));

        render(<FileSection service={mockFileService} />);

        const fileInput = screen.getByTestId('file-input');
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        const uploadButton = screen.getByText('Upload');

        await act(async () => {
            fireEvent.click(uploadButton);
        });

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith("Upload failed", expect.any(Error));
        consoleErrorSpy.mockRestore();
    });

    it('displays error message when selected file is too large', async () => {
        const largeFile = new File(
            [new Uint8Array(6 * 1024 * 1024)], // 6MB
            "bigfile.pdf",
            { type: "application/pdf" }
        );


        render(<FileSection service={mockFileService} />);

        const input = screen.getByTestId("file-input") as HTMLInputElement;

        await act(async () => {
            fireEvent.change(input, { target: { files: [largeFile] } });
        });

        expect(
            await screen.findByText("The file is too big. Max file size supported is 5MB")
        ).toBeInTheDocument();
    });

    it('displays error message when selected file type is not supported', async () => {
        const unsupportedFile = new File(['test content'], 'test-file.svg', { type: 'image/svg' });


        render(<FileSection service={mockFileService} />);

        const input = screen.getByTestId("file-input") as HTMLInputElement;

        await act(async () => {
            fireEvent.change(input, { target: { files: [unsupportedFile] } });
        });

        expect(
            await screen.findByText("The file type is not supported")
        ).toBeInTheDocument();
    });

    it('displays error message when download fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        const errorMessage = 'Download failed: Network error';
        mockFileService.uploadFile.mockResolvedValue(mockUploadResponse);
        mockFileService.downloadFile.mockRejectedValue(new Error(errorMessage));

        render(<FileSection service={mockFileService} />);

        const fileInput = screen.getByTestId('file-input');
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        const uploadButton = screen.getByText('Upload');

        await act(async () => {
            fireEvent.click(uploadButton);
        });

        await waitFor(() => {
            expect(screen.getByText('File uploaded successfully')).toBeInTheDocument();
        });

        await act(async () => {
            jest.advanceTimersByTime(2500);
        });

        await waitFor(() => {
            expect(screen.getByText('Download')).toBeInTheDocument();
        });

        const downloadButton = screen.getByText('Download');

        await act(async () => {
            fireEvent.click(downloadButton);
        });

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith("Download failed", expect.any(Error));
        consoleErrorSpy.mockRestore();
    });

    it('handles unknown error types with default message', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        mockFileService.uploadFile.mockRejectedValue('Unknown error string');

        render(<FileSection service={mockFileService} />);

        const fileInput = screen.getByTestId('file-input');
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        const uploadButton = screen.getByText('Upload');

        await act(async () => {
            fireEvent.click(uploadButton);
        });

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
            expect(screen.getByText('Upload failed: Unknown error')).toBeInTheDocument();
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith("Upload failed", "Unknown error string");
        consoleErrorSpy.mockRestore();
    });

    it('resets file state when delete button is clicked on file chip', () => {
        render(<FileSection service={mockFileService} />);

        const fileInput = screen.getByTestId('file-input');
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        expect(screen.getByTestId('selected-file-chip')).toBeInTheDocument();

        const deleteButton = screen.getByTestId('delete-file-button');
        fireEvent.click(deleteButton);

        expect(screen.queryByTestId('selected-file-chip')).not.toBeInTheDocument();
        expect(screen.queryByText('Upload')).not.toBeInTheDocument();
    });

    it('resets file state when error retry button is clicked', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        mockFileService.uploadFile.mockRejectedValue(new Error('Upload failed'));

        render(<FileSection service={mockFileService} />);

        const fileInput = screen.getByTestId('file-input');
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        const uploadButton = screen.getByText('Upload');
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
        });

        const resetButton = screen.getByTestId('error-reset-button');
        fireEvent.click(resetButton);

        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
        expect(screen.getByText('Select file')).toBeInTheDocument();

        expect(consoleErrorSpy).toHaveBeenCalledWith('Upload failed', expect.any(Error));
        consoleErrorSpy.mockRestore();
    });

    it('does not show download button when upload response indicates failure', async () => {
        const failureResponse: UploadResponse = {
            success: false,
            message: 'Upload failed',
            key: '',
        };

        mockFileService.uploadFile.mockResolvedValue(failureResponse);

        render(<FileSection service={mockFileService} />);

        const fileInput = screen.getByTestId('file-input');
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        const uploadButton = screen.getByText('Upload');

        await act(async () => {
            fireEvent.click(uploadButton);
        });

        await waitFor(() => {
            expect(screen.getByText('Upload failed')).toBeInTheDocument();
        });

        await act(async () => {
            jest.advanceTimersByTime(2500);
        });

        expect(screen.queryByText('Download')).not.toBeInTheDocument();
    });

    it('handles file input with no files selected', () => {
        render(<FileSection service={mockFileService} />);

        const fileInput = screen.getByTestId('file-input');
        fireEvent.change(fileInput, { target: { files: null } });

        expect(screen.queryByTestId('selected-file-chip')).not.toBeInTheDocument();
        expect(screen.queryByText('Upload')).not.toBeInTheDocument();
    });
});