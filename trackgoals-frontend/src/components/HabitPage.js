import React, { useState } from "react";
import Header from "./common/Header"; // Assuming this handles your overall site header or is the logout button
import HabitForm from "./HabitForm";
import HabitList from "./HabitList";
import { useNavigate } from "react-router-dom"; // Import useNavigate

function HabitPage() {
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const fetchHabits = () => setRefresh((r) => !r);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="container min-vh-100 py-4"> {/* Bootstrap container for centering */}
      {/* Top section: Title and Logout button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0">Your Habits</h2>
        <button onClick={handleLogout} className="btn btn-outline-danger">Log out</button>
      </div>

      {/* Habit Form Section */}
      <div className="card p-4 mb-5 shadow-sm" style={{ maxWidth: '600px', margin: 'auto' }}>
        <h4 className="mb-4 text-center fw-bold">Add New Habit</h4>
        <HabitForm onHabitCreated={fetchHabits} />
      </div>

      {/* Habit List Section - will be a grid of cards */}
      <HabitList key={refresh} onUpdate={fetchHabits} />
    </div>
  );
}

export default HabitPage;