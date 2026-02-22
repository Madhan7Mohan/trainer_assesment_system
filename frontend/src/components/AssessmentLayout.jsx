import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Button, Typography, Drawer, List, ListItem, ListItemButton,
  Chip, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import CodeCompiler from "./CodeCompiler";
import SqlCompiler from "./SqlCompiler";
import QuestionCard from "./QuestionCard";
//import McqCard from "./McqCard";
import McqCard from "./Mcqcard";
import { getTestQuestions, getPracticeQuestions } from "../data/questionBank";

const SECTION_CONFIG = {
  coding:   { label: "Coding",   icon: "💻", color: "#00ACC1" },
  aptitude: { label: "Aptitude", icon: "🧠", color: "#a78bfa" },
  sql:      { label: "SQL",      icon: "🗄️", color: "#f97316" },
};

const DRAWER_WIDTH = 260;
const TEST_DURATION = 80 * 60; // 80 minutes in seconds

export default function AssessmentLayout({ trainer, submitExam, onExitPractice }) {
  const isPractice = trainer.mode === "practice";

  // Build question sets once
  const [questions] = useState(() =>
    isPractice ? getPracticeQuestions() : getTestQuestions()
  );

  const [section,   setSection]   = useState("coding");
  const [qIndex,    setQIndex]    = useState(0);
  const [scores,    setScores]    = useState({});       // { [questionId]: score }
  const [mcqAnswer, setMcqAnswer] = useState({});       // { [questionId]: selectedOption }
  const [timeLeft,  setTimeLeft]  = useState(TEST_DURATION);
  const [submitDlg, setSubmitDlg] = useState(false);
  const timerRef = useRef(null);

  // ── handleFinalSubmit defined with useCallback BEFORE any effect that uses it ──
  const handleFinalSubmit = useCallback(() => {
    clearInterval(timerRef.current);

    let codingScore = 0, aptScore = 0, sqlScore = 0;
    questions.coding.forEach(q   => { codingScore += scores[q.id] || 0; });
    questions.aptitude.forEach(q => { aptScore    += scores[q.id] || 0; });
    questions.sql.forEach(q      => { sqlScore    += scores[q.id] || 0; });

    const totalCoding = questions.coding.reduce((a, q)   => a + q.marks, 0);
    const totalApt    = questions.aptitude.reduce((a, q) => a + q.marks, 0);
    const totalSql    = questions.sql.reduce((a, q)      => a + q.marks, 0);

    submitExam({
      codingScore,
      mcqScore:     aptScore + sqlScore,
      codingPassed: codingScore > 0,
      mcqCorrect:   Object.values(mcqAnswer).filter(Boolean).length,
      totalCoding,
      totalMCQ:     totalApt + totalSql,
      totalMarks:   totalCoding + totalApt + totalSql,
    });
  }, [questions, scores, mcqAnswer, submitExam]);

  // Timer (test mode only)
  useEffect(() => {
    if (isPractice) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isPractice]);

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (timeLeft === 0 && !isPractice) {
      handleFinalSubmit();
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

  if (!currentQ) return null;

  return (
    <Box sx={{ display: "flex", height: "100vh", background: "#03070f", overflow: "hidden" }}>

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
    </Box>
  );
}


//signout was not working
//sql not working
//previous button should be more light..
//results was not storing 
// screenshot need to take when click on back to home after displaying the results..
