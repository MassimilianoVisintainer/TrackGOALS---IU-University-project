import "bootstrap/dist/css/bootstrap.min.css"; 
import SignUp from "./components/SignUp"; 
import Login from "./components/Login"; 
import { BrowserRouter, Routes, Route } from "react-router-dom"; 
import HabitPage from "./components/HabitPage"; 
import PrivateRoute from "./components/common/PrivateRoute"; 

/**
 * The main App component that sets up the routing for the application.
 * It uses React Router DOM to define different paths and the components
 * that should be rendered for each path.
 */
function App() {
  return (
    // BrowserRouter makes the application's URL in sync with the UI.
    <BrowserRouter>
      {/* Routes is a container that holds all the individual Route components.
          It ensures that only one Route's element is rendered at a time based on the URL. */}
      <Routes>
        {/* Route for the register page ("/") */}
        <Route path="/" element={<SignUp />}></Route>

        {/* Route for the login page ("/login") */}
        <Route path="/login" element={<Login />}></Route>

        {/* Route for the habits page ("/habits") */}
        <Route
          path="/habits"
          element={
            // PrivateRoute acts as a wrapper. It will check for user authentication.
            // If the user is authenticated, it will render its children (HabitPage).
            // If not, it will redirect the user to a login page
            <PrivateRoute>
              <HabitPage /> 
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;