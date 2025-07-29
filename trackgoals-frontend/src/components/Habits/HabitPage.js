import React, { useState } from "react";
import HabitForm from "./HabitForm";
import HabitList from "./HabitList";
import Header from "../common/Header"; // Import the Header component

function HabitPage() {
  const [refresh, setRefresh] = useState(false);

  const fetchHabits = () => setRefresh((r) => !r);

  return (
    <> <Header /> {/* Full-width Header above all */}
      <div className="container min-vh-100 py-4">
        {/* Habit Form Section */}
        <div className="card p-4 mb-5 shadow-sm" style={{ maxWidth: '600px', margin: 'auto' }}>
          <h4 className="mb-4 text-center fw-bold">Add New Habit</h4>
          <HabitForm onHabitCreated={fetchHabits} />
        </div>

        {/* Habit List Section */}
        <HabitList key={refresh} onUpdate={fetchHabits} />
      </div>
    </>
  );
}

export default HabitPage;
