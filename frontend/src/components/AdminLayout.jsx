import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Activity, Globe, Shield,
  Search, LogOut, Menu, X, ChevronRight
} from "lucide-react";

const NAV = [
  { to: "/admin/dashboard",     icon: LayoutDashboard, label: "Dashboard"    },
  { to: "/admin/behavior",      icon: Activity,        label: "Behavior"     },
  { to: "/admin/ip-monitoring", icon: Globe,           label: "IP Monitor"   },
  { to: "/admin/risk",          icon: Shield,          label: "Risk Scoring" },
  { to: "/admin/lookup",        icon: Search,          label: "Quick Lookup" },
];

const s = {
  layout:   { display:"flex", height:"100vh", overflow:"hidden", background:"#09090f" },
  sidebar:  { width:200, flexShrink:0, background:"#0e0e1a", borderRight:"1px solid #1e1e30",
              display:"flex", flexDirection:"column", padding:"20px 0" },
  brand:    { padding:"0 20px 20px", borderBottom:"1px solid #1e1e30", marginBottom:8 },
  brandName:{ fontSize:15, fontWeight:600, color:"#e4e4ec", letterSpacing:"-.3px" },
  brandSub: { fontSize:10, color:"#44445a", letterSpacing:".08em", textTransform:"uppercase",
              marginTop:2 },
  navItem:  { display:"flex", alignItems:"center", gap:10, padding:"8px 20px",
              fontSize:13, color:"#8a8a9e", textDecoration:"none", cursor:"pointer",
              transition:"all .15s", borderLeft:"2px solid transparent" },
  navActive:{ color:"#818cf8", background:"rgba(129,140,248,.06)",
              borderLeft:"2px solid #818cf8" },
  navHover: { color:"#e4e4ec", background:"#13131f" },
  footer:   { marginTop:"auto", padding:"16px 20px", borderTop:"1px solid #1e1e30" },
  main:     { flex:1, overflow:"auto", display:"flex", flexDirection:"column" },
  topbar:   { padding:"16px 28px", borderBottom:"1px solid #1e1e30", display:"flex",
              alignItems:"center", gap:12, background:"#0e0e1a", flexShrink:0 },
  crumb:    { fontSize:12, color:"#44445a", display:"flex", alignItems:"center", gap:6 },
  content:  { flex:1, padding:"28px", overflow:"auto" },

  // Mobile
  mobileBar:{ display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"14px 20px", background:"#0e0e1a", borderBottom:"1px solid #1e1e30" },
  overlay:  { position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:40 },
  drawer:   { position:"fixed", top:0, left:0, height:"100%", width:220,
              background:"#0e0e1a", borderRight:"1px solid #1e1e30", zIndex:50,
              padding:"20px 0", display:"flex", flexDirection:"column" },
};

export default function AdminLayout({ children, title }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const isMobile = window.innerWidth < 768;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const NavLinks = () => (
    <>
      {NAV.map(({ to, icon: Icon, label }) => {
        const active = loc.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            style={{
              ...s.navItem,
              ...(active ? s.navActive : {}),
              ...(hovered === to && !active ? s.navHover : {}),
            }}
            onMouseEnter={() => setHovered(to)}
            onMouseLeave={() => setHovered(null)}
          >
            <Icon size={15} />
            {label}
          </Link>
        );
      })}
    </>
  );

  const currentPage = NAV.find(n => n.pathname === loc.pathname)?.label
    || NAV.find(n => loc.pathname.startsWith(n.to))?.label || "Admin";

  return (
    <div style={s.layout}>
      {/* Desktop sidebar */}
      <div style={{ ...s.sidebar, display: isMobile ? "none" : "flex" }}>
        <div style={s.brand}>
          <div style={s.brandName}>FakeDetect</div>
          <div style={s.brandSub}>Admin Panel</div>
        </div>
        <NavLinks />
        <div style={s.footer}>
          <button
            onClick={handleLogout}
            style={{ ...s.navItem, background:"none", border:"none", width:"100%",
                     padding:"8px 0", cursor:"pointer" }}
          >
            <LogOut size={14} style={{ color:"#44445a" }} />
            <span style={{ fontSize:12, color:"#44445a" }}>Sign out</span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div style={s.overlay} onClick={() => setMobileOpen(false)} />
          <div style={s.drawer}>
            <div style={{ ...s.brand, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={s.brandName}>FakeDetect</div>
                <div style={s.brandSub}>Admin Panel</div>
              </div>
              <button onClick={() => setMobileOpen(false)}
                style={{ background:"none", border:"none", color:"#44445a", cursor:"pointer" }}>
                <X size={16} />
              </button>
            </div>
            <NavLinks />
          </div>
        </>
      )}

      {/* Main area */}
      <div style={s.main}>
        {/* Mobile topbar */}
        {isMobile && (
          <div style={s.mobileBar}>
            <button onClick={() => setMobileOpen(true)}
              style={{ background:"none", border:"none", color:"#8a8a9e", cursor:"pointer" }}>
              <Menu size={18} />
            </button>
            <span style={{ fontSize:13, fontWeight:500, color:"#e4e4ec" }}>FakeDetect</span>
            <div style={{ width:18 }} />
          </div>
        )}

        {/* Desktop topbar */}
        {!isMobile && (
          <div style={s.topbar}>
            <div style={s.crumb}>
              <span>Admin</span>
              <ChevronRight size={12} />
              <span style={{ color:"#8a8a9e" }}>{title || currentPage}</span>
            </div>
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
              <Link to="/socialfeed"
                style={{ fontSize:12, color:"#44445a", textDecoration:"none",
                         padding:"5px 10px", border:"1px solid #1e1e30",
                         borderRadius:6, transition:"all .15s" }}>
                User view
              </Link>
            </div>
          </div>
        )}

        <div style={s.content}>{children}</div>
      </div>
    </div>
  );
}
