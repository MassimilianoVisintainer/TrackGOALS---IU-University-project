import React, { useEffect, useState } from "react";
import axios from "axios";
import HabitItem from "./HabitItem";

/**
 * Determines if a habit has been completed today.
 * This function checks if any of the dates in the `completedDates` array
 * match the current day (ignoring time).
 * @param {Array<string>} completedDates - An array of date strings when the habit was completed.
 * @returns {boolean} - True if the habit was completed today, false otherwise.
 */
const isCompletedToday = (completedDates) => {
  // If no completedDates array or it's empty, the habit hasn't been completed at all, so not today.
  if (!completedDates || completedDates.length === 0) return false;

  const today = new Date(); // Get the current date and time.
  // Iterate through each date string in the completedDates array.
  return completedDates.some(dateString => {
    const date = new Date(dateString); // Convert the date string from the habit data into a Date object.
    return (
      // Compare the day, month, and year of the completed date with today's date.
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  });
};

/**
 * HabitList Component: Displays a list of habits, categorized into "to do today" and "completed today".
 * It fetches habits from the backend and passes them to individual HabitItem components for rendering.
 * @param {object} props - Component props.
 * @param {function} props.onUpdate - Callback function to trigger a refresh of the habit list.
 */
const HabitList = ({ onUpdate }) => {

  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches the habits from the backend API.
   * It retrieves the authentication token from local storage and includes it in the request headers.
   */
  const fetchHabits = async () => {
    setLoading(true); 
    setError(null);   
    const token = localStorage.getItem("token"); // Get the JWT token from local storage.

    // If no token is found, log an error and stop.
    if (!token) {
      console.error("No authentication token found. Please log in.");
      setError("Authentication required. Please log in.");
      setLoading(false);
      return;
    }

    try {
      // Make a GET request to the habits API endpoint.
      const res = await axios.get("http://localhost:5000/api/habits", {
        headers: { Authorization: `Bearer ${token}` }, // Attach the token for authentication.
      });
      setHabits(res.data); // Update the habits state with the data received from the server.
    } catch (err) {
      console.error("Failed to fetch habits:", err); 
      setError("Failed to load habits. Please try again.");
    } finally {
      setLoading(false); 
    }
  };

  // useEffect hook to fetch habits when the component mounts or when 'onUpdate' changes.
  // The 'onUpdate' dependency allows the parent component (HabitPage) to trigger a re-fetch.
  useEffect(() => {
    fetchHabits(); 
  }, [onUpdate]);

  // Display a loading spinner while habits are being fetched.
  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Display an error message if fetching habits failed.
  if (error) {
    return <div className="alert alert-danger text-center mt-5">{error}</div>;
  }

  // Filter habits into two categories based on whether they were completed today.
  const incompleteHabits = habits.filter(h => !isCompletedToday(h.completedDates));
  const completedHabits = habits.filter(h => isCompletedToday(h.completedDates));

  return (
    <div className="container">
      <h3 className="mb-4 text-center fw-bold">Active Habits</h3> 
      {incompleteHabits.length === 0 ? (
        <div className="text-center text-muted mb-5">
          <p className="lead">All habits completed for today!</p> 
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-5"> 
          {incompleteHabits.map(habit => (
            <div className="col" key={habit._id}>
              <HabitItem habit={habit} onUpdated={fetchHabits} />
            </div>
          ))}
        </div>
      )}

      <h3 className="mb-4 text-center fw-bold mt-5">✅ Completed Today</h3>
      {completedHabits.length === 0 ? (
        <div className="text-center text-muted mb-5">
          <p className="lead">No habits completed yet today. Keep going!</p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {completedHabits.map(habit => (
            <div className="col" key={habit._id}>
              <HabitItem habit={habit} onUpdated={fetchHabits} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HabitList;