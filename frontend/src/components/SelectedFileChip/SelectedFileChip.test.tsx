import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SelectedFileChip from './SelectedFileChip';

jest.mock('@mui/icons-material/Close', () => {
    return function MockCloseIcon(props: React.SVGProps<SVGSVGElement>) {
        return <svg data-testid="close-icon" {...props} />;
    };
});

describe('SelectedFileChip', () => {
    it('renders the filename and extension correctly', () => {
        const mockFile = new File([''], 'my_document.pdf', { type: 'application/pdf' });
        const mockDelete = jest.fn();

        render(<SelectedFileChip file={mockFile} onDelete={mockDelete} />);

        expect(screen.getByText('my_document')).toBeInTheDocument();
        expect(screen.getByText('.pdf')).toBeInTheDocument();

    });

    it('renders correctly when there is no file extension', () => {
        const mockFile = new File([''], 'README', { type: 'text/plain' });
        const mockDelete = jest.fn();

        render(<SelectedFileChip file={mockFile} onDelete={mockDelete} />);

        expect(screen.getByText('README')).toBeInTheDocument();
        expect(screen.queryByText('.')).not.toBeInTheDocument();

    });

    it('renders correctly with multiple dots in the filename', () => {
        const mockFile = new File([''], 'my.report.v1.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const mockDelete = jest.fn();

        render(<SelectedFileChip file={mockFile} onDelete={mockDelete} />);

        expect(screen.getByText('my.report.v1')).toBeInTheDocument();
        expect(screen.getByText('.docx')).toBeInTheDocument();

    });

    it('calls onDelete when the delete icon is clicked', () => {
        const mockFile = new File([''], 'test_file.txt', { type: 'text/plain' });
        const mockDelete = jest.fn();

        render(<SelectedFileChip file={mockFile} onDelete={mockDelete} />);
        fireEvent.click(screen.getByTestId('close-icon'));

        expect(mockDelete).toHaveBeenCalledTimes(1);
    });
});