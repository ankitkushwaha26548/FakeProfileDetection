import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, Lock, Mail, AlertTriangle, Terminal } from 'lucide-react';
import * as authApi from '../api/authApi';

function AdminLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    securityCode: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.loginUser({ email: formData.email, password: formData.password });
      if (data.user?.role !== 'admin') {
        setError('Admin access only. Use admin credentials.');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>

      {/* Scan Lines Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="h-full w-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
        }}></div>
      </div>

      {/* Login Container */}
      <div className="relative z-10 w-full max-w-md">
        
        {/* Security Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-2xl shadow-indigo-500/50 animate-pulse">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            ADMIN PORTAL
          </h1>
          <p className="text-indigo-400 text-sm font-mono flex items-center justify-center gap-2">
            <Terminal className="w-4 h-4" />
            Security Monitoring System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl shadow-indigo-900/50 overflow-hidden">
          
          {/* Alert Banner */}
          <div className="bg-linear-to-r from-red-900/50 to-orange-900/50 border-b border-red-500/30 px-6 py-3">
            <div className="flex items-center gap-2 text-red-300 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-mono">RESTRICTED ACCESS - AUTHORIZED PERSONNEL ONLY</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300 font-mono uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@system.sec"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-indigo-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                />
                <div className="absolute inset-0 bg-indigo-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300 font-mono uppercase tracking-wider">
                Master Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-800/50 border border-indigo-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <div className="absolute inset-0 bg-indigo-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            {/* Security Code (optional for demo) */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300 font-mono uppercase tracking-wider">
                2FA Security Code (optional)
              </label>
              <div className="relative group">
                <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                <input
                  type="text"
                  name="securityCode"
                  value={formData.securityCode}
                  onChange={handleChange}
                  placeholder="000000"
                  maxLength="6"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-indigo-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono tracking-widest text-center"
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <Shield className="w-5 h-5" />
              {loading ? 'Verifying...' : 'Access Admin Panel'}
            </button>

            {/* Security Info */}
            <div className="pt-4 border-t border-gray-800">
              <div className="flex items-start gap-2 text-xs text-gray-500">
                <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="font-mono">
                  This system is protected by advanced encryption and monitoring. 
                  All access attempts are logged and analyzed.
                </p>
              </div>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-400 font-mono">System</span>
                </div>
                <p className="text-xs font-bold text-green-400 font-mono">ONLINE</p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-400 font-mono">Database</span>
                </div>
                <p className="text-xs font-bold text-blue-400 font-mono">ACTIVE</p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-400 font-mono">AI Engine</span>
                </div>
                <p className="text-xs font-bold text-purple-400 font-mono">READY</p>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-xs font-mono">
            © 2024 FakeDetect AI Security System • v2.5.1
          </p>
        </div>
      </div>

    </div>
  );
}

export default AdminLogin