import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&family=DM+Mono:wght@300;400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* 🔥 BACKGROUND UPGRADE */
body {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
}

/* ROOT */
.rg-root {
  min-height:100vh;
  display:flex;
  font-family:'DM Mono',monospace;
}

/* LEFT PANEL */
.rg-left {
  width:38%;
  background:#2563eb;
  border-right:1px solid #e2e8f0;
  display:flex;
  flex-direction:column;
  justify-content:flex-start;
  padding:60px 48px;
  position:relative;
}

@media(max-width:768px){.rg-left{display:none;}}

.rg-left-grid {
  position:absolute;
  inset:0;
  background-image:
    linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px);
  background-size:32px 32px;
}

/* LOGO */
.rg-logo { display:flex; align-items:center; gap:10px; margin-bottom:56px; }

.rg-logo-mark {
  width:36px; height:36px;
  border:2px solid #ffffff;
  border-radius:8px;
  display:flex; align-items:center; justify-content:center;
  font-weight:800;
  color:#ffffff;
}

.rg-logo-text {
  font-family:'Cabinet Grotesk',sans-serif;
  font-weight:800;
  font-size:18px;
  color:#ffffff;
}

/* LEFT TEXT */
.rg-tagline {
  font-family:'Cabinet Grotesk',sans-serif;
  font-size:36px;
  font-weight:800;
  color:#ffffff;
  margin-bottom:20px;
  line-height:1.2;
}

.rg-tagline span { color:#dbeafe; }

.rg-desc {
  font-size:13px;
  color:#dbeafe;
  margin-bottom:48px;
}

/* STEPS */
.rg-step {
  display:flex;
  align-items:center;
  gap:14px;
  font-size:12px;
  color:#dbeafe;
}

.rg-step-num {
  width:26px; height:26px;
  border-radius:50%;
  background:#ffffff;
  color:#2563eb;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:700;
}

/* RIGHT */
.rg-right {
  flex:1;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:40px 24px;
}

/* 💎 CARD PREMIUM */
.rg-card {
  width:100%;
  max-width:500px;
  background:#ffffff;
  border-radius:16px;
  box-shadow:0 20px 50px rgba(37,99,235,0.15);
  padding:24px;
}

/* TEXT */
.rg-card-title {
  font-family:'Cabinet Grotesk',sans-serif;
  font-size:28px;
  font-weight:800;
  color:#2563eb;
  letter-spacing:0.5px;
}

.rg-card-sub {
  font-size:12px;
  color:#64748b;
  margin-bottom:22px;
}

.rg-card-sub a {
  color:#2563eb;
  text-decoration:none;
}

/* FIELD SPACING */
.rg-field {
  margin-bottom:14px;
}

/* LABEL */
.rg-label {
  font-size:11px;
  color:#2563eb;
  margin-bottom:4px;
  font-weight:700;
}

/* INPUT */
.rg-input {
  width:100%;
  background:#ffffff;
  border:1px solid #cbd5e1;
  border-radius:4px;
  padding:8px 10px;
  font-size:14px;
  color:#0f172a;
  outline:none;
  transition:0.2s;
}

.rg-input::placeholder {
  font-size:12px;
  color:#9ca3af;
}

/* ✨ FOCUS EFFECT */
.rg-input:focus {
  border-color:#2563eb;
  transform:scale(1.01);
}

/* ROLE BUTTON */
.role-toggle {
  display:flex;
  background:#eff6ff;
  border:1px solid #e2e8f0;
  border-radius:8px;
  padding:4px;
  margin-bottom:22px;
}

.role-btn {
  flex:1;
  padding:8px;
  border:none;
  border-radius:6px;
  background:transparent;
  color:#64748b;
  cursor:pointer;
}

.role-btn.active.student {
  background: #2563eb;   /* main blue */
  color: #ffffff;        /* white text */
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);

}

/* TOGGLE */
.mini-toggle {
  display:flex;
  gap:8px;
  background:#eff6ff;
  border:1px solid #e2e8f0;
  border-radius:6px;
  padding:4px;
  margin-top:8px;
}

.mini-btn {
  flex:1;
  padding:8px 12px;
  border:none;
  border-radius:4px;
  font-size:13px;
  font-weight:600;
  cursor:pointer;
  background:#ffffff;
  color:#2563eb;
  transition:0.2s;
}

.mini-btn.active-inter,
.mini-btn.active-diploma {
  background:#2563eb;
  color:#ffffff;
}

.mini-btn:hover {
  background:#dbeafe;
}

