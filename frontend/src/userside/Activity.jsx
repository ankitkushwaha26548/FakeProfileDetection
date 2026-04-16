import React, { useEffect, useState } from "react";
import { ShieldCheck, AlertTriangle, XCircle, TrendingUp } from "lucide-react";
import UserHeader from "../components/UserHeader";
import * as activityApi from "../api/activityApi";
import * as detectionApi from "../api/detectionApi";

const LABELS = {
  LOGIN:"Logged in", REGISTER:"Account created",
  POST:"Created a post", LIKE_POST:"Liked a post", COMMENT:"Posted a comment",
};

export default function Activity() {
  const [activities, setActivities] = useState([]);
  const [risk, setRisk]   = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [a, r] = await Promise.all([
        activityApi.getMyActivities(),
        detectionApi.getMyRisk().catch(() => ({ data:null })),
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
  const isFake    = risk?.level === "FAKE";

  return (
    <div className="min-h-screen bg-[#09090f]">
      <UserHeader />

      <div className="max-w-xl mx-auto px-4 py-6">

        {/* Loader */}
        {loading && (
          <div className="flex justify-center pt-16">
            <div className="w-6 h-6 border border-[#1e1e30] border-t-indigo-400 rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && (
          <>
            {/* Good Standing */}
            {!isFlagged && (
              <div className="flex items-center gap-2 px-3 py-2 mb-4 rounded-md text-xs
                              bg-green-400/10 border border-green-400/20 text-green-400">
                <ShieldCheck size={14} />
                Account in good standing
              </div>
            )}

            {/* Warning */}
            {isFlagged && (
              <div className={`p-4 mb-4 rounded-md border
                ${isFake
                  ? "bg-red-400/10 border-red-400/30"
                  : "bg-yellow-400/10 border-yellow-400/30"}`}>

                <div className="flex items-center gap-2 mb-2">
                  {isFake
                    ? <XCircle size={14} className="text-red-400" />
                    : <AlertTriangle size={14} className="text-yellow-400" />}

                  <span className={`text-sm font-medium
                    ${isFake ? "text-red-400" : "text-yellow-400"}`}>
                    {isFake ? "Account flagged" : "Unusual activity detected"}
                  </span>

                  <span className={`ml-auto text-2xl font-light
                    ${isFake ? "text-red-400" : "text-yellow-400"}`}>
                    {risk.score}
                  </span>
                </div>

                {/* Score bar */}
                <div className="h-0.75 bg-white/5 rounded overflow-hidden mb-2">
                  <div
                    className={`h-full rounded
                      ${isFake ? "bg-red-400" : "bg-yellow-400"}`}
                    style={{ width:`${Math.min(risk.score||0,100)}%` }}
                  />
                </div>

                <p className={`text-xs mb-2
                  ${isFake ? "text-red-400/70" : "text-yellow-400/70"}`}>
                  {isFake
                    ? "Multiple suspicious patterns detected. Reduce automated activity to restore your account."
                    : "Your recent activity looks unusual. Slow down to keep your account in good standing."}
                </p>

                {risk.reasons?.filter(r=>r.startsWith("❌")||r.startsWith("⚠️")).map((r,i) => (
                  <div key={i} className={`flex gap-1 text-[11px]
                    ${r.startsWith("❌") ? "text-red-400/80" : "text-yellow-400/80"}`}>
                    <span>{r.slice(0,2)}</span>
                    <span>{r.slice(2).trim()}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Timeline */}
            <div className="bg-[#0e0e1a] border border-[#1e1e30] rounded-xl p-4">
              <div className="text-xs text-[#44445a] font-medium mb-4 flex items-center gap-2">
                <TrendingUp size={12} />
                ACTIVITY TIMELINE
              </div>

              {activities.length === 0 && (
                <p className="text-sm text-[#44445a] text-center py-5">
                  No activity yet.
                </p>
              )}

              {activities.map((a, i) => (
                <div key={a._id||i} className="flex gap-3 relative">

                  {/* Line */}
                  {i < activities.length-1 && (
                    <div className="absolute left-2.5 top-7 bottom-0 w-px bg-[#13131f]" />
                  )}

                  {/* Dot */}
                  <div className="w-5 h-5 rounded-full bg-[#13131f] border border-[#1e1e30]
                                  flex items-center justify-center mt-1 shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="text-sm text-[#c4c4d0] font-medium">
                      {LABELS[a.type] || a.type}
                    </div>
                    <div className="text-xs text-[#44445a] mt-1 font-mono">
                      {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}