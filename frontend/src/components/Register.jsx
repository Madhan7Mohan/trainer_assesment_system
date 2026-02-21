import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { createAndSendOtp } from "../utils/otpService";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #03070f; }

  .rg-root {
    min-height: 100vh;
    background: #03070f;
    display: flex;
    font-family: 'DM Mono', monospace;
    position: relative;
    overflow: hidden;
  }

  /* Left decorative panel */
  .rg-left {
    width: 38%;
    background: linear-gradient(160deg, #071828 0%, #030c18 100%);
    border-right: 1px solid rgba(0,172,193,.1);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 48px;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }

  .rg-left-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(0,172,193,.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,172,193,.07) 1px, transparent 1px);
    background-size: 32px 32px;
  }

  .rg-left-glow {
    position: absolute;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,172,193,.18) 0%, transparent 65%);
    bottom: -100px; right: -100px;
  }

  .rg-logo {
    position: relative;
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 56px;
  }

  .rg-logo-mark {
    width: 36px; height: 36px;
    border: 2px solid #00ACC1;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cabinet Grotesk', sans-serif;
    font-weight: 800; font-size: 16px;
    color: #00ACC1;
    box-shadow: 0 0 16px rgba(0,172,193,.3);
  }

  .rg-logo-text {
    font-family: 'Cabinet Grotesk', sans-serif;
    font-weight: 800; font-size: 18px;
    color: #e2e8f0;
    letter-spacing: 0.5px;
  }

  .rg-tagline {
    position: relative;
    font-family: 'Cabinet Grotesk', sans-serif;
    font-size: 36px;
    font-weight: 800;
    color: #f1f5f9;
    line-height: 1.15;
    margin-bottom: 20px;
  }

  .rg-tagline span { color: #00ACC1; }

  .rg-desc {
    position: relative;
    font-size: 13px;
    color: #64748b;
    line-height: 1.7;
    margin-bottom: 48px;
  }

  .rg-steps {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .rg-step {
    display: flex; align-items: center; gap: 14px;
    font-size: 12px; color: #94a3b8;
  }

  .rg-step-num {
    width: 26px; height: 26px;
    border-radius: 50%;
    background: rgba(0,172,193,.12);
    border: 1px solid rgba(0,172,193,.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700;
    color: #00ACC1;
    flex-shrink: 0;
  }

  /* Right form panel */
  .rg-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    overflow-y: auto;
  }

  .rg-card {
    width: 100%;
    max-width: 480px;
    animation: cardIn .5s cubic-bezier(.16,1,.3,1);
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .rg-card-title {
    font-family: 'Cabinet Grotesk', sans-serif;
    font-size: 26px; font-weight: 800;
    color: #f1f5f9;
    margin-bottom: 4px;
  }

  .rg-card-sub {
    font-size: 12px; color: #64748b;
    margin-bottom: 28px;
    line-height: 1.6;
  }

  .rg-card-sub a {
    color: #00ACC1; cursor: pointer; text-decoration: none;
    border-bottom: 1px solid rgba(0,172,193,.35);
    padding-bottom: 1px;
    transition: border-color .2s;
  }
  .rg-card-sub a:hover { border-color: #00ACC1; }

  /* 2-column grid for fields */
  .rg-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .rg-full   { grid-column: 1 / -1; }

  .rg-field { display: flex; flex-direction: column; }

  .rg-label {
    font-size: 10px; font-weight: 500;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: #94a3b8; margin-bottom: 6px;
  }

  .rg-input {
    background: rgba(15,23,42,.9);
    border: 1px solid rgba(148,163,184,.12);
    border-radius: 9px;
    padding: 11px 13px;
    font-family: 'DM Mono', monospace;
    font-size: 13px; color: #e2e8f0;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
    width: 100%;
    appearance: none;
  }

  .rg-input:focus {
    border-color: rgba(0,172,193,.5);
    box-shadow: 0 0 0 3px rgba(0,172,193,.07);
  }

  .rg-input::placeholder { color: #334155; }
  .rg-input option { background: #0f172a; color: #e2e8f0; }

  .rg-input.err { border-color: rgba(239,68,68,.4); }

  .rg-err {
    font-size: 10px; color: #f87171;
    margin-top: 4px;
  }

  .rg-divider {
    height: 1px; background: rgba(148,163,184,.08);
    margin: 20px 0;
  }

  .rg-section-label {
    font-size: 10px; font-weight: 600;
    letter-spacing: 2px; text-transform: uppercase;
    color: #475569; margin-bottom: 14px;
    display: flex; align-items: center; gap: 10px;
  }
  .rg-section-label::after {
    content: ''; flex: 1; height: 1px;
    background: rgba(148,163,184,.08);
  }

  .rg-submit {
    width: 100%; padding: 13px;
    background: linear-gradient(135deg, #00ACC1, #0891b2);
    border: none; border-radius: 10px;
    font-family: 'Cabinet Grotesk', sans-serif;
    font-size: 15px; font-weight: 700;
    color: #fff; cursor: pointer;
    transition: all .2s;
    box-shadow: 0 4px 20px rgba(0,172,193,.25);
    margin-top: 22px;
  }
  .rg-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 7px 28px rgba(0,172,193,.38); }
  .rg-submit:disabled { opacity: .5; cursor: not-allowed; }

  .rg-global-err {
    background: rgba(239,68,68,.08);
    border: 1px solid rgba(239,68,68,.2);
    border-radius: 8px; padding: 10px 14px;
    font-size: 12px; color: #f87171;
    margin-top: 14px; line-height: 1.5;
  }
`;

const STREAMS = ["Java", "Python", "Frontend", "Data Science", "DevOps", "QA"];

export default function Register({ onRegistered, goToLogin }) {
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    phone: "", stream: "", college: "", dob: "",
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [globalErr, setGlobalErr] = useState("");

  const set = (key) => (e) => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    setErrors(p => ({ ...p, [key]: "" }));
    setGlobalErr("");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                          e.name     = "Required";
    if (!form.email.includes("@"))                  e.email    = "Valid email required";
    if (form.password.length < 6)                   e.password = "Min 6 characters";
    if (form.password !== form.confirmPassword)     e.confirmPassword = "Passwords don't match";
    if (!/^\d{10}$/.test(form.phone.trim()))        e.phone    = "10-digit number required";
    if (!form.stream)                               e.stream   = "Required";
    if (!form.college.trim())                       e.college  = "Required";
    if (!form.dob)                                  e.dob      = "Required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    setGlobalErr("");

    // Step 1: Create the account with email + password
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email:    form.email.trim().toLowerCase(),
      password: form.password,
      options: {
        data: { name: form.name.trim() },
        // emailRedirectTo must be omitted so Supabase doesn't override with magic link
      },
    });

    if (authError) {
      setGlobalErr(authError.message);
      setLoading(false);
      return;
    }

    // Step 2: Send OTP using Resend
    const { error: otpError } = await createAndSendOtp(form.email.trim().toLowerCase());

    if (otpError) {
      setGlobalErr("Account created but OTP send failed: " + otpError);
      setLoading(false);
      return;
    }

    // Pass form data forward — profile inserted AFTER OTP verified (session confirmed)
    setLoading(false);
    onRegistered(form.email.trim().toLowerCase(), {
      id:      authData.user?.id,
      name:    form.name.trim(),
      email:   form.email.trim().toLowerCase(),
      phone:   form.phone.trim(),
      stream:  form.stream,
      college: form.college.trim(),
      dob:     form.dob,
      password: form.password,
    });
  };

  const inputCls = (key) => `rg-input${errors[key] ? " err" : ""}`;

  return (
    <>
      <style>{css}</style>
      <div className="rg-root">

        {/* Left panel */}
        <div className="rg-left">
          <div className="rg-left-grid" />
          <div className="rg-left-glow" />

          <div className="rg-logo">
            <div className="rg-logo-mark">T</div>
            <span className="rg-logo-text">ThopsTech</span>
          </div>

          <h1 className="rg-tagline">
            Assess.<br /><span>Grow.</span><br />Excel.
          </h1>
          <p className="rg-desc">
            The trainer assessment platform built to evaluate real coding skills — not just theory.
          </p>

          <div className="rg-steps">
            {[
              "Create your account",
              "Verify your email with OTP",
              "Log in and start your session",
              "Practice or take a timed test",
            ].map((s, i) => (
              <div className="rg-step" key={i}>
                <div className="rg-step-num">{i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right form */}
        <div className="rg-right">
          <div className="rg-card">
            <h2 className="rg-card-title">Create Account</h2>
            <p className="rg-card-sub">
              Already registered?{" "}
              <a onClick={goToLogin}>Sign in here</a>
            </p>

            <div className="rg-grid2">

              {/* Name */}
              <div className="rg-field rg-full">
                <label className="rg-label">Full Name</label>
                <input className={inputCls("name")} placeholder="e.g. Ravi Kumar"
                  value={form.name} onChange={set("name")} />
                {errors.name && <span className="rg-err">⚠ {errors.name}</span>}
              </div>

              {/* Email */}
              <div className="rg-field rg-full">
                <label className="rg-label">Email Address</label>
                <input className={inputCls("email")} type="email" placeholder="you@example.com"
                  value={form.email} onChange={set("email")} />
                {errors.email && <span className="rg-err">⚠ {errors.email}</span>}
              </div>

              {/* Password */}
              <div className="rg-field">
                <label className="rg-label">Password</label>
                <input className={inputCls("password")} type="password" placeholder="Min 6 chars"
                  value={form.password} onChange={set("password")} />
                {errors.password && <span className="rg-err">⚠ {errors.password}</span>}
              </div>

              {/* Confirm Password */}
              <div className="rg-field">
                <label className="rg-label">Confirm Password</label>
                <input className={inputCls("confirmPassword")} type="password" placeholder="Repeat password"
                  value={form.confirmPassword} onChange={set("confirmPassword")} />
                {errors.confirmPassword && <span className="rg-err">⚠ {errors.confirmPassword}</span>}
              </div>

              <div className="rg-divider rg-full" />
              <div className="rg-full">
                <div className="rg-section-label">Personal Info</div>
              </div>

              {/* Phone */}
              <div className="rg-field">
                <label className="rg-label">Mobile Number</label>
                <input className={inputCls("phone")} type="tel" placeholder="10-digit"
                  value={form.phone} onChange={set("phone")} />
                {errors.phone && <span className="rg-err">⚠ {errors.phone}</span>}
              </div>

              {/* DOB */}
              <div className="rg-field">
                <label className="rg-label">Date of Birth</label>
                <input className={inputCls("dob")} type="date"
                  value={form.dob} onChange={set("dob")} />
                {errors.dob && <span className="rg-err">⚠ {errors.dob}</span>}
              </div>

              {/* College */}
              <div className="rg-field rg-full">
                <label className="rg-label">College / Organization</label>
                <input className={inputCls("college")} placeholder="e.g. IIT Madras / ThopsTech"
                  value={form.college} onChange={set("college")} />
                {errors.college && <span className="rg-err">⚠ {errors.college}</span>}
              </div>

              {/* Stream */}
              <div className="rg-field rg-full">
                <label className="rg-label">Stream / Track</label>
                <select className={inputCls("stream")} value={form.stream} onChange={set("stream")}>
                  <option value="">-- Select Stream --</option>
                  {STREAMS.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                </select>
                {errors.stream && <span className="rg-err">⚠ {errors.stream}</span>}
              </div>

            </div>

            <button className="rg-submit" onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating Account..." : "Create Account & Send OTP →"}
            </button>

            {globalErr && <div className="rg-global-err">⚠ {globalErr}</div>}
          </div>
        </div>
      </div>
    </>
  );
}