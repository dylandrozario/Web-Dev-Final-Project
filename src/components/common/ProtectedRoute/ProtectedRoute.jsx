import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  if (!user) {
    // Not logged in → kick them to sign-in
    return <Navigate to="/sign-in" replace />;
  }

  return children;
};

export default ProtectedRoute;
