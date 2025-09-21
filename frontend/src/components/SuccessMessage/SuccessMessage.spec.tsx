import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SuccessMessage from './SuccessMessage';

jest.mock('@mui/icons-material/CheckCircleOutline', () => {
    return function MockCheckCircleOutlineIcon(props: React.SVGProps<SVGSVGElement>) {
        return <svg data-testid="check-circle-outline-icon" {...props} />;
    };
});

describe('SuccessMessage', () => {
    it('renders the success message and an icon', () => {
        const mockMessage = 'Completed successfully!';

        render(<SuccessMessage message={mockMessage}/>);

        expect(screen.getByTestId('check-circle-outline-icon')).toBeInTheDocument();

        expect(screen.getByText(mockMessage)).toBeInTheDocument();
    });

});