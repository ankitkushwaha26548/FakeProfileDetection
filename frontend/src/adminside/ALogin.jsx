import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Shield, Lock, Mail, AlertTriangle } from "lucide-react";
import * as authApi from "../api/authApi";

function AdminLogin() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await authApi.loginUser({
        email: formData.email,
        password: formData.password,
      });

      if (data.user?.role !== "admin") {
        setError("Admin access only.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-gray-900 to-black px-4">

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -z-10"></div>

      {/* Card */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-xl bg-indigo-600 shadow-lg">
            <Shield className="text-white w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold text-white mt-4">
            Admin Portal
          </h1>

          <p className="text-gray-400 text-sm">
            Secure system access
          </p>
        </div>

        {/* Alert */}
        <div className="flex items-center gap-2 text-amber-400 text-xs mb-6 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          <AlertTriangle size={16} />
          Authorized personnel only
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label className="text-gray-300 text-sm mb-1 block">
              Email
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400 w-5" />

              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                className="w-full pl-10 py-3 bg-black/40 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-300 text-sm mb-1 block">
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 w-5" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-black/40 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 transition rounded-lg text-white font-semibold shadow-lg disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Login as Admin"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          FakeDetect AI Security System
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;