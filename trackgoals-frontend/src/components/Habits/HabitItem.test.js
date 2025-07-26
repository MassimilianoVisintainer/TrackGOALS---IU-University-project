import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HabitItem from "./HabitItem";

jest.mock("axios", () => ({
  patch: jest.fn(),
  delete: jest.fn(),
}));

beforeAll(() => {
  window.confirm = jest.fn();
  window.alert = jest.fn();

  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: jest.fn(() => "test-token"),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("HabitItem", () => {
  const baseHabit = {
    _id: "abc123",
    name: "Read",
    description: "Read a book",
    frequency: "daily",
    completedDates: [],
  };

  it("renders habit details", () => {
    render(<HabitItem habit={baseHabit} onUpdated={jest.fn()} />);
    expect(screen.getByText("Read")).toBeInTheDocument();
    expect(screen.getByText("Read a book")).toBeInTheDocument();
    expect(screen.getByText(/daily/i)).toBeInTheDocument();
  });

  it("calls onUpdated after marking complete", async () => {
    const axios = require("axios");
    axios.patch.mockResolvedValue({});
    const onUpdated = jest.fn();
    render(<HabitItem habit={baseHabit} onUpdated={onUpdated} />);
    fireEvent.click(screen.getByRole("button", { name: /complete/i }));
    await waitFor(() => expect(axios.patch).toHaveBeenCalled());
    expect(onUpdated).toHaveBeenCalled();
  });

  it("shows alert if marking complete fails", async () => {
    const axios = require("axios");
    axios.patch.mockRejectedValue(new Error("fail"));
    render(<HabitItem habit={baseHabit} onUpdated={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /complete/i }));
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("Failed to mark habit as complete.")
    );
  });

  it("calls onUpdated after delete confirmed", async () => {
    const axios = require("axios");
    axios.delete.mockResolvedValue({});
    window.confirm.mockReturnValue(true);
    const onUpdated = jest.fn();
    render(<HabitItem habit={baseHabit} onUpdated={onUpdated} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    await waitFor(() => expect(axios.delete).toHaveBeenCalled());
    expect(onUpdated).toHaveBeenCalled();
  });

  it("does not call delete if confirm is false", () => {
    window.confirm.mockReturnValue(false);
    const axios = require("axios");
    const onUpdated = jest.fn();
    render(<HabitItem habit={baseHabit} onUpdated={onUpdated} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(axios.delete).not.toHaveBeenCalled();
    expect(onUpdated).not.toHaveBeenCalled();
  });

  it("shows alert if delete fails", async () => {
    const axios = require("axios");
    axios.delete.mockRejectedValue(new Error("fail"));
    window.confirm.mockReturnValue(true);
    render(<HabitItem habit={baseHabit} onUpdated={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("Failed to delete habit.")
    );
  });

  it("shows completed state if already completed today", () => {
    const todayStr = new Date().toISOString();
    const completedHabit = { ...baseHabit, completedDates: [todayStr] };
    render(<HabitItem habit={completedHabit} onUpdated={jest.fn()} />);
    expect(screen.getByText(/completed!/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /completed!/i })).toBeDisabled();
  });

  it("calls axios.patch with correct headers", async () => {
    const axios = require("axios");
    axios.patch.mockResolvedValue({});
    const onUpdated = jest.fn();
    render(<HabitItem habit={baseHabit} onUpdated={onUpdated} />);
    fireEvent.click(screen.getByRole("button", { name: /complete/i }));
    await waitFor(() =>
      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining(baseHabit._id),
        {},
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining("Bearer"),
          }),
        })
      )
    );
  });

  it("calls axios.delete with correct headers", async () => {
    const axios = require("axios");
    axios.delete.mockResolvedValue({});
    window.confirm.mockReturnValue(true);
    const onUpdated = jest.fn();
    render(<HabitItem habit={baseHabit} onUpdated={onUpdated} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    await waitFor(() =>
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining(baseHabit._id),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining("Bearer"),
          }),
        })
      )
    );
  });

  it("does not render description if not provided", () => {
    const habitNoDesc = { ...baseHabit, description: "" };
    render(<HabitItem habit={habitNoDesc} onUpdated={jest.fn()} />);
    expect(screen.queryByText("Read a book")).not.toBeInTheDocument();
  });

  it("renders frequency text", () => {
    render(<HabitItem habit={baseHabit} onUpdated={jest.fn()} />);
    expect(screen.getByText(/frequency:/i)).toBeInTheDocument();
  });
});
