import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Loader from './Loader';

describe('Loader', () => {
    it('renders the loader with its label', () => {
        render(<Loader/>);
        expect(screen.getByText("Caricamento...")).toBeInTheDocument();
    });
});