import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './app-init';
import FileSection from './sections/FileSection/FileSection';
import FileInfoSection from './sections/FileInfoSection/FileInfoSection';

const mockExampleService = {
  getMessage: jest.fn(() => Promise.resolve({ message: 'Mocked API Message' })),
};

jest.mock('./services/example.service', () => ({
  ExampleService: jest.fn(() => mockExampleService),
}));

jest.mock('./services/file.service', () => ({
  FileService: jest.fn(() => ({
    uploadFile: jest.fn(),
    downloadFile: jest.fn(),
    getFilesList: jest.fn(),
  })),
}));

jest.mock('./sections/FileSection/FileSection', () => jest.fn(() => <div>Mocked File Section</div>));
jest.mock('./sections/FileInfoSection/FileInfoSection', () => jest.fn(() => <div>Mocked File Info Section</div>));

jest.mock('./components/AuthModal/AuthModal', () => function MockAuthModal() {
  return <div data-testid="auth-modal">Mocked Auth Modal</div>;
});

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the main layout with headers and texts', () => {
    render(<App />);
    expect(screen.getByText('BonusX Interview Challenge')).toBeInTheDocument();
    expect(screen.getByText("Benvenuto nell'applicazione")).toBeInTheDocument();
    expect(screen.getByText('Carica un file')).toBeInTheDocument();
    expect(screen.getByText('Guarda e scarica i tuoi file')).toBeInTheDocument();
  });

  it('renders FileSection and FileInfoSection components', () => {
    render(<App />);
    expect(screen.getByText('Mocked File Section')).toBeInTheDocument();
    expect(screen.getByText('Mocked File Info Section')).toBeInTheDocument();
    expect(FileSection).toHaveBeenCalled();
    expect(FileInfoSection).toHaveBeenCalled();
  });

  it('calls ExampleService and shows alert on API button click', async () => {
    window.alert = jest.fn();
    render(<App />);
    const apiButton = screen.getByRole('button', { name: /Cliccami per fare una chiamata API/i });
    await act(async () => fireEvent.click(apiButton));
    expect(mockExampleService.getMessage).toHaveBeenCalledTimes(1);
    expect(window.alert).toHaveBeenCalledWith('Mocked API Message');
  });

  it('shows Login button when unauthenticated and opens AuthModal on click', () => {
    render(<App />);
    const loginButton = screen.getByRole('button', { name: 'Login' });
    expect(loginButton).toBeInTheDocument();
    fireEvent.click(loginButton);
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
  });
});
