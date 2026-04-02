import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Mail, Calendar, Activity, Smartphone,
  Clock, AlertTriangle, ShieldCheck, TrendingUp, Edit3
} from 'lucide-react';
import Header from '../components/Header';
import * as profileApi from '../api/profileApi';
import * as detectionApi from '../api/detectionApi';
import * as activityApi from '../api/activityApi';
import * as loginLogsApi from '../api/loginLogsApi';

export default function ProfileDashboard() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [userData, setUserData] = useState({
    name: '', email: '', bio: '', location: '', profileImage: '',
  });
  const [stats, setStats] = useState({
    activityCount: 0, deviceCount: 0, lastLogin: 'N/A',
  });
  const [riskLevel, setRiskLevel] = useState('GENUINE');
  const [riskData, setRiskData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [editForm, setEditForm] = useState({ bio: '', location: '', profileImage: '' });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [profileRes, riskRes, activitiesRes, loginLogsRes] = await Promise.all([
          profileApi.getProfile(),
          detectionApi.getMyRisk().catch(() => ({ data: { level: 'GENUINE', score: 0 } })),
          activityApi.getMyActivities().catch(() => ({ data: [] })),
          loginLogsApi.getMyLoginLogs().catch(() => ({ data: [] })),
        ]);

        const profile = profileRes.data;
        const user = profile?.user || {};
        setUserData({
          name: user.name || 'User',
          email: user.email || '',
          bio: profile?.bio || '',
          location: profile?.location || '',
          profileImage: profile?.profileImage ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&size=200&background=6366f1&color=fff`,
        });
        setEditForm({
          bio: profile?.bio || '',
          location: profile?.location || '',
          profileImage: profile?.profileImage || '',
        });

        const loginLogs = Array.isArray(loginLogsRes.data) ? loginLogsRes.data : [];
        const uniqueDevices = new Set(loginLogs.map(l => l.device || l.userAgent || 'Unknown'));
        const lastLogin = loginLogs.length > 0 && loginLogs[0].createdAt
          ? new Date(loginLogs[0].createdAt).toLocaleString()
          : 'N/A';

        setStats({
          activityCount: Array.isArray(activitiesRes.data) ? activitiesRes.data.length : 0,
          deviceCount: uniqueDevices.size,
          lastLogin,
        });

        setRiskLevel(riskRes.data?.level || 'GENUINE');
        setRiskData(riskRes.data || null);

        const list = Array.isArray(activitiesRes.data) ? activitiesRes.data : [];
        setActivities(list.slice(0, 8).map((a, i) => ({
          id: a._id || i,
          label: ({
            LOGIN: 'Logged in',
            POST: 'Created a post',
            LIKE_POST: 'Liked a post',
            COMMENT: 'Commented on a post',
            REGISTER: 'Account created',
          })[a.type] || a.type,
          time: a.createdAt ? new Date(a.createdAt).toLocaleString() : '',
        })));
      } catch (err) {
        if (err.response?.status !== 429) {
          setError(err.response?.data?.message || 'Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await profileApi.updateProfile(editForm);
      setUserData((prev) => ({
        ...prev,
        bio: editForm.bio,
        location: editForm.location,
        profileImage: editForm.profileImage || prev.profileImage,
      }));
      setShowEditModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Gentle own-account banner — only if flagged
  const renderAccountBanner = () => {
    if (riskLevel === 'GENUINE') {
      return (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 border border-green-200">
          <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-xs text-green-700 font-medium">Account in good standing</p>
        </div>
      );
    }
    const isFake = riskLevel === 'FAKE';
    return (
      <div className={`rounded-xl border p-4 ${isFake ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <div className="flex items-start gap-2">
          <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${isFake ? 'text-red-500' : 'text-yellow-500'}`} />
          <div>
            <p className={`text-xs font-semibold ${isFake ? 'text-red-800' : 'text-yellow-800'}`}>
              {isFake ? 'Account flagged' : 'Unusual activity detected'}
            </p>
            <p className={`text-xs mt-0.5 ${isFake ? 'text-red-600' : 'text-yellow-600'}`}>
              {isFake
                ? 'Your account has been identified as suspicious. Reduce automated activity.'
                : 'Your activity patterns look unusual. Slow down to stay in good standing.'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !userData.name) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <Link to="/socialfeed" className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              Back to Feed
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN */}
          <div className="space-y-4">

            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
              <img
                src={userData.profileImage}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-indigo-100 mx-auto"
              />
              <h2 className="mt-3 text-lg font-semibold text-gray-900">{userData.name}</h2>
              <p className="text-sm text-gray-400 mt-1 leading-snug">{userData.bio || 'No bio yet'}</p>

              <div className="mt-3 space-y-1.5">
                {userData.email && (
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> {userData.email}
                  </p>
                )}
                {userData.location && (
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {userData.location}
                  </p>
                )}
              </div>

              <button
                onClick={() => setShowEditModal(true)}
                className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-xl text-sm hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            </div>

            {/* Account standing — gentle banner */}
            {renderAccountBanner()}

            {/* Quick stats */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
              <StatRow icon={<Activity className="w-4 h-4 text-indigo-500" />} label="Total activities" value={stats.activityCount} />
              <StatRow icon={<Smartphone className="w-4 h-4 text-purple-500" />} label="Devices used" value={stats.deviceCount} />
              <StatRow icon={<Clock className="w-4 h-4 text-green-500" />} label="Last login" value={stats.lastLogin} small />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 space-y-5">

            {/* About */}
            {userData.bio && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{userData.bio}</p>
              </div>
            )}

            {/* Recent activity */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  Recent Activity
                </h3>
                <Link to="/activity" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                  View all
                </Link>
              </div>

              {activities.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No activity yet</p>
              ) : (
                <div className="space-y-2">
                  {activities.map((a, i) => (
                    <div key={a.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                        <Activity className="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-medium truncate">{a.label}</p>
                        <p className="text-xs text-gray-400">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(f => ({ ...f, bio: e.target.value }))}
                  rows="3"
                  className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Location</label>
                <input
                  value={editForm.location}
                  onChange={(e) => setEditForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Profile Image URL</label>
                <input
                  value={editForm.profileImage}
                  onChange={(e) => setEditForm(f => ({ ...f, profileImage: e.target.value }))}
                  placeholder="https://..."
                  className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowEditModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSaveProfile} disabled={saving} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatRow({ icon, label, value, small }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className={`font-semibold text-gray-900 ${small ? 'text-xs' : 'text-sm'}`}>{value}</span>
    </div>
  );
}
