import React from "react";
import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">

      {/*hero section */}
      <section className="text-center px-6 py-24">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
          FakeDetect
        </h1>

        <p className="text-xl text-indigo-400 font-semibold mb-4">
          Fake Profile & Behavior Detection System
        </p>

        <p className="max-w-2xl mx-auto text-gray-300 mb-10">
          A simulated social media platform that analyzes user behavior,
          activity patterns, and risk factors to identify suspicious or fake
          accounts using intelligent monitoring techniques.
        </p>

        {/* CTA Buttons */}
        <div className="flex justify-center gap-4">
          <Link
            to="/login"
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-8 py-3 border border-indigo-500 hover:bg-indigo-600/20 rounded-lg font-semibold"
          >
            Register
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-16 bg-slate-900/60">
        <h2 className="text-3xl font-bold text-center mb-12">
          Key System Features
        </h2>

        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto"> {/* Grid stays the same */}

          <FeatureCard
            title="Risk Scoring"
            desc="Evaluates each account and assigns Genuine, Suspicious, or Fake status."
            to="/features/risk-scoring"
          />

          <FeatureCard
            title="Behavior Analysis"
            desc="Tracks posting, interaction, and activity patterns to detect anomalies."
            to="/features/behavior-analysis"
          />

          <FeatureCard
            title="IP Monitoring"
            desc="Identifies suspicious location or device changes over time."
            to="/features/ip-monitoring"
          />

          <FeatureCard
            title="Admin Dashboard"
            desc="Provides investigators with insights into high-risk accounts."
            to="/admin/dashboard"
          />

        </div>
      </section>

      {/* PURPOSE */}
      <section className="text-center px-6 py-20">
        <h2 className="text-3xl font-bold mb-6">
          Why This System Exists
        </h2>

        <p className="max-w-3xl mx-auto text-gray-300 leading-relaxed">
          Fake profiles, bots, and malicious accounts pose serious threats to
          online platforms. This system demonstrates how intelligent monitoring
          of user behavior, profile completeness, and activity patterns can
          identify suspicious accounts before they cause harm.
        </p>
      </section>

      {/*FOOTER */}
      <footer className="text-center py-6 border-t border-slate-800 text-gray-500 text-sm">
        © 2026 FakeDetect AI — Academic Demonstration System
      </footer>

    </div>
  );
}

// Reusable Feature Card - Fixed Sizing & Always Clickable
function FeatureCard({ title, desc, to }) {
  return (
    <Link to={to} className="block h-full"> {/* h-full stretches to grid row height */}
      <div className="h-full flex flex-col p-6 rounded-xl border border-slate-700 hover:border-indigo-500 hover:bg-slate-800/80 transition-all duration-300 cursor-pointer group">
        <h3 className="text-lg font-bold mb-2 text-indigo-400 group-hover:text-indigo-300 shrink-0">
          {title}
        </h3>
        <p className="text-gray-300 text-sm grow"> {/* flex-grow fills remaining space */}
          {desc}
        </p>
      </div>
    </Link>
  );
}

export default LandingPage;
