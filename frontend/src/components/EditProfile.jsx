import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .ep-root { min-height:100vh; background:#ffffff; font-family:'DM Mono',monospace; padding-bottom:0; }
  .ep-grid { position:fixed; inset:0; background-image:linear-gradient(rgba(0,172,193,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,172,193,.03) 1px,transparent 1px); background-size:40px 40px; pointer-events:none; z-index:0; }
  .ep-nav { position:sticky; top:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:14px 32px; background:blue; border-bottom:1px solid rgba(0,172,193,.1); backdrop-filter:blur(10px); }
  .ep-nav-title { font-family:'Syne',sans-serif; font-weight:800; font-size:15px; color:#f1f5f9; display:flex; align-items:center; gap:10px; }
  .ep-nav-back { padding:7px 16px; background:blue; border:2px solid white; border-radius:10px; font-family:'DM Mono',monospace; font-size:11px; color:white; cursor:pointer; transition:all .2s; }
  .ep-nav-back:hover { border-color:white ; color:white; }
  .ep-body { position:relative; z-index:1; max-width:520px; margin:80px auto; padding:30px 24px;  background: #ffffff;  border: 1px solid #e2e8f0;border-radius: 14px;     box-shadow: 0 10px 30px rgba(0,0,0,0.08);      }
  .ep-section { font-family:'Syne',sans-serif; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:black; margin:24px 0 16px; display:flex; align-items:center; gap:10px; }
  .ep-section::after { content:''; flex:1; height:1px; background:#e2e8f0 }
  .ep-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media(max-width:560px) { .ep-grid2 { grid-template-columns:1fr; } }
  .ep-full { grid-column:1/-1; }
  .ep-field { display:flex; flex-direction:column; }
  .ep-label { font-size:10px; font-weight:500; letter-spacing:1.5px; text-transform:uppercase; color:black; margin-bottom:6px; display:flex; align-items:center; gap:6px; }
  .ep-lock-icon { font-size:10px }
  .ep-input { background:#ffffff; border:1px solid #cbd5e1; border-radius:10px; padding:12px 14px; font-family:'DM Mono',monospace; font-size:13px; color:#000000; outline:none; transition:border-color .2s,box-shadow .2s; width:100%; appearance:none; }
  .ep-input:focus { border-color:black; box-shadow:none}
  .ep-input::placeholder { color:#334155; }
  .ep-input.locked { background:#e2e8f0; color:#647; cursor:not-allowed; border-color:rgba(148,163,184,.06); }
  .ep-input.err { border-color:rgba(239,68,68,.4); }
  .ep-input option { background:#ffffff; color:#000000; }
  .ep-err  { font-size:10px; color:#f87171; margin-top:4px; }
  .ep-hint { font-size:10px; color:#475569; margin-top:4px; font-style:italic; }
  .ep-locked-info { display:flex; align-items:center; gap:8px; padding:10px 13px; background:#f8fafc; border:2px solid #e2e8f0; border-radius:9px; font-size:12px; color:#64748b; }
  .ep-divider { height:1px; background:rgba(148,163,184,.08); grid-column:1/-1; margin:4px 0; }
  .ep-actions { display:flex; gap:12px; margin-top:28px; }
  .ep-btn-save { flex:1; padding:13px; border:none; border-radius:10px; font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#fff; cursor:pointer; transition:all .2s; }
  .ep-btn-save.student { background:linear-gradient(135deg,#22c55e,#16a34a); box-shadow:0 4px 18px rgba(34,197,94,.2); }
  .ep-btn-save.trainer { background:blue; box-shadow:0 4px 18px rgba(0,172,193,.2); }
  .ep-btn-save:hover:not(:disabled) { filter:brightness(1.1); transform:translateY(-1px); }
  .ep-btn-save:disabled { opacity:.5; cursor:not-allowed; transform:none; }
  .ep-btn-cancel { padding:13px 22px; background:transparent; border:1px solid black; border-radius:10px; font-family:'DM Mono',monospace; font-size:13px; color:black; cursor:pointer; transition:all .2s; }
  .ep-btn-cancel:hover { border-color:rgba(148,163,184,.35); color:#e2e8f0; }
  .ep-success { display:flex; align-items:center; gap:10px; padding:12px 16px; background:rgba(34,197,94,.08); border:1px solid rgba(34,197,94,.2); border-radius:10px; font-size:13px; color:#86efac; margin-top:16px; }
  .ep-global-err { padding:12px 16px; background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.2); border-radius:10px; font-size:12px; color:#f87171; margin-top:16px; line-height:1.5; }
  .ep-pass-section>div:first-child { background:#ffffff; border:1px solid black; border-radius:14px; padding:20px; margin-top:8px;  display: flex; justify-content: space-between;align-items: center;  color: #1e293b; font-weight: 600;
 }
  .ep-pass-title { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; color:#1d4ed8; margin-bottom:16px; }
`;

const GRAD_DEGREES  = ["B.E / B.Tech","B.Sc","B.Com","BCA","B.A","MBA","MCA","Other"];
const GRAD_BRANCHES = ["Computer Science","Information Technology","Electronics & Communication","Electrical","Mechanical","Civil","Chemical","Biotechnology","Other"];
const MASTERS_DEG   = ["M.E / M.Tech","M.Sc","MCA","MBA","M.A","Other"];
const DEPARTMENTS   = ["Java","Python","Data Science","DevOps","Testing","Data Analytics","AI/ML","Management"];
const GENDER_OPTS   = ["male","female","other"];

export default function EditProfile({ profile, onBack, onProfileUpdated }) {
  const isStudent = profile?.role === "student";
  const isTrainer = profile?.role === "trainer";

  // Student editable: dob, gender, college, college_state, graduation_stream,
  //   graduation_branch, degree_percentage, degree_passout_year,
  //   masters fields, inter/diploma fields, school fields
  // Trainer editable: department only
  // Both: password change

  const [form, setForm] = useState({
    // student fields
    dob:                  profile?.dob              || "",
    gender:               profile?.gender           || "",
    college:              profile?.college          || "",
    college_state:        profile?.college_state    || "",
    graduation_stream:    profile?.graduation_stream || "",
    graduation_branch:    profile?.graduation_branch || "",
    degree_percentage:    profile?.degree_percentage?.toString() || "",
    degree_passout_year:  profile?.degree_passout_year?.toString() || "",
    masters_college:      profile?.masters_college  || "",
    masters_stream:       profile?.masters_stream   || "",
    masters_percentage:   profile?.masters_percentage?.toString() || "",
    masters_passout_year: profile?.masters_passout_year?.toString() || "",
    inter_college:        profile?.inter_college    || "",
    inter_percentage:     profile?.inter_percentage?.toString() || "",
    inter_passout_year:   profile?.inter_passout_year?.toString() || "",
    diploma_college:      profile?.diploma_college  || "",
    diploma_percentage:   profile?.diploma_percentage?.toString() || "",
    diploma_passout_year: profile?.diploma_passout_year?.toString() || "",
    school_name:          profile?.school_name      || "",
    school_percentage:    profile?.school_percentage?.toString() || "",
    school_passout_year:  profile?.school_passout_year?.toString() || "",
    // trainer fields
    department:           profile?.department       || "",
    // password
    currentPassword:      "",
    newPassword:          "",
    confirmPassword:      "",
  });

  const [errors,     setErrors]     = useState({});
  const [loading,    setLoading]    = useState(false);
  const [globalErr,  setGlobalErr]  = useState("");
  const [success,    setSuccess]    = useState("");
  const [showPass,   setShowPass]   = useState(false);

  const set = (key) => (e) => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    setErrors(p => ({ ...p, [key]: "" }));
    setGlobalErr("");
    setSuccess("");
  };

  const cls = (key) => `ep-input${errors[key] ? " err" : ""}`;

  // ── Validate ────────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (isStudent) {
      if (!form.dob)                  e.dob = "Required";
      if (!form.gender)               e.gender = "Required";
      if (!form.college.trim())       e.college = "Required";
      if (!form.college_state.trim()) e.college_state = "Required";
      if (!form.graduation_stream)    e.graduation_stream = "Required";
      if (!form.graduation_branch)    e.graduation_branch = "Required";
      if (!form.degree_percentage)    e.degree_percentage = "Required";
      if (!form.degree_passout_year)  e.degree_passout_year = "Required";
      // school
      if (!form.school_name.trim())   e.school_name = "Required";
      if (!form.school_percentage)    e.school_percentage = "Required";
      if (!form.school_passout_year)  e.school_passout_year = "Required";
    }
    if (isTrainer) {
      if (!form.department) e.department = "Required";
    }
    if (showPass) {
      if (!form.currentPassword)      e.currentPassword = "Required";
      if (form.newPassword.length < 6) e.newPassword = "Min 6 characters";
      if (form.newPassword !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    }
    return e;
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setGlobalErr("");
    setSuccess("");

    try {
      // ── 1. Build update payload ──────────────────────────────────────────
      let updates = {};

      if (isStudent) {
        updates = {
          dob:                 form.dob || null,
          gender:              form.gender || null,
          college:             form.college.trim() || null,
          college_state:       form.college_state.trim() || null,
          graduation_stream:   form.graduation_stream || null,
          graduation_branch:   form.graduation_branch || null,
          degree_percentage:   parseFloat(form.degree_percentage) || null,
          degree_passout_year: parseInt(form.degree_passout_year) || null,
          // masters (only if has_masters)
          ...(profile?.has_masters ? {
            masters_college:      form.masters_college.trim() || null,
            masters_stream:       form.masters_stream || null,
            masters_percentage:   parseFloat(form.masters_percentage) || null,
            masters_passout_year: parseInt(form.masters_passout_year) || null,
          } : {}),
          // inter or diploma
          ...(profile?.edu_after_inter === "inter" ? {
            inter_college:      form.inter_college.trim() || null,
            inter_percentage:   parseFloat(form.inter_percentage) || null,
            inter_passout_year: parseInt(form.inter_passout_year) || null,
          } : {}),
          ...(profile?.edu_after_inter === "diploma" ? {
            diploma_college:      form.diploma_college.trim() || null,
            diploma_percentage:   parseFloat(form.diploma_percentage) || null,
            diploma_passout_year: parseInt(form.diploma_passout_year) || null,
          } : {}),
          // school
          school_name:          form.school_name.trim() || null,
          school_percentage:    parseFloat(form.school_percentage) || null,
          school_passout_year:  parseInt(form.school_passout_year) || null,
        };
      }

      if (isTrainer) {
        updates = { department: form.department || null };
      }

      // ── 2. Update users table ────────────────────────────────────────────
      const { error: updateError } = await supabase
        .from("users")
        .update(updates)
        .eq("id", profile.id);

      if (updateError) throw new Error(updateError.message);

      // ── 3. Password change (if requested) ───────────────────────────────
      if (showPass && form.newPassword) {
        // Re-authenticate first
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email:    profile.email,
          password: form.currentPassword,
        });
        if (signInError) {
          setErrors(p => ({ ...p, currentPassword: "Current password is incorrect" }));
          setLoading(false);
          return;
        }
        const { error: passError } = await supabase.auth.updateUser({
          password: form.newPassword,
        });
        if (passError) throw new Error(passError.message);
      }

      setSuccess("✅ Profile updated successfully!");
      // Reset password fields
      setForm(p => ({ ...p, currentPassword: "", newPassword: "", confirmPassword: "" }));
      setShowPass(false);

      // Notify parent to refresh profile
      if (onProfileUpdated) onProfileUpdated({ ...profile, ...updates });

    } catch (err) {
      setGlobalErr("⚠ " + err.message);
    }

    setLoading(false);
  };

  const LockField = ({ label, value }) => (
    <div className="ep-field">
      <div className="ep-label">
        <span className="ep-lock-icon">🔒</span>
        {label}
      </div>
      <div className="ep-locked-info">{value || "—"}</div>
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div className="ep-root">
        <div className="ep-grid" />

        <nav className="ep-nav">
          <div className="ep-nav-title">
            ✏️ Edit Profile
          </div>
          <button className="ep-nav-back" onClick={onBack}>← Back</button>
        </nav>

        <div className="ep-body">

          {/* ── Locked fields info ── */}
          <div className="ep-section">Locked Fields (cannot be changed)</div>
          <div className="ep-grid2">
            <LockField label="Email"        value={profile?.email} />
            <LockField label="Phone Number" value={profile?.phone} />
            {isStudent && <LockField label="Student Card ID" value={profile?.student_card_id} />}
            {isStudent && <LockField label="Stream / Track"  value={profile?.stream} />}
            {isTrainer && <LockField label="Employee ID"     value={profile?.employee_id} />}
            {isTrainer && <LockField label="Email"           value={profile?.email} />}
          </div>

          {/* ── Student editable fields ── */}
          {isStudent && (<>
            <div className="ep-section">Personal Details</div>
            <div className="ep-grid2">
              <div className="ep-field">
                <label className="ep-label">Date of Birth</label>
                <input type="date" className={cls("dob")} value={form.dob} onChange={set("dob")} />
                {errors.dob && <span className="ep-err">⚠ {errors.dob}</span>}
              </div>
              <div className="ep-field">
                <label className="ep-label">Gender</label>
                <select className={cls("gender")} value={form.gender} onChange={set("gender")}>
                  <option value="">Select gender</option>
                  {GENDER_OPTS.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase()+g.slice(1)}</option>)}
                </select>
                {errors.gender && <span className="ep-err">⚠ {errors.gender}</span>}
              </div>
            </div>

            <div className="ep-section">Graduation / Degree</div>
            <div className="ep-grid2">
              <div className="ep-field ep-full">
                <label className="ep-label">College Name</label>
                <input className={cls("college")} value={form.college} onChange={set("college")} placeholder="Your college name" />
                {errors.college && <span className="ep-err">⚠ {errors.college}</span>}
              </div>
              <div className="ep-field">
                <label className="ep-label">College State</label>
                <input className={cls("college_state")} value={form.college_state} onChange={set("college_state")} placeholder="e.g. Telangana" />
                {errors.college_state && <span className="ep-err">⚠ {errors.college_state}</span>}
              </div>
              <div className="ep-field">
                <label className="ep-label">Degree</label>
                <select className={cls("graduation_stream")} value={form.graduation_stream} onChange={set("graduation_stream")}>
                  <option value="">Select degree</option>
                  {GRAD_DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.graduation_stream && <span className="ep-err">⚠ {errors.graduation_stream}</span>}
              </div>
              <div className="ep-field">
                <label className="ep-label">Branch</label>
                <select className={cls("graduation_branch")} value={form.graduation_branch} onChange={set("graduation_branch")}>
                  <option value="">Select branch</option>
                  {GRAD_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                {errors.graduation_branch && <span className="ep-err">⚠ {errors.graduation_branch}</span>}
              </div>
              <div className="ep-field">
                <label className="ep-label">Percentage / CGPA</label>
                <input type="number" className={cls("degree_percentage")} value={form.degree_percentage} onChange={set("degree_percentage")} placeholder="e.g. 75.5" min="0" max="100" />
                {errors.degree_percentage && <span className="ep-err">⚠ {errors.degree_percentage}</span>}
              </div>
              <div className="ep-field">
                <label className="ep-label">Passout Year</label>
                <input type="number" className={cls("degree_passout_year")} value={form.degree_passout_year} onChange={set("degree_passout_year")} placeholder="e.g. 2023" min="2000" max="2030" />
                {errors.degree_passout_year && <span className="ep-err">⚠ {errors.degree_passout_year}</span>}
              </div>
            </div>

            {/* Masters */}
            {profile?.has_masters && (<>
              <div className="ep-section" style={{ color:"#a78bfa" }}>Masters Degree</div>
              <div className="ep-grid2">
                <div className="ep-field">
                  <label className="ep-label">Masters College</label>
                  <input className={cls("masters_college")} value={form.masters_college} onChange={set("masters_college")} placeholder="Masters college" />
                </div>
                <div className="ep-field">
                  <label className="ep-label">Masters Degree</label>
                  <select className={cls("masters_stream")} value={form.masters_stream} onChange={set("masters_stream")}>
                    <option value="">Select</option>
                    {MASTERS_DEG.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="ep-field">
                  <label className="ep-label">Percentage</label>
                  <input type="number" className={cls("masters_percentage")} value={form.masters_percentage} onChange={set("masters_percentage")} placeholder="e.g. 80" />
                </div>
                <div className="ep-field">
                  <label className="ep-label">Passout Year</label>
                  <input type="number" className={cls("masters_passout_year")} value={form.masters_passout_year} onChange={set("masters_passout_year")} placeholder="e.g. 2024" />
                </div>
              </div>
            </>)}

            {/* Inter / Diploma */}
            {profile?.edu_after_inter === "inter" && (<>
              <div className="ep-section">Intermediate (10+2)</div>
              <div className="ep-grid2">
                <div className="ep-field">
                  <label className="ep-label">College / School</label>
                  <input className={cls("inter_college")} value={form.inter_college} onChange={set("inter_college")} placeholder="Inter college" />
                  {errors.inter_college && <span className="ep-err">⚠ {errors.inter_college}</span>}
                </div>
                <div className="ep-field">
                  <label className="ep-label">Percentage</label>
                  <input type="number" className={cls("inter_percentage")} value={form.inter_percentage} onChange={set("inter_percentage")} placeholder="e.g. 82" />
                </div>
                <div className="ep-field">
                  <label className="ep-label">Passout Year</label>
                  <input type="number" className={cls("inter_passout_year")} value={form.inter_passout_year} onChange={set("inter_passout_year")} placeholder="e.g. 2020" />
                </div>
              </div>
            </>)}

            {profile?.edu_after_inter === "diploma" && (<>
              <div className="ep-section">Diploma</div>
              <div className="ep-grid2">
                <div className="ep-field">
                  <label className="ep-label">College</label>
                  <input className={cls("diploma_college")} value={form.diploma_college} onChange={set("diploma_college")} placeholder="Diploma college" />
                </div>
                <div className="ep-field">
                  <label className="ep-label">Percentage</label>
                  <input type="number" className={cls("diploma_percentage")} value={form.diploma_percentage} onChange={set("diploma_percentage")} placeholder="e.g. 78" />
                </div>
                <div className="ep-field">
                  <label className="ep-label">Passout Year</label>
                  <input type="number" className={cls("diploma_passout_year")} value={form.diploma_passout_year} onChange={set("diploma_passout_year")} placeholder="e.g. 2021" />
                </div>
              </div>
            </>)}

            {/* School */}
            <div className="ep-section">School (10th)</div>
            <div className="ep-grid2">
              <div className="ep-field ep-full">
                <label className="ep-label">School Name</label>
                <input className={cls("school_name")} value={form.school_name} onChange={set("school_name")} placeholder="School name" />
                {errors.school_name && <span className="ep-err">⚠ {errors.school_name}</span>}
              </div>
              <div className="ep-field">
                <label className="ep-label">Percentage / GPA</label>
                <input type="number" className={cls("school_percentage")} value={form.school_percentage} onChange={set("school_percentage")} placeholder="e.g. 90" />
                {errors.school_percentage && <span className="ep-err">⚠ {errors.school_percentage}</span>}
              </div>
              <div className="ep-field">
                <label className="ep-label">Passout Year</label>
                <input type="number" className={cls("school_passout_year")} value={form.school_passout_year} onChange={set("school_passout_year")} placeholder="e.g. 2018" />
                {errors.school_passout_year && <span className="ep-err">⚠ {errors.school_passout_year}</span>}
              </div>
            </div>
          </>)}

          {/* ── Trainer editable fields ── */}
          {isTrainer && (<>
            <div className="ep-section">Trainer Details</div>
            <div className="ep-grid2">
              <div className="ep-field">
                <label className="ep-label">Department</label>
                <select className={cls("department")} value={form.department} onChange={set("department")}>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <span className="ep-err">⚠ {errors.department}</span>}
              </div>
            </div>
          </>)}

          {/* ── Change Password ── */}
          <div className="ep-section">Security</div>
          <div className="ep-pass-section">
            <div
              className="ep-pass-title"
              style={{ cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between" }}
              onClick={() => setShowPass(p => !p)}
            >
              <span>🔑 Change Password</span>
              <span style={{ fontSize:11, color:"black" }}>{showPass ? "▲ Hide" : "▼ Expand"}</span>
            </div>
            {showPass && (
              <div className="ep-grid2">
                <div className="ep-field ep-full">
                  <label className="ep-label">Current Password</label>
                  <input type="password" className={cls("currentPassword")} value={form.currentPassword} onChange={set("currentPassword")} placeholder="Your current password" autoComplete="current-password" />
                  {errors.currentPassword && <span className="ep-err">⚠ {errors.currentPassword}</span>}
                </div>
                <div className="ep-field">
                  <label className="ep-label">New Password</label>
                  <input type="password" className={cls("newPassword")} value={form.newPassword} onChange={set("newPassword")} placeholder="Min 6 characters" autoComplete="new-password" />
                  {errors.newPassword && <span className="ep-err">⚠ {errors.newPassword}</span>}
                </div>
                <div className="ep-field">
                  <label className="ep-label">Confirm Password</label>
                  <input type="password" className={cls("confirmPassword")} value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Repeat new password" autoComplete="new-password" />
                  {errors.confirmPassword && <span className="ep-err">⚠ {errors.confirmPassword}</span>}
                </div>
              </div>
            )}
          </div>

          {/* ── Status messages ── */}
          {success    && <div className="ep-success">{success}</div>}
          {globalErr  && <div className="ep-global-err">{globalErr}</div>}

          {/* ── Save / Cancel ── */}
          <div className="ep-actions">
            <button className="ep-btn-cancel" onClick={onBack}>Cancel</button>
            <button
              className={`ep-btn-save ${profile?.role}`}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes ✓"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}