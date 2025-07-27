import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GoalsPage from "./GoalsPage";

jest.mock("axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
}));

const axios = require("axios");

beforeEach(() => {
  jest.spyOn(window.localStorage.__proto__, "getItem").mockImplementation((key) => {
    if (key === "token") return "mock-token";
    return null;
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("GoalsPage", () => {
  const mockGoals = [
    {
      _id: "1",
      title: "Goal 1",
      description: "Test goal",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000).toISOString(), // future
      completed: false,
    },
  ];

  it("fetches and displays goals", async () => {
    axios.get.mockResolvedValueOnce({ data: mockGoals });

    render(<GoalsPage />);

    expect(axios.get).toHaveBeenCalledWith("http://localhost:5000/api/goals", {
      headers: { Authorization: "Bearer mock-token" },
    });

    await waitFor(() => {
      expect(screen.getByText("Goal 1")).toBeInTheDocument();
    });
  });

  it("validates form before submission", async () => {
    render(<GoalsPage />);

    const button = screen.getByRole("button", { name: /add goal/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Title, start date, and end date are required.")).toBeInTheDocument();
    });
  });

  it("handles edit and cancel", async () => {
    axios.get.mockResolvedValue({ data: mockGoals });

    render(<GoalsPage />);

    await waitFor(() => {
      expect(screen.getByText("Goal 1")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    expect(screen.getByDisplayValue("Goal 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
  });

  it("deletes a goal after confirmation", async () => {
  axios.get
    .mockResolvedValueOnce({ data: mockGoals }) // initial fetch
    .mockResolvedValueOnce({ data: [] });       // after deletion

  axios.delete.mockResolvedValue({});

  window.confirm = jest.fn(() => true); // confirm delete

  render(<GoalsPage />);

  await waitFor(() => {
    expect(screen.getByText("Goal 1")).toBeInTheDocument();
  });

  fireEvent.click(screen.getByRole("button", { name: /delete/i }));

  await waitFor(() => {
    expect(axios.delete).toHaveBeenCalledWith(
      "http://localhost:5000/api/goals/1",
      expect.any(Object)
    );
  });
});


 it("marks a goal as completed", async () => {
  axios.get
    .mockResolvedValueOnce({ data: mockGoals }) // initial fetch
    .mockResolvedValueOnce({ data: [] });       // after marking complete

  axios.patch.mockResolvedValue({});

  render(<GoalsPage />);

  await waitFor(() => {
    expect(screen.getByText("Goal 1")).toBeInTheDocument();
  });

  fireEvent.click(screen.getByRole("button", { name: /done/i }));

  await waitFor(() => {
    expect(axios.patch).toHaveBeenCalledWith(
      "http://localhost:5000/api/goals/1/complete",
      null,
      expect.any(Object)
    );
  });
});

});
