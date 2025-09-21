import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UnauthenticatedMessage from './UnauthenticatedMessage';

jest.mock('@mui/icons-material/LockOutlined', () => {
    return function MockLockOutlinedIcon(props: React.SVGProps<SVGSVGElement>) {
        return <svg data-testid="lock-outlined-icon" {...props} />;
    };
});

describe('UnauthenticatedMessage', () => {
    it('renders the unauthenticated message and an icon', () => {

        render(<UnauthenticatedMessage/>);

        expect(screen.getByTestId('lock-outlined-icon')).toBeInTheDocument();

        expect(screen.getByText("Non hai eseguito l'accesso. Devi accedere per poter utilizzare questa funzione!")).toBeInTheDocument();
    });

});