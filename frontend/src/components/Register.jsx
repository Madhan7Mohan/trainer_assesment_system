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
  .rg-card { width:100%; max-width:500px; animation:cardIn .5s cubic-bezier(.16,1,.3,1); padding:8px 0; }
  @keyframes cardIn { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  .rg-card-title { font-family:'Cabinet Grotesk',sans-serif; font-size:26px; font-weight:800; color:#f1f5f9; margin-bottom:4px; }
  .rg-card-sub { font-size:12px; color:#64748b; margin-bottom:22px; line-height:1.6; }
  .rg-card-sub a { color:#00ACC1; cursor:pointer; text-decoration:none; border-bottom:1px solid rgba(0,172,193,.35); padding-bottom:1px; }

  /* Role toggle */
  .role-toggle { display:flex; background:rgba(15,23,42,.9); border:1px solid rgba(148,163,184,.12); border-radius:10px; padding:4px; margin-bottom:22px; }
  .role-btn { flex:1; padding:9px 14px; border:none; border-radius:7px; font-family:'DM Mono',monospace; font-size:12px; font-weight:600; cursor:pointer; transition:all .2s; background:transparent; color:#64748b; }
  .role-btn.active.student { background:rgba(34,197,94,.15); color:#22c55e; box-shadow:0 0 0 1px rgba(34,197,94,.3); }
  .role-btn.active.trainer { background:rgba(0,172,193,.15); color:#00ACC1; box-shadow:0 0 0 1px rgba(0,172,193,.3); }
  .role-btn:not(.active):hover { color:#94a3b8; background:rgba(148,163,184,.05); }

  /* Mini toggle for inter/diploma */
  .mini-toggle { display:flex; background:rgba(15,23,42,.7); border:1px solid rgba(148,163,184,.1); border-radius:8px; padding:3px; grid-column:1/-1; }
  .mini-btn { flex:1; padding:8px 10px; border:none; border-radius:6px; font-family:'DM Mono',monospace; font-size:11px; font-weight:600; cursor:pointer; transition:all .2s; background:transparent; color:#475569; }
  .mini-btn.active-inter   { background:rgba(0,172,193,.15);  color:#00ACC1;  box-shadow:0 0 0 1px rgba(0,172,193,.25); }
  .mini-btn.active-diploma { background:rgba(249,115,22,.15); color:#f97316; box-shadow:0 0 0 1px rgba(249,115,22,.25); }
  .mini-btn:not([class*="active"]):hover { color:#94a3b8; }

  /* Masters toggle row */
  .masters-row { grid-column:1/-1; display:flex; align-items:center; justify-content:space-between; padding:13px 16px; background:rgba(167,139,250,.04); border:1px solid rgba(167,139,250,.15); border-radius:10px; cursor:pointer; transition:all .2s; user-select:none; }
  .masters-row:hover { border-color:rgba(167,139,250,.35); background:rgba(167,139,250,.08); }
  .masters-row-label { font-size:12px; color:#94a3b8; display:flex; align-items:center; gap:8px; }
  .masters-row-label strong { color:#a78bfa; }
  .masters-pill { padding:3px 10px; border-radius:20px; font-size:10px; font-weight:700; font-family:'DM Mono',monospace; transition:all .2s; }
  .masters-pill.off { background:rgba(148,163,184,.1); color:#475569; }
  .masters-pill.on  { background:rgba(167,139,250,.2); color:#a78bfa; border:1px solid rgba(167,139,250,.3); }

  /* Form */
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
  .rg-hint { font-size:10px; color:#475569; margin-top:5px; font-style:italic; }
  .rg-divider { height:1px; background:rgba(148,163,184,.08); margin:4px 0; grid-column:1/-1; }
  .rg-section-label { font-size:10px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:#475569; margin-bottom:14px; display:flex; align-items:center; gap:10px; }
  .rg-section-label::after { content:''; flex:1; height:1px; background:rgba(148,163,184,.08); }

  /* Section subheader inside grid */
  .edu-head { grid-column:1/-1; display:flex; align-items:center; gap:10px; font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; padding:10px 14px; border-radius:8px; margin-top:4px; }
  .edu-head::after { content:''; flex:1; height:1px; }
  .edu-head.degree  { color:#22c55e; background:rgba(34,197,94,.05);   border-left:3px solid #22c55e;  }
  .edu-head.degree::after  { background:rgba(34,197,94,.1); }
  .edu-head.masters { color:#a78bfa; background:rgba(167,139,250,.05); border-left:3px solid #a78bfa; }
  .edu-head.masters::after { background:rgba(167,139,250,.1); }
  .edu-head.inter   { color:#00ACC1; background:rgba(0,172,193,.05);   border-left:3px solid #00ACC1; }
  .edu-head.inter::after   { background:rgba(0,172,193,.1); }
  .edu-head.school  { color:#f97316; background:rgba(249,115,22,.05);  border-left:3px solid #f97316; }
  .edu-head.school::after  { background:rgba(249,115,22,.1); }

  /* Submit */
  .rg-submit { width:100%; padding:13px; border:none; border-radius:10px; font-family:'Cabinet Grotesk',sans-serif; font-size:15px; font-weight:700; color:#fff; cursor:pointer; transition:all .2s; margin-top:20px; }
  .rg-submit.student-btn { background:linear-gradient(135deg,#22c55e,#16a34a); box-shadow:0 4px 20px rgba(34,197,94,.25); }
  .rg-submit.trainer-btn { background:linear-gradient(135deg,#00ACC1,#0891b2); box-shadow:0 4px 20px rgba(0,172,193,.25); }
  .rg-submit:hover:not(:disabled) { transform:translateY(-1px); filter:brightness(1.1); }
  .rg-submit:disabled { opacity:.5; cursor:not-allowed; }
  .rg-global-err { background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.2); border-radius:8px; padding:10px 14px; font-size:12px; color:#f87171; margin-top:14px; line-height:1.5; }
  .rg-success { background:rgba(34,197,94,.08); border:1px solid rgba(34,197,94,.2); border-radius:8px; padding:10px 14px; font-size:12px; color:#4ade80; margin-top:14px; line-height:1.5; text-align:center; }
`;

const STREAMS        = ["Java Full Stack","Python Full Stack","Data Science","DevOps","Testing","Data Analytics","AI/ML"];
const GRAD_DEGREES   = ["B.E / B.Tech","B.Sc","B.Com","BCA","B.A","MBA","MCA","Other"];
const GRAD_BRANCHES  = ["Computer Science","Information Technology","Electronics & Communication","Electrical","Mechanical","Civil","Chemical","Biotechnology","Other"];
const MASTERS_DEG    = ["M.E / M.Tech","M.Sc","MCA","MBA","M.A","Other"];
const DEPARTMENTS    = ["Training","Development","QA","HR","Operations","Sales"];

export default function Register({ onRegistered, goToLogin }) {
  const [role,       setRole]       = useState("student");
  const [interType,  setInterType]  = useState("inter");
  const [hasMasters, setHasMasters] = useState(false);

  const [form, setForm] = useState({
    name:"", email:"", password:"", confirmPassword:"",
    phone:"", dob:"", gender:"", studentCardId:"",
    college:"", collegeState:"", graduationDegree:"", graduationBranch:"",
    stream:"", degreePercentage:"", degreePassoutYear:"",
    mastersCollege:"", mastersDegree:"", mastersPercentage:"", mastersPassoutYear:"",
    interCollege:"", interPercentage:"", interPassoutYear:"",
    diplomaCollege:"", diplomaPercentage:"", diplomaPassoutYear:"",
    schoolName:"", schoolPercentage:"", schoolPassoutYear:"",
    department:"", employeeId:"",
  });

  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [globalErr, setGlobalErr] = useState("");
  const [success,   setSuccess]   = useState(false);

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
      if (!form.gender)                   e.gender             = "Required";
      if (!form.studentCardId.trim())     e.studentCardId      = "Required";
      else if (!/^[a-zA-Z0-9]+$/.test(form.studentCardId.trim()))
                                          e.studentCardId      = "Alphanumeric only";
      if (!form.college.trim())           e.college            = "Required";
      if (!form.collegeState.trim())      e.collegeState       = "Required";
      if (!form.graduationDegree)         e.graduationDegree   = "Required";
      if (!form.graduationBranch)         e.graduationBranch   = "Required";
      if (!form.stream)                   e.stream             = "Required";
      if (!form.degreePercentage)         e.degreePercentage   = "Required";
      if (!form.degreePassoutYear)        e.degreePassoutYear  = "Required";
      if (hasMasters) {
        if (!form.mastersCollege.trim())  e.mastersCollege     = "Required";
        if (!form.mastersDegree)          e.mastersDegree      = "Required";
        if (!form.mastersPercentage)      e.mastersPercentage  = "Required";
        if (!form.mastersPassoutYear)     e.mastersPassoutYear = "Required";
      }
      if (interType === "inter") {
        if (!form.interCollege.trim())    e.interCollege       = "Required";
        if (!form.interPercentage)        e.interPercentage    = "Required";
        if (!form.interPassoutYear)       e.interPassoutYear   = "Required";
      } else {
        if (!form.diplomaCollege.trim())  e.diplomaCollege     = "Required";
        if (!form.diplomaPercentage)      e.diplomaPercentage  = "Required";
        if (!form.diplomaPassoutYear)     e.diplomaPassoutYear = "Required";
      }
      if (!form.schoolName.trim())        e.schoolName         = "Required";
      if (!form.schoolPercentage)         e.schoolPercentage   = "Required";
      if (!form.schoolPassoutYear)        e.schoolPassoutYear  = "Required";
    }

    if (role === "trainer") {
      if (!form.department)               e.department = "Required";
      if (!form.employeeId.trim())        e.employeeId = "Required";
      else if (!/^[a-zA-Z0-9]+$/.test(form.employeeId.trim()))
                                          e.employeeId = "Alphanumeric only";
    }
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true); setGlobalErr("");

    const email = form.email.trim().toLowerCase();

    // ── 1. Check for duplicate email in users table ──────────────────────────
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      setGlobalErr("⚠ This email is already registered. Please sign in.");
      setLoading(false);
      return;
    }

    // ── 2. Create auth user ──────────────────────────────────────────────────
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: { data: { name: form.name.trim() } },
    });

    if (authError) {
      setGlobalErr(authError.message);
      setLoading(false);
      return;
    }

    const id = authData?.user?.id;
    if (!id) {
      // Email confirmation is ON — user exists in auth but has no session yet.
      // We cannot insert into users table without the uid, so inform the user.
      setGlobalErr("⚠ Please check your email and confirm your address before logging in.");
      setLoading(false);
      return;
    }

    // ── 4. Build user row ────────────────────────────────────────────────────
    const S = role === "student";
    const T = role === "trainer";

    const userRow = {
      id,
      name:                 form.name.trim(),
      email,
      phone:                form.phone.trim(),
      dob:                  form.dob,
      role,
      // student personal
      gender:               S ? form.gender                                               : null,
      student_card_id:      S ? form.studentCardId.trim().toUpperCase()                  : null,
      // degree
      college:              S ? form.college.trim()                                       : null,
      college_state:        S ? form.collegeState.trim()                                  : null,
      graduation_stream:    S ? form.graduationDegree                                     : null,
      graduation_branch:    S ? form.graduationBranch                                     : null,
      stream:               S ? form.stream                                               : null,
      degree_percentage:    S ? parseFloat(form.degreePercentage)   || null              : null,
      degree_passout_year:  S ? parseInt(form.degreePassoutYear)    || null              : null,
      // masters
      has_masters:          S ? hasMasters                                                : false,
      masters_college:      S && hasMasters ? form.mastersCollege.trim()                 : null,
      masters_stream:       S && hasMasters ? form.mastersDegree                         : null,
      masters_percentage:   S && hasMasters ? parseFloat(form.mastersPercentage)  || null : null,
      masters_passout_year: S && hasMasters ? parseInt(form.mastersPassoutYear)   || null : null,
      // inter / diploma
      edu_after_inter:      S ? interType                                                 : null,
      inter_college:        S && interType === "inter"   ? form.interCollege.trim()       : null,
      inter_percentage:     S && interType === "inter"   ? parseFloat(form.interPercentage)   || null : null,
      inter_passout_year:   S && interType === "inter"   ? parseInt(form.interPassoutYear)    || null : null,
      diploma_college:      S && interType === "diploma" ? form.diplomaCollege.trim()     : null,
      diploma_percentage:   S && interType === "diploma" ? parseFloat(form.diplomaPercentage) || null : null,
      diploma_passout_year: S && interType === "diploma" ? parseInt(form.diplomaPassoutYear)  || null : null,
      // school
      school_name:          S ? form.schoolName.trim()                                   : null,
      school_percentage:    S ? parseFloat(form.schoolPercentage)   || null              : null,
      school_passout_year:  S ? parseInt(form.schoolPassoutYear)    || null              : null,
      // trainer
      department:           T ? form.department                                          : null,
      employee_id:          T ? form.employeeId.trim().toUpperCase()                     : null,
    };

    // ── 5. Insert profile row ────────────────────────────────────────────────
    const { error: profError } = await supabase.from("users").insert([userRow]);

    if (profError) {
      console.error("Profile insert error:", profError);
      setGlobalErr("Profile save failed: " + profError.message);
      setLoading(false);
      return;
    }

    // ── 6. Sign out AFTER insert so user isn't auto-logged in ────────────────
    await supabase.auth.signOut();

    // ── 6. Success → redirect to login ──────────────────────────────────────
    setLoading(false);
    setSuccess(true);
    setTimeout(() => goToLogin(), 2500); // show success message then go to login
  };

  const cls = (key) => `rg-input${errors[key] ? " err" : ""}`;

  if (success) {
    return (
      <>
        <style>{css}</style>
        <div className="rg-root" style={{ alignItems:"center", justifyContent:"center" }}>
          <div style={{ textAlign:"center", padding:"40px" }}>
            <div style={{ fontSize:"48px", marginBottom:"16px" }}>✅</div>
            <h2 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", color:"#4ade80", fontSize:"24px", marginBottom:"8px" }}>
              Account Created!
            </h2>
            <p style={{ color:"#64748b", fontSize:"13px", fontFamily:"'DM Mono',monospace" }}>
              Redirecting you to login...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="rg-root">

        {/* ── Left panel ── */}
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
              <div className="rg-step" key={i}><div className="rg-step-num">{i+1}</div><span>{s}</span></div>
            ))}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="rg-right">
          <div className="rg-card">
            <h2 className="rg-card-title">Create Account</h2>
            <p className="rg-card-sub">Already registered? <a onClick={goToLogin}>Sign in here</a></p>

            <div className="role-toggle">
              <button className={`role-btn ${role==="student"?"active student":""}`}
                onClick={() => { setRole("student"); setErrors({}); }}>🎓 Student</button>
              <button className={`role-btn ${role==="trainer"?"active trainer":""}`}
                onClick={() => { setRole("trainer"); setErrors({}); }}>👨‍🏫 Trainer</button>
            </div>

            <div className="rg-grid2">

              {/* ── Common ── */}
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
              <div className="rg-divider" />
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

              {/* ══ STUDENT FIELDS ══ */}
              {role === "student" && (<>

                <div className="rg-field">
                  <label className="rg-label">Gender</label>
                  <select className={cls("gender")} value={form.gender} onChange={set("gender")}>
                    <option value="">-- Select --</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <span className="rg-err">⚠ {errors.gender}</span>}
                </div>
                <div className="rg-field">
                  <label className="rg-label">Student Card ID</label>
                  <input className={cls("studentCardId")} placeholder="------"
                    value={form.studentCardId} onChange={set("studentCardId")} style={{ textTransform:"uppercase" }} />
                  {errors.studentCardId
                    ? <span className="rg-err">⚠ {errors.studentCardId}</span>
                    : <span className="rg-hint">Check Your ID Card</span>}
                </div>

                {/* ── DEGREE / UG ── */}
                <div className="edu-head degree">🎓 Degree / UG</div>
                <div className="rg-field rg-full">
                  <label className="rg-label">College / University Name</label>
                  <input className={cls("college")} placeholder="e.g. SVR Engineering College" value={form.college} onChange={set("college")} />
                  {errors.college && <span className="rg-err">⚠ {errors.college}</span>}
                </div>
                <div className="rg-field rg-full">
                  <label className="rg-label">College State</label>
                  <input className={cls("collegeState")} placeholder="e.g. Andhra Pradesh" value={form.collegeState} onChange={set("collegeState")} />
                  {errors.collegeState && <span className="rg-err">⚠ {errors.collegeState}</span>}
                </div>
                <div className="rg-field">
                  <label className="rg-label">Graduation Degree</label>
                  <select className={cls("graduationDegree")} value={form.graduationDegree} onChange={set("graduationDegree")}>
                    <option value="">-- Select --</option>
                    {GRAD_DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.graduationDegree && <span className="rg-err">⚠ {errors.graduationDegree}</span>}
                </div>
                <div className="rg-field">
                  <label className="rg-label">Branch / Specialisation</label>
                  <select className={cls("graduationBranch")} value={form.graduationBranch} onChange={set("graduationBranch")}>
                    <option value="">-- Select --</option>
                    {GRAD_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  {errors.graduationBranch && <span className="rg-err">⚠ {errors.graduationBranch}</span>}
                </div>
                <div className="rg-field rg-full">
                  <label className="rg-label">ThopsTech Track</label>
                  <select className={cls("stream")} value={form.stream} onChange={set("stream")}>
                    <option value="">-- Select Track --</option>
                    {STREAMS.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                  </select>
                  {errors.stream && <span className="rg-err">⚠ {errors.stream}</span>}
                </div>
                <div className="rg-field">
                  <label className="rg-label">Degree Percentage (%)</label>
                  <input className={cls("degreePercentage")} type="number" min="0" max="100" step="0.01"
                    placeholder="e.g. 82.5" value={form.degreePercentage} onChange={set("degreePercentage")} />
                  {errors.degreePercentage && <span className="rg-err">⚠ {errors.degreePercentage}</span>}
                </div>
                <div className="rg-field">
                  <label className="rg-label">Passed Out Year</label>
                  <input className={cls("degreePassoutYear")} type="number" min="2000" max="2035"
                    placeholder="e.g. 2024" value={form.degreePassoutYear} onChange={set("degreePassoutYear")} />
                  {errors.degreePassoutYear && <span className="rg-err">⚠ {errors.degreePassoutYear}</span>}
                </div>

                {/* ── MASTERS toggle ── */}
                <div className="masters-row" onClick={() => setHasMasters(h => !h)}>
                  <span className="masters-row-label">
                    🏛️ <strong>Masters / PG</strong> — did you pursue a masters degree?
                  </span>
                  <span className={`masters-pill ${hasMasters ? "on" : "off"}`}>
                    {hasMasters ? "YES — fill below ↓" : "NO"}
                  </span>
                </div>

                {hasMasters && (<>
                  <div className="edu-head masters">🏛️ Masters / PG</div>
                  <div className="rg-field rg-full">
                    <label className="rg-label">Masters College / University</label>
                    <input className={cls("mastersCollege")} placeholder="e.g. IIT Madras"
                      value={form.mastersCollege} onChange={set("mastersCollege")} />
                    {errors.mastersCollege && <span className="rg-err">⚠ {errors.mastersCollege}</span>}
                  </div>
                  <div className="rg-field rg-full">
                    <label className="rg-label">Masters Degree</label>
                    <select className={cls("mastersDegree")} value={form.mastersDegree} onChange={set("mastersDegree")}>
                      <option value="">-- Select --</option>
                      {MASTERS_DEG.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.mastersDegree && <span className="rg-err">⚠ {errors.mastersDegree}</span>}
                  </div>
                  <div className="rg-field">
                    <label className="rg-label">Masters Percentage (%)</label>
                    <input className={cls("mastersPercentage")} type="number" min="0" max="100" step="0.01"
                      placeholder="e.g. 78.0" value={form.mastersPercentage} onChange={set("mastersPercentage")} />
                    {errors.mastersPercentage && <span className="rg-err">⚠ {errors.mastersPercentage}</span>}
                  </div>
                  <div className="rg-field">
                    <label className="rg-label">Passed Out Year</label>
                    <input className={cls("mastersPassoutYear")} type="number" min="2000" max="2035"
                      placeholder="e.g. 2026" value={form.mastersPassoutYear} onChange={set("mastersPassoutYear")} />
                    {errors.mastersPassoutYear && <span className="rg-err">⚠ {errors.mastersPassoutYear}</span>}
                  </div>
                </>)}

                {/* ── INTER / DIPLOMA toggle ── */}
                <div className="edu-head inter">
                  {interType === "inter" ? "📘 Intermediate / 12th" : "📄 Diploma"}
                </div>
                <div className="mini-toggle">
                  <button
                    className={`mini-btn${interType === "inter" ? " active-inter" : ""}`}
                    onClick={() => {
                      setInterType("inter");
                      setForm(p => ({ ...p, diplomaCollege:"", diplomaPercentage:"", diplomaPassoutYear:"" }));
                      setErrors(p => ({ ...p, diplomaCollege:"", diplomaPercentage:"", diplomaPassoutYear:"" }));
                    }}>
                    📘 Intermediate / 12th
                  </button>
                  <button
                    className={`mini-btn${interType === "diploma" ? " active-diploma" : ""}`}
                    onClick={() => {
                      setInterType("diploma");
                      setForm(p => ({ ...p, interCollege:"", interPercentage:"", interPassoutYear:"" }));
                      setErrors(p => ({ ...p, interCollege:"", interPercentage:"", interPassoutYear:"" }));
                    }}>
                    📄 Diploma
                  </button>
                </div>

                {interType === "inter" && (<>
                  <div className="rg-field rg-full">
                    <label className="rg-label">Inter College Name</label>
                    <input className={cls("interCollege")} placeholder="e.g. Sri Chaitanya Junior College"
                      value={form.interCollege} onChange={set("interCollege")} />
                    {errors.interCollege && <span className="rg-err">⚠ {errors.interCollege}</span>}
                  </div>
                  <div className="rg-field">
                    <label className="rg-label">Inter Percentage (%)</label>
                    <input className={cls("interPercentage")} type="number" min="0" max="100" step="0.01"
                      placeholder="e.g. 91.2" value={form.interPercentage} onChange={set("interPercentage")} />
                    {errors.interPercentage && <span className="rg-err">⚠ {errors.interPercentage}</span>}
                  </div>
                  <div className="rg-field">
                    <label className="rg-label">Passed Out Year</label>
                    <input className={cls("interPassoutYear")} type="number" min="2000" max="2035"
                      placeholder="e.g. 2021" value={form.interPassoutYear} onChange={set("interPassoutYear")} />
                    {errors.interPassoutYear && <span className="rg-err">⚠ {errors.interPassoutYear}</span>}
                  </div>
                </>)}

                {interType === "diploma" && (<>
                  <div className="rg-field rg-full">
                    <label className="rg-label">Diploma College Name</label>
                    <input className={cls("diplomaCollege")} placeholder="e.g. Govt. Polytechnic College"
                      value={form.diplomaCollege} onChange={set("diplomaCollege")} />
                    {errors.diplomaCollege && <span className="rg-err">⚠ {errors.diplomaCollege}</span>}
                  </div>
                  <div className="rg-field">
                    <label className="rg-label">Diploma Percentage (%)</label>
                    <input className={cls("diplomaPercentage")} type="number" min="0" max="100" step="0.01"
                      placeholder="e.g. 78.5" value={form.diplomaPercentage} onChange={set("diplomaPercentage")} />
                    {errors.diplomaPercentage && <span className="rg-err">⚠ {errors.diplomaPercentage}</span>}
                  </div>
                  <div className="rg-field">
                    <label className="rg-label">Passed Out Year</label>
                    <input className={cls("diplomaPassoutYear")} type="number" min="2000" max="2035"
                      placeholder="e.g. 2021" value={form.diplomaPassoutYear} onChange={set("diplomaPassoutYear")} />
                    {errors.diplomaPassoutYear && <span className="rg-err">⚠ {errors.diplomaPassoutYear}</span>}
                  </div>
                </>)}

                {/* ── SCHOOL / 10TH ── */}
                <div className="edu-head school">🏫 School / 10th</div>
                <div className="rg-field rg-full">
                  <label className="rg-label">School Name</label>
                  <input className={cls("schoolName")} placeholder="e.g. DAV Public School"
                    value={form.schoolName} onChange={set("schoolName")} />
                  {errors.schoolName && <span className="rg-err">⚠ {errors.schoolName}</span>}
                </div>
                <div className="rg-field">
                  <label className="rg-label">10th Percentage (%)</label>
                  <input className={cls("schoolPercentage")} type="number" min="0" max="100" step="0.01"
                    placeholder="e.g. 88.0" value={form.schoolPercentage} onChange={set("schoolPercentage")} />
                  {errors.schoolPercentage && <span className="rg-err">⚠ {errors.schoolPercentage}</span>}
                </div>
                <div className="rg-field">
                  <label className="rg-label">Passed Out Year</label>
                  <input className={cls("schoolPassoutYear")} type="number" min="2000" max="2035"
                    placeholder="e.g. 2019" value={form.schoolPassoutYear} onChange={set("schoolPassoutYear")} />
                  {errors.schoolPassoutYear && <span className="rg-err">⚠ {errors.schoolPassoutYear}</span>}
                </div>

              </>)}
              {/* ══ END STUDENT ══ */}

              {/* ── TRAINER ── */}
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
                  <input className={cls("employeeId")} placeholder="e.g. 25KU001"
                    value={form.employeeId} onChange={set("employeeId")} style={{ textTransform:"uppercase" }} />
                  {errors.employeeId
                    ? <span className="rg-err">⚠ {errors.employeeId}</span>
                    : <span className="rg-hint">YY + Last 2 of surname + Serial (e.g. 25KU001)</span>}
                </div>
              </>)}

            </div>

            <button className={`rg-submit ${role==="student"?"student-btn":"trainer-btn"}`}
              onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating Account..." : `Create ${role==="trainer"?"Trainer":"Student"} Account →`}
            </button>
            {globalErr && <div className="rg-global-err">{globalErr}</div>}
          </div>
        </div>
      </div>
    </>
  );
}