import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Chip
} from "@mui/material";
import { keyframes } from "@mui/system";

/**
 * QuestionCard
 * Props:
 *   question, currentIndex, setCurrentIndex, total, timeLeft
 *   isLast          — true when this is the final question
 *   onFinalSubmit   — called when "Final Submit" is clicked (null in practice mode)
 */
function QuestionCard({
  question,
  currentIndex,
  setCurrentIndex,
  total,
  timeLeft,
  isLast,
  onFinalSubmit,
}) {
  const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  `;

  const getDifficultyColor = () => {
    if (question.difficulty === "Easy")   return "#16a34a";
    if (question.difficulty === "Medium") return "#facc15";
    if (question.difficulty === "Hard")   return "#dc2626";
    return "#38bdf8";
  };

  return (
    <Box
      key={question.id}
      sx={{
        background: "linear-gradient(135deg, #1e293b, #0f172a)",
        minHeight: "100%",
        p: 3,
        borderRadius: 3,
        color: "#fff",
        animation: `${fadeIn} 0.4s ease`,
      }}
    >
      {/* ── Header row ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h5" sx={{ color: "#00ACC1", fontWeight: "bold", fontFamily: "'Syne', sans-serif" }}>
          {question.title}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip label={question.difficulty} sx={{ backgroundColor: getDifficultyColor(), color: "#000", fontWeight: "bold" }} />
          <Chip label={`${question.marks} Marks`} sx={{ backgroundColor: "#38bdf8", color: "#000", fontWeight: "bold" }} />
          {timeLeft !== undefined && (
            <Chip label={`⏱ ${timeLeft}s`} sx={{ backgroundColor: "#f97316", color: "#000", fontWeight: "bold" }} />
          )}
          <Chip label={`${currentIndex + 1} / ${total}`} sx={{ backgroundColor: "#a78bfa", color: "#000", fontWeight: "bold" }} />
        </Box>
      </Box>

      {/* ── Description ── */}
      <Typography sx={{ mb: 2, color: "#e2e8f0", lineHeight: 1.7 }}>
        {question.description}
      </Typography>

      {/* ── Explanation ── */}
      {question.explanation && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: "#38bdf8", fontWeight: "bold" }}>
            Explanation
          </Typography>
          <Typography sx={{ color: "#cbd5e1", lineHeight: 1.6 }}>
            {question.explanation}
          </Typography>
        </>
      )}

      <Divider sx={{ my: 2, backgroundColor: "#334155" }} />

      {/* ── Input Format ── */}
      {question.inputFormat && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 1, color: "#38bdf8", fontWeight: "bold" }}>Input Format</Typography>
          <Typography sx={{ color: "#cbd5e1", mb: 2 }}>{question.inputFormat}</Typography>
        </>
      )}

      {/* ── Output Format ── */}
      {question.outputFormat && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 1, color: "#38bdf8", fontWeight: "bold" }}>Output Format</Typography>
          <Typography sx={{ color: "#cbd5e1", mb: 2 }}>{question.outputFormat}</Typography>
        </>
      )}

      {/* ── Constraints ── */}
      {question.constraints && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 1, color: "#38bdf8", fontWeight: "bold" }}>Constraints</Typography>
          <Paper sx={{ backgroundColor: "#0f172a", p: 2, mb: 2, color: "#facc15", borderLeft: "4px solid #facc15" }}>
            <Typography>{question.constraints}</Typography>
          </Paper>
        </>
      )}

      {/* ── Sample Test Case ── */}
      {(question.sampleInput || question.sampleOutput) && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 1, color: "#38bdf8", fontWeight: "bold" }}>Sample Test Case</Typography>
          <Paper sx={{ backgroundColor: "#0f172a", p: 2, mb: 2, color: "#e2e8f0" }}>
            {question.sampleInput && (
              <>
                <Typography sx={{ fontWeight: "bold", mb: 1 }}>Input:</Typography>
                <Typography sx={{ mb: 2, fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{question.sampleInput}</Typography>
              </>
            )}
            {question.sampleOutput && (
              <>
                <Typography sx={{ fontWeight: "bold", mb: 1 }}>Output:</Typography>
                <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{question.sampleOutput}</Typography>
              </>
            )}
          </Paper>
        </>
      )}

      {/* ── Navigation ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3, gap: 1 }}>

        {/* Previous — always visible, disabled on Q1 */}
        <Button
          variant="outlined"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(prev => prev - 1)}
          sx={{ borderColor: "#00ACC1", color: "#00ACC1", fontFamily: "'Syne', sans-serif", fontWeight: 700 }}
        >
          ← Previous
        </Button>

        {/* Right side: Next OR Final Submit */}
        {isLast ? (
          // Last question — show Final Submit only if in test mode (onFinalSubmit provided)
          onFinalSubmit ? (
            <Button
              variant="contained"
              onClick={onFinalSubmit}
              sx={{
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: "15px",
                px: 4,
                py: 1.2,
                boxShadow: "0 4px 16px rgba(34,197,94,0.3)",
                "&:hover": { boxShadow: "0 6px 22px rgba(34,197,94,0.45)", transform: "translateY(-1px)" },
              }}
            >
              Final Submit ✓
            </Button>
          ) : (
            // Practice mode last question — no button on right
            <Box />
          )
        ) : (
          // Not last — show Next
          <Button
            variant="contained"
            onClick={() => setCurrentIndex(prev => prev + 1)}
            sx={{ backgroundColor: "#00ACC1", fontFamily: "'Syne', sans-serif", fontWeight: 700 }}
          >
            Next →
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default QuestionCard;