/* SECTION HEAD */
.rg-section-label,
.edu-head {
  color:#2563eb;
  background:linear-gradient(90deg,#eff6ff,#dbeafe);
  border-left:4px solid #2563eb;
  padding:8px 12px;
  border-radius:6px;
  margin-top:12px;
  font-size:12px;
  font-weight:700;
}

.edu-head::after,
.rg-section-label::after {
  content:'';
  flex:1;
  height:1px;
  background:rgba(37,99,235,.2);
}

/* ERROR */
.rg-error {
  font-size:11px;
  color:#ef4444;
  margin-top:4px;
  display:flex;
  align-items:center;
  gap:6px;
}
  .rg-hint {
  font-size: 10px;
  color: #94a3b8;   /* lighter color */
  margin-top: 2px;
}

.rg-error svg {
  width:12px;
  height:12px;
}
  .rg-field {
  position: relative;
}

.rg-field {
  position: relative;
  margin-top: 18px;   /* 🔥 ADD THIS */
  margin-bottom: 16px;
}
  .rg-section-label {
  margin-bottom: 12px;   /* 🔥 important */
}
  .masters-row-label {
  font-size: 11px;        /* 🔽 reduce size */
  color: #64748b;         /* softer gray */
  font-weight: 500;       /* not too bold */
}

.rg-floating-label {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  color: #9ca3af;
  background: #fff;
  padding: 0 4px;
  transition: 0.2s;
  pointer-events: none;
}
.rg-input.has-value + .rg-floating-label {
  top: -7px;
  font-size: 11px;
  color: #2563eb;
}
.rg-input:focus + .rg-floating-label,
.rg-input:not(:placeholder-shown) + .rg-floating-label,
select:focus + .rg-floating-label,
select:not([value=""]) + .rg-floating-label {
  top: -7px;
  font-size: 11px;
  color: #2563eb;
}
  

.rg-input:focus + .rg-floating-label,
.rg-input:not(:placeholder-shown) + .rg-floating-label {
  top: -7px;
  font-size: 11px;
  color: #2563eb;
}
/* layout */
.masters-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

/* label */
.masters-label {
  font-size: 12px;
  color: #2563eb;
  font-weight: 600;
}

/* switch container */
.switch {
  position: relative;
  width: 40px;
  height: 20px;
}

/* hide checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* slider background */
.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #cbd5e1;
  border-radius: 20px;
  transition: 0.3s;
}

/* circle */
.slider::before {
  content: "";
  position: absolute;
  height: 14px;
  width: 14px;
  left: 3px;
  top: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.3s;
}

/* active state */
.switch input:checked + .slider {
  background-color: #2563eb;
}

.switch input:checked + .slider::before {
  transform: translateX(20px);
}

/* yes/no text */
.toggle-text {
  font-size: 11px;
  color: #64748b;
}
  .custom-file input {
  display: none;
}

.custom-file {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 6px;
}

/* 🔵 Button */
.file-btn {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.25s;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.3);
}

/* Hover effect */
.file-btn:hover {
  transform: translateY(-2px);
  
}

