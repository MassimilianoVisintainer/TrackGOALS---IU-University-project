import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "./Dashboard";
jest.mock("axios", () => ({
  post: jest.fn(),
  post: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

// Mock ResizeObserver for recharts and other libs
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("Dashboard Component", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  const mockData = {
    data: {
      totalHabits: 4,
      totalGoals: 2,
      habitsCompletedInRange: 5,
      habitCompletionChartData: [
        { date: "2025-07-13", completed: 1 },
        { date: "2025-07-14", completed: 2 },
      ],
      goalsProgress: [
        { goalName: "Study React", progress: 40, completed: false },
        { goalName: "Finish Project", progress: 80, completed: true },
      ],
    },
  };

  test("renders dashboard data correctly", async () => {
    const axios = require("axios");
    axios.get = jest.fn().mockResolvedValue(mockData); // Mock the axios get request
    localStorage.setItem("token", "fake-jwt-token"); // Set a fake token to simulate authentication
    render(<Dashboard />);

    expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/your progress dashboard/i)).toBeInTheDocument();
    });

    expect(screen.getByText("4")).toBeInTheDocument(); // totalHabits
    expect(screen.getByText("2")).toBeInTheDocument(); // totalGoals
    expect(screen.getByText("5")).toBeInTheDocument(); // completions
    expect(screen.getByText("Study React")).toBeInTheDocument();
    expect(screen.getByText("Finish Project")).toBeInTheDocument();
  });

  test("handles fetch failure", async () => {
    const axios = require("axios");
    axios.get.mockRejectedValueOnce(new Error("API Error"));

    localStorage.setItem("token", "fake-jwt-token"); // ✅ Needed to trigger the API call

    render(<Dashboard />);

    await waitFor(() => {
      expect(
        screen.getByText((content) =>
          content.toLowerCase().includes("error loading dashboard")
        )
      ).toBeInTheDocument();
    });
  });
});
