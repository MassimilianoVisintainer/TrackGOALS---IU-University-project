import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import SignUp from "./components/SignUp/SignUp";
import Login from "./components/Login/Login";
import HabitPage from "./components/Habits/HabitPage";
import PrivateRoute from "./components/common/PrivateRoute";
import GoalsPage from "./components/Goals/GoalsPage";
import Dashboard from "./components/Dashboard/Dashboard";
import ProtectedLayout from "./components/common/ProtectedLayout";

/**
 * The main App component that sets up the routing for the application.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<Login />} />

        {/* Protected routes wrapped with header */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/habits"
          element={
            <PrivateRoute>
              <ProtectedLayout>
                <HabitPage />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <PrivateRoute>
              <ProtectedLayout>
                <GoalsPage />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
