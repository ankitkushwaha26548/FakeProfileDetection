import React from "react";
import { Link } from "react-router-dom";
import { Shield, Activity, Globe, LayoutDashboard, ArrowRight } from "lucide-react";

const FEATURES = [
  { icon: Shield, label: "Risk scoring", desc: "0–100 score per account. Genuine, Suspicious, or Fake.", to: "/admin/risk" },
  { icon: Activity, label: "Behavior analysis", desc: "Detects rapid actions, bot timing, repetitive patterns.", to: "/admin/behavior" },
  { icon: Globe, label: "IP monitoring", desc: "Flags location changes and suspicious login patterns.", to: "/admin/ip-monitoring" },
  { icon: LayoutDashboard, label: "Admin dashboard", desc: "Full overview of users, risk levels, and activity logs.", to: "/admin/dashboard" },
];

const STEPS = [
  { n: "01", title: "Users join & act", desc: "Register, post, like, comment on the simulated platform." },
  { n: "02", title: "System monitors", desc: "Every action is silently logged and analyzed for patterns." },
  { n: "03", title: "Admin reviews", desc: "Dashboard surfaces risk scores and flagged accounts." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 text-gray-800 font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-indigo-600 font-semibold text-base tracking-tight">FakeDetect</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition shadow-sm"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-2xl mx-auto px-6 py-20 md:py-28 text-center">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-800 leading-tight mb-4">
          Fake Profile<br />
          <span className="text-indigo-600 font-semibold">Detection System</span>
        </h1>
        <p className="text-base text-gray-500 leading-relaxed max-w-md mx-auto mb-8">
          A simulated social media platform that analyzes user behavior,
          activity patterns, and risk factors to identify suspicious and
          fake accounts.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-full shadow-sm hover:bg-indigo-700 transition"
          >
            Get started <ArrowRight size={14} />
          </Link>
          <Link
            to="/admin/dashboard"
            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition"
          >
            Admin panel
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          {STEPS.map((step, idx) => (
            <div key={idx} className="p-6">
              <div className="text-3xl font-extralight text-gray-300 mb-2 tabular-nums tracking-tighter">
                {step.n}
              </div>
              <div className="text-sm font-semibold text-gray-800 mb-1">{step.title}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6">
          Detection capabilities — all in admin panel
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map(({ icon, label, desc, to }) => (
            <Link
              key={to}
              to={to}
              className="group flex gap-4 p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200"
            >
              {React.createElement(icon, { size: 18, className: "text-indigo-500 shrink-0 mt-0.5" })}
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-1 group-hover:text-indigo-600 transition">
                  {label}
                </div>
                <div className="text-xs text-gray-500 leading-relaxed">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-5 px-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-400">
        <span>© 2026 FakeDetect</span>
      </footer>
    </div>
  );
}