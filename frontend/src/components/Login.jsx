import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #03070f; }
  .lg-root { min-height:100vh; background:#03070f; display:flex; font-family:'DM Mono',monospace; }
  .lg-left { width:38%; background:linear-gradient(160deg,#071828 0%,#030c18 100%); border-right:1px solid rgba(0,172,193,.1); display:flex; flex-direction:column; justify-content:center; padding:60px 48px; position:relative; overflow:hidden; flex-shrink:0; }
  .lg-left-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(0,172,193,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,172,193,.07) 1px,transparent 1px); background-size:32px 32px; }
  .lg-left-glow { position:absolute; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle,rgba(0,172,193,.18) 0%,transparent 65%); bottom:-100px; right:-100px; }
  .lg-logo { position:relative; display:flex; align-items:center; gap:10px; margin-bottom:56px; }
  .lg-logo-mark { width:36px; height:36px; border:2px solid #00ACC1; border-radius:8px; display:flex; align-items:center; justify-content:center; font-family:'Cabinet Grotesk',sans-serif; font-weight:800; font-size:16px; color:#00ACC1; }
  .lg-logo-text { font-family:'Cabinet Grotesk',sans-serif; font-weight:800; font-size:18px; color:#e2e8f0; }
  .lg-welcome { position:relative; }
  .lg-welcome-tag { display:inline-block; background:rgba(0,172,193,.1); border:1px solid rgba(0,172,193,.25); border-radius:20px; padding:4px 14px; font-size:11px; color:#00ACC1; letter-spacing:1px; text-transform:uppercase; margin-bottom:20px; }
  .lg-welcome-title { font-family:'Cabinet Grotesk',sans-serif; font-size:40px; font-weight:800; color:#f1f5f9; line-height:1.1; margin-bottom:16px; }
  .lg-welcome-title span { color:#00ACC1; }
  .lg-welcome-desc { font-size:13px; color:#64748b; line-height:1.7; margin-bottom:40px; }
  .lg-stats { display:flex; gap:28px; }
  .lg-stat-val { font-family:'Cabinet Grotesk',sans-serif; font-size:24px; font-weight:800; color:#00ACC1; }
  .lg-stat-lbl { font-size:11px; color:#475569; margin-top:2px; }
  .lg-right { flex:1; display:flex; align-items:center; justify-content:center; padding:40px 24px; }
  .lg-card { width:100%; max-width:400px; animation:cardIn .5s cubic-bezier(.16,1,.3,1); }
  @keyframes cardIn { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  .lg-card-title { font-family:'Cabinet Grotesk',sans-serif; font-size:26px; font-weight:800; color:#f1f5f9; margin-bottom:4px; }
  .lg-card-sub { font-size:12px; color:#64748b; margin-bottom:28px; }
  .lg-card-sub a { color:#00ACC1; cursor:pointer; text-decoration:none; border-bottom:1px solid rgba(0,172,193,.35); padding-bottom:1px; }
  .lg-field { display:flex; flex-direction:column; margin-bottom:14px; }
  .lg-label { font-size:10px; font-weight:500; letter-spacing:1.5px; text-transform:uppercase; color:#94a3b8; margin-bottom:6px; }
  .lg-input { background:rgba(15,23,42,.9); border:1px solid rgba(148,163,184,.12); border-radius:9px; padding:11px 13px; font-family:'DM Mono',monospace; font-size:13px; color:#e2e8f0; outline:none; transition:border-color .2s,box-shadow .2s; width:100%; }
  .lg-input:focus { border-color:rgba(0,172,193,.5); box-shadow:0 0 0 3px rgba(0,172,193,.07); }
  .lg-input::placeholder { color:#334155; }
  .lg-input.err { border-color:rgba(239,68,68,.4); }
  .lg-err { font-size:10px; color:#f87171; margin-top:4px; }
  .lg-submit { width:100%; padding:13px; background:linear-gradient(135deg,#00ACC1,#0891b2); border:none; border-radius:10px; font-family:'Cabinet Grotesk',sans-serif; font-size:15px; font-weight:700; color:#fff; cursor:pointer; transition:all .2s; box-shadow:0 4px 20px rgba(0,172,193,.25); margin-top:8px; }
  .lg-submit:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 7px 28px rgba(0,172,193,.38); }
  .lg-submit:disabled { opacity:.45; cursor:not-allowed; }
  .lg-global-err { background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.2); border-radius:8px; padding:10px 14px; font-size:12px; color:#f87171; margin-top:14px; line-height:1.5; }
`;

export default function Login({ onLoggedIn, goToRegister }) {
  const [form,      setForm]      = useState({ email: "", password: "" });
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [globalErr, setGlobalErr] = useState("");

  const set = (key) => (e) => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    setErrors(p => ({ ...p, [key]: "" }));
    setGlobalErr("");
  };

  const handleLogin = async () => {
    const e = {};
    if (!form.email.includes("@")) e.email    = "Valid email required";
    if (!form.password)            e.password = "Password required";
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true); setGlobalErr("");

    // Check if user is registered in public.users first
    const { data: existing } = await supabase
      .from("users").select("id").eq("email", form.email.trim().toLowerCase()).single();

    if (!existing) {
      setGlobalErr("No account found. Please register first.");
      setLoading(false);
      return;
    }

    // Sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email:    form.email.trim().toLowerCase(),
      password: form.password,
    });

    if (authError) {
      setGlobalErr(authError.message);
      setLoading(false);
      return;
    }

    // Fetch full profile
    const { data: prof, error: profError } = await supabase
      .from("users").select("*").eq("id", authData.user.id).single();

    if (profError || !prof) {
      setGlobalErr("Profile not found. Please register first.");
      setLoading(false);
      return;
    }

    setLoading(false);
    onLoggedIn(prof, authData.user);
  };

  const inputCls = (key) => `lg-input${errors[key] ? " err" : ""}`;

  return (
    <>
      <style>{css}</style>
      <div className="lg-root">
        <div className="lg-left">
          <div className="lg-left-grid" /><div className="lg-left-glow" />
          <div className="lg-logo">
            <div className="lg-logo-mark">T</div>
            <span className="lg-logo-text">ThopsTech</span>
          </div>
          <div className="lg-welcome">
            <div className="lg-welcome-tag">Assessment Portal</div>
            <h1 className="lg-welcome-title">Welcome<br />back.<br /><span>Let's code.</span></h1>
            <p className="lg-welcome-desc">Log in to access your practice sessions, take timed assessments, and track your performance.</p>
            <div className="lg-stats">
              <div className="lg-stat"><div className="lg-stat-val">20+</div><div className="lg-stat-lbl">Coding Problems</div></div>
              <div className="lg-stat"><div className="lg-stat-val">60</div><div className="lg-stat-lbl">MCQ Questions</div></div>
              <div className="lg-stat"><div className="lg-stat-val">80m</div><div className="lg-stat-lbl">Timed Test</div></div>
            </div>
          </div>
        </div>

        <div className="lg-right">
          <div className="lg-card">
            <h2 className="lg-card-title">Sign In</h2>
            <p className="lg-card-sub">No account? <a onClick={goToRegister}>Register here</a></p>

            <div className="lg-field">
              <label className="lg-label">Email Address</label>
              <input className={inputCls("email")} type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
              {errors.email && <span className="lg-err">⚠ {errors.email}</span>}
            </div>
            <div className="lg-field">
              <label className="lg-label">Password</label>
              <input className={inputCls("password")} type="password" placeholder="Your password" value={form.password} onChange={set("password")} />
              {errors.password && <span className="lg-err">⚠ {errors.password}</span>}
            </div>

            <button className="lg-submit" onClick={handleLogin} disabled={loading}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
            {globalErr && <div className="lg-global-err">⚠ {globalErr}</div>}
          </div>
        </div>
      </div>
    </>
  );
}