import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Button, Typography, Drawer, List, ListItem, ListItemButton,
  LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import CodeCompiler from "./CodeCompiler";
import SqlCompiler from "./SqlCompiler";
import QuestionCard from "./QuestionCard";
import McqCard from "./Mcqcard";
import { getTestQuestions, getPracticeQuestions } from "../data/questionBank";
import { supabase } from "../supabaseClient";

const SECTION_CONFIG = {
  coding:   { label: "Coding",   icon: "💻", color: "#00ACC1" },
  aptitude: { label: "Aptitude", icon: "🧠", color: "#a78bfa" },
  sql:      { label: "SQL",      icon: "🗄️", color: "#f97316" },
};

const DRAWER_WIDTH      = 260;
const TEST_DURATION_STUDENT = 75 * 60;   // 75 minutes for students
const TEST_DURATION_TRAINER = 60 * 60;   // 60 minutes for trainers
const MAX_TESTS         = 5;
const WINDOW_MS         = 24 * 60 * 60 * 1000; // 24 hours in ms

// ── Core logic: fetch last N test timestamps and determine access ───────────
//
// Example: user took tests at 10am, 11am, 12pm, 1pm, 2pm
//   → last 5 timestamps = [10am, 11am, 12pm, 1pm, 2pm]
//   → oldest of the 5 = 10am
//   → unlocksAt = 10am + 24h = 10am tomorrow
//
// If user has < 5 tests in last 24h window → not blocked
async function fetchTestAccess(userId) {
  // Fetch the most recent MAX_TESTS test attempts, ordered oldest→newest
  const { data, error } = await supabase
    .from("results")
    .select("id, created_at")
    .eq("user_id", userId)
    .eq("mode", "test")
    .order("created_at", { ascending: false })
    .limit(MAX_TESTS);

  if (error) {
    console.error("fetchTestAccess error:", error.message);
    return { blocked: false, unlocksAt: null, attemptsUsed: 0, testsLeft: MAX_TESTS };
  }

  if (!data || data.length < MAX_TESTS) {
    // Fewer than 5 total attempts ever — not blocked
    return {
      blocked:      false,
      unlocksAt:    null,
      attemptsUsed: data?.length ?? 0,
      testsLeft:    MAX_TESTS - (data?.length ?? 0),
    };
  }

  // We have exactly MAX_TESTS rows (the most recent 5)
  // The oldest of these 5 is at index MAX_TESTS-1 (since ordered desc)
  const oldestOfLast5 = new Date(data[MAX_TESTS - 1].created_at);
  const unlocksAt     = new Date(oldestOfLast5.getTime() + WINDOW_MS);
  const now           = Date.now();

  if (now >= unlocksAt.getTime()) {
    // The oldest attempt has "aged out" — one slot is free
    return {
      blocked:      false,
      unlocksAt:    null,
      attemptsUsed: MAX_TESTS,
      testsLeft:    1,   // at least one slot opened up
    };
  }

  // Still within 24h of the oldest attempt — fully blocked
  return {
    blocked:      true,
    unlocksAt,           // exact datetime when next slot opens
    attemptsUsed: MAX_TESTS,
    testsLeft:    0,
  };
}

