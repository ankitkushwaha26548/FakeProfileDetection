import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import * as authApi from '../api/authApi';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
      const { data } = await authApi.loginUser(formData);
      if (!data?.token) {
        setError('Invalid response from server');
        return;
      }
      localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/socialfeed', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      
       {/* Login Form */}
    <form 
        onSubmit={handleSubmit}
        className="max-w-96 w-full text-center border border-gray-300/60 rounded-2xl px-8 bg-white shadow-lg"
      >
    
        {/* Header */}
        <h1 className="text-gray-900 text-3xl mt-10 font-medium">Login</h1>
        <p className="text-gray-500 text-sm mt-2">Please sign in to continue</p>
     
        {/* Email Input */}
        <div className="flex items-center w-full mt-10 bg-white border border-gray-300/80 hover:border-purple-400/60 focus-within:border-purple-500 h-12 rounded-full overflow-hidden pl-6 gap-2 transition-colors">
          <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="#6B7280"/>
          </svg>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email id" 
            className="bg-transparent text-gray-700 placeholder-gray-500 outline-none text-sm w-full h-full pr-4" 
            required
          />                 
        </div>

        {/* Password Input */}
        <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 hover:border-purple-400/60 focus-within:border-purple-500 h-12 rounded-full overflow-hidden pl-6 gap-2 transition-colors">
          <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280"/>
          </svg>
          <input 
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password" 
            className="bg-transparent text-gray-700 placeholder-gray-500 outline-none text-sm w-full h-full" 
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="pr-4 text-gray-400 hover:text-purple-500 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>                 
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          className="mt-4 w-full h-11 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all"
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>

        {/* Sign Up Link */}
        <p className="text-gray-500 text-sm mt-3 mb-11">
          Don't have an account?{' '}
          <Link className="text-indigo-500 hover:text-purple-600 font-medium" to="/register">Sign up</Link>
        </p>
      </form>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}