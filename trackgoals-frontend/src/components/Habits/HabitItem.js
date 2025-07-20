import React from "react";
import axios from "axios";

/**
 * A card representing a single habit with completion and delete actions.
 * @param {object} habit - The habit data object.
 * @param {function} onUpdated - Callback to refresh the habit list after changes.
 */
const HabitItem = ({ habit, onUpdated }) => {
  const token = localStorage.getItem("token");

  /**
   * Check if the habit has already been completed today.
   * @returns {boolean} True if completed today, false otherwise.
   */
  const isCompletedToday = () => {
    if (!habit.completedDates || habit.completedDates.length === 0) return false;

    const today = new Date();
    return habit.completedDates.some(dateString => {
      const date = new Date(dateString);
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    });
  };

  /**
   * Mark the habit as completed for today.
   */
  const markComplete = async () => {
    try {
      await axios.patch(
        `http://localhost:5000/api/habits/${habit._id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdated(); // Refresh the list
    } catch (err) {
      console.error("Error marking habit complete:", err);
      alert("Failed to mark habit as complete.");
    }
  };

  /**
   * Delete the habit after confirmation.
   */
  const deleteHabit = async () => {
    if (!window.confirm("Are you sure you want to delete this habit?")) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/habits/${habit._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpdated(); // Refresh the list
    } catch (err) {
      console.error("Error deleting habit:", err);
      alert("Failed to delete habit.");
    }
  };

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body d-flex flex-column">
        <h5
          className={`card-title fw-bold ${
            isCompletedToday() ? "text-success text-decoration-line-through" : ""
          }`}
        >
          {habit.name}
        </h5>

        {habit.description && (
          <p className="card-text text-muted mb-2">{habit.description}</p>
        )}

        <p className="card-text small text-secondary">
          Frequency: {habit.frequency}
        </p>

        <div className="mt-auto d-flex justify-content-between pt-3 border-top">
          <button
            onClick={markComplete}
            className={`btn btn-sm ${
              isCompletedToday() ? "btn-outline-success" : "btn-success"
            }`}
            disabled={isCompletedToday()}
          >
            {isCompletedToday() ? "Completed!" : "✓ Complete Today"}
          </button>

          <button
            onClick={deleteHabit}
            className="btn btn-sm btn-outline-danger"
          >
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitItem;
