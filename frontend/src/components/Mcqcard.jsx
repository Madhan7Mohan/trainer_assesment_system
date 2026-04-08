import React from "react";
import { Box, Typography, Button, Paper, Chip } from "@mui/material";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@700;800&family=DM+Mono:wght@400;500&display=swap');

  /* OPTION BOX */
  .mcq-opt {
    cursor: pointer;
    padding: 12px 16px;
    border-radius: 10px;

    background: #ffffff;              /* pure white */
    color: #000000;                   /* black text */

    border: 1px solid #e2e8f0;        /* light border */

    font-family: 'DM Mono', monospace;
    font-size: 13px;

    transition: all 0.2s;
    margin-bottom: 10px;

    display: flex;
    align-items: center;
    gap: 12px;

    user-select: none;
  }

  /* HOVER */
  .mcq-opt:hover {
    background: #f8fafc;
    border-color: #38bdf8;
  }

  /* SELECTED */
  .mcq-opt.selected {
    border-color: #38bdf8;
    background: #e0f2fe;
    color: #000000;
  }

  /* CORRECT */
  .mcq-opt.correct {
    border-color: #22c55e;
    background: #dcfce7;
    color: #166534;
  }

  /* WRONG */
  .mcq-opt.wrong {
    border-color: #ef4444;
    background: #fee2e2;
    color: #991b1b;
  }

  /* OPTION LETTER (A, B, C, D) */
  .mcq-opt-letter {
    width: 28px;
    height: 28px;
    border-radius: 50%;

    display: flex;
    align-items: center;
    justify-content: center;

    font-weight: 700;
    font-size: 12px;

    flex-shrink: 0;

    background: #e0f2fe;
    color: #0284c7;

    transition: all 0.2s;
  }

  /* SELECTED LETTER */
  .mcq-opt.selected .mcq-opt-letter {
    background: #38bdf8;
    color: #ffffff;
  }
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
        background: "#ffffff",
color: "#000000",
border: "1px solid #e2e8f0",
boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        borderRadius: 3, p: 3, minHeight: "100%"
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
          <Typography sx={{ color: "#000000", fontSize: 15, lineHeight: 1.8, fontWeight: 500 }}>
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
            <Button
  variant="contained"
  onClick={() => setCurrentIndex(p => p + 1)}
  sx={{
    background: "#38bdf8",   // ✅ sky blue
    color: "#ffffff",
    fontWeight: 700,

    "&:hover": {
      background: "#0ea5e9",  // slightly darker sky blue
    }
  }}
>
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