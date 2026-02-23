import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Filter, SortDesc, Eye, Flag, Ban, Download, RefreshCw,
  ChevronDown, CheckCircle, AlertTriangle, XCircle, User, Mail, Shield, Clock, MoreVertical
} from 'lucide-react';
import * as adminApi from '../api/adminApi';

function AdminUser() {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getUsers();
      setUsers(
        (data || []).map((r) => ({
          id: r.user?._id || r._id,
          _id: r._id,
          name: r.user?.name || '—',
          email: r.user?.email || '—',
          riskScore: r.score ?? 0,
          riskLevel: r.level || 'GENUINE',
          lastLogin: r.lastUpdated ? new Date(r.lastUpdated).toLocaleString() : '—',
          location: '—',
          deviceCount: 0,
          activityCount: 0,
        }))
      );
    } catch (_) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFlag = async (userId) => {
    try {
      await adminApi.flagUser(userId);
      load();
    } catch (_) {}
  };

  // Filter and Sort Logic
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = riskFilter === 'ALL' || user.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'score') return (a.riskScore - b.riskScore) * multiplier;
      if (sortBy === 'name') return a.name.localeCompare(b.name) * multiplier;
      if (sortBy === 'email') return a.email.localeCompare(b.email) * multiplier;
      return 0;
    });

  const getRiskBadge = (level) => {
    switch(level) {
      case 'GENUINE':
        return {
          bg: 'bg-green-900/30',
          text: 'text-green-400',
          border: 'border-green-500/30',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'SUSPICIOUS':
        return {
          bg: 'bg-yellow-900/30',
          text: 'text-yellow-400',
          border: 'border-yellow-500/30',
          icon: <AlertTriangle className="w-4 h-4" />
        };
      case 'FAKE':
        return {
          bg: 'bg-red-900/30',
          text: 'text-red-400',
          border: 'border-red-500/30',
          icon: <XCircle className="w-4 h-4" />
        };
      default:
        return {
          bg: 'bg-gray-900/30',
          text: 'text-gray-400',
          border: 'border-gray-500/30',
          icon: <Shield className="w-4 h-4" />
        };
    }
  };

  const getRiskScoreColor = (score) => {
    if (score < 30) return 'text-green-400';
    if (score < 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-black">
      
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-xl border-b border-indigo-500/20 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">User Management</h1>
              <p className="text-sm text-gray-400 font-mono mt-1">
                Total: {users.length} users • Showing: {filteredUsers.length} results
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors text-sm">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button onClick={load} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg text-white text-sm">
                <RefreshCw className="w-4 h-4" />
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              <Link to="/" className="text-gray-400 hover:text-white text-sm">Dashboard</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Filters & Search */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono uppercase">
                Search Users
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            {/* Risk Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono uppercase">
                Risk Level
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm appearance-none cursor-pointer"
                >
                  <option value="ALL">All Users</option>
                  <option value="GENUINE">Genuine</option>
                  <option value="SUSPICIOUS">Suspicious</option>
                  <option value="FAKE">Fake</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 font-mono uppercase">
                Sort By
              </label>
              <div className="relative">
                <SortDesc className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm appearance-none cursor-pointer"
                >
                  <option value="score-desc">Risk Score (High to Low)</option>
                  <option value="score-asc">Risk Score (Low to High)</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-800">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {users.filter(u => u.riskLevel === 'GENUINE').length}
              </p>
              <p className="text-xs text-gray-500 font-mono mt-1">Genuine</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {users.filter(u => u.riskLevel === 'SUSPICIOUS').length}
              </p>
              <p className="text-xs text-gray-500 font-mono mt-1">Suspicious</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">
                {users.filter(u => u.riskLevel === 'FAKE').length}
              </p>
              <p className="text-xs text-gray-500 font-mono mt-1">Fake</p>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl overflow-hidden">
          
          {/* Table Header */}
          <div className="bg-gray-800/50 px-6 py-4 border-b border-gray-700">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
              />
              {selectedUsers.length > 0 && (
                <span className="ml-3 text-sm text-gray-400 font-mono">
                  {selectedUsers.length} selected
                </span>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/30 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredUsers.map((user) => {
                  const riskBadge = getRiskBadge(user.riskLevel);
                  return (
                    <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-linear-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-white font-medium">{user.name}</p>
                              <p className="text-gray-400 text-sm font-mono">{user.email}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`text-2xl font-bold ${getRiskScoreColor(user.riskScore)}`}>
                            {user.riskScore}
                          </span>
                          <div className="flex-1 max-w-25">
                            <div className="w-full bg-gray-800 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  user.riskScore < 30 ? 'bg-green-500' :
                                  user.riskScore < 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${user.riskScore}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold border ${riskBadge.bg} ${riskBadge.text} ${riskBadge.border}`}>
                          {riskBadge.icon}
                          {user.riskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-mono">{user.lastLogin}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400 text-sm">{user.location}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30 rounded-lg transition-colors" title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleFlag(user.id)} className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/30 rounded-lg transition-colors" title="Flag User">
                            <Flag className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors" title="Ban User">
                            <Ban className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-800/30 px-6 py-4 border-t border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-400 font-mono">
              Showing 1 to {filteredUsers.length} of {users.length} users
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors text-sm">
                Previous
              </button>
              <button className="px-4 py-2 bg-indigo-600 border border-indigo-500 rounded-lg text-white hover:bg-indigo-700 transition-colors text-sm">
                Next
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminUser