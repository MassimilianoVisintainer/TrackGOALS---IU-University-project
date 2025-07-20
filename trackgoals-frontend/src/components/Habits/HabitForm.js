import React, { useState } from "react";
import axios from "axios";

/**
 * HabitForm Component: A form for users to create and add new habits.
 * It handles input state, form submission, and displays loading/error messages.
 * @param {object} props - Component props.
 * @param {function} props.onHabitCreated - Callback function to be called after a habit is successfully created,
 * typically used to trigger a refresh of the habit list.
 */
const HabitForm = ({ onHabitCreated }) => {
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handles the form submission event.
   * Prevents default form behavior, sets loading state, performs validation,
   * sends a POST request to the backend, and handles success or error.
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior (page reload).
    setLoading(true);   // Set loading to true to indicate submission is in progress.
    setError(null);     // Clear any previous error messages.

    // Basic validation: Check if the habit name is empty or just whitespace.
    if (!name.trim()) {
      setError("Habit Name is required."); // Set an error message.
      setLoading(false);                   // Stop loading.
      return;                              // Stop the function execution.
    }

    // Retrieve the authentication token from local storage.
    const token = localStorage.getItem("token");

    // If no token is found, log an error, display an alert, and stop.
    if (!token) {
        console.error("No authentication token found. Please log in.");
        setError("Authentication error: Please log in again.");
        setLoading(false);
        return;
    }

    try {
      // Send a POST request to the backend API to create a new habit.
      const response = await axios.post(
        "http://localhost:5000/api/habits", // API endpoint for creating habits.
        { name, frequency, description },    // Request body containing habit data.
        {
          headers: { Authorization: `Bearer ${token}` }, // Include JWT token for authentication.
        }
      );
      console.log("Habit created successfully:", response.data); 

      // Clear the form fields after successful submission.
      setName("");
      setFrequency("daily");
      setDescription("");
      onHabitCreated(); // Call the callback to signal the parent component to refresh the habit list.
    } catch (err) {
      console.error("Error creating habit:", err); 
      // Display a user-friendly error message. Check for specific backend messages if available.
      if (err.response && err.response.data && err.response.data.message) {
          setError(`Failed to add habit: ${err.response.data.message}`);
      } else {
          setError("Failed to add habit. Please try again.");
      }
    } finally {
      setLoading(false); // Always set loading to false when the request is complete (success or failure).
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Bootstrap grid row with gutter spacing for form elements */}
      <div className="row g-3">
        {/* Column for Habit Name input, takes half width on medium screens and up */}
        <div className="col-md-6">
          <input
            type="text"
            className="form-control" // Bootstrap class for form input styling.
            placeholder="Habit Name"
            value={name}
            onChange={(e) => setName(e.target.value)} // Update 'name' state on input change.
            required // HTML5 validation: makes this field mandatory.
          />
        </div>
        {/* Column for Description input, takes half width on medium screens and up */}
        <div className="col-md-6">
          <input
            type="text"
            className="form-control" // Bootstrap class for form input styling.
            placeholder="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)} // Update 'description' state on input change.
          />
        </div>
        {/* Column for Frequency select dropdown, takes full width on all screen sizes */}
        <div className="col-12">
          <select
            className="form-select" // Bootstrap class for select styling.
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)} // Update 'frequency' state on selection change.
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            {/* Add more frequency options here if needed */}
          </select>
        </div>
        {/* Column for the submit button, takes full width and uses d-grid for block-level button */}
        <div className="col-12 d-grid">
          <button
            type="submit"
            className="btn btn-primary fw-semibold" // Bootstrap primary button with bold font weight.
            disabled={loading} // Disable the button while the form is submitting.
          >
            {/* Display "Adding..." text while loading, otherwise "Add Habit". */}
            {loading ? "Adding..." : "Add Habit"}
          </button>
        </div>
      </div>
      {/* Display an alert message if there's an error, styled with Bootstrap. */}
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </form>
  );
};

export default HabitForm;