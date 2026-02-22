import React, { useState, useEffect } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #060a14; }

  .db-root { min-height: 100vh; background: #060a14; font-family: 'DM Mono', monospace; position: relative; overflow-x: hidden; }

  /* Animated grid */
  .db-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(0,172,193,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,172,193,.04) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; }

  /* Glowing orbs */
  .db-orb { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(80px); opacity: 0.18; }
  .db-orb-1 { width: 400px; height: 400px; background: radial-gradient(circle, #00ACC1, transparent); top: -100px; right: -100px; animation: orbFloat 8s ease-in-out infinite; }
  .db-orb-2 { width: 300px; height: 300px; background: radial-gradient(circle, #a78bfa, transparent); bottom: 100px; left: -80px; animation: orbFloat 10s ease-in-out infinite reverse; }
  @keyframes orbFloat { 0%,100%{transform:translate(0,0);} 50%{transform:translate(20px,-30px);} }

  /* Nav */
  .db-nav { position: relative; z-index: 10; display: flex; align-items: center; justify-content: space-between; padding: 16px 36px; background: rgba(8,14,28,.92); border-bottom: 1px solid rgba(0,172,193,.1); backdrop-filter: blur(8px); flex-wrap: wrap; gap: 10px; }
  .db-nav-brand { display: flex; align-items: center; gap: 10px; }
  .db-dot { width: 8px; height: 8px; border-radius: 50%; background: #00ACC1; box-shadow: 0 0 10px #00ACC1; animation: dp 2s infinite; }
  @keyframes dp { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(.8);} }
  .db-nav-name { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #00ACC1; }
  .db-nav-right { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }

  /* Live time badge */
  .db-nav-time { font-size: 11px; color: #475569; display: flex; align-items: center; gap: 5px; }
  .db-nav-time-dot { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px #22c55e; animation: dp 1.5s infinite; }

  /* Greeting in nav */
  .db-nav-user { font-size: 11px; color: #94a3b8; }
  .db-nav-user span { color: #00ACC1; font-weight: 500; }

  .db-logout { padding: 6px 14px; background: transparent; border: 1px solid rgba(239,68,68,.3); border-radius: 8px; font-family: 'DM Mono', monospace; font-size: 11px; color: #ef4444; cursor: pointer; transition: all .2s; }
  .db-logout:hover { background: rgba(239,68,68,.08); border-color: rgba(239,68,68,.5); box-shadow: 0 0 12px rgba(239,68,68,.1); }

  /* Body */
  .db-body { position: relative; z-index: 1; max-width: 960px; margin: 0 auto; padding: 52px 24px 80px; }

  .db-welcome-tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(0,172,193,.1); border: 1px solid rgba(0,172,193,.2); border-radius: 20px; padding: 4px 14px; font-size: 11px; color: #00ACC1; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 14px; }
  .db-title { font-family: 'Syne', sans-serif; font-size: 36px; font-weight: 800; color: #f1f5f9; line-height: 1.15; margin-bottom: 10px; }
  .db-title span { background: linear-gradient(135deg, #00ACC1, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .db-subtitle { font-size: 13px; color: #64748b; line-height: 1.7; max-width: 480px; margin-bottom: 36px; }

  /* Profile strip */
  .db-profile { background: rgba(15,23,42,.8); border: 1px solid rgba(0,172,193,.12); border-radius: 16px; padding: 18px 22px; margin-bottom: 28px; display: flex; flex-wrap: wrap; gap: 16px; align-items: center; backdrop-filter: blur(4px); }
  .db-avatar { width: 46px; height: 46px; border-radius: 50%; background: linear-gradient(135deg, #00ACC1, #a78bfa); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; color: #fff; flex-shrink: 0; box-shadow: 0 0 20px rgba(0,172,193,.25); }
  .db-pname { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #f1f5f9; margin-bottom: 2px; }
  .db-pmeta { font-size: 11px; color: #64748b; line-height: 1.6; }
  .db-ptags { display: flex; flex-wrap: wrap; gap: 7px; margin-left: auto; }
  .db-ptag { padding: 3px 11px; border-radius: 20px; font-size: 11px; font-weight: 500; }
  .t-stream  { background: rgba(0,172,193,.12);  border: 1px solid rgba(0,172,193,.25);  color: #00ACC1; }
  .t-college { background: rgba(167,139,250,.1);  border: 1px solid rgba(167,139,250,.25); color: #a78bfa; }

  /* Stats row */
  .db-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 36px; }
  @media (max-width: 580px) { .db-stats { grid-template-columns: 1fr 1fr; } }
  .db-stat { background: rgba(15,23,42,.6); border: 1px solid rgba(148,163,184,.08); border-radius: 14px; padding: 16px 20px; display: flex; flex-direction: column; gap: 4px; transition: border-color .2s; }
  .db-stat:hover { border-color: rgba(0,172,193,.2); }
  .db-stat-label { font-size: 10px; color: #475569; letter-spacing: 1px; text-transform: uppercase; }
  .db-stat-value { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #f1f5f9; }
  .db-stat-sub { font-size: 10px; color: #64748b; }

  /* Tech ticker */
  .db-ticker-wrap { overflow: hidden; background: rgba(0,172,193,.04); border: 1px solid rgba(0,172,193,.1); border-radius: 10px; padding: 8px 0; margin-bottom: 36px; position: relative; }
  .db-ticker-wrap::before, .db-ticker-wrap::after { content: ''; position: absolute; top: 0; bottom: 0; width: 48px; z-index: 2; pointer-events: none; }
  .db-ticker-wrap::before { left: 0; background: linear-gradient(90deg, #060a14, transparent); }
  .db-ticker-wrap::after  { right: 0; background: linear-gradient(-90deg, #060a14, transparent); }
  .db-ticker { display: flex; gap: 0; animation: tickerScroll 30s linear infinite; width: max-content; }
  .db-ticker:hover { animation-play-state: paused; }
  @keyframes tickerScroll { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }
  .db-tick-item { display: flex; align-items: center; gap: 7px; padding: 0 28px; font-size: 11px; color: #475569; white-space: nowrap; border-right: 1px solid rgba(148,163,184,.06); }
  .db-tick-item span { color: #00ACC1; font-weight: 500; }
  .db-tick-badge { padding: 1px 7px; border-radius: 20px; font-size: 9px; font-weight: 600; }
  .tb-new  { background: rgba(34,197,94,.1);  border: 1px solid rgba(34,197,94,.25);  color: #22c55e; }
  .tb-hot  { background: rgba(249,115,22,.1); border: 1px solid rgba(249,115,22,.25); color: #f97316; }
  .tb-tip  { background: rgba(0,172,193,.1);  border: 1px solid rgba(0,172,193,.25);  color: #00ACC1; }

  /* Section header */
  .db-section { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #475569; margin-bottom: 18px; display: flex; align-items: center; gap: 10px; }
  .db-section::after { content: ''; flex: 1; height: 1px; background: rgba(148,163,184,.09); }

  /* Cards */
  .db-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  @media (max-width: 580px) { .db-cards { grid-template-columns: 1fr; } }

  .db-card { background: rgba(15,23,42,.8); border: 1.5px solid rgba(148,163,184,.1); border-radius: 20px; padding: 30px 26px; cursor: pointer; transition: all .25s; position: relative; overflow: hidden; backdrop-filter: blur(4px); }
  .db-card::before { content: ''; position: absolute; inset: 0; opacity: 0; transition: opacity .3s; pointer-events: none; }
  .db-card.practice::before { background: radial-gradient(circle at top right, rgba(34,197,94,.06), transparent 60%); }
  .db-card.test::before     { background: radial-gradient(circle at top right, rgba(0,172,193,.06), transparent 60%); }
  .db-card.practice:hover { border-color: rgba(34,197,94,.4); box-shadow: 0 12px 40px rgba(34,197,94,.1); transform: translateY(-4px); }
  .db-card.practice:hover::before { opacity: 1; }
  .db-card.test:hover     { border-color: rgba(0,172,193,.4);  box-shadow: 0 12px 40px rgba(0,172,193,.1);  transform: translateY(-4px); }
  .db-card.test:hover::before { opacity: 1; }

  .db-card-icon  { font-size: 38px; margin-bottom: 16px; }
  .db-card-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #f1f5f9; margin-bottom: 10px; }
  .db-card-desc  { font-size: 12px; color: #64748b; line-height: 1.75; margin-bottom: 20px; }

  .db-pills { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 22px; }
  .pill { padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; }
  .p-green  { background: rgba(34,197,94,.1);  border: 1px solid rgba(34,197,94,.25);  color: #22c55e; }
  .p-cyan   { background: rgba(0,172,193,.1);  border: 1px solid rgba(0,172,193,.25);  color: #00ACC1; }
  .p-orange { background: rgba(249,115,22,.1); border: 1px solid rgba(249,115,22,.25); color: #f97316; }

  .db-card-btn { width: 100%; padding: 12px; border: none; border-radius: 10px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; transition: all .2s; }
  .btn-practice { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; box-shadow: 0 4px 16px rgba(34,197,94,.18); }
  .btn-test     { background: linear-gradient(135deg, #00ACC1, #0891b2); color: #fff; box-shadow: 0 4px 16px rgba(0,172,193,.18); }
  .db-card-btn:hover { transform: translateY(-1px); filter: brightness(1.1); }

  /* Footer note */
  .db-footer-note { margin-top: 44px; text-align: center; font-size: 11px; color: #334155; line-height: 1.6; }
  .db-footer-note span { color: #475569; }
`;

const TICKER_ITEMS = [
  { icon: "⚡", label: "Python 3.13 released", badge: "NEW", badgeClass: "tb-new" },
  { icon: "🔥", label: "React 19 is stable", badge: "HOT", badgeClass: "tb-hot" },
  { icon: "💡", label: "Tip: Use list comprehensions for cleaner Python loops", badge: "TIP", badgeClass: "tb-tip" },
  { icon: "🚀", label: "TypeScript 5.5 ships faster type-checking", badge: "NEW", badgeClass: "tb-new" },
  { icon: "🔥", label: "AI coding tools boost dev productivity by 55%", badge: "HOT", badgeClass: "tb-hot" },
  { icon: "💡", label: "Tip: Master Big-O notation to ace DSA interviews", badge: "TIP", badgeClass: "tb-tip" },
  { icon: "⚡", label: "Node.js 22 LTS is now supported", badge: "NEW", badgeClass: "tb-new" },
  { icon: "🔥", label: "LeetCode weekly contests are great prep", badge: "HOT", badgeClass: "tb-hot" },
  { icon: "💡", label: "Tip: Practice 1 DSA problem daily for 30 days", badge: "TIP", badgeClass: "tb-tip" },
];

// Double for seamless loop
const TICKER_DOUBLED = [...TICKER_ITEMS, ...TICKER_ITEMS];

function LiveTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="db-nav-time">
      <span className="db-nav-time-dot" />
      {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

export default function Dashboard({ profile, user, onModeSelect, onLogout, onSignOut }) {
  // Support both onLogout and onSignOut prop names
  const handleSignOut = onLogout || onSignOut;

  const name    = profile?.name    || user?.name    || user?.email?.split("@")[0] || "Trainer";
  const firstName = name.split(" ")[0];
  const initial = firstName.charAt(0).toUpperCase();
  const stream  = profile?.stream  || null;
  const college = profile?.college || null;
  const dob     = profile?.dob
    ? new Date(profile.dob).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <>
      <style>{css}</style>
      <div className="db-root">
        <div className="db-grid" />
        <div className="db-orb db-orb-1" />
        <div className="db-orb db-orb-2" />

        <nav className="db-nav">
          <div className="db-nav-brand">
            <div className="db-dot" />
            <span className="db-nav-name">ThopsTech · CodeArena</span>
          </div>
          <div className="db-nav-right">
            <LiveTime />
            <span className="db-nav-user">{greeting}, <span>{firstName}</span></span>
            <button className="db-logout" onClick={handleSignOut}>Sign Out</button>
          </div>
        </nav>

        <div className="db-body">
          <div className="db-welcome-tag">👋 Welcome back</div>
          <h1 className="db-title">Hello, <span>{firstName}</span>!</h1>
          <p className="db-subtitle">
            Pick a mode below — practice at your own pace or jump straight into a timed test. Good luck!
          </p>

          {/* Profile strip */}
          <div className="db-profile">
            <div className="db-avatar">{initial}</div>
            <div>
              <div className="db-pname">{name}</div>
              <div className="db-pmeta">
                {profile?.email || user?.email}
                {dob             && <> · {dob}</>}
                {profile?.phone  && <> · {profile.phone}</>}
              </div>
            </div>
            <div className="db-ptags">
              {stream  && <span className="db-ptag t-stream">📚 {stream}</span>}
              {college && <span className="db-ptag t-college">🏫 {college}</span>}
            </div>
          </div>

          {/* Quick stats */}
          <div className="db-stats">
            <div className="db-stat">
              <span className="db-stat-label">Coding Questions</span>
              <span className="db-stat-value">20</span>
              <span className="db-stat-sub">Available in practice</span>
            </div>
            <div className="db-stat">
              <span className="db-stat-label">Test Duration</span>
              <span className="db-stat-value">60m</span>
              <span className="db-stat-sub">5 coding + 5 sql + 10 MCQ</span>
            </div>
            <div className="db-stat">
              <span className="db-stat-label">Pass Threshold</span>
              <span className="db-stat-value">75%</span>
              <span className="db-stat-sub">Score to qualify</span>
            </div>
          </div>

          {/* Tech ticker */}
          <div className="db-ticker-wrap">
            <div className="db-ticker">
              {TICKER_DOUBLED.map((item, i) => (
                <div key={i} className="db-tick-item">
                  {item.icon} <span>{item.label}</span>
                  <span className={`db-tick-badge ${item.badgeClass}`}>{item.badge}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="db-section">Choose your mode</div>

          <div className="db-cards">
            {/* Practice */}
            <div className="db-card practice" onClick={() => onModeSelect("practice")}>
              <div className="db-card-icon">📚</div>
              <div className="db-card-title">Practice</div>
              <div className="db-card-desc">
                Browse all 20 coding questions at your own pace. Write code, run tests, and learn — no timer, no pressure.
              </div>
              <div className="db-pills">
                <span className="pill p-green">20 Coding Qs</span>
                <span className="pill p-green">No Timer</span>
                <span className="pill p-green">Unlimited Attempts</span>
              </div>
              <button className="db-card-btn btn-practice">Start Practice →</button>
            </div>

            {/* Test */}
            <div className="db-card test" onClick={() => onModeSelect("test")}>
              <div className="db-card-icon">🎯</div>
              <div className="db-card-title">Take Test</div>
              <div className="db-card-desc">
                10 random questions — 6 coding + 4 logical MCQs. You have 80 minutes. Score is saved to your profile.
              </div>
              <div className="db-pills">
                <span className="pill p-cyan">6 Coding + 4 MCQ</span>
                <span className="pill p-orange">⏱ 80 Minutes</span>
                <span className="pill p-cyan">Score Recorded</span>
              </div>
              <button className="db-card-btn btn-test">Start Test →</button>
            </div>
          </div>

          <div className="db-footer-note">
            Scores are recorded only in <span>Test</span> mode · Practice is always free and untimed
          </div>
        </div>
      </div>
    </>
  );
}