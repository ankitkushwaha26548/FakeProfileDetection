import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Activity, Globe, Shield,
  Search, LogOut, Menu, X, ChevronRight
} from "lucide-react";

const NAV = [
  { to: "/admin/dashboard",     icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/behavior",      icon: Activity,        label: "Behavior" },
  { to: "/admin/ip-monitoring", icon: Globe,           label: "IP Monitor" },
  { to: "/admin/risk",          icon: Shield,          label: "Risk Scoring" },
  { to: "/admin/lookup",        icon: Search,          label: "Quick Lookup" },
];

function NavLinks({ pathname, onNavigate }) {
  return (
    <>
      {NAV.map(({ to, icon, label }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 px-5 py-2 text-sm font-medium transition-all border-l-2
              ${active
                ? "text-indigo-700 bg-indigo-50 border-indigo-600"
                : "text-gray-600 border-transparent hover:text-indigo-600 hover:bg-gray-50"
              }`}
          >
            {React.createElement(icon, { size: 16 })}
            {label}
          </Link>
        );
      })}
    </>
  );
}

export default function AdminLayout({ children, title }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  const closeMobile = () => setMobileOpen(false);

  const currentPage =
    NAV.find(n => n.to === location.pathname)?.label ||
    NAV.find(n => location.pathname.startsWith(n.to))?.label ||
    "Admin";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-56 flex-col bg-white border-r border-gray-200 shadow-sm py-6">
        {/* Brand */}
        <div className="px-6 pb-6 border-b border-gray-100">
          <div className="text-base font-semibold text-indigo-600">FakeDetect</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">
            Admin Panel
          </div>
        </div>

        <nav className="flex-1 mt-4 space-y-1">
          <NavLinks pathname={location.pathname} onNavigate={closeMobile} />
        </nav>

        {/* Footer */}
        <div className="px-6 pt-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 flex flex-col shadow-xl">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <div className="text-base font-semibold text-indigo-600">FakeDetect</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">
                  Admin Panel
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 mt-2 space-y-1">
              <NavLinks pathname={location.pathname} onNavigate={closeMobile} />
            </nav>
          </div>
        </>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100 shadow-sm">
          <button onClick={() => setMobileOpen(true)} className="text-gray-500">
            <Menu size={20} />
          </button>
          <span className="text-sm font-medium text-gray-700">FakeDetect</span>
          <div className="w-5" />
        </div>

        {/* Desktop Top Bar */}
        <div className="hidden md:flex items-center gap-3 px-7 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span>Admin</span>
            <ChevronRight size={14} />
            <span className="text-gray-800 font-medium">{title || currentPage}</span>
          </div>

          <div className="ml-auto">
            <Link
              to="/socialfeed"
              className="text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
            >
              User view
            </Link>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}