import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Button, Typography, Drawer, List, ListItem, ListItemButton,
  Chip, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import CodeCompiler from "./CodeCompiler";
import SqlCompiler from "./SqlCompiler";
import QuestionCard from "./QuestionCard";
import McqCard from "./Mcqcard";
import { getTestQuestions, getPracticeQuestions } from "../data/questionBank";

const SECTION_CONFIG = {
  coding:   { label: "Coding",   icon: "💻", color: "#00ACC1" },
  aptitude: { label: "Aptitude", icon: "🧠", color: "#a78bfa" },
  sql:      { label: "SQL",      icon: "🗄️", color: "#f97316" },
};

const DRAWER_WIDTH = 260;
const getDuration = (role) => (role === "trainer" ? 60 : 80) * 60;

// ── Security warning messages shown at random intervals ──────────────────────
const SECURITY_WARNINGS = [
  { icon: "📷", title: "Camera Check", message: "Please look directly into the camera." },
  { icon: "🔇", title: "Noise Alert", message: "Please do not speak loudly. Stay silent during the exam." },
  { icon: "👀", title: "Stay Focused", message: "Keep your eyes on the screen. Do not look away frequently." },
  { icon: "🚫", title: "No Assistance", message: "Do not take help from any external source or person." },
  { icon: "📱", title: "No Devices", message: "Keep all other devices away from your workspace." },
  { icon: "🖥️", title: "Screen Focus", message: "Do not switch to other tabs or applications." },
  { icon: "🤫", title: "Silence Please", message: "Maintain silence. Any noise may be flagged." },
  { icon: "📋", title: "Original Work", message: "All answers must be your own. No copying allowed." },
];

// ── Camera permission UI styles ──────────────────────────────────────────────
const camCss = `
  .cam-gate {
    min-height: 100vh; background: #03070f;
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Mono', monospace; padding: 24px;
  }
  .cam-card {
    background: rgba(7,15,30,.97); border: 1px solid rgba(0,172,193,.2);
    border-radius: 20px; padding: 40px; max-width: 480px; width: 100%;
    text-align: center; box-shadow: 0 0 60px rgba(0,172,193,.08);
  }
  .cam-icon { font-size: 52px; margin-bottom: 20px; }
  .cam-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #f1f5f9; margin-bottom: 10px; }
  .cam-desc  { font-size: 13px; color: #64748b; line-height: 1.7; margin-bottom: 28px; }
  .cam-video { width: 100%; border-radius: 12px; border: 2px solid rgba(0,172,193,.3); background: #0a1120; margin-bottom: 20px; max-height: 220px; object-fit: cover; }
  .cam-btn {
    width: 100%; padding: 13px; border: none; border-radius: 10px;
    font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #fff;
    cursor: pointer; transition: all .2s; margin-bottom: 10px;
    background: linear-gradient(135deg, #00ACC1, #0891b2);
    box-shadow: 0 4px 18px rgba(0,172,193,.25);
  }
  .cam-btn:hover { transform: translateY(-1px); }
  .cam-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
  .cam-btn-deny {
    width: 100%; padding: 11px; border: 1px solid rgba(239,68,68,.3);
    border-radius: 10px; background: transparent; color: #ef4444;
    font-family: 'DM Mono', monospace; font-size: 12px; cursor: pointer;
    transition: all .2s;
  }
  .cam-btn-deny:hover { background: rgba(239,68,68,.08); }
  .cam-err {
    margin-top: 16px; padding: 12px 16px;
    background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.2);
    border-radius: 8px; font-size: 12px; color: #f87171; line-height: 1.6;
  }
  .cam-status { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 16px; font-size: 12px; }
  .cam-status-dot { width: 8px; height: 8px; border-radius: 50%; }
  .cam-status-dot.green { background: #22c55e; box-shadow: 0 0 8px #22c55e; animation: camPulse 1.5s infinite; }
  .cam-status-dot.red   { background: #ef4444; }
  .cam-status-dot.yellow{ background: #f97316; animation: camPulse 1s infinite; }
  @keyframes camPulse { 0%,100%{opacity:1;} 50%{opacity:.4;} }
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono&display=swap');
`;

