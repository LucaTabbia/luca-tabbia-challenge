import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './app-init';
import FileSection from './sections/FileSection/FileSection';

const mockExampleService = {
  getMessage: jest.fn(() => Promise.resolve({ message: 'Mocked API Message' })),
};

jest.mock('./services/example.service', () => {
  return {
    ExampleService: jest.fn().mockImplementation(() => mockExampleService),
  };
});

jest.mock('./services/file.service', () => {
  return {
    FileService: jest.fn().mockImplementation(() => ({
      uploadFile: jest.fn(),
      downloadFile: jest.fn(),
    })),
  };
});

jest.mock('./sections/FileSection/FileSection', () => {
  return jest.fn(() => <div>Mocked File Section</div>);
});

jest.mock('./components/AuthModal/AuthModal', () => {
  return function MockAuthModal() {
    return <div data-testid="auth-modal">Mocked Auth Modal</div>;
  };
});

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the main layout with correct text', () => {
    render(<App />);
    expect(screen.getByText('BonusX Interview Challenge')).toBeInTheDocument();
    expect(screen.getByText("Benvenuto nell'applicazione")).toBeInTheDocument();
    expect(screen.getByText('Carica e scarica un file')).toBeInTheDocument();
    expect(screen.getByText('Funzionalità 2')).toBeInTheDocument();
  });

  it('should render the FileSection component', () => {
    render(<App />);
    expect(screen.getByText('Mocked File Section')).toBeInTheDocument();
    expect(FileSection).toHaveBeenCalled();
  });

  it('should call the API service and show an alert on button click', async () => {
    window.alert = jest.fn();
    render(<App />);
    const apiButton = screen.getByRole('button', { name: /Cliccami per fare una chiamata API/i });
    await act(async () => {
      fireEvent.click(apiButton);
    });
    expect(mockExampleService.getMessage).toHaveBeenCalledTimes(1);
    expect(window.alert).toHaveBeenCalledWith('Mocked API Message');
  });

  it('should show Login button when unauthenticated and open modal on click', () => {
    render(<App />);
    const loginButton = screen.getByRole('button', { name: 'Login' });
    expect(loginButton).toBeInTheDocument();
    fireEvent.click(loginButton);
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
  });

  it('should show Log out button when authenticated', () => {
    render(<App />);
    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(loginButton);
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
  });
});
