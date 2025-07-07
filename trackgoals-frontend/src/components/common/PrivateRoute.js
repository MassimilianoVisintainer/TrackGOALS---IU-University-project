import { Navigate } from "react-router-dom";

/**
 * PrivateRoute functional component.
 * This component acts as a guard for routes that require user authentication.
 * It checks if a user is logged in (by looking for an authentication token).
 * If the user is authenticated, it renders its children (the protected content).
 * Otherwise, it redirects the user to the login page.
 *
 * @param {object} props - The component's props.
 * @param {React.ReactNode} props.children - The child components that PrivateRoute wraps.
 * These are the components that should only be accessible to logged-in users.
 */
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token"); // Look for an existing token

  if (!token) {
    // If the token does not exist and then the user is not logged, redirect them to the login page
    return <Navigate to="/login" />;
  }

  // If User is logged in, the access is allowed and it renders its children (the protected content).
  return children;
}

export default PrivateRoute;