// ── Format countdown hh:mm:ss ─────────────────────────────────────────────
function formatCountdown(unlocksAt) {
  const ms = unlocksAt.getTime() - Date.now();
  if (ms <= 0) return "00:00:00";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Format friendly unlock time: "10:00 AM, Thu 22 Feb" ───────────────────
function formatUnlockTime(unlocksAt) {
  return unlocksAt.toLocaleString("en-IN", {
    weekday: "short", day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

export default function AssessmentLayout({ trainer, submitExam, onExitPractice }) {
  const isPractice = trainer.mode === "practice";

  // Determine test duration based on role
  const testDuration = trainer.role === "trainer" ? TEST_DURATION_TRAINER : TEST_DURATION_STUDENT;

  const [questions] = useState(() =>
    isPractice ? getPracticeQuestions() : getTestQuestions()
  );

  const [section,      setSection]      = useState("coding");
  const [qIndex,       setQIndex]       = useState(0);
  const [scores,       setScores]       = useState({});
  const [mcqAnswer,    setMcqAnswer]    = useState({});
  const [timeLeft,     setTimeLeft]     = useState(isPractice ? testDuration : testDuration);
  const [submitDlg,    setSubmitDlg]    = useState(false);

  // Access control state
  const [accessState,  setAccessState]  = useState(null);  // null = loading
  const [countdown,    setCountdown]    = useState("");

  const timerRef     = useRef(null);
  const countdownRef = useRef(null);

  // ── Check access on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (isPractice) {
      setAccessState({ blocked: false, testsLeft: 999, attemptsUsed: 0 });
      return;
    }
    fetchTestAccess(trainer.id).then(setAccessState);
  }, [isPractice, trainer.id]);

  // ── Live countdown when blocked ────────────────────────────────────────────
  useEffect(() => {
    if (!accessState?.blocked || !accessState?.unlocksAt) return;
    setCountdown(formatCountdown(accessState.unlocksAt));
    countdownRef.current = setInterval(() => {
      const cd = formatCountdown(accessState.unlocksAt);
      setCountdown(cd);
      // Auto-unblock when countdown hits zero
      if (cd === "00:00:00") {
        clearInterval(countdownRef.current);
        fetchTestAccess(trainer.id).then(setAccessState);
      }
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [accessState?.blocked, accessState?.unlocksAt, trainer.id]);

  // ── Disable copy / paste / right-click ────────────────────────────────────
  useEffect(() => {
    const block = (e) => { e.preventDefault(); return false; };
    document.addEventListener("copy",        block);
    document.addEventListener("cut",         block);
    document.addEventListener("paste",       block);
    document.addEventListener("contextmenu", block);
    return () => {
      document.removeEventListener("copy",        block);
      document.removeEventListener("cut",         block);
      document.removeEventListener("paste",       block);
      document.removeEventListener("contextmenu", block);
    };
  }, []);

  // ── Final submit ───────────────────────────────────────────────────────────
  const handleFinalSubmit = useCallback(() => {
    clearInterval(timerRef.current);

    let codingScore = 0, aptScore = 0, sqlScore = 0;
    questions.coding.forEach(q   => { codingScore += scores[q.id] || 0; });
    questions.aptitude.forEach(q => { aptScore    += scores[q.id] || 0; });
    questions.sql.forEach(q      => { sqlScore    += scores[q.id] || 0; });

    const totalCoding = questions.coding.reduce((a, q)   => a + q.marks, 0);
    const totalApt    = questions.aptitude.reduce((a, q) => a + q.marks, 0);
    const totalSql    = questions.sql.reduce((a, q)      => a + q.marks, 0);
    const totalMarks  = totalCoding + totalApt + totalSql;
    const totalScore  = codingScore + aptScore + sqlScore;
    const percentage  = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;

    submitExam({
      codingScore,
      mcqScore:     aptScore + sqlScore,
      totalScore,
      percentage,
      totalMarks,
      codingPassed: codingScore > 0,
      mcqCorrect:   Object.values(mcqAnswer).filter(Boolean).length,
      totalCoding,
      totalMCQ:     totalApt + totalSql,
      attemptNumber: (accessState?.attemptsUsed ?? 0) + 1,
    });
  }, [questions, scores, mcqAnswer, submitExam, accessState]);

  // ── Exam timer ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isPractice || !accessState || accessState.blocked) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isPractice, accessState]);

  useEffect(() => {
    if (timeLeft === 0 && !isPractice) handleFinalSubmit();
  }, [timeLeft, isPractice, handleFinalSubmit]);

  const fmtTime = s =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const currentQ  = questions[section]?.[qIndex];
  const sectionQs = questions[section] || [];

  const handleScoreUpdate = (id, score) => setScores(p => ({ ...p, [id]: score }));
  const handleMcqSelect   = (id, option) => {
    setMcqAnswer(p => ({ ...p, [id]: option }));
    const q = sectionQs.find(x => x.id === id);
    if (q?.answer !== undefined) {
      handleScoreUpdate(id, option === q.answer ? q.marks : 0);
    }
  };
  const isAnswered = (q) => scores[q.id] !== undefined || mcqAnswer[q.id] !== undefined;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!accessState) {
    return (
      <Box sx={{
        minHeight: "100vh", background: "#03070f", display: "flex",
        alignItems: "center", justifyContent: "center",
        color: "#00ACC1", fontFamily: "'DM Mono', monospace", fontSize: 13, letterSpacing: 2
      }}>
        LOADING...
      </Box>
    );
  }

  // ── Blocked screen ─────────────────────────────────────────────────────────
  if (!isPractice && accessState.blocked) {
    return (
      <Box sx={{
        minHeight: "100vh", background: "#03070f", display: "flex",
        alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 3, p: 4, fontFamily: "'DM Mono', monospace",
        position: "relative", overflow: "hidden"
      }}>
        {/* Grid bg */}
        <Box sx={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(0,172,193,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,172,193,.04) 1px,transparent 1px)",
          backgroundSize: "36px 36px", pointerEvents: "none"
        }} />

        <Typography sx={{ fontSize: 64, lineHeight: 1, position: "relative" }}>🔒</Typography>

        <Typography sx={{
          fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800,
          color: "#f1f5f9", textAlign: "center", position: "relative"
        }}>
          Test Access Locked
        </Typography>

        {/* Countdown */}
        <Box sx={{
          background: "rgba(239,68,68,.07)", border: "1px solid rgba(239,68,68,.2)",
          borderRadius: 3, px: 5, py: 3, textAlign: "center", position: "relative"
        }}>
          <Typography sx={{ fontSize: 11, color: "#64748b", letterSpacing: 2, textTransform: "uppercase", mb: 1 }}>
            Unlocks in
          </Typography>
          <Typography sx={{
            fontFamily: "'DM Mono', monospace", fontSize: 42, fontWeight: 700,
            color: "#f87171", letterSpacing: 6, lineHeight: 1
          }}>
            {countdown}
          </Typography>
        </Box>

        {/* Exact unlock time */}
        <Box sx={{
          background: "rgba(0,172,193,.06)", border: "1px solid rgba(0,172,193,.15)",
          borderRadius: 2, px: 4, py: 2, textAlign: "center", position: "relative"
        }}>
          <Typography sx={{ fontSize: 11, color: "#475569", letterSpacing: 1, textTransform: "uppercase", mb: 0.5 }}>
            Next test available at
          </Typography>
          <Typography sx={{
            fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#00ACC1"
          }}>
            {formatUnlockTime(accessState.unlocksAt)}
          </Typography>
        </Box>

        {/* Explanation */}
        <Box sx={{
          background: "rgba(15,23,42,.8)", border: "1px solid rgba(148,163,184,.08)",
          borderRadius: 2, px: 3, py: 2, maxWidth: 420, textAlign: "center", position: "relative"
        }}>
          <Typography sx={{ fontSize: 12, color: "#64748b", lineHeight: 1.8 }}>
            You've completed all{" "}
            <span style={{ color: "#f87171" }}>{MAX_TESTS} test attempts</span>{" "}
            in the last 24 hours. Each attempt unlocks a new slot 24 hours after it was taken.{" "}
            <span style={{ color: "#94a3b8" }}>Practice mode is always available!</span>
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2, position: "relative" }}>
          {isPractice ? (
            <Button
              variant="contained"
              onClick={() => onExitPractice("practice")}
              sx={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", fontWeight: 700, px: 3 }}
            >
              Go to Practice →
            </Button>
          ) : (
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              sx={{ color: "#64748b", borderColor: "#334155", px: 3 }}
            >
              Refresh Page
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  if (!currentQ) return null;

  const { testsLeft, attemptsUsed } = accessState;

  return (
    <Box sx={{ display: "flex", height: "100vh", background: "#03070f", overflow: "hidden" }}>

      {/* ── Sidebar ── */}
      <Drawer variant="permanent" sx={{
        width: DRAWER_WIDTH, flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH, background: "#071020",
          borderRight: "1px solid rgba(0,172,193,.15)",
          overflow: "hidden", display: "flex", flexDirection: "column"
        }
      }}>

        <Box sx={{ p: 2, borderBottom: "1px solid rgba(0,172,193,.15)" }}>
          <Typography sx={{ color: "#00ACC1", fontWeight: 800, fontFamily: "'Syne', sans-serif", fontSize: 16 }}>
            ThopsTech {isPractice ? "Practice" : "Assessment"}
          </Typography>
          <Typography sx={{ color: "#64748b", fontSize: 11, mt: 0.5 }}>
            Hi, {trainer.name?.split(" ")[0]} 👋
          </Typography>
        </Box>

        {/* Timer */}
        {!isPractice && (
          <Box sx={{
            px: 2, py: 1.5, borderBottom: "1px solid rgba(0,172,193,.1)",
            background: timeLeft < 300 ? "rgba(239,68,68,.08)" : "transparent"
          }}>
            <Typography sx={{
              color: timeLeft < 300 ? "#f87171" : "#f97316",
              fontWeight: 700, fontSize: 20, fontFamily: "'DM Mono', monospace", textAlign: "center"
            }}>
              ⏱ {fmtTime(timeLeft)}
            </Typography>
            <LinearProgress variant="determinate" value={(timeLeft / testDuration) * 100}
              sx={{ mt: 1, height: 4, borderRadius: 2,
                "& .MuiLinearProgress-bar": { background: timeLeft < 300 ? "#ef4444" : "#f97316" },
                background: "#1e293b" }} />
          </Box>
        )}

        {/* Tests remaining */}
        {!isPractice && (
          <Box sx={{
            px: 2, py: 1.2, borderBottom: "1px solid rgba(0,172,193,.08)",
            background: testsLeft <= 2 ? "rgba(239,68,68,.06)" : "rgba(0,172,193,.04)"
          }}>
            <Typography sx={{
              fontSize: 11, textAlign: "center", fontFamily: "'DM Mono', monospace",
              color: testsLeft <= 2 ? "#f87171" : "#64748b", fontWeight: testsLeft <= 2 ? 700 : 400
            }}>
              {testsLeft <= 1 ? "⚠️ Last attempt!" : `📊 ${testsLeft} attempts remaining`}
            </Typography>
            <Typography sx={{ fontSize: 10, textAlign: "center", color: "#334155", mt: 0.3 }}>
              Attempt #{attemptsUsed + 1} of {MAX_TESTS}
            </Typography>
          </Box>
        )}

        {/* Section tabs */}
        <Box sx={{ display: "flex", borderBottom: "1px solid rgba(0,172,193,.1)" }}>
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
                      background: active ? "rgba(0,172,193,.1)" : "transparent",
                      borderLeft: active ? "3px solid #00ACC1" : "3px solid transparent",
                      "&:hover": { background: "rgba(0,172,193,.07)" }
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
        <Box sx={{ p: 2, borderTop: "1px solid rgba(0,172,193,.1)" }}>
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
            <Box sx={{ width: "42%", overflowY: "auto", borderRight: "1px solid rgba(0,172,193,.1)",
              "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { background: "#1e3a4a" } }}>
              <QuestionCard
                question={currentQ}
                currentIndex={qIndex} setCurrentIndex={setQIndex}
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
              currentIndex={qIndex} setCurrentIndex={setQIndex}
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
            <Box sx={{ width: "36%", overflowY: "auto", borderRight: "1px solid rgba(0,172,193,.1)",
              "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { background: "#1e3a4a" } }}>
              <QuestionCard
                question={{
                  ...currentQ,
                  title:       `SQL Q${qIndex + 1}`,
                  description: currentQ.question,
                  explanation: undefined,
                }}
                currentIndex={qIndex} setCurrentIndex={setQIndex}
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
        PaperProps={{ sx: { background: "#0f172a", border: "1px solid rgba(0,172,193,.2)", borderRadius: 3 } }}>
        <DialogTitle sx={{ color: "#f1f5f9", fontFamily: "'Syne', sans-serif" }}>
          Submit Assessment?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#94a3b8", mb: 2 }}>
            You are about to submit your assessment. This cannot be undone.
          </Typography>
          {!isPractice && (
            <Box sx={{
              background: testsLeft <= 1 ? "rgba(239,68,68,.08)" : "rgba(0,172,193,.06)",
              border: `1px solid ${testsLeft <= 1 ? "rgba(239,68,68,.2)" : "rgba(0,172,193,.15)"}`,
              borderRadius: 2, p: 1.5, mb: 2,
            }}>
              <Typography sx={{ fontSize: 12, color: testsLeft <= 1 ? "#f87171" : "#64748b" }}>
                {testsLeft <= 1
                  ? "⚠️ This is your last test attempt for the next 24 hours!"
                  : `📊 After submitting you'll have ${testsLeft - 1} attempt${testsLeft - 1 !== 1 ? "s" : ""} remaining.`
                }
              </Typography>
            </Box>
          )}
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
    </Box>
  );
}