import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/**
 * Login functional component.
 * This component handles user authentication by providing a login form.
 */
function Login() {
  // State variables to manage form input, messages, and loading status.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();  // Hook to get the navigate function, allowing redirection to different routes.
  
  // useEffect hook to check for existing authentication token on component mount.
  // If a token is found, it means the user is already logged in, so they are redirected to the "/habits" page.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/habits");
    }
  }, [navigate]);


    /**
   * Handles the form submission for login.
   * Prevents default form submission behavior, performs client-side validation,
   * makes an API call to log in the user, and handles success/error responses.
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the default form submission (which would cause a page reload).

    // Client-side validation for password length.
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true); // Sets loading state to true,  to disable the submit button and show a loading indicator.

    try {
      // Makes a POST request to the login API endpoint with email and password.
      const response = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });
      const { token } = response.data; // Extracts the authentication token from the successful response.
      localStorage.setItem("token", token); // Stores the received token in local storage for future authentication requests.
      // Display a successful message and navigate to the habits page
      setMessage("Login successful!");
      navigate("/habits");
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div
        className="card p-4 bg-white"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h3 className="text-center mb-4 fw-bold">Login</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 position-relative">
            <input
              type="email"
              className="form-control"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3 position-relative">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="d-grid mb-3">
            <button
              type="submit"
              className="btn btn-primary fw-semibold"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
          {message && (
            <p
              className={`text-center fw-semibold ${
                message.toLowerCase().includes("success")
                  ? "text-success"
                  : "text-danger"
              }`}
            >
              {message}
            </p>
          )}
          <p className="text-center small text-muted mb-0">
            You do not have an account? <a href="/signup">Register</a>
          </p>
          <div className="mt-3 p-2 bg-light border rounded text-center small text-muted">
            <p className="mb-1 fw-bold">Test Credentials:</p>
            <p className="mb-0">Email: `test@test.com`</p>
            <p className="mb-0">Password: `123456`</p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
