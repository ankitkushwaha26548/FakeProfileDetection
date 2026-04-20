import React, { useState, useEffect } from "react";
import { Mail, MapPin, Edit3, TrendingUp, ShieldCheck, AlertTriangle, XCircle,
         Smartphone, Clock, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import * as profileApi from "../api/profileApi";
import * as detectionApi from "../api/detectionApi";
import * as activityApi from "../api/activityApi";
import * as loginLogsApi from "../api/loginLogsApi";

export default function Profile() {
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [user, setUser]         = useState({ name:"", email:"", bio:"", location:"", image:"" });
  const [stats, setStats]       = useState({ activities:0, devices:0, lastLogin:"N/A" });
  const [risk, setRisk]         = useState(null);
  const [recentActs, setRecentActs] = useState([]);
  const [form, setForm]         = useState({ bio:"", location:"", phone:"", profileImage:"" });

  const LABELS = { LOGIN:"Logged in", POST:"Created a post", LIKE_POST:"Liked a post",
                   COMMENT:"Commented", REGISTER:"Account created" };

  useEffect(() => {
    Promise.all([
      profileApi.getProfile(),
      detectionApi.getMyRisk().catch(() => ({ data:null })),
      activityApi.getMyActivities().catch(() => ({ data:[] })),
      loginLogsApi.getMyLoginLogs().catch(() => ({ data:[] })),
    ]).then(([p, r, a, l]) => {
      const profile = p.data;
      const u = profile?.user || {};
      const name = u.name || "User";
      setUser({
        name, email:u.email||"", bio:profile?.bio||"",
        location:profile?.location||"",
        image: profile?.profileImage ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
      });
      setForm({ bio:profile?.bio||"", location:profile?.location||"", phone:profile?.phone||"", profileImage:profile?.profileImage||"" });
      setRisk(r.data || null);

      const logs = Array.isArray(l.data) ? l.data : [];
      const devices = new Set(logs.map(x => x.device||x.userAgent||"unknown"));
      setStats({
        activities: Array.isArray(a.data) ? a.data.length : 0,
        devices: devices.size,
        lastLogin: logs[0]?.createdAt ? new Date(logs[0].createdAt).toLocaleString() : "N/A",
      });
      setRecentActs((Array.isArray(a.data)?a.data:[]).slice(0,6).map(x => ({
        id:x._id, label:LABELS[x.type]||x.type,
        time:x.createdAt ? new Date(x.createdAt).toLocaleString() : "",
      })));
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileApi.updateProfile(form);
      // Update local user state with new values
      setUser(prev => ({
        ...prev,
        bio: form.bio,
        location: form.location,
        image: form.profileImage || prev.image,
      }));
      setEditOpen(false);
      // Optional: reload page data to reflect changes fully
      window.location.reload();
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setSaving(false);
    }
  };

const isFlagged = risk && risk.level !== "GENUINE";
const isFake    = risk?.level === "FAKE";

const standingColor = isFlagged
  ? (isFake ? "#dc2626" : "#d97706")   // red-600, amber-600
  : "#16a34a";                         // green-600

  if (loading) return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <UserHeader />
      <div className="flex items-center justify-center h-75">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <UserHeader />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-5 md:grid-cols-3">
          {/* Profile Card */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex flex-col sm:flex-row gap-5">
            <img src={user.image} alt={user.name}
              className="w-20 h-20 rounded-full border-2 border-indigo-100 object-cover" />

            <div className="flex-1 min-w-0">
              <div className="text-xl font-semibold text-gray-800 mb-1">{user.name}</div>

              {user.email && (
                <div className="text-sm text-gray-500 flex items-center gap-1.5 mb-1">
                  <Mail size={14} /> {user.email}
                </div>
              )}

              {user.location && (
                <div className="text-sm text-gray-500 flex items-center gap-1.5 mb-1">
                  <MapPin size={14} /> {user.location}
                </div>
              )}

              {user.bio && (
                <div className="text-sm text-gray-600 mt-3 leading-relaxed">
                  {user.bio}
                </div>
              )}
            </div>

            <button
              onClick={() => setEditOpen(true)}
              className="self-start px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-full text-sm text-gray-700 flex items-center gap-2 transition"
            >
              <Edit3 size={14} /> Edit
            </button>
          </div>

          {/* Standing Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              {isFake ? <XCircle size={18} style={{ color: standingColor }} />
               : isFlagged ? <AlertTriangle size={18} style={{ color: standingColor }} />
               : <ShieldCheck size={18} style={{ color: standingColor }} />}
              <span className="text-sm font-semibold" style={{ color: standingColor }}>
                {risk?.level || "GENUINE"}
              </span>
            </div>

            {risk?.score !== undefined && (
              <>
                <div className="text-4xl font-light" style={{ color: standingColor }}>
                  {risk.score}
                </div>

                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(risk.score, 100)}%`, background: standingColor }} />
                </div>

                <div className="text-xs text-gray-500">
                  {isFlagged ? "Review your activity" : "Good standing"}
                </div>
              </>
            )}
          </div>

          {/* Stats Row */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Activity, label: "Activities", value: stats.activities },
              { icon: Smartphone, label: "Devices", value: stats.devices },
              { icon: Clock, label: "Last login", value: stats.lastLogin, small: true },
            ].map(({ icon: Icon, label, value, small }) => (
              <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                  <Icon size={18} className="text-indigo-600" />
                </div>
                <div>
                  <div className={`${small ? "text-sm" : "text-2xl"} font-semibold text-gray-800`}>
                    {value}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="md:col-span-3 bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={14} />
                Recent Activity
              </div>
              <Link to="/activity" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View all →
              </Link>
            </div>

            {recentActs.length === 0 && (
              <p className="text-sm text-gray-400">No activity yet.</p>
            )}

            <div className="divide-y divide-gray-100">
              {recentActs.map((a) => (
                <div key={a.id} className="flex justify-between items-center py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                    <span className="text-sm text-gray-700">{a.label}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-gray-800">Edit Profile</h3>
              <button onClick={() => setEditOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                ✕
              </button>
            </div>

            {[
              { label: "Bio", key: "bio", multiline: true, rows: 3 },
              { label: "Location", key: "location" },
              { label: "Phone", key: "phone" },
              { label: "Profile image URL", key: "profileImage" },
            ].map(f => (
              <div key={f.key} className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  {f.label}
                </label>

                {f.multiline ? (
                  <textarea
                    value={form[f.key]}
                    rows={f.rows}
                    onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                  />
                ) : (
                  <input
                    value={form[f.key]}
                    onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                )}
              </div>
            ))}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditOpen(false)}
                className="flex-1 py-2 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-full text-sm text-white font-medium transition disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}