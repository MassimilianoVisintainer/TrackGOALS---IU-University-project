import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import SignUp from "./SignUp";

jest.mock('axios', () => ({
  post: jest.fn(),
}));
describe("SignUp Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders input fields and submit button", () => {
    render(<SignUp />);

    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  test("displays success message on successful signup", async () => {
    axios.post.mockResolvedValueOnce({ data: { message: "Sign up successful" } });

    render(<SignUp />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "TestUser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/email address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/sign up successful/i)).toBeInTheDocument();
      expect(screen.getByText(/sign up successful/i)).toHaveClass("text-success");
    });
  });

  test("displays error message from server on failed signup", async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Email already exists" } },
    });

    render(<SignUp />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "ExistingUser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/email address/i), {
      target: { value: "existing@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      expect(screen.getByText(/email already exists/i)).toHaveClass("text-danger");
    });
  });

  test("displays generic error message on network failure", async () => {
    axios.post.mockRejectedValueOnce(new Error("Network Error"));

    render(<SignUp />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "OfflineUser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/email address/i), {
      target: { value: "offline@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/error signing up/i)).toBeInTheDocument();
    });
  });
});
