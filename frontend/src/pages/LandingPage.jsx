import React from "react";
import { Link } from "react-router-dom";
import { Shield, Activity, Globe, LayoutDashboard, ArrowRight } from "lucide-react";
import logo from "../assets/detect.png";

const FEATURES = [
  { icon:Shield,         label:"Risk scoring",     desc:"0–100 score per account. Genuine, Suspicious, or Fake.", to:"/admin/risk"          },
  { icon:Activity,       label:"Behavior analysis",desc:"Detects rapid actions, bot timing, repetitive patterns.",  to:"/admin/behavior"      },
  { icon:Globe,          label:"IP monitoring",    desc:"Flags location changes and suspicious login patterns.",    to:"/admin/ip-monitoring" },
  { icon:LayoutDashboard,label:"Admin dashboard",  desc:"Full overview of users, risk levels, and activity logs.", to:"/admin/dashboard"     },
];

const STEPS = [
  { n:"01", title:"Users join & act",    desc:"Register, post, like, comment on the simulated platform." },
  { n:"02", title:"System monitors",     desc:"Every action is silently logged and analyzed for patterns." },
  { n:"03", title:"Admin reviews",       desc:"Dashboard surfaces risk scores and flagged accounts." },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight:"100vh", background:"#09090f", color:"#e4e4ec",
                  fontFamily:"'Inter',system-ui,sans-serif", fontSize:14 }}>
    

      {/* Nav */}
      <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"16px 40px", borderBottom:"1px solid #1e1e30" }}>
         {/* Logo */}
         <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="LeafLine Logo" className="h-9 w-9 object-cover" />
          <span style={{ fontSize:15, fontWeight:600, color:"#818cf8", letterSpacing:"-.2px" }}>
          FakeDetect
        </span>
        </Link>

        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Link to="/login" style={{ padding:"6px 14px", background:"none",
                                      border:"1px solid #1e1e30", borderRadius:6,
                                      fontSize:13, color:"#8a8a9e", textDecoration:"none",
                                      transition:"all .15s" }}>
            Login
          </Link>
          <Link to="/register" style={{ padding:"6px 14px", background:"#818cf8",
                                         border:"none", borderRadius:6,
                                         fontSize:13, color:"#fff", textDecoration:"none",
                                         fontWeight:500 }}>
            Register
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth:640, margin:"0 auto", padding:"96px 24px 80px", textAlign:"center" }}>
        
        <h1 style={{ fontSize:48, fontWeight:300, letterSpacing:"-1.5px", lineHeight:1.15,
                     color:"#e4e4ec", marginBottom:16 }}>
          Fake Profile<br />
          <span style={{ color:"#818cf8" }}>Detection System</span>
        </h1>
        <p style={{ fontSize:16, color:"#44445a", lineHeight:1.7, marginBottom:36, maxWidth:480, margin:"0 auto 36px" }}>
          A simulated social media platform that analyzes user behavior,
          activity patterns, and risk factors to identify suspicious and
          fake accounts.
        </p>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, flexWrap:"wrap" }}>
          <Link to="/register" style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 20px",
                                         background:"#818cf8", borderRadius:8, fontSize:13,
                                         fontWeight:500, color:"#fff", textDecoration:"none" }}>
            Get started <ArrowRight size={13} />
          </Link>
          <Link to="/admin/dashboard" style={{ padding:"10px 20px", background:"none",
                                               border:"1px solid #1e1e30", borderRadius:8,
                                               fontSize:13, color:"#8a8a9e", textDecoration:"none" }}>
            Admin panel
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth:800, margin:"0 auto", padding:"0 24px 80px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1,
                      border:"1px solid #1e1e30", borderRadius:10, overflow:"hidden" }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ padding:"24px 20px", background:"#0e0e1a",
                                   borderRight: i<2 ? "1px solid #1e1e30" : "none" }}>
              <div style={{ fontSize:28, fontWeight:200, color:"#1e1e30", marginBottom:10,
                            fontVariantNumeric:"tabular-nums", letterSpacing:"-1px" }}>{s.n}</div>
              <div style={{ fontSize:13, fontWeight:500, color:"#e4e4ec", marginBottom:6 }}>{s.title}</div>
              <div style={{ fontSize:12, color:"#44445a", lineHeight:1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth:800, margin:"0 auto", padding:"0 24px 80px" }}>
        <div style={{ fontSize:10, fontWeight:600, letterSpacing:".12em", textTransform:"uppercase",
                      color:"#44445a", marginBottom:20, textAlign:"center" }}>
          Detection capabilities — all in admin panel
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
          {FEATURES.map(({ icon:Icon, label, desc, to }) => (
            <Link key={to} to={to} style={{ display:"flex", gap:14, padding:"16px 18px",
                                             background:"#0e0e1a", border:"1px solid #1e1e30",
                                             borderRadius:10, textDecoration:"none",
                                             transition:"border-color .15s", cursor:"pointer" }}
              onMouseEnter={e => e.currentTarget.style.borderColor="#2e2e46"}
              onMouseLeave={e => e.currentTarget.style.borderColor="#1e1e30"}>
              <Icon size={16} style={{ color:"#818cf8", flexShrink:0, marginTop:2 }} />
              <div>
                <div style={{ fontSize:13, fontWeight:500, color:"#e4e4ec", marginBottom:4 }}>{label}</div>
                <div style={{ fontSize:12, color:"#44445a", lineHeight:1.55 }}>{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop:"1px solid #1e1e30", padding:"20px 40px",
                       display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
        <span style={{ fontSize:12, color:"#2a2a3e" }}>
          © 2026 FakeDetect
        </span>
        <span style={{ fontSize:12, color:"#2a2a3e" }}>Ankit Kushwaha · U2449004</span>
      </footer>
    </div>
  );
}
