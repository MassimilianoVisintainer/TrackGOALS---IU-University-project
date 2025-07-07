import { useState } from "react";
import axios from "axios";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/signup", { name, email, password });
      setMessage("Sign up successful! You can now log in.");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message); // Use specific error message if available
      } else {
        setMessage("Error signing up. Please try again.");
      }
      console.error("Signup error:", error); // Log more details for debugging
    }
  };

  return (
    // Added a container and utility classes for centering and vertical alignment
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 bg-white" style={{ maxWidth: '400px', width: '100%' }}> {/* Constrain max-width */}
        <h3 className="text-center mb-4 fw-bold">Create an Account</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 position-relative">
            {/* Make sure 'bi bi-person' and 'form-icon' classes are defined in your CSS if using Bootstrap Icons */}
            <i className="bi bi-person form-icon"></i>
            <input
              type="text"
              className="form-control"
              id="username"
              placeholder="Username"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-3 position-relative">
            <i className="bi bi-envelope form-icon"></i>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3 position-relative">
            <i className="bi bi-lock form-icon"></i>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Password"
              required
              minLength="6" // minLength attribute is good for basic client-side validation
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password" // Added for better UX
            />
          </div>
          <div className="d-grid mb-3">
            <button type="submit" className="btn btn-primary fw-semibold">
              Sign Up
            </button>
          </div>
          {message && (
            <p
              className={`text-center fw-semibold ${
                message.toLowerCase().includes("success") ? "text-success" : "text-danger"
              }`}
            >
              {message}
            </p>
          )}
          <p className="text-center small text-muted mb-0">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUp;