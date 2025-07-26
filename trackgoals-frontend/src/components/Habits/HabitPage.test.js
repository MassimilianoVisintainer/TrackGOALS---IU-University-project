import { render, screen, fireEvent, act } from "@testing-library/react";
import HabitPage from "./HabitPage";

jest.mock("./HabitForm", () => (props) => (
  <div data-testid="habit-form" onClick={() => props.onHabitCreated()}>
    MockHabitForm
  </div>
));

jest.mock("./HabitList", () => {
  let localRenderCount = 0;
  return (props) => {
    localRenderCount++;
    return (
      <div data-testid="habit-list">
        MockHabitList render #{localRenderCount} — key {props.key || "none"}
        <button onClick={props.onUpdate}>Trigger onUpdate</button>
      </div>
    );
  };
});

describe("HabitPage", () => {
  it("renders HabitForm and HabitList", () => {
    render(<HabitPage />);
    expect(screen.getByTestId("habit-form")).toBeInTheDocument();
    expect(screen.getByTestId("habit-list")).toBeInTheDocument();
  });

  it("triggers refresh when HabitForm's onHabitCreated is clicked", async () => {
    render(<HabitPage />);
    const beforeText = screen.getByTestId("habit-list").textContent;

    await act(async () => {
      fireEvent.click(screen.getByTestId("habit-form"));
    });

    const afterText = screen.getByTestId("habit-list").textContent;
    expect(afterText).not.toBe(beforeText);
  });

  it("triggers refresh when HabitList's onUpdate is clicked", async () => {
    render(<HabitPage />);
    const beforeText = screen.getByTestId("habit-list").textContent;

    await act(async () => {
      fireEvent.click(screen.getByText("Trigger onUpdate"));
    });

    const afterText = screen.getByTestId("habit-list").textContent;
    expect(afterText).not.toBe(beforeText); 
  });
});
