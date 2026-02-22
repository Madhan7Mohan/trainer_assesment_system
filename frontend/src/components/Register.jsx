import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #03070f; }
  .rg-root { min-height:100vh; background:#03070f; display:flex; font-family:'DM Mono',monospace; }
  .rg-left { width:38%; background:linear-gradient(160deg,#071828 0%,#030c18 100%); border-right:1px solid rgba(0,172,193,.1); display:flex; flex-direction:column; justify-content:center; padding:60px 48px; position:relative; overflow:hidden; flex-shrink:0; }
  @media(max-width:768px){.rg-left{display:none;}}
  .rg-left-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(0,172,193,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,172,193,.07) 1px,transparent 1px); background-size:32px 32px; }
  .rg-left-glow { position:absolute; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle,rgba(0,172,193,.18) 0%,transparent 65%); bottom:-100px; right:-100px; }
  .rg-logo { position:relative; display:flex; align-items:center; gap:10px; margin-bottom:56px; }
  .rg-logo-mark { width:36px; height:36px; border:2px solid #00ACC1; border-radius:8px; display:flex; align-items:center; justify-content:center; font-family:'Cabinet Grotesk',sans-serif; font-weight:800; font-size:16px; color:#00ACC1; }
  .rg-logo-text { font-family:'Cabinet Grotesk',sans-serif; font-weight:800; font-size:18px; color:#e2e8f0; }
  .rg-tagline { position:relative; font-family:'Cabinet Grotesk',sans-serif; font-size:36px; font-weight:800; color:#f1f5f9; line-height:1.15; margin-bottom:20px; }
  .rg-tagline span { color:#00ACC1; }
  .rg-desc { position:relative; font-size:13px; color:#64748b; line-height:1.7; margin-bottom:48px; }
  .rg-steps { position:relative; display:flex; flex-direction:column; gap:16px; }
  .rg-step { display:flex; align-items:center; gap:14px; font-size:12px; color:#94a3b8; }
  .rg-step-num { width:26px; height:26px; border-radius:50%; background:rgba(0,172,193,.12); border:1px solid rgba(0,172,193,.3); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#00ACC1; flex-shrink:0; }
  .rg-right { flex:1; display:flex; align-items:center; justify-content:center; padding:40px 24px; overflow-y:auto; }
  .rg-card { width:100%; max-width:500px; animation:cardIn .5s cubic-bezier(.16,1,.3,1); padding: 8px 0; }
  @keyframes cardIn { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  .rg-card-title { font-family:'Cabinet Grotesk',sans-serif; font-size:26px; font-weight:800; color:#f1f5f9; margin-bottom:4px; }
  .rg-card-sub { font-size:12px; color:#64748b; margin-bottom:22px; line-height:1.6; }
  .rg-card-sub a { color:#00ACC1; cursor:pointer; text-decoration:none; border-bottom:1px solid rgba(0,172,193,.35); padding-bottom:1px; }

  /* Role Toggle */
  .role-toggle { display:flex; gap:0; background:rgba(15,23,42,.9); border:1px solid rgba(148,163,184,.12); border-radius:10px; padding:4px; margin-bottom:22px; }
  .role-btn { flex:1; padding:9px 14px; border:none; border-radius:7px; font-family:'DM Mono',monospace; font-size:12px; font-weight:600; cursor:pointer; transition:all .2s; background:transparent; color:#64748b; }
  .role-btn.active.student { background:rgba(34,197,94,.15); color:#22c55e; box-shadow:0 0 0 1px rgba(34,197,94,.3); }
  .role-btn.active.trainer { background:rgba(0,172,193,.15); color:#00ACC1; box-shadow:0 0 0 1px rgba(0,172,193,.3); }
  .role-btn:not(.active):hover { color:#94a3b8; background:rgba(148,163,184,.05); }

  .rg-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .rg-full { grid-column:1/-1; }
  .rg-field { display:flex; flex-direction:column; }
  .rg-label { font-size:10px; font-weight:500; letter-spacing:1.5px; text-transform:uppercase; color:#94a3b8; margin-bottom:6px; }
  .rg-input { background:rgba(15,23,42,.9); border:1px solid rgba(148,163,184,.12); border-radius:9px; padding:11px 13px; font-family:'DM Mono',monospace; font-size:13px; color:#e2e8f0; outline:none; transition:border-color .2s,box-shadow .2s; width:100%; appearance:none; }
  .rg-input:focus { border-color:rgba(0,172,193,.5); box-shadow:0 0 0 3px rgba(0,172,193,.07); }
  .rg-input::placeholder { color:#334155; }
  .rg-input option { background:#0f172a; color:#e2e8f0; }
  .rg-input.err { border-color:rgba(239,68,68,.4); }
  .rg-err { font-size:10px; color:#f87171; margin-top:4px; }
  .rg-divider { height:1px; background:rgba(148,163,184,.08); margin:16px 0; }
  .rg-section-label { font-size:10px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:#475569; margin-bottom:14px; display:flex; align-items:center; gap:10px; }
  .rg-section-label::after { content:''; flex:1; height:1px; background:rgba(148,163,184,.08); }
  .rg-submit { width:100%; padding:13px; border:none; border-radius:10px; font-family:'Cabinet Grotesk',sans-serif; font-size:15px; font-weight:700; color:#fff; cursor:pointer; transition:all .2s; margin-top:20px; }
  .rg-submit.student-btn { background:linear-gradient(135deg,#22c55e,#16a34a); box-shadow:0 4px 20px rgba(34,197,94,.25); }
  .rg-submit.trainer-btn { background:linear-gradient(135deg,#00ACC1,#0891b2); box-shadow:0 4px 20px rgba(0,172,193,.25); }
  .rg-submit:hover:not(:disabled) { transform:translateY(-1px); filter:brightness(1.1); }
  .rg-submit:disabled { opacity:.5; cursor:not-allowed; }
  .rg-global-err { background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.2); border-radius:8px; padding:10px 14px; font-size:12px; color:#f87171; margin-top:14px; line-height:1.5; }
  .rg-global-ok  { background:rgba(34,197,94,.08);  border:1px solid rgba(34,197,94,.2);  border-radius:8px; padding:10px 14px; font-size:12px; color:#86efac; margin-top:14px; line-height:1.5; }

  /* Employee ID hint */
  .emp-hint { font-size:10px; color:#475569; margin-top:5px; font-style:italic; }
`;

const STREAMS = ["Java","Python","Frontend","Data Science","DevOps","QA"];
const DEPARTMENTS = ["Training","Development","QA","HR","Operations","Sales"];

export default function Register({ onRegistered, goToLogin }) {
  const [role, setRole] = useState("student"); // 'student' | 'trainer'

  const [form, setForm] = useState({
    name:"", email:"", password:"", confirmPassword:"",
    phone:"", dob:"", college:"", stream:"",
    // trainer-only
    department:"", employeeId:"",
  });
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [globalErr, setGlobalErr] = useState("");

  const set = (key) => (e) => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    setErrors(p => ({ ...p, [key]: "" }));
    setGlobalErr("");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                      e.name            = "Required";
    if (!form.email.includes("@"))              e.email           = "Valid email required";
    if (form.password.length < 6)              e.password        = "Min 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    if (!/^\d{10}$/.test(form.phone.trim()))   e.phone           = "10-digit number required";
    if (!form.dob)                              e.dob             = "Required";

    if (role === "student") {
      if (!form.college.trim()) e.college = "Required";
      if (!form.stream)         e.stream  = "Required";
    }
    if (role === "trainer") {
      if (!form.department)           e.department = "Required";
      if (!form.employeeId.trim())    e.employeeId = "Required";
      if (!/^[a-zA-Z0-9]+$/.test(form.employeeId.trim())) e.employeeId = "Alphanumeric only";
    }
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setGlobalErr("");

    const email = form.email.trim().toLowerCase();

    // Check duplicate
    const { data: existing } = await supabase
      .from("users").select("id").eq("email", email).maybeSingle();
    if (existing) {
      setGlobalErr("⚠ This email is already registered. Please sign in.");
      setLoading(false);
      return;
    }

    // Create auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: { data: { name: form.name.trim() } },
    });
    if (authError) { setGlobalErr(authError.message); setLoading(false); return; }

    const uid = authData.user?.id;

    // Build user row
    const userRow = {
      id:          uid,
      name:        form.name.trim(),
      email,
      phone:       form.phone.trim(),
      dob:         form.dob,
      role,
      // student fields
      college:     role === "student" ? form.college.trim() : null,
      stream:      role === "student" ? form.stream         : null,
      // trainer fields
      employee_id: role === "trainer" ? form.employeeId.trim().toUpperCase() : null,
    };

    const { data: prof, error: profError } = await supabase
      .from("users").insert([userRow]).select().single();

    if (profError) {
      setGlobalErr("Account created but profile save failed: " + profError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onRegistered(prof, authData.user);
  };

  const cls = (key) => `rg-input${errors[key] ? " err" : ""}`;

  return (
    <>
      <style>{css}</style>
      <div className="rg-root">
        {/* Left panel */}
        <div className="rg-left">
          <div className="rg-left-grid" /><div className="rg-left-glow" />
          <div className="rg-logo">
            <div className="rg-logo-mark">T</div>
            <span className="rg-logo-text">ThopsTech</span>
          </div>
          <h1 className="rg-tagline">Assess.<br /><span>Grow.</span><br />Excel.</h1>
          <p className="rg-desc">
            {role === "trainer"
              ? "The trainer portal — manage assessments, track student progress, stay updated with tech news."
              : "The student portal — practice coding, learn SQL/Java/Python, and take real assessments."}
          </p>
          <div className="rg-steps">
            {["Create your account","Log in to your portal","Practice & learn","Track your progress"].map((s,i) => (
              <div className="rg-step" key={i}>
                <div className="rg-step-num">{i+1}</div><span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="rg-right">
          <div className="rg-card">
            <h2 className="rg-card-title">Create Account</h2>
            <p className="rg-card-sub">Already registered? <a onClick={goToLogin}>Sign in here</a></p>

            {/* Role Toggle */}
            <div className="role-toggle">
              <button
                className={`role-btn ${role === "student" ? "active student" : ""}`}
                onClick={() => { setRole("student"); setErrors({}); }}>
                🎓 Student
              </button>
              <button
                className={`role-btn ${role === "trainer" ? "active trainer" : ""}`}
                onClick={() => { setRole("trainer"); setErrors({}); }}>
                👨‍🏫 Trainer
              </button>
            </div>

            <div className="rg-grid2">
              {/* Common fields */}
              <div className="rg-field rg-full">
                <label className="rg-label">Full Name</label>
                <input className={cls("name")} placeholder="e.g. Ravi Kumar" value={form.name} onChange={set("name")} />
                {errors.name && <span className="rg-err">⚠ {errors.name}</span>}
              </div>
              <div className="rg-field rg-full">
                <label className="rg-label">Email Address</label>
                <input className={cls("email")} type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
                {errors.email && <span className="rg-err">⚠ {errors.email}</span>}
              </div>
              <div className="rg-field">
                <label className="rg-label">Password</label>
                <input className={cls("password")} type="password" placeholder="Min 6 chars" value={form.password} onChange={set("password")} />
                {errors.password && <span className="rg-err">⚠ {errors.password}</span>}
              </div>
              <div className="rg-field">
                <label className="rg-label">Confirm Password</label>
                <input className={cls("confirmPassword")} type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={set("confirmPassword")} />
                {errors.confirmPassword && <span className="rg-err">⚠ {errors.confirmPassword}</span>}
              </div>

              <div className="rg-divider rg-full" />
              <div className="rg-full"><div className="rg-section-label">Personal Info</div></div>

              <div className="rg-field">
                <label className="rg-label">Mobile Number</label>
                <input className={cls("phone")} type="tel" placeholder="10-digit" value={form.phone} onChange={set("phone")} />
                {errors.phone && <span className="rg-err">⚠ {errors.phone}</span>}
              </div>
              <div className="rg-field">
                <label className="rg-label">Date of Birth</label>
                <input className={cls("dob")} type="date" value={form.dob} onChange={set("dob")} />
                {errors.dob && <span className="rg-err">⚠ {errors.dob}</span>}
              </div>

              {/* STUDENT-ONLY fields */}
              {role === "student" && (<>
                <div className="rg-field rg-full">
                  <label className="rg-label">College / Organization</label>
                  <input className={cls("college")} placeholder="e.g. IIT Madras / ThopsTech" value={form.college} onChange={set("college")} />
                  {errors.college && <span className="rg-err">⚠ {errors.college}</span>}
                </div>
                <div className="rg-field rg-full">
                  <label className="rg-label">Stream / Track</label>
                  <select className={cls("stream")} value={form.stream} onChange={set("stream")}>
                    <option value="">-- Select Stream --</option>
                    {STREAMS.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                  </select>
                  {errors.stream && <span className="rg-err">⚠ {errors.stream}</span>}
                </div>
              </>)}

              {/* TRAINER-ONLY fields */}
              {role === "trainer" && (<>
                <div className="rg-field rg-full">
                  <label className="rg-label">Department</label>
                  <select className={cls("department")} value={form.department} onChange={set("department")}>
                    <option value="">-- Select Department --</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d.toLowerCase()}>{d}</option>)}
                  </select>
                  {errors.department && <span className="rg-err">⚠ {errors.department}</span>}
                </div>
                <div className="rg-field rg-full">
                  <label className="rg-label">Employee ID</label>
                  <input className={cls("employeeId")} placeholder="e.g. 25KU001" value={form.employeeId}
                    onChange={set("employeeId")} style={{ textTransform:"uppercase" }} />
                  {errors.employeeId
                    ? <span className="rg-err">⚠ {errors.employeeId}</span>
                    : <span className="emp-hint">Format: YY + Last2 of surname + Serial (e.g. 25KU001) — alphanumeric</span>}
                </div>
              </>)}
            </div>

            <button
              className={`rg-submit ${role === "student" ? "student-btn" : "trainer-btn"}`}
              onClick={handleSubmit}
              disabled={loading}>
              {loading ? "Creating Account..." : `Create ${role === "trainer" ? "Trainer" : "Student"} Account →`}
            </button>
            {globalErr && <div className="rg-global-err">{globalErr}</div>}
          </div>
        </div>
      </div>
    </>
  );
}