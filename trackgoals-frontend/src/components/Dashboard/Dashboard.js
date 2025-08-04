import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Header from "../common/Header"; // Import the Header component
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { format } from "date-fns";

const Dashboard = () => {
  // Store dashboard data, loading, and error states
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Default date range = last 7 days
  const [startDate, setStartDate] = useState(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());

  // Get the stored JWT token from localStorage
  const token = localStorage.getItem("token");

  // Fetch dashboard data when token or date range changes
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        // Make authenticated request to the backend with selected date range
        const response = await axios.get("http://localhost:5000/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            startDate: format(startDate, "yyyy-MM-dd"),
            endDate: format(endDate, "yyyy-MM-dd"),
          },
        });
        setData(response.data); // Save returned data
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboard(); // Only fetch if token exists
    }
  }, [token, startDate, endDate]); // Re-run when token or date range changes

  // Loading and error handling
  if (loading) return <p>Loading dashboard...</p>;
  if (error || !data) return <p>Error loading dashboard. Please try again later.</p>;

  return (
    <div className="container mt-4">
      {/* Header + Date Range Pickers */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <h2 className="me-3">Your Progress Dashboard</h2>
        <div className="d-flex gap-3 align-items-center">
          {/* Start Date Picker */}
          <div>
            <label>From:</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={new Date()}
              className="form-control"
            />
          </div>
          {/* End Date Picker */}
          <div>
            <label>To:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              maxDate={new Date()}
              className="form-control"
            />
          </div>
        </div>
      </div>

      {/* Summary cards: Habits, Goals, Completions */}
      <div className="row">
        <div className="col-md-4">
          <div className="card p-3 mb-3">
            <h5>Total Habits</h5>
            <p className="fs-4">{data.totalHabits}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 mb-3">
            <h5>Total Goals</h5>
            <p className="fs-4">{data.totalGoals}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 mb-3">
            <h5>Habit Completions</h5>
            <p className="fs-4">{data.habitsCompletedInRange}</p>
          </div>
        </div>
      </div>

      {/* Habit completion chart */}
      <div className="card p-4 mt-4">
        <h5>Habit Completion Over Selected Range</h5>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.habitCompletionChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="completed" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Goal progress bars */}
      <div className="mt-4">
        <h5 className="mb-3">Goal Progress</h5>
        {data.goalsProgress.map((goal, index) => (
          <div key={index} className="mb-3">
            <strong>{goal.goalName}</strong>
            <div className="progress mt-1" style={{ height: "25px" }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${goal.progress}%` }}
              >
                {goal.progress}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    
  );
};

export default Dashboard;
