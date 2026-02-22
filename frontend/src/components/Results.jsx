import React, { useRef, useState, useEffect } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #03070f; }

  /* ── Analysing loader ── */
  .analyse-root {
    min-height: 100vh; background: #03070f;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-family: 'DM Mono', monospace; gap: 32px; padding: 40px;
    position: relative; overflow: hidden;
  }
  .analyse-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(0,172,193,.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,172,193,.04) 1px, transparent 1px);
    background-size: 36px 36px; pointer-events: none;
  }
  .analyse-orb {
    position: absolute; border-radius: 50%; filter: blur(90px); opacity: .15; pointer-events: none;
    width: 360px; height: 360px;
    background: radial-gradient(circle, #00ACC1, transparent);
    animation: orbPulse 3s ease-in-out infinite;
  }
  @keyframes orbPulse { 0%,100%{transform:scale(1);opacity:.15;} 50%{transform:scale(1.2);opacity:.25;} }

  .analyse-icon { font-size: 56px; animation: iconSpin 2s ease-in-out infinite; position: relative; z-index:1; }
  @keyframes iconSpin { 0%,100%{transform:rotate(-5deg) scale(1);} 50%{transform:rotate(5deg) scale(1.1);} }

  .analyse-title {
    font-family: 'Cabinet Grotesk', sans-serif; font-size: 28px; font-weight: 800;
    color: #f1f5f9; text-align: center; position: relative; z-index: 1;
  }
  .analyse-title span { color: #00ACC1; }

  .analyse-steps { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 360px; position: relative; z-index: 1; }
  .analyse-step {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px; border-radius: 10px;
    background: rgba(15,23,42,.7); border: 1px solid rgba(148,163,184,.08);
    font-size: 12px; color: #64748b;
    transition: all .4s ease;
  }
  .analyse-step.active  { border-color: rgba(0,172,193,.3); color: #00ACC1; background: rgba(0,172,193,.06); }
  .analyse-step.done    { border-color: rgba(34,197,94,.25); color: #22c55e; background: rgba(34,197,94,.06); }
  .analyse-step-icon    { font-size: 16px; flex-shrink: 0; }
  .analyse-step-dot {
    width: 8px; height: 8px; border-radius: 50%; margin-left: auto; flex-shrink: 0;
    background: #1e293b;
  }
  .analyse-step.active .analyse-step-dot { background: #00ACC1; animation: dotPulse 1s infinite; }
  .analyse-step.done   .analyse-step-dot { background: #22c55e; }
  @keyframes dotPulse { 0%,100%{opacity:1;} 50%{opacity:.3;} }

  .analyse-bar-wrap { width: 100%; max-width: 360px; position: relative; z-index: 1; }
  .analyse-bar-label { display: flex; justify-content: space-between; font-size: 11px; color: #475569; margin-bottom: 8px; }
  .analyse-bar-track { height: 6px; background: #1e293b; border-radius: 20px; overflow: hidden; }
  .analyse-bar-fill  {
    height: 100%; border-radius: 20px;
    background: linear-gradient(90deg, #00ACC1, #a78bfa);
    transition: width .5s cubic-bezier(.4,0,.2,1);
  }

  /* ── Result card ── */
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
    padding: 48px; width: 100%; max-width: 680px;
    box-shadow: 0 0 80px rgba(0,172,193,.06), 0 32px 80px rgba(0,0,0,.7);
    animation: pop .6s cubic-bezier(.16,1,.3,1);
  }
  @keyframes pop { from { opacity:0; transform:scale(.92) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }

  .res-hero { text-align: center; margin-bottom: 32px; }
  .res-emoji { font-size: 58px; margin-bottom: 14px; animation: bounce .6s .3s cubic-bezier(.16,1,.3,1) both; }
  @keyframes bounce { from { opacity:0; transform:scale(.5); } to { opacity:1; transform:scale(1); } }
  .res-name { font-family: 'Cabinet Grotesk', sans-serif; font-size: 24px; font-weight: 800; color: #f1f5f9; margin-bottom: 4px; }
  .res-sub  { font-size: 12px; color: #64748b; }

  /* Score dual display */
  .score-dual { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0 24px; }
  .score-block { text-align: center; background: rgba(15,23,42,.6); border-radius: 16px; padding: 20px 12px; border: 1px solid rgba(148,163,184,.08); }
  .score-lbl { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #94a3b8; margin-bottom: 7px; }
  .score-val {
    font-family: 'Cabinet Grotesk', sans-serif; font-size: 52px; font-weight: 800; line-height: 1;
    background: linear-gradient(135deg, #00ACC1, #a78bfa);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .score-val.avg { background: linear-gradient(135deg, #22c55e, #00ACC1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .score-of { font-size: 12px; color: #475569; margin-top: 4px; }
  .score-attempts { font-size: 10px; color: #334155; margin-top: 3px; }

  .badge-row { display: flex; justify-content: center; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
  .res-badge { padding: 5px 14px; border-radius: 20px; font-size: 11px; font-weight: 600; font-family: 'DM Mono', monospace; }

  .stats-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 20px; }
  .stat { background: rgba(15,23,42,.8); border: 1px solid rgba(148,163,184,.08); border-radius: 12px; padding: 14px 10px; text-align: center; }
  .stat-val { font-family: 'Cabinet Grotesk', sans-serif; font-size: 22px; font-weight: 800; margin-bottom: 3px; }
  .stat-lbl { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }

  .divider { height: 1px; background: rgba(148,163,184,.08); margin: 18px 0; }
  .bd-title { font-family: 'Cabinet Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }

  .bd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 24px; }
  .bd-item { display: flex; justify-content: space-between; align-items: center; padding: 11px 14px; border-radius: 10px; background: rgba(15,23,42,.7); font-size: 12px; }
  .bd-item .lbl { color: #94a3b8; }
  .bd-item .val { font-weight: 600; color: #e2e8f0; }
  .bd-item .val.g { color: #22c55e; }
  .bd-item .val.r { color: #ef4444; }
  .bd-item .val.b { color: #00ACC1; }

  .btn-row { display: flex; gap: 10px; margin-top: 4px; }
  .res-btn {
    flex: 1; padding: 14px;
    background: linear-gradient(135deg, #00ACC1, #0891b2);
    border: none; border-radius: 12px;
    font-family: 'Cabinet Grotesk', sans-serif; font-size: 15px; font-weight: 700; color: #fff;
    cursor: pointer; transition: all .2s; box-shadow: 0 4px 18px rgba(0,172,193,.25);
  }
  .res-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,172,193,.38); }
  .res-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }
  .res-btn-ghost {
    flex: 0 0 auto; padding: 14px 18px;
    background: rgba(148,163,184,.07); border: 1px solid rgba(148,163,184,.18); border-radius: 12px;
    font-family: 'Cabinet Grotesk', sans-serif; font-size: 15px; font-weight: 700; color: #94a3b8;
    cursor: pointer; transition: all .2s; display: flex; align-items: center; gap: 6px;
  }
  .res-btn-ghost:hover { background: rgba(148,163,184,.14); color: #e2e8f0; border-color: rgba(148,163,184,.35); }
  .res-btn-ghost:disabled { opacity: .5; cursor: not-allowed; }

  /* Screenshot overlay */
  .screenshot-overlay {
    position: fixed; inset: 0; background: rgba(3,7,15,.96);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    z-index: 9999; gap: 20px; animation: fadeIn .25s ease; padding: 20px;
  }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  .screenshot-overlay img {
    max-width: 86vw; max-height: 60vh;
    border-radius: 16px; border: 1px solid rgba(0,172,193,.3);
    box-shadow: 0 0 60px rgba(0,172,193,.12);
  }
  .screenshot-overlay-title { font-family: 'Cabinet Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: #f1f5f9; text-align: center; }
  .screenshot-overlay-sub   { font-size: 12px; color: #64748b; text-align: center; max-width: 360px; line-height: 1.6; }
  .screenshot-btn-row { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
  .sc-btn-dl {
    padding: 12px 28px; background: linear-gradient(135deg, #00ACC1, #0891b2);
    border: none; border-radius: 10px; font-family: 'Cabinet Grotesk', sans-serif;
    font-size: 14px; font-weight: 700; color: #fff; cursor: pointer; transition: all .2s;
  }
  .sc-btn-dl:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,172,193,.3); }
  .sc-btn-skip {
    padding: 12px 28px; background: rgba(148,163,184,.1);
    border: 1px solid rgba(148,163,184,.2); border-radius: 10px;
    font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; font-weight: 700;
    color: #94a3b8; cursor: pointer; transition: all .2s;
  }
  .sc-btn-skip:hover { background: rgba(148,163,184,.18); color: #e2e8f0; }

  /* Copy-paste blocked toast */
  .no-copy-toast {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.25);
    border-radius: 8px; padding: 8px 18px; font-size: 12px; color: #f87171;
    font-family: 'DM Mono', monospace; z-index: 99999; pointer-events: none;
    animation: toastIn .2s ease;
  }
  @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(8px);} to{opacity:1;transform:translateX(-50%) translateY(0);} }
`;

const ANALYSE_STEPS = [
  { icon: "📊", label: "Collecting your answers..." },
  { icon: "🧮", label: "Calculating scores..."       },
  { icon: "📈", label: "Computing averages..."        },
  { icon: "🏆", label: "Generating your report..."   },
];

// Load html2canvas from CDN
function loadHtml2Canvas() {
  return new Promise((resolve, reject) => {
    if (window.html2canvas) { resolve(window.html2canvas); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    s.async = true;
    s.onload  = () => resolve(window.html2canvas);
    s.onerror = () => reject(new Error("html2canvas failed to load"));
    document.head.appendChild(s);
  });
}

// ── Fix 2: Creative analysing loader ──────────────────────────────────────
function AnalysingScreen({ onDone }) {
  const [activeStep, setActiveStep] = useState(0);
  const [progress,   setProgress]   = useState(0);

  useEffect(() => {
    // Step through each analysis stage
    const stepDuration = 700; // ms per step
    let step = 0;

    const stepInterval = setInterval(() => {
      step++;
      setActiveStep(step);
      setProgress(Math.round((step / ANALYSE_STEPS.length) * 100));
      if (step >= ANALYSE_STEPS.length) {
        clearInterval(stepInterval);
        // Small pause then reveal results
        setTimeout(onDone, 500);
      }
    }, stepDuration);

    return () => clearInterval(stepInterval);
  }, [onDone]);

  return (
    <>
      <style>{css}</style>
      <div className="analyse-root">
        <div className="analyse-grid" />
        <div className="analyse-orb" />

        <div className="analyse-icon">🔍</div>
        <div className="analyse-title">
          Analysing your <span>performance</span>...
        </div>

        <div className="analyse-steps">
          {ANALYSE_STEPS.map((step, i) => (
            <div
              key={i}
              className={`analyse-step ${i < activeStep ? "done" : i === activeStep ? "active" : ""}`}
            >
              <span className="analyse-step-icon">
                {i < activeStep ? "✅" : step.icon}
              </span>
              {step.label}
              <span className="analyse-step-dot" />
            </div>
          ))}
        </div>

        <div className="analyse-bar-wrap">
          <div className="analyse-bar-label">
            <span>Processing</span>
            <span>{progress}%</span>
          </div>
          <div className="analyse-bar-track">
            <div className="analyse-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </>
  );
}

export default function Results({ trainer, result, onRetake }) {
  const cardRef = useRef(null);

  // Fix 2: show loader first
  const [analysing,    setAnalysing]    = useState(true);
  const [screenshot,   setScreenshot]   = useState(null);
  const [capturing,    setCapturing]    = useState(false);
  const [showOverlay,  setShowOverlay]  = useState(false);
  const [showToast,    setShowToast]    = useState(false);

  const {
    codingScore, mcqScore,
    codingPassed, mcqCorrect,
    totalCoding, totalMCQ, totalMarks,
    thisScore, thisPercentage,         // this attempt's raw values
    avgScore, avgPercentage,           // Fix 4: averages stored in DB
    attemptNumber,
  } = result;

  // Fallbacks for older result shapes
  const displayThisScore = thisScore       ?? (codingScore + mcqScore);
  const displayThisPct   = thisPercentage  ?? result.percentage;
  const displayAvgScore  = avgScore        ?? displayThisScore;
  const displayAvgPct    = avgPercentage   ?? displayThisPct;
  const displayAttempt   = attemptNumber   ?? 1;

  const grade =
    displayAvgPct >= 80 ? { label: "Excellent", emoji: "🏆", color: "#facc15" } :
    displayAvgPct >= 60 ? { label: "Good",       emoji: "👍", color: "#22c55e" } :
    displayAvgPct >= 40 ? { label: "Average",    emoji: "📈", color: "#f97316" } :
                          { label: "Needs Work", emoji: "💪", color: "#ef4444" };

  const stream = trainer?.stream
    ? trainer.stream.charAt(0).toUpperCase() + trainer.stream.slice(1)
    : "";

  // Fix 1: Robust download — append to body, click, remove
  const downloadImage = (dataUrl) => {
    const filename = `${(trainer?.name ?? "result").replace(/\s+/g, "_")}_ThopsTech_Result.png`;
    const a = document.createElement("a");
    a.href     = dataUrl;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 200);
  };

  const captureCard = async () => {
    if (!cardRef.current) return null;
    try {
      const h2c    = await loadHtml2Canvas();
      const canvas = await h2c(cardRef.current, {
        backgroundColor: "rgb(7,15,30)",
        scale: 2, useCORS: true, logging: false,
        // Fix 1: ensure full card is captured including gradients
        allowTaint: true,
        foreignObjectRendering: false,
      });
      return canvas.toDataURL("image/png");
    } catch (err) {
      console.warn("Screenshot failed:", err);
      return null;
    }
  };

  // Standalone ⬇ button
  const handleDownloadOnly = async () => {
    setCapturing(true);
    const img = await captureCard();
    setCapturing(false);
    if (img) {
      downloadImage(img);
    } else {
      // Fix 1: clear error message instead of generic "try browser tools"
      alert("Could not capture screenshot automatically.\n\nTo save your result:\n• Windows: Press Win + Shift + S\n• Mac: Press Cmd + Shift + 4\n• Mobile: Use your device's screenshot button");
    }
  };

  // Back to dashboard — capture then show overlay
  const handleBack = async () => {
    setCapturing(true);
    const img = await captureCard();
    setCapturing(false);
    if (img) {
      setScreenshot(img);
      setShowOverlay(true);
    } else {
      onRetake();
    }
  };

  const handleDownloadAndGo = () => {
    if (screenshot) downloadImage(screenshot);
    setShowOverlay(false);
    onRetake();
  };

  // Show analysing screen first
  if (analysing) {
    return <AnalysingScreen onDone={() => setAnalysing(false)} />;
  }

  return (
    <>
      <style>{css}</style>

      {showToast && (
        <div className="no-copy-toast">🚫 Copy/paste is disabled</div>
      )}

      {/* Screenshot overlay */}
      {showOverlay && (
        <div className="screenshot-overlay">
          <div className="screenshot-overlay-title">📸 Save Your Results</div>
          <img src={screenshot} alt="Results screenshot" />
          <div className="screenshot-overlay-sub">
            Download your result card before going back to the dashboard.
          </div>
          <div className="screenshot-btn-row">
            <button className="sc-btn-dl" onClick={handleDownloadAndGo}>
              ⬇ Download & Continue
            </button>
            <button className="sc-btn-skip" onClick={() => { setShowOverlay(false); onRetake(); }}>
              Skip
            </button>
          </div>
        </div>
      )}

      <div className="res-root">
        <div className="res-grid" />

        <div className="res-card" ref={cardRef}>

          <div className="res-hero">
            <div className="res-emoji">{grade.emoji}</div>
            <div className="res-name">{trainer?.name}</div>
            <div className="res-sub">{stream} · Test #{displayAttempt} Completed</div>
          </div>

          {/* Fix 4: dual score display — this attempt + running average */}
          <div className="score-dual">
            <div className="score-block">
              <div className="score-lbl">This Attempt</div>
              <div className="score-val">{displayThisScore}</div>
              <div className="score-of">{displayThisPct}%</div>
              <div className="score-attempts">out of {totalMarks} marks</div>
            </div>
            <div className="score-block">
              <div className="score-lbl">Running Average</div>
              <div className="score-val avg">{displayAvgScore}</div>
              <div className="score-of">{displayAvgPct}%</div>
              <div className="score-attempts">over {displayAttempt} attempt{displayAttempt !== 1 ? "s" : ""}</div>
            </div>
          </div>

          <div className="badge-row">
            <span className="res-badge"
              style={{ background: `${grade.color}22`, color: grade.color, border: `1px solid ${grade.color}44` }}>
              {grade.label}
            </span>
            <span className="res-badge"
              style={{ background: "rgba(0,172,193,.12)", color: "#00ACC1", border: "1px solid rgba(0,172,193,.25)" }}>
              Avg {displayAvgPct}%
            </span>
          </div>

          <div className="stats-grid">
            <div className="stat">
              <div className="stat-val" style={{ color: "#00ACC1" }}>{displayThisScore}</div>
              <div className="stat-lbl">This Score</div>
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
            <div className="bd-item"><span className="lbl">This %</span><span className={`val ${displayThisPct >= 60 ? "g" : "r"}`}>{displayThisPct}%</span></div>
            <div className="bd-item"><span className="lbl">Avg %</span><span className={`val b`}>{displayAvgPct}%</span></div>
            <div className="bd-item"><span className="lbl">Attempt #</span><span className="val">{displayAttempt}</span></div>
            <div className="bd-item"><span className="lbl">Grade</span><span className="val" style={{ color: grade.color }}>{grade.label}</span></div>
          </div>

          <div className="btn-row">
            <button className="res-btn" onClick={handleBack} disabled={capturing}>
              {capturing ? "📸 Capturing…" : "↩ Back to Dashboard"}
            </button>
            <button className="res-btn-ghost" onClick={handleDownloadOnly} disabled={capturing} title="Download result card">
              {capturing ? "…" : "⬇"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}