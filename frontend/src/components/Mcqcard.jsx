import React from "react";
import { Box, Typography, Button, Paper, Chip } from "@mui/material";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@700;800&family=DM+Mono:wght@400;500&display=swap');

  .mcq-opt {
    cursor: pointer; padding: 12px 16px; border-radius: 10px;
    border: 1.5px solid rgba(148,163,184,0.12);
    background: rgba(15,23,42,0.8); color: #cbd5e1;
    font-family: 'DM Mono', monospace; font-size: 13px;
    transition: all 0.2s; margin-bottom: 10px;
    display: flex; align-items: center; gap: 12px;
    user-select: none;
  }
  .mcq-opt:hover {
    border-color: rgba(0,172,193,0.4);
    background: rgba(0,172,193,0.06);
    color: #e2e8f0;
  }
  .mcq-opt.selected {
    border-color: #00ACC1;
    background: rgba(0,172,193,0.12);
    color: #fff;
  }
  .mcq-opt.correct { border-color: #22c55e; background: rgba(34,197,94,0.12);  color: #86efac; }
  .mcq-opt.wrong   { border-color: #ef4444; background: rgba(239,68,68,0.08);  color: #fca5a5; }

  .mcq-opt-letter {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 12px; flex-shrink: 0;
    background: rgba(0,172,193,0.15); color: #00ACC1;
    transition: all 0.2s;
  }
  .mcq-opt.selected .mcq-opt-letter { background: #00ACC1; color: #fff; }
`;

const LETTERS = ["A", "B", "C", "D"];

export default function McqCard({
  question, currentIndex, setCurrentIndex, total,
  selected, onSelect, isLast, onFinalSubmit,
}) {
  const isAnswered = !!selected;

  return (
    <>
      <style>{css}</style>
      <Box sx={{
        background: "linear-gradient(135deg,#1e293b,#0f172a)",
        borderRadius: 3, p: 3, minHeight: "100%", color: "#fff",
      }}>

        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 1 }}>
          <Typography sx={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>
            🧠 Aptitude • Q{currentIndex + 1} of {total}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip label={`${question.marks} marks`}
              sx={{ background: "#a78bfa", color: "#000", fontWeight: 700, height: 24, fontSize: 11 }} />
            {isAnswered && (
              <Chip label="✓ Answered"
                sx={{ background: "#16a34a", color: "#fff", height: 24, fontSize: 11 }} />
            )}
          </Box>
        </Box>

        {/* Question text */}
        <Paper sx={{
          p: 2.5, background: "rgba(0,172,193,0.05)",
          border: "1px solid rgba(0,172,193,0.15)", borderRadius: 2, mb: 3,
        }}>
          <Typography sx={{ color: "#f1f5f9", fontSize: 15, lineHeight: 1.8, fontWeight: 500 }}>
            {question.question}
          </Typography>
        </Paper>

        {/* Options — ✅ guard removed so user can always change their answer */}
        {question.options.map((opt, i) => (
          <div
            key={opt}
            className={`mcq-opt${selected === opt ? " selected" : ""}`}
            onClick={() => onSelect(opt)}   // ← was: !selected && onSelect(opt)
          >
            <span className="mcq-opt-letter">{LETTERS[i]}</span>
            {opt}
          </div>
        ))}

        {/* Navigation */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          {/* ✅ Lighter "Previous" styling */}
          <Button
            variant="outlined"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(p => p - 1)}
            sx={{
              borderColor: "rgba(148,163,184,0.25)",
              color: "#64748b",
              fontWeight: 600,
              "&:hover": {
                borderColor: "rgba(148,163,184,0.5)",
                background: "rgba(148,163,184,0.06)",
                color: "#94a3b8",
              },
              "&.Mui-disabled": {
                borderColor: "rgba(148,163,184,0.08)",
                color: "#334155",
              },
            }}
          >
            ← Previous
          </Button>

          {isLast && onFinalSubmit ? (
            <Button variant="contained" onClick={onFinalSubmit}
              sx={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", fontWeight: 700 }}>
              Final Submit ✓
            </Button>
          ) : !isLast ? (
            <Button variant="contained" onClick={() => setCurrentIndex(p => p + 1)}
              sx={{ background: "#00ACC1", fontWeight: 700 }}>
              Next →
            </Button>
          ) : (
            <Box />
          )}
        </Box>

      </Box>
    </>
  );
}