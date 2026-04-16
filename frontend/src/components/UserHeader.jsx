import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, PenSquare, User, Activity, LogOut, Menu, X } from "lucide-react";

const NAV = [
  { to:"/socialfeed", icon:Home,       label:"Feed"     },
  { to:"/post",       icon:PenSquare,  label:"Post"     },
  { to:"/profile",    icon:User,       label:"Profile"  },
  { to:"/activity",   icon:Activity,   label:"Activity" },
];

export default function UserHeader() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      <header style={{ position:"sticky", top:0, zIndex:30, background:"rgba(9,9,15,.95)",
                        borderBottom:"1px solid #1e1e30", backdropFilter:"blur(8px)" }}>
        <div style={{ maxWidth:680, margin:"0 auto", padding:"0 20px",
                      display:"flex", alignItems:"center", height:52 }}>
          <Link to="/socialfeed" style={{ fontSize:14, fontWeight:600, color:"#818cf8",
                                           textDecoration:"none", letterSpacing:"-.2px", marginRight:"auto" }}>
            FakeDetect
          </Link>

          {/* Desktop nav */}
          <nav style={{ display:"flex", alignItems:"center", gap:4 }}>
            {NAV.map(({ to, icon:Icon, label }) => {
              const active = loc.pathname === to;
              return (
                <Link key={to} to={to} style={{
                  display:"flex", alignItems:"center", gap:6, padding:"6px 12px",
                  borderRadius:6, fontSize:13, textDecoration:"none", transition:"all .15s",
                  color: active ? "#e4e4ec" : "#44445a",
                  background: active ? "#13131f" : "transparent",
                }}>
                  <Icon size={14} />
                  <span style={{ display: window.innerWidth < 500 ? "none" : "block" }}>{label}</span>
                </Link>
              );
            })}
            <button onClick={handleLogout} style={{
              padding:"6px 10px", borderRadius:6, background:"none",
              border:"none", color:"#44445a", cursor:"pointer", display:"flex",
              alignItems:"center", marginLeft:4, transition:"color .15s"
            }}
            onMouseEnter={e => e.currentTarget.style.color="#f87171"}
            onMouseLeave={e => e.currentTarget.style.color="#44445a"}>
              <LogOut size={14} />
            </button>
          </nav>
        </div>
      </header>
    </>
  );
}
