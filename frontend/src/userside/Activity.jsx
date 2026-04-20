import React, { useEffect, useState } from "react";
import { ShieldCheck, AlertTriangle, XCircle, TrendingUp, Activity as ActivityIcon } from "lucide-react";
import UserHeader from "../components/UserHeader";
import * as activityApi from "../api/activityApi";
import * as detectionApi from "../api/detectionApi";

const LABELS = {
  LOGIN: "Logged in",
  REGISTER: "Account created",
  POST: "Created a post",
  LIKE_POST: "Liked a post",
  COMMENT: "Posted a comment",
};

export default function Activity() {
  const [activities, setActivities] = useState([]);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [a, r] = await Promise.all([
        activityApi.getMyActivities(),
        detectionApi.getMyRisk().catch(() => ({ data: null })),
      ]);
      setActivities(a.data || []);
      setRisk(r.data || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const isFlagged = risk && risk.level !== "GENUINE";
  const isFake = risk?.level === "FAKE";

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <UserHeader />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Loader */}
        {loading && (
          <div className="flex justify-center pt-16">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && (
          <>
            {/* Good Standing Banner */}
            {!isFlagged && (
              <div className="flex items-center gap-2 px-4 py-3 mb-5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
                <ShieldCheck size={16} />
                <span className="font-medium">Account in good standing</span>
              </div>
            )}

            {/* Risk Warning Card */}
            {isFlagged && (
              <div
                className={`rounded-xl border p-5 mb-5 shadow-sm ${
                  isFake
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isFake ? (
                      <XCircle size={18} className="text-red-500" />
                    ) : (
                      <AlertTriangle size={18} className="text-amber-500" />
                    )}
                    <span
                      className={`font-semibold ${
                        isFake ? "text-red-700" : "text-amber-700"
                      }`}
                    >
                      {isFake ? "Account flagged" : "Unusual activity detected"}
                    </span>
                  </div>
                  <span
                    className={`text-3xl font-light ${
                      isFake ? "text-red-500" : "text-amber-500"
                    }`}
                  >
                    {risk.score}
                  </span>
                </div>

                {/* Score bar */}
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isFake ? "bg-red-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(risk.score || 0, 100)}%` }}
                  />
                </div>

                <p
                  className={`text-sm mb-3 ${
                    isFake ? "text-red-600" : "text-amber-600"
                  }`}
                >
                  {isFake
                    ? "Multiple suspicious patterns detected. Reduce automated activity to restore your account."
                    : "Your recent activity looks unusual. Slow down to keep your account in good standing."}
                </p>

                {risk.reasons
                  ?.filter((r) => r.startsWith("❌") || r.startsWith("⚠️"))
                  .map((r, i) => (
                    <div
                      key={i}
                      className={`flex gap-1 text-xs ${
                        r.startsWith("❌") ? "text-red-600" : "text-amber-600"
                      }`}
                    >
                      <span>{r.slice(0, 2)}</span>
                      <span>{r.slice(2).trim()}</span>
                    </div>
                  ))}
              </div>
            )}

            {/* Activity Timeline Card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                  <TrendingUp size={16} className="text-indigo-600" />
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Activity Timeline
                </span>
              </div>

              {activities.length === 0 && (
                <div className="text-center py-8">
                  <ActivityIcon size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">No activity yet.</p>
                </div>
              )}

              <div className="relative">
                {activities.map((a, idx) => (
                  <div key={a._id || idx} className="flex gap-4 relative">
                    {/* Vertical connecting line (except last) */}
                    {idx < activities.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-200" />
                    )}

                    {/* Timeline dot */}
                    <div className="relative z-10">
                      <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-5">
                      <div className="text-gray-800 font-medium">
                        {LABELS[a.type] || a.type}
                      </div>
                      <div className="text-xs text-gray-400 font-mono mt-1">
                        {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}