/* 📄 File name */
.file-name {
  font-size: 13px;
  color: #059669;   /* green success */
  font-weight: 600;
  background: #ecfdf5;
  padding: 6px 10px;
  border-radius: 6px;
}
/* 💎 BUTTON PREMIUM */
.rg-submit.student-btn {
  width:100%;
  padding:13px;
  border:none;
  border-radius:10px;
  font-weight:700;
  color:#fff;
  background:linear-gradient(135deg,#2563eb,#3b82f6);
  margin-top:20px;
  cursor:pointer;
  font-size:15px;
  letter-spacing:0.5px;
  box-shadow:0 8px 20px rgba(37,99,235,0.3);
  transition:0.2s;
}

.rg-submit:hover {
  transform:translateY(-2px);
}
`;

const STREAMS       = ["Java Full Stack","Python Full Stack","Data Science","DevOps","Testing","Data Analytics","AI/ML"];

// ── Pre-approved trainer employee IDs (case-insensitive) ────────────────────
const APPROVED_EMPLOYEE_IDS = [
  "2405K39", "2504P41", "2508J42", "2103J02","2303R35","2310K38","2601K45"
  // Add more IDs here when needed
];
const GRAD_DEGREES  = ["B.E / B.Tech","B.Sc","B.Com","BCA","B.A","MBA","MCA","Other"];
const GRAD_BRANCHES = ["Computer Science","Information Technology","Electronics & Communication","Electrical","Mechanical","Civil","Chemical","Biotechnology","Other"];
const MASTERS_DEG   = ["M.E / M.Tech","M.Sc","MCA","MBA","M.A","Other"];
const DEPARTMENTS   = ["Training","Development","QA","HR","Operations","Sales"];

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
    department:"", employeeId:"",resume:null,
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
    if (form.password.length < 6)               e.password        = "Min 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    if (!/^\d{10}$/.test(form.phone.trim()))    e.phone           = "10-digit number required";
    if (!form.dob)                              e.dob             = "Required";
    if (role === "student") {
      if (!form.gender)               e.gender            = "Required";
      if (!form.studentCardId.trim()) e.studentCardId     = "Required";
      else if (!/^[a-zA-Z0-9]+$/.test(form.studentCardId.trim()))
                                      e.studentCardId     = "Alphanumeric only";
      if (!form.college.trim())       e.college           = "Required";
      if (!form.collegeState.trim())  e.collegeState      = "Required";
      if (!form.graduationDegree)     e.graduationDegree  = "Required";
      if (!form.graduationBranch)     e.graduationBranch  = "Required";
      if (!form.stream)               e.stream            = "Required";
      if (!form.degreePercentage)     e.degreePercentage  = "Required";
      if (!form.degreePassoutYear)    e.degreePassoutYear = "Required";
      if (hasMasters) {
        if (!form.mastersCollege.trim()) e.mastersCollege     = "Required";
        if (!form.mastersDegree)         e.mastersDegree      = "Required";
        if (!form.mastersPercentage)     e.mastersPercentage  = "Required";
        if (!form.mastersPassoutYear)    e.mastersPassoutYear = "Required";
      }
      if (interType === "inter") {
        if (!form.interCollege.trim()) e.interCollege     = "Required";
        if (!form.interPercentage)     e.interPercentage  = "Required";
        if (!form.interPassoutYear)    e.interPassoutYear = "Required";
      } else {
        if (!form.diplomaCollege.trim()) e.diplomaCollege     = "Required";
        if (!form.diplomaPercentage)     e.diplomaPercentage  = "Required";
        if (!form.diplomaPassoutYear)    e.diplomaPassoutYear = "Required";
      }
      if (!form.schoolName.trim())  e.schoolName       = "Required";
      if (!form.schoolPercentage)   e.schoolPercentage = "Required";
      if (!form.schoolPassoutYear)  e.schoolPassoutYear= "Required";
    
       // ✅ Resume validation
if (!form.resume) {
  e.resume = "Resume required";
} else if (form.resume.size > 2 * 1024 * 1024) {
  e.resume = "Max 2MB allowed";
} else if (
  !["application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ].includes(form.resume.type)
) {
  e.resume = "Only PDF/DOC allowed";
}
    }
    if (role === "trainer") {
      if (!form.department)        e.department = "Required";
      if (!form.employeeId.trim()) e.employeeId = "Required";
      else if (!/^[a-zA-Z0-9]+$/.test(form.employeeId.trim()))
                                   e.employeeId = "Alphanumeric only";
      else if (!APPROVED_EMPLOYEE_IDS.includes(form.employeeId.trim().toUpperCase()))
                                   e.employeeId = "This Employee ID is not approved for registration";
    }
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setGlobalErr("");

    const email = form.email.trim().toLowerCase();

    // ── 1. Duplicate email check ─────────────────────────────────────────────
    const { data: existing } = await supabase
      .from("users").select("id").eq("email", email).maybeSingle();
    if (existing) {
      setGlobalErr("⚠ This email is already registered. Please sign in.");
      setLoading(false);
      return;
    }

    // ── 1b. Trainer: duplicate employee ID check ──────────────────────────────
    if (role === "trainer") {
      const empId = form.employeeId.trim().toUpperCase();
      const { data: existingEmp } = await supabase
        .from("users").select("id").eq("employee_id", empId).maybeSingle();
      if (existingEmp) {
        setGlobalErr("⚠ This Employee ID already has a registered account.");
        setLoading(false);
        return;
      }
    }

    // ── 2. Create auth user ──────────────────────────────────────────────────
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: form.password,
      options:  { data: { name: form.name.trim() } },
    });
    if (authError) {
      setGlobalErr(authError.message);
      setLoading(false);
      return;
    }
    const id = authData?.user?.id;
    if (!id) {
      setGlobalErr("⚠ Please confirm your email before logging in.");
      setLoading(false);
      return;
    }

    // ── 3. Build profile row ─────────────────────────────────────────────────
    const S = role === "student";
    const T = role === "trainer";
    const userRow = {
      id,
      name:                 form.name.trim(),
      email,
      phone:                form.phone.trim(),
      dob:                  form.dob,
      role,
      gender:               S ? form.gender                                                 : null,
      student_card_id:      S ? form.studentCardId.trim().toUpperCase()                    : null,
      college:              S ? form.college.trim()                                         : null,
      college_state:        S ? form.collegeState.trim()                                    : null,
      graduation_stream:    S ? form.graduationDegree                                       : null,
      graduation_branch:    S ? form.graduationBranch                                       : null,
      stream:               S ? form.stream                                                 : null,
      degree_percentage:    S ? parseFloat(form.degreePercentage)     || null              : null,
      degree_passout_year:  S ? parseInt(form.degreePassoutYear)      || null              : null,
      has_masters:          S ? hasMasters                                                  : false,
      masters_college:      S && hasMasters ? form.mastersCollege.trim()                   : null,
      masters_stream:       S && hasMasters ? form.mastersDegree                           : null,
      masters_percentage:   S && hasMasters ? parseFloat(form.mastersPercentage)   || null : null,
      masters_passout_year: S && hasMasters ? parseInt(form.mastersPassoutYear)    || null : null,
      edu_after_inter:      S ? interType                                                   : null,
      inter_college:        S && interType === "inter"   ? form.interCollege.trim()         : null,
      inter_percentage:     S && interType === "inter"   ? parseFloat(form.interPercentage)   || null : null,
      inter_passout_year:   S && interType === "inter"   ? parseInt(form.interPassoutYear)    || null : null,
      diploma_college:      S && interType === "diploma" ? form.diplomaCollege.trim()       : null,
      diploma_percentage:   S && interType === "diploma" ? parseFloat(form.diplomaPercentage) || null : null,
      diploma_passout_year: S && interType === "diploma" ? parseInt(form.diplomaPassoutYear)  || null : null,
      school_name:          S ? form.schoolName.trim()                                     : null,
      school_percentage:    S ? parseFloat(form.schoolPercentage)     || null              : null,
      school_passout_year:  S ? parseInt(form.schoolPassoutYear)      || null              : null,
      department:           T ? form.department                                            : null,
      employee_id:          T ? form.employeeId.trim().toUpperCase()                       : null,
    };

    // ── 4. INSERT via RPC (SECURITY DEFINER — bypasses RLS entirely) ───────
    //    Direct insert fails because signUp session is invalidated before
    //    our insert runs. The DB function runs as DB owner, no session needed.
    const { error: profError } = await supabase.rpc("create_user_profile", {
      p_id:                   userRow.id,
      p_name:                 userRow.name,
      p_email:                userRow.email,
      p_phone:                userRow.phone,
      p_dob:                  userRow.dob,
      p_role:                 userRow.role,
      p_gender:               userRow.gender,
      p_student_card_id:      userRow.student_card_id,
      p_college:              userRow.college,
      p_college_state:        userRow.college_state,
      p_graduation_stream:    userRow.graduation_stream,
      p_graduation_branch:    userRow.graduation_branch,
      p_stream:               userRow.stream,
      p_degree_percentage:    userRow.degree_percentage,
      p_degree_passout_year:  userRow.degree_passout_year,
      p_has_masters:          userRow.has_masters,
      p_masters_college:      userRow.masters_college,
      p_masters_stream:       userRow.masters_stream,
      p_masters_percentage:   userRow.masters_percentage,
      p_masters_passout_year: userRow.masters_passout_year,
      p_edu_after_inter:      userRow.edu_after_inter,
      p_inter_college:        userRow.inter_college,
      p_inter_percentage:     userRow.inter_percentage,
      p_inter_passout_year:   userRow.inter_passout_year,
      p_diploma_college:      userRow.diploma_college,
      p_diploma_percentage:   userRow.diploma_percentage,
      p_diploma_passout_year: userRow.diploma_passout_year,
      p_school_name:          userRow.school_name,
      p_school_percentage:    userRow.school_percentage,
      p_school_passout_year:  userRow.school_passout_year,
      p_department:           userRow.department,
      p_employee_id:          userRow.employee_id,
    });

    if (profError) {
      console.error("Profile insert error:", profError);
      await supabase.auth.signOut();
      setGlobalErr("Account setup failed: " + profError.message);
      setLoading(false);
      return;
    }

    // ── 5. Sign out — prevent auto-login ─────────────────────────────────────
    await supabase.auth.signOut();

    // ── 6. Done ──────────────────────────────────────────────────────────────
    setLoading(false);
    setSuccess(true);
    setTimeout(() => goToLogin(), 2500);
  };

  const cls = (key) => `rg-input${errors[key] ? " err" : ""}`;

  if (success) return (
    <>
      <style>{css}</style>
      <div className="rg-root" style={{ alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center", padding:"40px" }}>
          <div style={{ fontSize:"52px", marginBottom:"16px" }}>✅</div>
          <h2 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", color:"#4ade80", fontSize:"26px", marginBottom:"10px" }}>
            Account Created!
          </h2>
          <p style={{ color:"#64748b", fontSize:"13px", fontFamily:"'DM Mono',monospace", lineHeight:1.7 }}>
            Your {role} account is ready.<br />Redirecting to login...
          </p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="rg-root">

        {/* Left */}
        <div className="rg-left">
          <div className="rg-left-grid" /><div className="rg-left-glow" />
          <div className="rg-logo">
            <div className="rg-logo-mark">T</div>
            <span className="rg-logo-text">ThopsTech</span>
          </div>
          <h1 className="rg-tagline">Assess.<br /><span>Grow.</span><br />Excel.</h1>
          <p className="rg-desc">
            {role === "trainer"
              ? "The trainer portal — manage assessments, track student progress."
              : "The student portal — practice coding, learn SQL/Java/Python, take real assessments."}
          </p>
          <div className="rg-steps">
            {["Create your account","Log in to your portal","Practice & learn","Track your progress"].map((s,i) => (
              <div className="rg-step" key={i}><div className="rg-step-num">{i+1}</div><span>{s}</span></div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="rg-right">
          <div className="rg-card">
            <h2 className="rg-card-title">Create Account</h2>
            <p className="rg-card-sub">Already registered? <a onClick={goToLogin}>Sign in here</a></p>

            <div className="role-toggle">
              <button className={`role-btn${role==="student" ? " active student" : ""}`}
                onClick={() => { setRole("student"); setErrors({}); setGlobalErr(""); }}>
                🎓 Student
              </button>
              
            </div>

            <div className="rg-grid2">

              {/* Common */}
              <div className="rg-field rg-full">
                
                <input className={cls("name")} placeholder="eg:ravi kumar" value={form.name} onChange={set("name")} />
                <label className="rg-floating-label">Full Name</label>
                {errors.name && <span className="rg-err">⚠ {errors.name}</span>}
              </div>
              <div className="rg-field rg-full">
                
                <input className={cls("email")} type="email" placeholder="example@gmail.com" value={form.email} onChange={set("email")} />
                <label className="rg-floating-label">Email Address</label>
                {errors.email && <span className="rg-err">⚠ {errors.email}</span>}
              </div>
              <div className="rg-field">
                
                <input className={cls("password")} type="password" placeholder="Min 6 chars" value={form.password} onChange={set("password")} />
                <label className="rg-floating-label">Password</label>
                {errors.password && <span className="rg-err">⚠ {errors.password}</span>}
              </div>
              <div className="rg-field">
                
                <input className={cls("confirmPassword")} type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={set("confirmPassword")} />
                <label className="rg-floating-label">Confirm Password</label>
                {errors.confirmPassword && <span className="rg-err">⚠ {errors.confirmPassword}</span>}
              </div>

              <div className="rg-divider" />
              <div className="rg-full"><div className="rg-section-label">Personal Info</div></div>

              <div className="rg-field">
                
                <input className={cls("phone")} type="tel" placeholder="10-digit" value={form.phone} onChange={set("phone")} />
                <label className="rg-floating-label">Mobile Number</label>
                {errors.phone && <span className="rg-err">⚠ {errors.phone}</span>}
              </div>
              <div className="rg-field">
  <label className="rg-label">Date of Birth</label>
  <input 
    className={cls("dob")} 
    type="date" 
    value={form.dob} 
    onChange={set("dob")} 
  />
</div>

              {/* ══ STUDENT ══ */}
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
                  <input className={cls("studentCardId")} placeholder="e.g. TT25001"
                    value={form.studentCardId} onChange={set("studentCardId")} style={{ textTransform:"uppercase" }} />
                  {errors.studentCardId
                    ? <span className="rg-err">⚠ {errors.studentCardId}</span>
                    : <span className="rg-hint">Check your ID card</span>}
                </div>
               <div className="rg-field rg-full">
  <label className="rg-label">Upload Resume</label>

  <label className="custom-file">
    <input 
      type="file"
      accept=".pdf,.doc,.docx"
      onChange={(e) => {
        const file = e.target.files[0];
        setForm(p => ({ ...p, resume: file }));
      }}
    />

    <span className="file-btn">📄 Upload Resume</span>

    {form.resume && (
      <span className="file-name">
        ✅ {form.resume.name}
      </span>
    )}
  </label>

  <span className="rg-hint">PDF/DOC (Max 2MB)</span>

  {errors.resume && <span className="rg-error">⚠ {errors.resume}</span>}
</div>
                {/* Degree */}
                <div className="edu-head degree">🎓 Degree / UG</div>
                <div className="rg-field rg-full">
                  
                  <input className={cls("college")} placeholder="e.g. SVR Engineering College" value={form.college} onChange={set("college")} />
                  <label className="rg-floating-label">College / University Name</label>
                  {errors.college && <span className="rg-err">⚠ {errors.college}</span>}
                </div>
                <div className="rg-field rg-full">
                  
                  <input className={cls("collegeState")} placeholder="e.g. Andhra Pradesh" value={form.collegeState} onChange={set("collegeState")} />
                  <label className="rg-floating-label">College State</label>
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

                {/* Masters */}
                <div className="masters-row">
  <span className="masters-label">Masters / PG</span>

  <label className="switch">
    <input 
      type="checkbox" 
      checked={hasMasters}
      onChange={() => {
        setHasMasters(!hasMasters);

        if (hasMasters) {
          setForm(p => ({
            ...p,
            mastersCollege: "",
            mastersDegree: "",
            mastersPercentage: "",
            mastersPassoutYear: ""
          }));
        }
      }}
    />
    <span className="slider"></span>
  </label>

  <span className="toggle-text">
    {hasMasters ? "Yes" : "No"}
  </span>
</div>
                {hasMasters && (<>
                  <div className="edu-head masters">🏛️ Masters / PG</div>
                  <div className="rg-field rg-full">
                    <label className="rg-label">Masters College / University</label>
                    <input className={cls("mastersCollege")} placeholder="e.g. IIT Madras" value={form.mastersCollege} onChange={set("mastersCollege")} />
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

                {/* Inter / Diploma */}
                <div className="edu-head inter">
                  {interType === "inter" ? "📘 Intermediate / 12th" : "📄 Diploma"}
                </div>
                <div className="mini-toggle">
                  <button className={`mini-btn${interType==="inter" ? " active-inter" : ""}`}
                    onClick={() => {
                      setInterType("inter");
                      setForm(p => ({ ...p, diplomaCollege:"", diplomaPercentage:"", diplomaPassoutYear:"" }));
                      setErrors(p => ({ ...p, diplomaCollege:"", diplomaPercentage:"", diplomaPassoutYear:"" }));
                    }}>📘 Intermediate / 12th</button>
                  <button className={`mini-btn${interType==="diploma" ? " active-diploma" : ""}`}
                    onClick={() => {
                      setInterType("diploma");
                      setForm(p => ({ ...p, interCollege:"", interPercentage:"", interPassoutYear:"" }));
                      setErrors(p => ({ ...p, interCollege:"", interPercentage:"", interPassoutYear:"" }));
                    }}>📄 Diploma</button>
                </div>

                {interType === "inter" && (<>
                  <div className="rg-field rg-full">
                    <label className="rg-label">Inter College Name</label>
                    <input className={cls("interCollege")} placeholder="e.g. Sri Chaitanya Junior College" value={form.interCollege} onChange={set("interCollege")} />
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
                    <input className={cls("diplomaCollege")} placeholder="e.g. Govt. Polytechnic College" value={form.diplomaCollege} onChange={set("diplomaCollege")} />
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

                {/* School */}
                <div className="edu-head school">🏫 School / 10th</div>
                <div className="rg-field rg-full">
                  
                  
                <input className={cls("schoolName")} placeholder="e.g. DAV  School" value={form.schoolName} onChange={set("schoolName")} />
                <label className="rg-floating-label">School Name</label>
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

              {/* ══ TRAINER ══ */}
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

            <button
      className="rg-submit student-btn"
  onClick={handleSubmit}
  disabled={loading}
>
  {loading ? "Creating Account..." : "Create Account →"}
</button>
            {globalErr && <div className="rg-global-err">{globalErr}</div>}
          </div>
        </div>
      </div>
    </>
  );
}