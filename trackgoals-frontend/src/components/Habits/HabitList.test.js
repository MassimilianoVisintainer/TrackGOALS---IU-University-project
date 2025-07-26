import { render, screen, waitFor } from "@testing-library/react";
import HabitList from "./HabitList";

jest.mock("axios", () => ({
  get: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

beforeAll(() => {
  window.alert = jest.fn();
  window.confirm = jest.fn();

  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.getItem.mockReturnValue("test-token"); // <-- always set token before each test
});
describe("HabitList", () => {
  const axios = require("axios");

  const todayISO = new Date().toISOString();
  const habitsMock = [
    {
      _id: "1",
      name: "Drink Water",
      description: "Drink 2L of water",
      frequency: "daily",
      completedDates: [],
    },
    {
      _id: "2",
      name: "Meditate",
      description: "Morning meditation",
      frequency: "daily",
      completedDates: [todayISO],
    },
  ];

  it("displays loading spinner initially", async () => {
    axios.get.mockResolvedValue({ data: [] });

    render(<HabitList onUpdate={jest.fn()} />);
    expect(screen.getByRole("status")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  it("displays error message when fetch fails", async () => {
    axios.get.mockRejectedValue(new Error("Network error"));

    render(<HabitList onUpdate={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load habits/i)).toBeInTheDocument();
    });
  });

  it("displays incomplete and completed habits correctly", async () => {
    axios.get.mockResolvedValue({ data: habitsMock });

    render(<HabitList onUpdate={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Drink Water")).toBeInTheDocument();
      expect(screen.getByText("Meditate")).toBeInTheDocument();
      expect(screen.getByText(/✅ Completed Today/)).toBeInTheDocument();
    });
  });

  it("displays message when all habits are completed", async () => {
    const allDone = habitsMock.map(h => ({ ...h, completedDates: [todayISO] }));
    axios.get.mockResolvedValue({ data: allDone });

    render(<HabitList onUpdate={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/All habits completed for today/i)).toBeInTheDocument();
      expect(screen.getByText("Drink Water")).toBeInTheDocument();
      expect(screen.getByText("Meditate")).toBeInTheDocument();
    });
  });

  it("displays message when no habits completed today", async () => {
    const noneDone = habitsMock.map(h => ({ ...h, completedDates: [] }));
    axios.get.mockResolvedValue({ data: noneDone });

    render(<HabitList onUpdate={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/No habits completed yet today/i)).toBeInTheDocument();
    });
  });

  it("displays auth error if no token found", async () => {
    window.localStorage.getItem.mockReturnValueOnce(null);

    render(<HabitList onUpdate={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Authentication required/i)).toBeInTheDocument();
    });
  });

  it("calls axios.get with Authorization header", async () => {
    axios.get.mockResolvedValue({ data: [] });

    render(<HabitList onUpdate={jest.fn()} />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/habits"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining("Bearer"),
          }),
        })
      );
    });
  });
});
