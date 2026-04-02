import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import RegisterPage from "./pages/Register";
import LandingPage from "./pages/LandingPage";

// Admin imports
import AdminDashboard from "./adminside/AdminDashboard";
import BehaviorAnalysis from "./adminside/BehaviorAnalysis";
import IPMonitoring from "./adminside/IPMonitoring";
import RiskScoring from "./adminside/RiskScoring";

import ProfilePage from "./userside/Profile";
import FeedSystem from "./userside/SocialFeed";
import PostSystem from "./userside/Post";
import ActivityPage from "./userside/Activity";

function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user?.id) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/socialfeed" replace />;
  return children;
}

const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/behavior"
        element={
          <AdminRoute>
            <BehaviorAnalysis />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/ip-monitoring"
        element={
          <AdminRoute>
            <IPMonitoring />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/risk"
        element={
          <AdminRoute>
            <RiskScoring />
          </AdminRoute>
        }
      />

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* User Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/socialfeed"
        element={
          <ProtectedRoute>
            <FeedSystem />
          </ProtectedRoute>
        }
      />
      <Route
        path="/post"
        element={
          <ProtectedRoute>
            <PostSystem />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activity"
        element={
          <ProtectedRoute>
            <ActivityPage />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<LandingPage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