// ── Security Popup ────────────────────────────────────────────────────────────
const secCss = `
  .sec-overlay {
    position: fixed; inset: 0; background: rgba(3,7,15,.75);
    z-index: 99999; display: flex; align-items: center; justify-content: center;
    padding: 20px; backdrop-filter: blur(6px);
    animation: secFadeIn .25s ease;
  }
  @keyframes secFadeIn { from{opacity:0;} to{opacity:1;} }
  .sec-card {
    background: #0f172a; border: 1.5px solid rgba(0,172,193,.3);
    border-radius: 20px; padding: 36px 32px; max-width: 400px; width: 100%;
    text-align: center; box-shadow: 0 0 80px rgba(0,172,193,.12);
    animation: secPop .4s cubic-bezier(.16,1,.3,1);
    font-family: 'DM Mono', monospace;
  }
  @keyframes secPop { from{opacity:0;transform:scale(.88);} to{opacity:1;transform:scale(1);} }
  .sec-icon  { font-size: 48px; margin-bottom: 16px; }
  .sec-badge {
    display: inline-block; padding: 3px 12px; margin-bottom: 12px;
    background: rgba(0,172,193,.12); border: 1px solid rgba(0,172,193,.25);
    border-radius: 20px; font-size: 10px; font-weight: 700; letter-spacing: 1px;
    color: #00ACC1; text-transform: uppercase;
  }
  .sec-title {
    font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800;
    color: #f1f5f9; margin-bottom: 10px;
  }
  .sec-msg { font-size: 14px; color: #94a3b8; line-height: 1.7; margin-bottom: 24px; }
  .sec-btn {
    width: 100%; padding: 12px; border: none; border-radius: 10px;
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #fff;
    cursor: pointer; background: linear-gradient(135deg, #00ACC1, #0891b2);
    transition: all .2s;
  }
  .sec-btn:hover { filter: brightness(1.1); }
  .sec-countdown {
    margin-top: 12px; font-size: 11px; color: #334155;
  }
`;

