import React from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #060a14; }

  .db-root { min-height: 100vh; background: #060a14; font-family: 'DM Mono', monospace; position: relative; overflow-x: hidden; }
  .db-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(0,172,193,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,172,193,.04) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; }

  .db-nav { position: relative; z-index: 10; display: flex; align-items: center; justify-content: space-between; padding: 16px 36px; background: rgba(8,14,28,.92); border-bottom: 1px solid rgba(0,172,193,.1); backdrop-filter: blur(8px); flex-wrap: wrap; gap: 10px; }
  .db-nav-brand { display: flex; align-items: center; gap: 10px; }
  .db-dot { width: 8px; height: 8px; border-radius: 50%; background: #00ACC1; box-shadow: 0 0 10px #00ACC1; animation: dp 2s infinite; }
  @keyframes dp { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(.8);} }
  .db-nav-name { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #00ACC1; }
  .db-nav-right { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .db-nav-email { font-size: 11px; color: #475569; }
  .db-logout { padding: 6px 14px; background: transparent; border: 1px solid rgba(239,68,68,.3); border-radius: 8px; font-family: 'DM Mono', monospace; font-size: 11px; color: #ef4444; cursor: pointer; transition: all .2s; }
  .db-logout:hover { background: rgba(239,68,68,.08); border-color: rgba(239,68,68,.5); }

  .db-body { position: relative; z-index: 1; max-width: 940px; margin: 0 auto; padding: 52px 24px 60px; }

  .db-welcome-tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(0,172,193,.1); border: 1px solid rgba(0,172,193,.2); border-radius: 20px; padding: 4px 14px; font-size: 11px; color: #00ACC1; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 14px; }
  .db-title { font-family: 'Syne', sans-serif; font-size: 36px; font-weight: 800; color: #f1f5f9; line-height: 1.15; margin-bottom: 10px; }
  .db-title span { background: linear-gradient(135deg, #00ACC1, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .db-subtitle { font-size: 13px; color: #64748b; line-height: 1.7; max-width: 480px; margin-bottom: 36px; }

  .db-profile { background: rgba(15,23,42,.8); border: 1px solid rgba(0,172,193,.12); border-radius: 16px; padding: 18px 22px; margin-bottom: 44px; display: flex; flex-wrap: wrap; gap: 16px; align-items: center; }
  .db-avatar { width: 46px; height: 46px; border-radius: 50%; background: linear-gradient(135deg, #00ACC1, #a78bfa); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; color: #fff; flex-shrink: 0; }
  .db-pname { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #f1f5f9; margin-bottom: 2px; }
  .db-pmeta { font-size: 11px; color: #64748b; line-height: 1.6; }
  .db-ptags { display: flex; flex-wrap: wrap; gap: 7px; margin-left: auto; }
  .db-ptag { padding: 3px 11px; border-radius: 20px; font-size: 11px; font-weight: 500; }
  .t-stream  { background: rgba(0,172,193,.12);  border: 1px solid rgba(0,172,193,.25);  color: #00ACC1; }
  .t-college { background: rgba(167,139,250,.1);  border: 1px solid rgba(167,139,250,.25); color: #a78bfa; }

  .db-section { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #475569; margin-bottom: 18px; display: flex; align-items: center; gap: 10px; }
  .db-section::after { content: ''; flex: 1; height: 1px; background: rgba(148,163,184,.09); }

  .db-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  @media (max-width: 580px) { .db-cards { grid-template-columns: 1fr; } }

  .db-card { background: rgba(15,23,42,.8); border: 1.5px solid rgba(148,163,184,.1); border-radius: 20px; padding: 30px 26px; cursor: pointer; transition: all .25s; position: relative; overflow: hidden; }
  .db-card.practice:hover { border-color: rgba(34,197,94,.4); box-shadow: 0 12px 40px rgba(34,197,94,.1); transform: translateY(-4px); }
  .db-card.test:hover     { border-color: rgba(0,172,193,.4);  box-shadow: 0 12px 40px rgba(0,172,193,.1);  transform: translateY(-4px); }

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
  .db-card-btn:hover { transform: translateY(-1px); }
`;

export default function Dashboard({ profile, user, onModeSelect, onLogout }) {
  const name    = profile?.name    || user?.email || "Trainer";
  const initial = name.charAt(0).toUpperCase();
  const stream  = profile?.stream  || null;
  const college = profile?.college || null;
  const dob     = profile?.dob
    ? new Date(profile.dob).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <>
      <style>{css}</style>
      <div className="db-root">
        <div className="db-grid" />

        <nav className="db-nav">
          <div className="db-nav-brand">
            <div className="db-dot" />
            <span className="db-nav-name">ThopsTech · CodeArena</span>
          </div>
          <div className="db-nav-right">
            <span className="db-nav-email">{user?.email}</span>
            <button className="db-logout" onClick={onLogout}>Sign Out</button>
          </div>
        </nav>

        <div className="db-body">
          <div className="db-welcome-tag">👋 Welcome back</div>
          <h1 className="db-title">Hello, <span>{name.split(" ")[0]}</span>!</h1>
          <p className="db-subtitle">
            Pick a mode below — practice at your own pace or jump straight into a timed test.
          </p>

          {/* Profile strip */}
          <div className="db-profile">
            <div className="db-avatar">{initial}</div>
            <div>
              <div className="db-pname">{name}</div>
              <div className="db-pmeta">
                {user?.email}
                {dob     && <> · {dob}</>}
                {profile?.phone && <> · {profile.phone}</>}
              </div>
            </div>
            <div className="db-ptags">
              {stream  && <span className="db-ptag t-stream">📚 {stream}</span>}
              {college && <span className="db-ptag t-college">🏫 {college}</span>}
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
        </div>
      </div>
    </>
  );
}