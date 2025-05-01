import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./components/Authcontext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const { employee, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const AdminOnlyRoute = ({ children, requireAdmin }) => {
    if (!employee) return <Navigate to="/" />;
    if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" />;
    return children;
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          employee ? (
            <Navigate to={isAdmin ? "/admin/requests" : "/dashboard"} />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <AdminOnlyRoute>
            <Dashboard />
          </AdminOnlyRoute>
        }
      />
      {/* TODO: RE DO ADMIN ROUTES; I THINK THEY MIGHT NEED CHANGES*/}
      <Route
        path="/admin/*"
        element={
          <AdminOnlyRoute requireAdmin>
            <Routes>
              <Route path="requests" element={<AdminDashboard />} />
            </Routes>
          </AdminOnlyRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate to={employee ? "/dashboard" : "/"} />}
      />
    </Routes>
  );
}

export default App;
