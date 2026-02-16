import React, { useState } from 'react';
import { 
  Edit, 
  Shield, 
  Activity, 
  Smartphone, 
  Clock, 
  MapPin, 
  Mail, 
  Calendar,
  User,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  XCircle,
  SmartphoneNfc
} from 'lucide-react';

export default function ProfileDashboard() {
  const [showEditModal, setShowEditModal] = useState(false);
  
  const userData = {
    name: "John Doe",
    email: "john.doe@example.com",
    bio: "Tech enthusiast. Exploring AI, cybersecurity and innovation.",
    location: "San Francisco, CA",
    joinDate: "January 2024",
    profileImage: "https://ui-avatars.com/api/?name=John+Doe&size=200&background=6366f1&color=fff",
  };

  const stats = {
    riskLevel: "GENUINE",
    riskScore: 18,
    accountStatus: "Active",
    activityCount: 245,
    deviceCount: 3,
    trustedDevices: 2,
    unknownDevices: 1,
    lastLogin: "2 hours ago",
    lastDevice: "Chrome on MacOS",
    lastLocation: "San Francisco, CA",
  };

  const activities = [
    { id: 1, action: "Created a post", time: "2h ago", severity: "NORMAL", type: 'POST' },
    { id: 2, action: "Login from new device", time: "5h ago", severity: "HIGH", type: 'LOGIN' },
    { id: 3, action: "Liked multiple posts", time: "1d ago", severity: "NORMAL", type: 'LIKE' },
    { id: 4, action: "Password changed", time: "2d ago", severity: "MEDIUM", type: 'SECURITY' },
  ];

  const getRiskColor = (level) => {
    switch(level) {
      case 'GENUINE': return 'text-green-600 bg-green-50 border-green-200';
      case 'SUSPICIOUS': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'FAKE': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityColor = (s) => {
    if (s === "HIGH") return "bg-red-100 text-red-600";
    if (s === "MEDIUM") return "bg-yellow-100 text-yellow-600";
    return "bg-blue-100 text-blue-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile Security Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">AI-powered fake profile risk analysis</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Profile Info Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
              <div className="relative inline-block">
                <img 
                  src={userData.profileImage} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full border-4 border-indigo-100"
                />
                <div className="absolute top-0 right-0 bg-green-500 p-1.5 rounded-full border-2 border-white shadow-sm">
                  <CheckCircle className="text-white w-4 h-4" />
                </div>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">{userData.name}</h2>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                  <Mail className="w-4 h-4" /> {userData.email}
                </p>
                <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                  <MapPin className="w-4 h-4" /> {userData.location}
                </p>
              </div>
              <button 
                onClick={() => setShowEditModal(true)}
                className="mt-6 w-full bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-sm"
              >
                Edit Profile
              </button>
            </div>

            {/* Risk Analysis Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Risk Analysis</h3>
                <Shield className="w-5 h-5 text-gray-400" />
              </div>
              <div className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border font-bold ${getRiskColor(stats.riskLevel)}`}>
                <CheckCircle className="w-5 h-5" />
                {stats.riskLevel}
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium">Trust Score</span>
                  <span className="font-bold text-gray-900">{100 - stats.riskScore}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-700 rounded-full"
                    style={{ width: `${100 - stats.riskScore}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wider">
                  <span>High Risk</span>
                  <span>Neutral</span>
                  <span>Safe</span>
                </div>
              </div>
            </div>

            {/* Device Intelligence Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <SmartphoneNfc className="w-4 h-4 text-indigo-500" /> Device Intelligence
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-100">
                  <span className="text-sm text-green-700 font-medium">Trusted Devices</span>
                  <span className="text-lg font-bold text-green-700">{stats.trustedDevices}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                  <span className="text-sm text-red-700 font-medium">Unknown / New</span>
                  <span className="text-lg font-bold text-red-700">{stats.unknownDevices}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-600 leading-relaxed">{userData.bio}</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={<Activity className="w-5 h-5 text-blue-600" />} label="Activities" value={stats.activityCount} color="blue" />
              <StatCard icon={<Smartphone className="w-5 h-5 text-purple-600" />} label="Devices" value={stats.deviceCount} color="purple" />
              <StatCard icon={<Clock className="w-5 h-5 text-green-600" />} label="Last Login" value={stats.lastLogin} color="green" />
            </div>

            {/* Security Alerts */}
            <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 bg-linear-to-r from-white to-red-50/30">
              <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Security Flags Detected
              </h3>
              <div className="grid sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/50 p-2 rounded-lg border border-red-100">
                  <span className="text-red-500">⚠</span> Login from unknown device
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/50 p-2 rounded-lg border border-red-100">
                  <span className="text-red-500">⚠</span> Rapid activity spike
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-1">
                  View Logs <TrendingUp className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                {activities.map((a, index) => (
                  <div key={a.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        a.severity === 'HIGH' ? 'bg-red-100' : 'bg-indigo-50'
                      }`}>
                        {a.type === 'LOGIN' ? <User className="w-5 h-5 text-indigo-600" /> : <Activity className="w-5 h-5 text-indigo-600" />}
                      </div>
                      {index !== activities.length - 1 && <div className="w-px h-full bg-gray-100 my-1"></div>}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-gray-900 font-semibold">{a.action}</p>
                          <p className="text-sm text-gray-500 mt-0.5">{a.time}</p>
                        </div>
                        <span className={`h-fit px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${getSeverityColor(a.severity)}`}>
                          {a.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                <input defaultValue={userData.name} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Bio</label>
                <textarea defaultValue={userData.bio} rows="3" className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Location</label>
                <input defaultValue={userData.location} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowEditModal(false)} className="flex-1 border border-gray-200 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
  };
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color] || "bg-gray-50"}`}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}