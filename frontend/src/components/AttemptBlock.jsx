// Reusable attempt limit countdown component
// Import and use in both StudentDashboard and TrainerDashboard

import React, { useState, useEffect } from "react";

const css = `
  .ab-overlay {
    position: fixed; inset: 0; background: rgba(3,7,15,.88);
    z-index: 99999; display: flex; align-items: center; justify-content: center;
    padding: 20px; backdrop-filter: blur(8px);
    animation: abFade .3s ease;
  }
  @keyframes abFade { from{opacity:0;} to{opacity:1;} }
  .ab-card {
    background: #0f172a; border: 1.5px solid rgba(239,68,68,.3);
    border-radius: 20px; padding: 40px 36px; max-width: 420px; width: 100%;
    text-align: center; box-shadow: 0 0 80px rgba(239,68,68,.08);
    font-family: 'DM Mono', monospace;
    animation: abPop .4s cubic-bezier(.16,1,.3,1);
  }
  @keyframes abPop { from{opacity:0;transform:scale(.9);} to{opacity:1;transform:scale(1);} }
  .ab-icon   { font-size: 52px; margin-bottom: 16px; }
  .ab-title  { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #f87171; margin-bottom: 10px; }
  .ab-desc   { font-size: 13px; color: #64748b; line-height: 1.7; margin-bottom: 24px; }
  .ab-timer  {
    background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.2);
    border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;
  }
  .ab-timer-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
  .ab-timer-val   { font-family: 'Syne', sans-serif; font-size: 36px; font-weight: 800; color: #f87171; }
  .ab-timer-sub   { font-size: 11px; color: #475569; margin-top: 4px; }
  .ab-close {
    width: 100%; padding: 12px; background: rgba(148,163,184,.08);
    border: 1px solid rgba(148,163,184,.18); border-radius: 10px;
    font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 600;
    color: #94a3b8; cursor: pointer; transition: all .2s;
  }
  .ab-close:hover { background: rgba(148,163,184,.14); color: #e2e8f0; }
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono&display=swap');
`;

function fmtCountdown(ms) {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

export default function AttemptBlockModal({ attemptBlock, onClose }) {
  const [msLeft, setMsLeft] = useState(() =>
    Math.max(0, new Date(attemptBlock.nextAvailableAt).getTime() - Date.now())
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, new Date(attemptBlock.nextAvailableAt).getTime() - Date.now());
      setMsLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [attemptBlock]);

  const isExpired = msLeft <= 0;

  return (
    <>
      <style>{css}</style>
      <div className="ab-overlay">
        <div className="ab-card">
          <div className="ab-icon">{isExpired ? "✅" : "⏳"}</div>
          <div className="ab-title">
            {isExpired ? "You Can Now Attempt!" : "Attempt Limit Reached"}
          </div>
          <div className="ab-desc">
            {isExpired
              ? "The 24-hour cooldown has ended. You can now take another test."
              : "You have used 2 test attempts in the last 24 hours. Please wait before your next attempt."}
          </div>
          {!isExpired && (
            <div className="ab-timer">
              <div className="ab-timer-label">Next attempt available in</div>
              <div className="ab-timer-val">{fmtCountdown(msLeft)}</div>
              <div className="ab-timer-sub">
                Available at {new Date(attemptBlock.nextAvailableAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          )}
          <button className="ab-close" onClick={onClose}>
            {isExpired ? "✓ Dismiss & Start Test" : "← Back to Dashboard"}
          </button>
        </div>
      </div>
    </>
  );
}