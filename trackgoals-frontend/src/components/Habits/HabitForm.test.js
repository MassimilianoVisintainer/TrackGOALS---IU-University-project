import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HabitForm from "./HabitForm";
const axios = require("axios");

jest.mock("axios", () => ({
  post: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

describe("HabitForm", () => {
  const onHabitCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    onHabitCreated.mockReset();
  });

  it("renders form fields and submit button", () => {
    render(<HabitForm onHabitCreated={onHabitCreated} />);
    expect(screen.getByPlaceholderText("Habit Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Description (Optional)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add habit/i })).toBeInTheDocument();
    const select = screen.getByRole("combobox");
    expect(select.value).toBe("daily");
  });

  it("shows error if habit name is empty", async () => {
    render(<HabitForm onHabitCreated={onHabitCreated} />);
    fireEvent.change(screen.getByPlaceholderText("Habit Name"), { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: /add habit/i }));
    expect(await screen.findByText(/habit name is required/i)).toBeInTheDocument();
    expect(onHabitCreated).not.toHaveBeenCalled();
  });

  it("shows error if no token is present", async () => {
    render(<HabitForm onHabitCreated={onHabitCreated} />);
    fireEvent.change(screen.getByPlaceholderText("Habit Name"), { target: { value: "Read" } });
    fireEvent.click(screen.getByRole("button", { name: /add habit/i }));
    expect(await screen.findByText(/authentication error/i)).toBeInTheDocument();
    expect(onHabitCreated).not.toHaveBeenCalled();
  });

  it("submits form and calls onHabitCreated on success", async () => {
    localStorage.setItem("token", "test-token");
    axios.post.mockResolvedValueOnce({ data: { id: 1, name: "Read" } });

    render(<HabitForm onHabitCreated={onHabitCreated} />);
    fireEvent.change(screen.getByPlaceholderText("Habit Name"), { target: { value: "Read" } });
    fireEvent.change(screen.getByPlaceholderText("Description (Optional)"), { target: { value: "Read a book" } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "weekly" } });
    fireEvent.click(screen.getByRole("button", { name: /add habit/i }));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:5000/api/habits",
      { name: "Read", frequency: "weekly", description: "Read a book" },
      { headers: { Authorization: "Bearer test-token" } }
    );
    expect(onHabitCreated).toHaveBeenCalled();

    expect(screen.getByPlaceholderText("Habit Name").value).toBe("Read");
    expect(screen.getByPlaceholderText("Description (Optional)").value).toBe("Read a book");
    expect(screen.getByRole("combobox").value).toBe("weekly");
  });

  it("shows backend error message if present", async () => {
    localStorage.setItem("token", "test-token");
    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Habit already exists" } }
    });

    render(<HabitForm onHabitCreated={onHabitCreated} />);
    fireEvent.change(screen.getByPlaceholderText("Habit Name"), { target: { value: "Read" } });
    fireEvent.click(screen.getByRole("button", { name: /add habit/i }));

    expect(await screen.findByText(/failed to add habit: habit already exists/i)).toBeInTheDocument();
    expect(onHabitCreated).not.toHaveBeenCalled();
  });

  it("shows generic error if backend error has no message", async () => {
    localStorage.setItem("token", "test-token");
    axios.post.mockRejectedValueOnce({});

    render(<HabitForm onHabitCreated={onHabitCreated} />);
    fireEvent.change(screen.getByPlaceholderText("Habit Name"), { target: { value: "Read" } });
    fireEvent.click(screen.getByRole("button", { name: /add habit/i }));

    expect(await screen.findByText(/failed to add habit\. please try again\./i)).toBeInTheDocument();
    expect(onHabitCreated).not.toHaveBeenCalled();
  });

  it("disables submit button while loading", async () => {
    localStorage.setItem("token", "test-token");
    let resolvePromise;
    axios.post.mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve; })
    );

    render(<HabitForm onHabitCreated={onHabitCreated} />);
    fireEvent.change(screen.getByPlaceholderText("Habit Name"), { target: { value: "Read" } });
    fireEvent.click(screen.getByRole("button", { name: /add habit/i }));

    expect(screen.getByRole("button", { name: /adding/i })).toBeDisabled();

    resolvePromise({ data: { id: 1, name: "Read" } });
    await waitFor(() => expect(onHabitCreated).toHaveBeenCalled());
  });
});