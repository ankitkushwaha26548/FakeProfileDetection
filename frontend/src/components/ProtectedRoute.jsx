import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import * as authApi from "../api/authApi";

const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState("loading"); 
  const token = localStorage.getItem("token");
 

  
  useEffect(() => {
    if (!token) {
      setStatus("forbidden");
      return;
    }
    authApi.getCurrentUser()
      .then((res) => {
        setStatus("authorized");
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setStatus("forbidden");
      });
  }, [token]);
  if (!token || status === "forbidden") {
    return <Navigate to="/login" replace />;
  }
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-indigo-400 font-mono">Verifying session...</p>
      </div>
    );
  }
  return children;
};

export default ProtectedRoute;