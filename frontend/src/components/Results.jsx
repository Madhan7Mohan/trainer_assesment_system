import React, { useRef, useState, useEffect } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #03070f; }

  .res-root {
    min-height: 100vh; background: #03070f;
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Mono', monospace; padding: 40px 20px;
    position: relative; overflow: hidden;
  }
  .res-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(0,172,193,.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,172,193,.04) 1px, transparent 1px);
    background-size: 36px 36px; pointer-events: none;
  }

  .res-card {
    position: relative; background: rgba(7,15,30,.97);
    border: 1px solid rgba(0,172,193,.18); border-radius: 24px;
    padding: 48px; width: 100%; max-width: 660px;
    box-shadow: 0 0 80px rgba(0,172,193,.06), 0 32px 80px rgba(0,0,0,.7);
    animation: pop .6s cubic-bezier(.16,1,.3,1);
  }
  @keyframes pop { from { opacity:0; transform:scale(.92) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }

  .res-hero { text-align: center; margin-bottom: 36px; }
  .res-emoji { font-size: 58px; margin-bottom: 14px; animation: bounce .6s .3s cubic-bezier(.16,1,.3,1) both; }
  @keyframes bounce { from { opacity:0; transform:scale(.5); } to { opacity:1; transform:scale(1); } }

  .res-name { font-family: 'Cabinet Grotesk', sans-serif; font-size: 24px; font-weight: 800; color: #f1f5f9; margin-bottom: 4px; }
  .res-sub  { font-size: 12px; color: #64748b; }

  .score-block { text-align: center; margin: 20px 0 28px; }
  .score-lbl { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #94a3b8; margin-bottom: 7px; }
  .score-val {
    font-family: 'Cabinet Grotesk', sans-serif; font-size: 68px;
    font-weight: 800; line-height: 1;
    background: linear-gradient(135deg, #00ACC1, #a78bfa);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    animation: cntUp .8s .4s ease both;
  }
  @keyframes cntUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  .score-of { font-size: 16px; color: #475569; margin-top: 4px; }

  .badge-row { display: flex; justify-content: center; gap: 8px; margin-bottom: 28px; flex-wrap: wrap; }
  .res-badge { padding: 5px 14px; border-radius: 20px; font-size: 11px; font-weight: 600; font-family: 'DM Mono', monospace; }

  .stats-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 24px; }
  .stat { background: rgba(15,23,42,.8); border: 1px solid rgba(148,163,184,.08); border-radius: 12px; padding: 14px 10px; text-align: center; }
  .stat-val { font-family: 'Cabinet Grotesk', sans-serif; font-size: 22px; font-weight: 800; margin-bottom: 3px; }
  .stat-lbl { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }

  .divider { height: 1px; background: rgba(148,163,184,.08); margin: 20px 0; }
  .bd-title { font-family: 'Cabinet Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }

  .bd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 28px; }
  .bd-item { display: flex; justify-content: space-between; align-items: center; padding: 11px 14px; border-radius: 10px; background: rgba(15,23,42,.7); font-size: 12px; }
  .bd-item .lbl { color: #94a3b8; }
  .bd-item .val { font-weight: 600; color: #e2e8f0; }
  .bd-item .val.g { color: #22c55e; }
  .bd-item .val.r { color: #ef4444; }

  .btn-row { display: flex; gap: 10px; margin-top: 4px; }

  .res-btn {
    flex: 1; padding: 14px;
    background: linear-gradient(135deg, #00ACC1, #0891b2);
    border: none; border-radius: 12px;
    font-family: 'Cabinet Grotesk', sans-serif;
    font-size: 15px; font-weight: 700; color: #fff;
    cursor: pointer; transition: all .2s;
    box-shadow: 0 4px 18px rgba(0,172,193,.25);
  }
  .res-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,172,193,.38); }
  .res-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  .res-btn-ghost {
    flex: 0 0 auto; padding: 14px 18px;
    background: rgba(148,163,184,.07);
    border: 1px solid rgba(148,163,184,.18); border-radius: 12px;
    font-family: 'Cabinet Grotesk', sans-serif;
    font-size: 15px; font-weight: 700; color: #94a3b8;
    cursor: pointer; transition: all .2s;
  }
  .res-btn-ghost:hover { background: rgba(148,163,184,.14); color: #e2e8f0; border-color: rgba(148,163,184,.35); }
  .res-btn-ghost:disabled { opacity: .5; cursor: not-allowed; }

  /* Screenshot overlay */
  .screenshot-overlay {
    position: fixed; inset: 0; background: rgba(3,7,15,.92);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    z-index: 9999; gap: 20px;
    animation: fadeIn .25s ease;
  }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  .screenshot-overlay img {
    max-width: 90vw; max-height: 70vh;
    border-radius: 16px; border: 1px solid rgba(0,172,193,.3);
    box-shadow: 0 0 60px rgba(0,172,193,.12);
  }
  .screenshot-overlay-title {
    font-family: 'Cabinet Grotesk', sans-serif; font-size: 18px; font-weight: 700;
    color: #f1f5f9; text-align: center;
  }
  .screenshot-overlay-sub { font-size: 12px; color: #64748b; text-align: center; }
  .screenshot-btn-row { display: flex; gap: 10px; }
  .sc-btn-dl {
    padding: 12px 24px; background: linear-gradient(135deg, #00ACC1, #0891b2);
    border: none; border-radius: 10px; font-family: 'Cabinet Grotesk', sans-serif;
    font-size: 14px; font-weight: 700; color: #fff; cursor: pointer; transition: all .2s;
  }
  .sc-btn-dl:hover { transform: translateY(-1px); }
  .sc-btn-skip {
    padding: 12px 24px; background: rgba(148,163,184,.1);
    border: 1px solid rgba(148,163,184,.2); border-radius: 10px;
    font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; font-weight: 700;
    color: #94a3b8; cursor: pointer; transition: all .2s;
  }
  .sc-btn-skip:hover { background: rgba(148,163,184,.18); color: #e2e8f0; }
`;

// Dynamically load html2canvas from CDN
function loadHtml2Canvas() {
  return new Promise((resolve, reject) => {
    if (window.html2canvas) { resolve(window.html2canvas); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    s.async = true;
    s.onload  = () => resolve(window.html2canvas);
    s.onerror = () => reject(new Error("Could not load html2canvas"));
    document.head.appendChild(s);
  });
}

export default function Results({ trainer, result, onRetake }) {
  const cardRef   = useRef(null);
  const [screenshot, setScreenshot] = useState(null);   // base64 data URL
  const [capturing, setCapturing]   = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const {
    codingScore, mcqScore, totalScore, percentage,
    codingPassed, mcqCorrect, totalCoding, totalMCQ, totalMarks,
  } = result;

  const grade =
    percentage >= 80 ? { label: "Excellent", emoji: "🏆", color: "#facc15" } :
    percentage >= 60 ? { label: "Good",       emoji: "👍", color: "#22c55e" } :
    percentage >= 40 ? { label: "Average",    emoji: "📈", color: "#f97316" } :
                       { label: "Needs Work", emoji: "💪", color: "#ef4444" };

  const stream = trainer?.stream
    ? trainer.stream.charAt(0).toUpperCase() + trainer.stream.slice(1)
    : "";

  // ── Take screenshot ────────────────────────────────────────────────────────
  const captureCard = async () => {
    if (!cardRef.current) return null;
    try {
      const h2c    = await loadHtml2Canvas();
      const canvas = await h2c(cardRef.current, {
        backgroundColor: "rgb(7,15,30)",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      return canvas.toDataURL("image/png");
    } catch (e) {
      console.warn("Screenshot failed:", e);
      return null;
    }
  };

  const downloadImage = (dataUrl) => {
    const a = document.createElement("a");
    a.href     = dataUrl;
    a.download = `${trainer?.name ?? "result"}_ThopsTech_Result.png`;
    a.click();
  };

  // ── Handle "Back to Dashboard" — capture first, then show overlay ──────────
  const handleBack = async () => {
    setCapturing(true);
    const img = await captureCard();
    setCapturing(false);
    if (img) {
      setScreenshot(img);
      setShowOverlay(true);
    } else {
      // Screenshot failed silently — just navigate
      onRetake();
    }
  };

  const handleDownloadAndGo = () => {
    if (screenshot) downloadImage(screenshot);
    setShowOverlay(false);
    onRetake();
  };

  const handleSkipAndGo = () => {
    setShowOverlay(false);
    onRetake();
  };

  return (
    <>
      <style>{css}</style>

      {/* ── Screenshot preview overlay ── */}
      {showOverlay && (
        <div className="screenshot-overlay">
          <div className="screenshot-overlay-title">📸 Save Your Results</div>
          <img src={screenshot} alt="Results screenshot" />
          <div className="screenshot-overlay-sub">Download your result card before going back to the dashboard</div>
          <div className="screenshot-btn-row">
            <button className="sc-btn-dl" onClick={handleDownloadAndGo}>
              ⬇ Download & Continue
            </button>
            <button className="sc-btn-skip" onClick={handleSkipAndGo}>
              Skip
            </button>
          </div>
        </div>
      )}

      <div className="res-root">
        <div className="res-grid" />

        {/* The card we capture */}
        <div className="res-card" ref={cardRef}>

          <div className="res-hero">
            <div className="res-emoji">{grade.emoji}</div>
            <div className="res-name">{trainer?.name}</div>
            <div className="res-sub">{stream} · Test Completed</div>
          </div>

          <div className="score-block">
            <div className="score-lbl">Total Score</div>
            <div className="score-val">{totalScore}</div>
            <div className="score-of">out of {totalMarks} marks</div>
          </div>

          <div className="badge-row">
            <span className="res-badge"
              style={{ background: `${grade.color}22`, color: grade.color, border: `1px solid ${grade.color}44` }}>
              {grade.label}
            </span>
            <span className="res-badge"
              style={{ background: "rgba(0,172,193,.12)", color: "#00ACC1", border: "1px solid rgba(0,172,193,.25)" }}>
              {percentage}%
            </span>
          </div>

          <div className="stats-grid">
            <div className="stat">
              <div className="stat-val" style={{ color: "#00ACC1" }}>{totalScore}</div>
              <div className="stat-lbl">Total Marks</div>
            </div>
            <div className="stat">
              <div className="stat-val" style={{ color: "#22c55e" }}>{codingPassed ? "✓" : "✗"}</div>
              <div className="stat-lbl">Coding Passed</div>
            </div>
            <div className="stat">
              <div className="stat-val" style={{ color: "#a78bfa" }}>{mcqCorrect}</div>
              <div className="stat-lbl">MCQ Correct</div>
            </div>
          </div>

          <div className="divider" />
          <div className="bd-title">Score Breakdown</div>

          <div className="bd-grid">
            <div className="bd-item"><span className="lbl">Coding Score</span><span className="val g">{codingScore} pts</span></div>
            <div className="bd-item"><span className="lbl">MCQ Score</span><span className="val" style={{ color: "#a78bfa" }}>{mcqScore} pts</span></div>
            <div className="bd-item"><span className="lbl">Coding Total</span><span className="val">{codingScore} / {totalCoding}</span></div>
            <div className="bd-item"><span className="lbl">MCQ Answered</span><span className="val">{mcqCorrect} / {totalMCQ}</span></div>
            <div className="bd-item">
              <span className="lbl">Percentage</span>
              <span className={`val ${percentage >= 60 ? "g" : "r"}`}>{percentage}%</span>
            </div>
            <div className="bd-item">
              <span className="lbl">Grade</span>
              <span className="val" style={{ color: grade.color }}>{grade.label}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="btn-row">
            <button className="res-btn" onClick={handleBack} disabled={capturing}>
              {capturing ? "📸 Capturing…" : "↩ Back to Dashboard"}
            </button>
            <button
              className="res-btn-ghost"
              title="Download result card"
              onClick={async () => {
                setCapturing(true);
                const img = await captureCard();
                setCapturing(false);
                if (img) downloadImage(img);
              }}
              disabled={capturing}
            >
              ⬇
            </button>
          </div>

        </div>
      </div>
    </>
  );
}