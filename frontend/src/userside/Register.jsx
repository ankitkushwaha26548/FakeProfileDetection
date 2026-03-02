import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import * as authApi from '../api/authApi';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      if (!data?.token) {
        setError('Invalid response from server');
        return;
      }
      localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/feed', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      
      <form 
        onSubmit={handleSubmit}
        className="max-w-96 w-full text-center border border-gray-300/60 rounded-2xl px-8 bg-white shadow-lg"
      >
        {/* Header */}
        <h1 className="text-gray-900 text-3xl mt-10 font-medium">Sign Up</h1>
        <p className="text-gray-500 text-sm mt-2">Create your account to continue</p>

        {/* Name Input */}
        <div className="flex items-center w-full mt-10 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2 focus-within:border-indigo-400 transition-colors">
          <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 8c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#6B7280"/>
          </svg>
          <input 
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name" 
            className="bg-transparent text-gray-500 placeholder-gray-500 outline-none text-sm w-full h-full pr-4" 
            required
          />                 
        </div>

        {/* Email Input */}
        <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2 focus-within:border-indigo-400 transition-colors">
          <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="#6B7280"/>
          </svg>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email id" 
            className="bg-transparent text-gray-500 placeholder-gray-500 outline-none text-sm w-full h-full pr-4" 
            required
          />                 
        </div>

        {/* Password Input */}
        <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2 focus-within:border-indigo-400 transition-colors">
          <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280"/>
          </svg>
          <input 
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password" 
            className="bg-transparent text-gray-500 placeholder-gray-500 outline-none text-sm w-full h-full" 
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="pr-4 text-gray-400 hover:text-indigo-500 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>                 
        </div>

        {/* Confirm Password Input */}
        <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2 focus-within:border-indigo-400 transition-colors">
          <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280"/>
          </svg>
          <input 
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password" 
            className="bg-transparent text-gray-500 placeholder-gray-500 outline-none text-sm w-full h-full" 
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="pr-4 text-gray-400 hover:text-indigo-500 transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>                 
        </div>

        {/* Password Match Warning */}
        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
          <p className="text-red-500 text-xs mt-2 text-left pl-6">Passwords don't match</p>
        )}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {/* Terms & Conditions */}
        <div className="mt-5 text-left">
          <label className="flex items-start gap-2 text-xs text-gray-500 cursor-pointer">
            <input 
              type="checkbox" 
              required
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-400"
            />
            <span>
              I agree to the{' '}
              <a href="/terms" className="text-indigo-500 hover:underline">
                Terms & Conditions
              </a>
              {' '}and{' '}
              <a href="/privacy" className="text-indigo-500 hover:underline">
                Privacy Policy
              </a>
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          className="mt-2 w-full h-11 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p className="text-gray-500 text-sm mt-3 mb-11">
          Already have an account? <Link className="text-indigo-500 font-medium" to="/login">Login</Link>
        </p>
      </form>

    </div>
  );
}