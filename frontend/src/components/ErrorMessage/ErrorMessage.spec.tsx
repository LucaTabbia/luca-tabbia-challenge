import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorMessage from './ErrorMessage';

jest.mock('@mui/icons-material/ErrorOutline', () => {
    return function MockErrorOutlineIcon(props: React.SVGProps<SVGSVGElement>) {
        return <svg data-testid="error-outline-icon" {...props} />;
    };
});

describe('ErrorMessage', () => {
    it('renders the error message and retry button', () => {
        const mockError = 'An error occurred during upload.';
        const mockOnClick = jest.fn();

        render(<ErrorMessage error={mockError} onClick={mockOnClick} />);

        expect(screen.getByTestId('error-outline-icon')).toBeInTheDocument();

        expect(screen.getByText(mockError)).toBeInTheDocument();

        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });

    it('calls onClick handler when the "Retry" button is clicked', () => {
        const mockError = 'Network error.';
        const mockOnClick = jest.fn();

        render(<ErrorMessage error={mockError} onClick={mockOnClick} />);

        const retryButton = screen.getByRole('button', { name: 'Retry' });

        fireEvent.click(retryButton);

        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

});