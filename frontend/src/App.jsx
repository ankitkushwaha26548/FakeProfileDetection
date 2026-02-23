import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import Dashboard from "./adminside/Dashboard";
import AdminLogin from "./adminside/ALogin";
import AdminUser from "./adminside/AUsers";
import FakeAccount from "./adminside/Fake";
import Reports from "./adminside/Reports";


import Login from "./userside/Login";
import RegisterPage from "./userside/Register";
import ProfilePage from "./userside/Profile";
import FeedSystem from "./userside/Feed";
import PostSystem from "./userside/Post";
import ActivityPage from "./userside/Activity";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/*Admin Routes*/}
        <Route path="/" element={<AdminProtectedRoute><Dashboard /></AdminProtectedRoute>} />
        <Route path="/admin/alogin" element={<AdminLogin />} />
        <Route path="/admin/users" element={<AdminProtectedRoute><AdminUser /></AdminProtectedRoute>} />
        <Route path="/admin/fake" element={<AdminProtectedRoute><FakeAccount /></AdminProtectedRoute>} />
        <Route path="/admin/reports" element={<AdminProtectedRoute><Reports /></AdminProtectedRoute>} />

        {/*User Routes*/}
        <Route path="/user/login" element={<Login />} />
        <Route path="/user/register" element={<RegisterPage />} />
        <Route path="/user/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/user/feed" element={<ProtectedRoute><FeedSystem /></ProtectedRoute>} />
        <Route path="/user/post" element={<ProtectedRoute><PostSystem /></ProtectedRoute>} />
        <Route path="/user/activity" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
