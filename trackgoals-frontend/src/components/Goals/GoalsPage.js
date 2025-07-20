import React, { useEffect, useState } from "react";
import axios from "axios";

// Main GoalsPage component
function GoalsPage() {
  // State hooks for managing goals, form input, editing state, and error messages
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [editId, setEditId] = useState(null); // Tracks which goal is being edited (if any)
  const [error, setError] = useState(""); // Stores form validation error

  // Get JWT token from local storage to authenticate API requests
  const token = localStorage.getItem("token");

  // Headers for API calls including Authorization token
  const headers = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Fetch goals from the server when the component mounts
  useEffect(() => {
    fetchGoals();
  }, []);

  // Fetches goals from the backend API
  const fetchGoals = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/goals", headers);
      setGoals(res.data); // Update state with received goals
    } catch (err) {
      console.error("Error fetching goals:", err.response?.data || err.message);
    }
  };

  // Handles form submission for creating or updating a goal
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { title, startDate, endDate } = form;

    // Basic form validation
    if (!title || !startDate || !endDate) {
      setError("Title, start date, and end date are required.");
      return;
    }

    try {
      if (editId) {
        // Update existing goal
        await axios.put(
          `http://localhost:5000/api/goals/${editId}`,
          form,
          headers
        );
      } else {
        // Create a new goal
        await axios.post("http://localhost:5000/api/goals", form, headers);
      }
      // Reset form and editing state, then refresh goals
      setForm({ title: "", description: "", startDate: "", endDate: "" });
      setEditId(null);
      fetchGoals();
    } catch (err) {
      console.error("Error saving goal:", err.response?.data || err.message);
    }
  };

  // Fills form with goal data for editing
  const handleEdit = (goal) => {
    setForm({
      title: goal.title,
      description: goal.description,
      startDate: goal.startDate.slice(0, 10), // Format to yyyy-mm-dd
      endDate: goal.endDate.slice(0, 10),
    });
    setEditId(goal._id); // Mark which goal is being edited
  };

  // Deletes a goal after confirmation
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/goals/${id}`, headers);
      fetchGoals();
    } catch (err) {
      console.error("Error deleting goal:", err.response?.data || err.message);
    }
  };

  // Marks a goal as completed
  const handleComplete = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/goals/${id}/complete`,
        null,
        headers
      );
      fetchGoals();
    } catch (err) {
      console.error(
        "Error completing goal:",
        err.response?.data || err.message
      );
    }
  };

  // Cancels the edit action and resets the form
  const handleCancel = () => {
    setForm({ title: "", description: "", startDate: "", endDate: "" });
    setEditId(null);
    setError("");
  };

  // Classify goals into categories
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeGoals = goals.filter(
    (g) => !g.completed && new Date(g.endDate) >= today
  );
  const expiredGoals = goals.filter(
    (g) => !g.completed && new Date(g.endDate) < today
  );
  const completedGoals = goals.filter((g) => g.completed);

  // Render the UI
  return (
    <div className="container mt-4">
      <h2>{editId ? "Edit Goal" : "Create a Goal"}</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          className="form-control my-2"
          type="text"
          placeholder="Goal Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          className="form-control my-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        ></textarea>
        <input
          className="form-control my-2"
          type="date"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
        />
        <input
          className="form-control my-2"
          type="date"
          value={form.endDate}
          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
        />
        <div className="d-flex gap-2">
          <button className="btn btn-primary" type="submit">
            {editId ? "Update Goal" : "Add Goal"}
          </button>
          {editId && (
            <button
              className="btn btn-secondary"
              type="button"
              onClick={handleCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <hr />
      <h3>Active Goals</h3>
      <GoalList
        goals={activeGoals}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onComplete={handleComplete}
      />

      <h3 className="mt-4">Expired Goals</h3>
      <GoalList goals={expiredGoals} onDelete={handleDelete} />

      <h3 className="mt-4">Completed Goals</h3>
      <GoalList goals={completedGoals} showStatusOnly />
    </div>
  );
}

// Component for displaying a list of goals
function GoalList({
  goals,
  onEdit,
  onDelete,
  onComplete,
  showStatusOnly = false,
}) {
  if (goals.length === 0) return <p className="text-muted">None</p>;

  return (
    <ul className="list-group">
      {goals.map((goal) => (
        <li
          key={goal._id}
          className="list-group-item d-flex justify-content-between align-items-start flex-column flex-md-row"
        >
          <div>
            <strong>{goal.title}</strong>
            <br />
            {goal.description && <small>{goal.description}</small>}
            <br />
            <span className="text-muted">
              {new Date(goal.startDate).toLocaleDateString()} →{" "}
              {new Date(goal.endDate).toLocaleDateString()}
            </span>
          </div>

          {/* Only show buttons if not in "view-only" mode */}
          {!showStatusOnly && (
            <div className="btn-group mt-2 mt-md-0">
              <button
                className="btn btn-sm btn-outline-success"
                onClick={() => onComplete(goal._id)}
              >
                ✓ Done
              </button>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => onEdit(goal)}
              >
                Edit
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => onDelete(goal._id)}
              >
                Delete
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default GoalsPage;
