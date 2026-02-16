import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./adminside/ALogin";
import AdminUser from "./adminside/AUsers";
import FakeAccount from "./adminside/Fake";
import Reports from "./adminside/Reports";


import Login from "./userside/Login";
import RegisterPage from "./userside/Register";
import ProfilePage from "./userside/Profile";
import FeedSystem from "./userside/Feed"; 
import PostSystem from "./userside/Post";


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/*Admin Routes*/}
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/alogin" element={<AdminLogin />} />
        <Route path="/admin/users" element={<AdminUser />} />
        <Route path="/admin/fake" element={<FakeAccount />} />
        <Route path="/admin/reports" element={<Reports />} />

        {/*User Routes*/}
        <Route path="/user/login" element={<Login />} />
        <Route path="/user/register" element={<RegisterPage />} />
        <Route path="/user/profile" element={<ProfilePage />} />
        <Route path="/user/feed" element={<FeedSystem />} />
        <Route path="/user/post" element={<PostSystem />} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default App;
