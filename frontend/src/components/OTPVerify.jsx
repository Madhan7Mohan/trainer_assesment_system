import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../supabaseClient";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #03070f; }

  .otp-root {
    min-height: 100vh;
    background: #03070f;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Mono', monospace;
    position: relative;
    overflow: hidden;
    padding: 20px;
  }

  .otp-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(0,172,193,.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,172,193,.05) 1px, transparent 1px);
    background-size: 36px 36px;
    pointer-events: none;
  }

  .otp-glow {
    position: absolute;
    width: 700px; height: 700px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,172,193,.1) 0%, transparent 65%);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .otp-card {
    position: relative;
    background: rgba(7,15,30,.96);
    border: 1px solid rgba(0,172,193,.2);
    border-radius: 22px;
    padding: 52px 48px;
    width: 100%;
    max-width: 440px;
    text-align: center;
    box-shadow: 0 0 60px rgba(0,172,193,.07), 0 32px 80px rgba(0,0,0,.7);
    animation: popIn .5s cubic-bezier(.16,1,.3,1);
  }

  @keyframes popIn {
    from { opacity: 0; transform: scale(.93) translateY(20px); }
    to   { opacity: 1; transform: scale(1)   translateY(0); }
  }

  .otp-icon {
    width: 60px; height: 60px;
    border-radius: 16px;
    background: rgba(0,172,193,.12);
    border: 1px solid rgba(0,172,193,.25);
    display: flex; align-items: center; justify-content: center;
    font-size: 26px;
    margin: 0 auto 24px;
    box-shadow: 0 0 24px rgba(0,172,193,.15);
  }

  .otp-title {
    font-family: 'Cabinet Grotesk', sans-serif;
    font-size: 26px; font-weight: 800;
    color: #f1f5f9;
    margin-bottom: 8px;
  }

  .otp-sub {
    font-size: 12px; color: #64748b;
    line-height: 1.65; margin-bottom: 36px;
  }

  .otp-email {
    color: #00ACC1; font-weight: 500;
    font-family: 'DM Mono', monospace;
  }

  /* OTP input boxes */
  .otp-boxes {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-bottom: 28px;
  }

  .otp-box {
    width: 52px; height: 58px;
    background: rgba(15,23,42,.9);
    border: 1.5px solid rgba(148,163,184,.15);
    border-radius: 12px;
    font-family: 'Cabinet Grotesk', sans-serif;
    font-size: 24px; font-weight: 800;
    color: #f1f5f9;
    text-align: center;
    outline: none;
    transition: border-color .2s, box-shadow .2s, transform .15s;
    caret-color: #00ACC1;
  }

  .otp-box:focus {
    border-color: #00ACC1;
    box-shadow: 0 0 0 3px rgba(0,172,193,.12);
    transform: translateY(-2px);
  }

  .otp-box.filled {
    border-color: rgba(0,172,193,.4);
    background: rgba(0,172,193,.06);
  }

  .otp-box.err-box {
    border-color: rgba(239,68,68,.5);
    animation: shake .4s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-5px); }
    60%       { transform: translateX(5px); }
  }

  .otp-verify-btn {
    width: 100%; padding: 13px;
    background: linear-gradient(135deg, #00ACC1, #0891b2);
    border: none; border-radius: 10px;
    font-family: 'Cabinet Grotesk', sans-serif;
    font-size: 15px; font-weight: 700;
    color: #fff; cursor: pointer;
    transition: all .2s;
    box-shadow: 0 4px 20px rgba(0,172,193,.25);
    margin-bottom: 18px;
  }
  .otp-verify-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 7px 28px rgba(0,172,193,.38); }
  .otp-verify-btn:disabled { opacity: .45; cursor: not-allowed; }

  .otp-resend {
    font-size: 12px; color: #64748b;
  }

  .otp-resend-btn {
    background: none; border: none;
    color: #00ACC1; cursor: pointer;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    border-bottom: 1px solid rgba(0,172,193,.3);
    padding-bottom: 1px;
    transition: border-color .2s;
  }
  .otp-resend-btn:hover { border-color: #00ACC1; }
  .otp-resend-btn:disabled { color: #475569; border-color: transparent; cursor: not-allowed; }

  .otp-err {
    background: rgba(239,68,68,.08);
    border: 1px solid rgba(239,68,68,.2);
    border-radius: 8px; padding: 10px 14px;
    font-size: 12px; color: #f87171;
    margin-top: 14px; line-height: 1.5;
    text-align: left;
  }

  .otp-success {
    background: rgba(34,197,94,.08);
    border: 1px solid rgba(34,197,94,.2);
    border-radius: 8px; padding: 10px 14px;
    font-size: 12px; color: #86efac;
    margin-top: 14px;
  }

  .otp-countdown {
    color: #f97316; font-weight: 600;
    font-family: 'DM Mono', monospace;
  }
`;

export default function OTPVerify({ email, pendingProfile, onVerified }) {
  const [digits,    setDigits]    = useState(Array(6).fill(""));
  const [loading,   setLoading]   = useState(false);
  const [errMsg,    setErrMsg]    = useState("");
  const [hasErr,    setHasErr]    = useState(false);
  const [resendCD,  setResendCD]  = useState(60);
  const [resendMsg, setResendMsg] = useState("");
  const inputRefs = useRef([]);

  // Countdown for resend
  useEffect(() => {
    if (resendCD <= 0) return;
    const id = setTimeout(() => setResendCD(p => p - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCD]);

  const handleKey = (index, e) => {
    setErrMsg(""); setHasErr(false);
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = val;
    setDigits(next);
    if (val && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = Array(6).fill("");
    pasted.split("").forEach((c, i) => { next[i] = c; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const otp = digits.join("");

  const handleVerify = async () => {
    if (otp.length < 6) { setErrMsg("Please enter all 6 digits."); setHasErr(true); return; }
    setLoading(true); setErrMsg("");

    // Verify the OTP sent by signInWithOtp — type must be "email" (not "signup")
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type:  "email",
    });

    if (verifyError) {
      setErrMsg(verifyError.message || "Invalid or expired OTP. Please try again.");
      setHasErr(true);
      setDigits(Array(6).fill(""));
      inputRefs.current[0]?.focus();
      setLoading(false);
      return;
    }

    // Session is confirmed — now safe to insert profile row into public.users
    if (pendingProfile) {
      const uid = verifyData?.user?.id || pendingProfile.id;
      const { error: profileError } = await supabase.from("users").insert([{
        id:      uid,
        name:    pendingProfile.name,
        email:   pendingProfile.email,
        phone:   pendingProfile.phone,
        stream:  pendingProfile.stream,
        college: pendingProfile.college,
        dob:     pendingProfile.dob,
      }]);

      if (profileError) {
        // Ignore duplicate key — user may be retrying after already verified
        if (!profileError.message.includes("duplicate") && !profileError.message.includes("unique")) {
          setErrMsg("Verified but profile save failed: " + profileError.message);
          setLoading(false);
          return;
        }
      }
    }

    setLoading(false);
    onVerified();
  };

  const handleResend = async () => {
    setResendCD(60); setResendMsg(""); setErrMsg("");
    // Resend uses signInWithOtp which sends a fresh 6-digit code
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (error) setErrMsg("Could not resend OTP: " + error.message);
    else setResendMsg("✓ A new 6-digit OTP has been sent to your email.");
  };

  return (
    <>
      <style>{css}</style>
      <div className="otp-root">
        <div className="otp-grid" />
        <div className="otp-glow" />

        <div className="otp-card">
          <div className="otp-icon">📬</div>

          <h2 className="otp-title">Check your inbox</h2>
          <p className="otp-sub">
            We've sent a 6-digit OTP to<br />
            <span className="otp-email">{email}</span>.<br />
            Enter it below to verify your account.
          </p>

          {/* 6-box OTP input */}
          <div className="otp-boxes" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                className={`otp-box${d ? " filled" : ""}${hasErr ? " err-box" : ""}`}
                type="text" inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleKey(i, e)}
                onKeyDown={e => handleKeyDown(i, e)}
              />
            ))}
          </div>

          <button
            className="otp-verify-btn"
            onClick={handleVerify}
            disabled={loading || otp.length < 6}
          >
            {loading ? "Verifying..." : "Verify OTP →"}
          </button>

          <div className="otp-resend">
            {resendCD > 0 ? (
              <>Resend OTP in <span className="otp-countdown">{resendCD}s</span></>
            ) : (
              <>Didn't get it?{" "}
                <button className="otp-resend-btn" onClick={handleResend} disabled={loading}>
                  Resend OTP
                </button>
              </>
            )}
          </div>

          {errMsg    && <div className="otp-err">⚠ {errMsg}</div>}
          {resendMsg && <div className="otp-success">{resendMsg}</div>}
        </div>
      </div>
    </>
  );
}