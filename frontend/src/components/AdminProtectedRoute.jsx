import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import * as authApi from "../api/authApi";

const AdminProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState("loading"); // loading | admin | forbidden
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setStatus("forbidden");
      return;
    }
    authApi
      .getCurrentUser()
      .then((res) => {
        setStatus(res.data?.role === "admin" ? "admin" : "forbidden");
      })
      .catch(() => setStatus("forbidden"));
  }, [token]);

  if (!token || status === "forbidden") {
    return <Navigate to="/login" replace />;
  }
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-indigo-400 font-mono">Verifying access...</p>
      </div>
    );
  }
  return children;
};

export default AdminProtectedRoute;
