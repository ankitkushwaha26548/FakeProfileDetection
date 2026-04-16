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
          `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=312e81&color=fff`,
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

  const isFlagged = risk && risk.level !== "GENUINE";
  const isFake    = risk?.level === "FAKE";

  const standingColor  = isFlagged ? (isFake ? "#f87171" : "#f59e0b") : "#4ade80";

  if (loading) return (
    <div className="min-h-screen bg-[#09090f]">
      <UserHeader />
      <div className="flex items-center justify-center h-75">
        <div className="w-6 h-6 border border-[#1e1e30] border-t-indigo-400 rounded-full animate-spin"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090f]">
      <UserHeader />

      <div className="max-w-170 mx-auto px-4 py-6">
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns:"1fr 1fr 1fr",
            gridTemplateAreas:`"profile profile standing" "stats stats stats" "activity activity activity"`
          }}
        >

          {/* Profile */}
          <div
            className="bg-[#0e0e1a] border border-[#1e1e30] rounded-xl p-5 flex items-center gap-4"
            style={{ gridArea:"profile" }}
          >
            <img src={user.image} alt={user.name}
              className="w-14 h-14 rounded-full border border-[#1e1e30]" />

            <div className="flex-1 min-w-0">
              <div className="text-base font-medium text-[#e4e4ec] mb-1">{user.name}</div>

              {user.email && (
                <div className="text-xs text-[#44445a] flex items-center gap-1 mb-1">
                  <Mail size={11} />{user.email}
                </div>
              )}

              {user.location && (
                <div className="text-xs text-[#44445a] flex items-center gap-1">
                  <MapPin size={11} />{user.location}
                </div>
              )}

              {user.bio && (
                <div className="text-xs text-[#8a8a9e] mt-2 leading-relaxed">
                  {user.bio}
                </div>
              )}
            </div>

            <button
              onClick={() => setEditOpen(true)}
              className="px-3 py-1.5 bg-[#13131f] border border-[#1e1e30] rounded-md text-xs text-[#8a8a9e] flex items-center gap-1"
            >
              <Edit3 size={11} />Edit
            </button>
          </div>

          {/* Standing */}
          <div
            className="rounded-xl p-4 flex flex-col justify-center gap-2 border"
            style={{ gridArea:"standing", borderColor:standingColor+"30", backgroundColor:standingColor+"10" }}
          >
            <div className="flex items-center gap-2">
              {isFake ? <XCircle size={14} style={{ color:standingColor }} />
               : isFlagged ? <AlertTriangle size={14} style={{ color:standingColor }} />
               : <ShieldCheck size={14} style={{ color:standingColor }} />}
              <span className="text-xs font-semibold" style={{ color:standingColor }}>
                {risk?.level || "GENUINE"}
              </span>
            </div>

            {risk?.score !== undefined && (
              <>
                <div className="text-3xl font-light" style={{ color:standingColor }}>
                  {risk.score}
                </div>

                <div className="h-1 bg-white/5 rounded overflow-hidden">
                  <div className="h-full rounded" style={{ width:`${Math.min(risk.score,100)}%`, background:standingColor }} />
                </div>

                <div className="text-[10px]" style={{ color:standingColor+"80" }}>
                  {isFlagged ? "Review your activity" : "Looks good"}
                </div>
              </>
            )}
          </div>

          {/* Stats */}
          <div
            className="grid gap-2"
            style={{ gridArea:"stats", gridTemplateColumns:"repeat(3,1fr)" }}
          >
            {[
              { icon:Activity, label:"Activities", value:stats.activities },
              { icon:Smartphone, label:"Devices", value:stats.devices },
              { icon:Clock, label:"Last login", value:stats.lastLogin, small:true },
            ].map(({ icon:Icon, label, value, small }) => (
              <div key={label} className="bg-[#0e0e1a] border border-[#1e1e30] rounded-lg p-3 flex items-center gap-3">
                <Icon size={14} className="text-indigo-400" />
                <div>
                  <div className={`${small ? "text-xs" : "text-xl"} text-[#e4e4ec] font-light`}>
                    {value}
                  </div>
                  <div className="text-[10px] text-[#44445a] mt-1">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Activity */}
          <div
            className="bg-[#0e0e1a] border border-[#1e1e30] rounded-xl p-4"
            style={{ gridArea:"activity" }}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="text-xs text-[#44445a] font-medium flex items-center gap-2">
                <TrendingUp size={12} />
                RECENT ACTIVITY
              </div>
              <Link to="/activity" className="text-xs text-indigo-400">
                View all
              </Link>
            </div>

            {recentActs.length === 0 && (
              <p className="text-xs text-[#44445a]">No activity yet.</p>
            )}

            <div className="flex flex-col gap-1">
              {recentActs.map((a, i) => (
                <div key={a.id} className={`flex justify-between items-center py-2 ${i<recentActs.length-1 ? "border-b border-[#0d0d18]" : ""}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                    <span className="text-xs text-[#8a8a9e]">{a.label}</span>
                  </div>
                  <span className="text-[11px] text-[#44445a] font-mono">{a.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0e0e1a] border border-[#1e1e30] rounded-xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-5">
              <span className="text-sm font-medium text-[#e4e4ec]">Edit Profile</span>
              <button onClick={() => setEditOpen(false)} className="text-[#44445a] text-lg">✕</button>
            </div>

            {[
              { label:"Bio", key:"bio", multiline:true },
              { label:"Location", key:"location" },
              { label:"Phone", key:"phone" },
              { label:"Profile image URL", key:"profileImage" },
            ].map(f => (
              <div key={f.key} className="mb-4">
                <label className="block text-[10px] text-[#44445a] font-semibold mb-1 uppercase">
                  {f.label}
                </label>

                {f.multiline ? (
                  <textarea
                    value={form[f.key]}
                    rows={3}
                    onChange={e => setForm(x => ({ ...x,[f.key]:e.target.value }))}
                    className="w-full bg-[#09090f] border border-[#1e1e30] rounded-md px-3 py-2 text-sm text-[#e4e4ec] outline-none resize-none"
                  />
                ) : (
                  <input
                    value={form[f.key]}
                    onChange={e => setForm(x => ({ ...x,[f.key]:e.target.value }))}
                    className="w-full bg-[#09090f] border border-[#1e1e30] rounded-md px-3 py-2 text-sm text-[#e4e4ec] outline-none"
                  />
                )}
              </div>
            ))}

            <div className="flex gap-2 mt-5">
              <button onClick={() => setEditOpen(false)} className="flex-1 py-2 border border-[#1e1e30] rounded-md text-sm text-[#8a8a9e]">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2 bg-indigo-400 rounded-md text-sm text-white font-medium"
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