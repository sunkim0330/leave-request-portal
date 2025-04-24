import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./components/Authcontext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
function App() {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />}
      />
      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? "/dashboard" : "/"} />}
      />
    </Routes>
  );
}

export default App;
