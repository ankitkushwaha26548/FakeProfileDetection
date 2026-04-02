import React from "react";
import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-black text-white">

      {/* Hero */}
      <section className="text-center px-6 py-24">
        
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 bg-linear-to-r from-white to-indigo-300 bg-clip-text text-transparent">
          FakeDetect
        </h1>
        <p className="text-xl text-indigo-400 font-semibold mb-4">
          Fake Profile & Behavior Detection System
        </p>
        <p className="max-w-2xl mx-auto text-gray-400 mb-10 leading-relaxed">
          A simulated social media platform that analyzes user behavior,
          activity patterns, and risk factors to identify suspicious or fake
          accounts using intelligent monitoring techniques.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/login" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors">
            Login
          </Link>
          <Link to="/register" className="px-8 py-3 border border-indigo-500 hover:bg-indigo-600/20 rounded-lg font-semibold transition-colors">
            Register
          </Link>
          <Link to="/admin/dashboard" className="px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors text-gray-200">
            Admin Panel
          </Link>
        </div>
      </section>

      {/* How it works — 3 simple steps */}
      <section className="px-6 py-12 border-t border-slate-800">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <StepCard number="01" title="User joins & acts" desc="Users register, post, like, comment on the simulated platform." />
          <StepCard number="02" title="System monitors" desc="Every login, post, and IP change is silently logged and analyzed." />
          <StepCard number="03" title="Admin reviews" desc="Admin dashboard surfaces risk scores, flagged accounts, and behavior reports." />
        </div>
      </section>

      {/* Features — all link to admin */}
      <section className="px-6 py-16 bg-slate-900/60">
        <h2 className="text-3xl font-bold text-center mb-3">Detection Capabilities</h2>
        <p className="text-center text-gray-500 text-sm mb-10">All features are accessible from the Admin Panel</p>

        <div className="grid md:grid-cols-4 gap-5 max-w-5xl mx-auto">
          <FeatureCard
            icon="🛡️"
            title="Risk Scoring"
            desc="Each account is scored 0–100 and classified as Genuine, Suspicious, or Fake."
            to="/admin/risk"
          />
          <FeatureCard
            icon="📊"
            title="Behavior Analysis"
            desc="Detects rapid actions, repetitive patterns, and bot-like timing."
            to="/admin/behavior"
          />
          <FeatureCard
            icon="🌐"
            title="IP Monitoring"
            desc="Flags frequent IP changes and suspicious login location patterns."
            to="/admin/ip-monitoring"
          />
          <FeatureCard
            icon="⚙️"
            title="Admin Dashboard"
            desc="Full overview of all users, risk levels, and detection reports."
            to="/admin/dashboard"
          />
        </div>
      </section>

      {/* Purpose */}
      <section className="text-center px-6 py-20">
        <h2 className="text-3xl font-bold mb-6">Why This System Exists</h2>
        <p className="max-w-3xl mx-auto text-gray-400 leading-relaxed">
          Fake profiles, bots, and malicious accounts pose serious threats to
          online platforms. This system demonstrates how intelligent monitoring
          of user behavior, profile completeness, and activity patterns can
          identify suspicious accounts before they cause harm — all without
          exposing the detection mechanics to end users.
        </p>
      </section>

      <footer className="text-center py-6 border-t border-slate-800 text-gray-600 text-sm">
        © 2026 FakeDetect — MCA Major Project · University of Allahabad
      </footer>
    </div>
  );
}

function StepCard({ number, title, desc }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-4xl font-black text-indigo-900 mb-2">{number}</span>
      <h3 className="text-base font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc, to }) {
  return (
    <Link to={to} className="block h-full group">
      <div className="h-full flex flex-col p-5 rounded-xl border border-slate-700 hover:border-indigo-500 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer">
        <span className="text-2xl mb-3">{icon}</span>
        <h3 className="text-sm font-bold mb-1.5 text-indigo-400 group-hover:text-indigo-300">{title}</h3>
        <p className="text-gray-400 text-xs leading-relaxed grow">{desc}</p>
        <p className="text-indigo-500 text-xs mt-3 font-medium group-hover:text-indigo-400">View in admin →</p>
      </div>
    </Link>
  );
}

export default LandingPage;
