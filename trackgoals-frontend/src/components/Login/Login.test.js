import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';

jest.mock('axios', () => ({
  post: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));



describe('Login Component', () => {
    beforeEach(() => {
    localStorage.clear(); // Clear local storage before each test to ensure a clean state.
    });

  test('renders login form elements', () => {
    render(<Login />);
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('shows error message for short password', async () => {
    render(<Login />);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(passwordInput, { target: { value: '123' } }); // Simulate a short password
    fireEvent.click(loginButton);

    expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument();
  });

  test('submits form with valid credentials', async () => {
    render(<Login />);
    // Mock axios post request to simulate successful login
    const axios = require('axios');
    axios.post.mockResolvedValue({
      data: { token: 'mockToken' },
    });

    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    emailInput.value = 'test@test.com';
    passwordInput.value = '123456'; // Valid password
    loginButton.click();

});

 test("calls axios and redirects on successful login", async () => {
    const axios = require('axios');
    axios.post.mockResolvedValue({ data: { token: "fakeToken" } });
    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/email address/i), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("http://localhost:5000/api/login", {
        email: "test@test.com",
        password: "123456",
      });
    });

    expect(localStorage.getItem("token")).toBe("fakeToken");
    expect(screen.getByText(/login successful/i)).toBeInTheDocument();
  });

 test("displays error message on failed login", async () => {
        const axios = require('axios');
    // Mock axios post request to simulate failed login
    axios.post.mockRejectedValue({
      response: { data: { message: "Invalid credentials" } },
    });

    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/email address/i), {
      target: { value: "wrong@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