// ── Camera Gate Component ─────────────────────────────────────────────────────
function CameraGate({ onGranted, onBlocked }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | requesting | granted | denied | error
  const [errMsg, setErrMsg] = useState("");
  const [photoData, setPhotoData] = useState(null); // base64 capture

  const requestPermission = async () => {
    setStatus("requesting");
    setErrMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setStatus("granted");
      // Capture photo after a short delay so video renders
      setTimeout(() => {
        try {
          const video = videoRef.current;
          if (!video) return;
          const canvas = document.createElement("canvas");
          canvas.width  = video.videoWidth  || 320;
          canvas.height = video.videoHeight || 240;
          canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
          setPhotoData(canvas.toDataURL("image/jpeg", 0.7));
        } catch (_) {}
      }, 1200);
    } catch (err) {
      setStatus("denied");
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrMsg("Camera and microphone access was denied. You must allow access to start the exam.");
      } else if (err.name === "NotFoundError") {
        setErrMsg("No camera or microphone found on this device. Please connect one to proceed.");
      } else {
        setErrMsg(`Could not access camera/microphone: ${err.message}`);
      }
    }
  };

  const handleStartExam = () => {
    // Pass both stream and captured photo
    onGranted(streamRef.current, photoData);
  };

  return (
    <>
      <style>{camCss}</style>
      <div className="cam-gate">
        <div className="cam-card">
          <div className="cam-icon">
            {status === "granted" ? "✅" : status === "denied" ? "🚫" : status === "requesting" ? "⏳" : "📷"}
          </div>
          <div className="cam-title">Camera & Microphone Required</div>
          <div className="cam-desc">
            This exam requires your camera and microphone to be active throughout the session.
            Your video is <strong style={{ color: "#00ACC1" }}>not recorded</strong> — it is used for proctoring purposes only.
          </div>

          {status === "granted" && (
            <>
              <div className="cam-status">
                <span className="cam-status-dot green" />
                <span style={{ color: "#22c55e", fontSize: 12 }}>Camera & microphone active</span>
              </div>
              <video ref={videoRef} className="cam-video" muted autoPlay playsInline />
            </>
          )}

          {status === "requesting" && (
            <div className="cam-status">
              <span className="cam-status-dot yellow" />
              <span style={{ color: "#f97316", fontSize: 12 }}>Requesting permission...</span>
            </div>
          )}

          {status === "idle" && (
            <div className="cam-status">
              <span className="cam-status-dot red" />
              <span style={{ color: "#64748b", fontSize: 12 }}>Camera not active</span>
            </div>
          )}

          {status !== "granted" && (
            <button className="cam-btn" onClick={requestPermission} disabled={status === "requesting"}>
              {status === "requesting" ? "⏳ Requesting Access..." : "🎥 Allow Camera & Microphone"}
            </button>
          )}

          {status === "granted" && (
            <button className="cam-btn" onClick={handleStartExam}>
              ✓ Start Exam
            </button>
          )}

          {status === "denied" && (
            <>
              {errMsg && <div className="cam-err">⚠ {errMsg}</div>}
              <div className="cam-err" style={{ marginTop: 10, borderColor: "rgba(239,68,68,.4)" }}>
                <strong>To fix:</strong> Click the camera icon in your browser's address bar and allow access, then refresh the page.
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── Security Popup Component ──────────────────────────────────────────────────
function SecurityPopup({ warning, onDismiss, autoCloseIn }) {
  const [remaining, setRemaining] = useState(autoCloseIn || null);

  useEffect(() => {
    if (!autoCloseIn) return;
    const interval = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(interval); onDismiss(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [autoCloseIn, onDismiss]);

  return (
    <>
      <style>{secCss}</style>
      <div className="sec-overlay">
        <div className="sec-card">
          <div className="sec-icon">{warning.icon}</div>
          <div className="sec-badge">🔒 Proctoring Alert</div>
          <div className="sec-title">{warning.title}</div>
          <div className="sec-msg">{warning.message}</div>
          <button className="sec-btn" onClick={onDismiss}>
            ✓ Understood — Continue
          </button>
          {remaining !== null && (
            <div className="sec-countdown">Auto-dismissing in {remaining}s</div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main AssessmentLayout ─────────────────────────────────────────────────────
export default function AssessmentLayout({ trainer, submitExam, onExitPractice }) {
  const isPractice  = trainer.mode === "practice";
  const durationRef = useRef(getDuration(trainer.role));
  const TEST_DURATION = durationRef.current;

  const [questions] = useState(() =>
    isPractice ? getPracticeQuestions() : getTestQuestions()
  );

  const [section,     setSection]     = useState("coding");
  const [qIndex,      setQIndex]      = useState(0);
  const [scores,      setScores]      = useState({});
  const [mcqAnswer,   setMcqAnswer]   = useState({});
  const [timeLeft,    setTimeLeft]    = useState(() => getDuration(trainer.role));
  const [submitDlg,   setSubmitDlg]   = useState(false);
  const [timesUp,     setTimesUp]     = useState(false);
  const timerRef      = useRef(null);

  // ── Camera/Mic state ─────────────────────────────────────────────────────────
  const [camGranted,  setCamGranted]  = useState(isPractice); // skip gate in practice
  const camStreamRef  = useRef(null);

  // ── Security popup state ─────────────────────────────────────────────────────
  const [secWarning,  setSecWarning]  = useState(null);
  const secTimerRef   = useRef(null);
  const usedWarnings  = useRef(new Set());

  // ── Copy-paste blocking toast ────────────────────────────────────────────────
  const [showCopyToast, setShowCopyToast] = useState(false);
  const copyToastTimer  = useRef(null);

  // ── handleFinalSubmit ────────────────────────────────────────────────────────
  const handleFinalSubmit = useCallback(() => {
    clearInterval(timerRef.current);
    clearInterval(secTimerRef.current);

    let codingScore = 0, aptScore = 0, sqlScore = 0;
    questions.coding.forEach(q   => { codingScore += scores[q.id] || 0; });
    questions.aptitude.forEach(q => { aptScore    += scores[q.id] || 0; });
    questions.sql.forEach(q      => { sqlScore    += scores[q.id] || 0; });

    const totalCoding = questions.coding.reduce((a, q)   => a + q.marks, 0);
    const totalApt    = questions.aptitude.reduce((a, q) => a + q.marks, 0);
    const totalSql    = questions.sql.reduce((a, q)      => a + q.marks, 0);

    // Stop camera stream
    if (camStreamRef.current) {
      camStreamRef.current.getTracks().forEach(t => t.stop());
    }

    submitExam({
      codingScore,
      mcqScore:     aptScore + sqlScore,
      codingPassed: codingScore > 0,
      mcqCorrect:   Object.values(mcqAnswer).filter(Boolean).length,
      totalCoding,
      totalMCQ:     totalApt + totalSql,
      totalMarks:   totalCoding + totalApt + totalSql,
      capturedPhoto,   // ← photo taken at exam start
    });
  }, [questions, scores, mcqAnswer, submitExam]);

  // ── Camera granted callback ──────────────────────────────────────────────────
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const handleCamGranted = useCallback((stream, photo) => {
    camStreamRef.current = stream;
    if (photo) setCapturedPhoto(photo);
    setCamGranted(true);
  }, []);

  // ── Copy-paste blocking ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!camGranted || isPractice) return;

    const showToast = () => {
      setShowCopyToast(true);
      clearTimeout(copyToastTimer.current);
      copyToastTimer.current = setTimeout(() => setShowCopyToast(false), 2500);
    };

    const blockCopy  = (e) => { e.preventDefault(); showToast(); };
    const blockPaste = (e) => { e.preventDefault(); showToast(); };
    const blockCut   = (e) => { e.preventDefault(); showToast(); };
    const blockCtx   = (e) => { e.preventDefault(); showToast(); };

    const blockKey = (e) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      if (isCtrl && ["c", "v", "x", "a"].includes(e.key.toLowerCase())) {
        // Allow Ctrl+A only in code editor (monaco handles it)
        // Block copy/paste/cut globally
        if (["c", "v", "x"].includes(e.key.toLowerCase())) {
          e.preventDefault();
          showToast();
        }
      }
    };

    document.addEventListener("copy",        blockCopy,  true);
    document.addEventListener("paste",       blockPaste, true);
    document.addEventListener("cut",         blockCut,   true);
    document.addEventListener("contextmenu", blockCtx,   true);
    document.addEventListener("keydown",     blockKey,   true);

    return () => {
      document.removeEventListener("copy",        blockCopy,  true);
      document.removeEventListener("paste",       blockPaste, true);
      document.removeEventListener("cut",         blockCut,   true);
      document.removeEventListener("contextmenu", blockCtx,   true);
      document.removeEventListener("keydown",     blockKey,   true);
    };
  }, [camGranted, isPractice]);

  // ── Random security warning popups (test mode only) ──────────────────────────
  const scheduleNextWarning = useCallback(() => {
    clearInterval(secTimerRef.current);
    if (isPractice) return;
    // Random interval: 3–8 minutes
    const minMs = 3 * 60 * 1000;
    const maxMs = 8 * 60 * 1000;
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;

    secTimerRef.current = setTimeout(() => {
      // Pick a warning not recently shown
      const available = SECURITY_WARNINGS.filter((_, i) => !usedWarnings.current.has(i));
      const pool = available.length > 0 ? available : SECURITY_WARNINGS;
      const idx  = Math.floor(Math.random() * pool.length);
      const actualIdx = SECURITY_WARNINGS.indexOf(pool[idx]);
      usedWarnings.current.add(actualIdx);
      if (usedWarnings.current.size >= SECURITY_WARNINGS.length) usedWarnings.current.clear();
      setSecWarning(pool[idx]);
    }, delay);
  }, [isPractice]);

  const handleDismissWarning = useCallback(() => {
    setSecWarning(null);
    scheduleNextWarning();
  }, [scheduleNextWarning]);

  // ── Start security warning schedule after cam granted ───────────────────────
  useEffect(() => {
    if (!camGranted || isPractice) return;
    scheduleNextWarning();
    return () => clearTimeout(secTimerRef.current);
  }, [camGranted, isPractice, scheduleNextWarning]);

  // ── Timer (test mode only) ───────────────────────────────────────────────────
  useEffect(() => {
    if (isPractice || !camGranted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isPractice, camGranted]);

  useEffect(() => {
    if (timeLeft === 0 && !isPractice) {
      setSubmitDlg(false);
      setTimesUp(true);
      const t = setTimeout(() => handleFinalSubmit(), 3000);
      return () => clearTimeout(t);
    }
  }, [timeLeft, isPractice, handleFinalSubmit]);

  const fmtTime = s =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const currentQ  = questions[section]?.[qIndex];
  const sectionQs = questions[section] || [];

  const handleScoreUpdate = (id, score) => setScores(p => ({ ...p, [id]: score }));

  const handleMcqSelect = (id, option) => {
    setMcqAnswer(p => ({ ...p, [id]: option }));
    const q = sectionQs.find(x => x.id === id);
    if (q?.answer !== undefined) {
      handleScoreUpdate(id, option === q.answer ? q.marks : 0);
    }
  };

  const isAnswered = (q) => scores[q.id] !== undefined || mcqAnswer[q.id] !== undefined;

  // ── Camera gate — show before exam ──────────────────────────────────────────
  if (!camGranted && !isPractice) {
    return <CameraGate onGranted={handleCamGranted} />;
  }

  if (!currentQ) return null;

  return (
    <Box sx={{ display: "flex", height: "100vh", background: "#03070f", overflow: "hidden" }}>

      {/* ── Copy-paste blocked toast ── */}
      {showCopyToast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.3)",
          borderRadius: 8, padding: "8px 20px", fontSize: 12, color: "#f87171",
          fontFamily: "'DM Mono', monospace", zIndex: 99998, pointerEvents: "none",
          animation: "fadeIn .2s ease",
        }}>
          🚫 Copy / Paste / Right-click is disabled during the exam
        </div>
      )}

      {/* ── Security warning popup ── */}
      {secWarning && (
        <SecurityPopup
          warning={secWarning}
          onDismiss={handleDismissWarning}
          autoCloseIn={30}
        />
      )}

      {/* ── Sidebar ── */}
      <Drawer variant="permanent" sx={{
        width: DRAWER_WIDTH, flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH, background: "#071020",
          borderRight: "1px solid rgba(0,172,193,0.15)",
          overflow: "hidden", display: "flex", flexDirection: "column"
        }
      }}>
        {/* Logo */}
        <Box sx={{ p: 2, borderBottom: "1px solid rgba(0,172,193,0.15)" }}>
          <Typography sx={{ color: "#00ACC1", fontWeight: 800, fontFamily: "'Syne', sans-serif", fontSize: 16 }}>
            ThopsTech {isPractice ? "Practice" : "Assessment"}
          </Typography>
          <Typography sx={{ color: "#64748b", fontSize: 11, mt: 0.5 }}>
            Hi, {trainer.name?.split(" ")[0]} 👋
          </Typography>
          {/* Camera indicator */}
          {!isPractice && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              <Box sx={{
                width: 6, height: 6, borderRadius: "50%", background: "#22c55e",
                boxShadow: "0 0 6px #22c55e", animation: "pulse 1.5s infinite",
                "@keyframes pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.4 } }
              }} />
              <Typography sx={{ fontSize: 10, color: "#22c55e" }}>Camera Active</Typography>
            </Box>
          )}
        </Box>

        {/* Timer */}
        {!isPractice && (
          <Box sx={{
            px: 2, py: 1.5, borderBottom: "1px solid rgba(0,172,193,0.1)",
            background: timeLeft < 300 ? "rgba(239,68,68,0.08)" : "transparent"
          }}>
            <Typography sx={{
              color: timeLeft < 300 ? "#f87171" : "#f97316",
              fontWeight: 700, fontSize: 20, fontFamily: "'DM Mono', monospace", textAlign: "center"
            }}>
              ⏱ {fmtTime(timeLeft)}
            </Typography>
            <Typography sx={{ fontSize: 10, color: "#475569", textAlign: "center", mt: 0.3 }}>
              {trainer.role === "trainer" ? "60" : "80"} min · {trainer.role === "trainer" ? "Trainer" : "Student"} mode
            </Typography>
            <LinearProgress variant="determinate" value={(timeLeft / TEST_DURATION) * 100}
              sx={{ mt: 1, height: 4, borderRadius: 2,
                "& .MuiLinearProgress-bar": { background: timeLeft < 300 ? "#ef4444" : "#f97316" },
                background: "#1e293b" }} />
          </Box>
        )}

        {/* Section tabs */}
        <Box sx={{ display: "flex", borderBottom: "1px solid rgba(0,172,193,0.1)" }}>
          {Object.entries(SECTION_CONFIG).map(([key, cfg]) => (
            <Button key={key} onClick={() => { setSection(key); setQIndex(0); }}
              sx={{
                flex: 1, py: 1, minWidth: 0, fontSize: 10, fontWeight: 700, borderRadius: 0,
                color: section === key ? cfg.color : "#475569",
                borderBottom: section === key ? `2px solid ${cfg.color}` : "2px solid transparent",
                flexDirection: "column", gap: 0.3
              }}>
              <span style={{ fontSize: 16 }}>{cfg.icon}</span>
              {cfg.label}
            </Button>
          ))}
        </Box>

        {/* Question list */}
        <Box sx={{ flex: 1, overflowY: "auto",
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": { background: "#1e3a4a" } }}>
          <List dense disablePadding>
            {sectionQs.map((q, i) => {
              const answered = isAnswered(q);
              const active   = i === qIndex;
              return (
                <ListItem key={q.id} disablePadding>
                  <ListItemButton onClick={() => setQIndex(i)}
                    sx={{
                      py: 1, px: 2, gap: 1.5,
                      background: active ? "rgba(0,172,193,0.1)" : "transparent",
                      borderLeft: active ? "3px solid #00ACC1" : "3px solid transparent",
                      "&:hover": { background: "rgba(0,172,193,0.07)" }
                    }}>
                    <Box sx={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      background: answered ? "#16a34a" : active ? "#00ACC1" : "#1e293b",
                      border: `1px solid ${answered ? "#16a34a" : active ? "#00ACC1" : "#334155"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, color: answered || active ? "#fff" : "#64748b"
                    }}>
                      {i + 1}
                    </Box>
                    <Box sx={{ overflow: "hidden" }}>
                      <Typography sx={{
                        fontSize: 11, color: active ? "#e2e8f0" : "#94a3b8",
                        fontWeight: active ? 600 : 400,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                      }}>
                        {q.title || q.question?.slice(0, 40)}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: "#475569" }}>{q.marks} marks</Typography>
                    </Box>
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* Progress & submit */}
        <Box sx={{ p: 2, borderTop: "1px solid rgba(0,172,193,0.1)" }}>
          <Typography sx={{ color: "#64748b", fontSize: 11, mb: 1 }}>
            Answered: {sectionQs.filter(isAnswered).length} / {sectionQs.length}
          </Typography>
          <LinearProgress variant="determinate"
            value={(sectionQs.filter(isAnswered).length / Math.max(sectionQs.length, 1)) * 100}
            sx={{ mb: 2, height: 4, borderRadius: 2, background: "#1e293b",
              "& .MuiLinearProgress-bar": { background: "#00ACC1" } }} />
          {isPractice ? (
            <Button fullWidth variant="outlined" onClick={onExitPractice}
              sx={{ color: "#94a3b8", borderColor: "#334155", fontSize: 12 }}>
              ← Back to Dashboard
            </Button>
          ) : (
            <Button fullWidth variant="contained" onClick={() => setSubmitDlg(true)}
              sx={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", fontWeight: 700 }}>
              Final Submit ✓
            </Button>
          )}
        </Box>
      </Drawer>

      {/* ── Main Content ── */}
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {section === "coding" && (
          <>
            <Box sx={{ width: "42%", overflowY: "auto", borderRight: "1px solid rgba(0,172,193,0.1)",
              "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { background: "#1e3a4a" } }}>
              <QuestionCard
                question={currentQ}
                currentIndex={qIndex}
                setCurrentIndex={setQIndex}
                total={sectionQs.length}
                isLast={qIndex === sectionQs.length - 1}
                onFinalSubmit={!isPractice ? () => setSubmitDlg(true) : null}
              />
            </Box>
            <Box sx={{ flex: 1, overflowY: "auto" }}>
              <CodeCompiler
                question={currentQ}
                onScoreUpdate={(s) => handleScoreUpdate(currentQ.id, s)}
              />
            </Box>
          </>
        )}

        {section === "aptitude" && (
          <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
            <McqCard
              question={currentQ}
              currentIndex={qIndex}
              setCurrentIndex={setQIndex}
              total={sectionQs.length}
              selected={mcqAnswer[currentQ.id]}
              onSelect={(opt) => handleMcqSelect(currentQ.id, opt)}
              isLast={qIndex === sectionQs.length - 1}
              onFinalSubmit={!isPractice ? () => setSubmitDlg(true) : null}
            />
          </Box>
        )}

        {section === "sql" && (
          <>
            <Box sx={{ width: "36%", overflowY: "auto", borderRight: "1px solid rgba(0,172,193,0.1)",
              "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { background: "#1e3a4a" } }}>
              <QuestionCard
                question={{ ...currentQ, title: `SQL Q${qIndex + 1}`, description: currentQ.question, explanation: currentQ.hint }}
                currentIndex={qIndex}
                setCurrentIndex={setQIndex}
                total={sectionQs.length}
                isLast={qIndex === sectionQs.length - 1}
                onFinalSubmit={!isPractice ? () => setSubmitDlg(true) : null}
              />
            </Box>
            <Box sx={{ flex: 1, overflowY: "auto" }}>
              <SqlCompiler
                question={currentQ}
                onScoreUpdate={(s) => handleScoreUpdate(currentQ.id, s)}
              />
            </Box>
          </>
        )}
      </Box>

      {/* ── Final Submit Dialog ── */}
      <Dialog open={submitDlg} onClose={() => setSubmitDlg(false)}
        PaperProps={{ sx: { background: "#0f172a", border: "1px solid rgba(0,172,193,0.2)", borderRadius: 3 } }}>
        <DialogTitle sx={{ color: "#f1f5f9", fontFamily: "'Syne', sans-serif" }}>
          Submit Assessment?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#94a3b8", mb: 2 }}>
            You are about to submit your assessment. This cannot be undone.
          </Typography>
          {Object.entries(SECTION_CONFIG).map(([key, cfg]) => (
            <Box key={key} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ color: "#64748b", fontSize: 13 }}>{cfg.icon} {cfg.label}</Typography>
              <Typography sx={{ color: "#e2e8f0", fontSize: 13 }}>
                {questions[key].filter(isAnswered).length} / {questions[key].length} answered
              </Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setSubmitDlg(false)} sx={{ color: "#64748b" }}>Cancel</Button>
          <Button variant="contained" onClick={handleFinalSubmit}
            sx={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", fontWeight: 700 }}>
            Submit Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Time's Up Dialog ── */}
      <Dialog open={timesUp} disableEscapeKeyDown
        PaperProps={{ sx: {
          background: "#0f172a", border: "1px solid rgba(239,68,68,0.4)",
          borderRadius: 3, textAlign: "center", minWidth: 340,
        }}}>
        <DialogContent sx={{ pt: 4, pb: 4, px: 4 }}>
          <Typography sx={{ fontSize: 48, mb: 2 }}>⏰</Typography>
          <Typography sx={{
            color: "#f87171", fontFamily: "'Syne', sans-serif",
            fontSize: 24, fontWeight: 800, mb: 1,
          }}>
            Time's Up!
          </Typography>
          <Typography sx={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.7 }}>
            Your {trainer.role === "trainer" ? "60" : "80"}-minute test has ended.
            <br />
            Auto-submitting your answers now...
          </Typography>
          <Box sx={{ mt: 3, height: 4, borderRadius: 2, background: "rgba(239,68,68,0.2)", overflow: "hidden" }}>
            <Box sx={{
              height: "100%", borderRadius: 2, background: "#ef4444",
              animation: "timesUpBar 3s linear forwards",
              "@keyframes timesUpBar": { from: { width: "0%" }, to: { width: "100%" } },
            }} />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}