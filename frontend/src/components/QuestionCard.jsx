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

  // Split sample input into lines for clear display
  const renderSampleInput = (input) => {
    if (!input) return null;
    const lines = input.split("\n").filter(l => l !== undefined);

    if (lines.length <= 1) {
      // Single line — just show it plainly
      return (
        <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#e2e8f0" }}>
          {input}
        </Typography>
      );
    }

    // Multi-line — show each line with a label
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {lines.map((line, i) => (
          <Box key={i} sx={{
            display: "flex", alignItems: "stretch",
            borderRadius: 1, overflow: "hidden",
            border: "1px solid rgba(99,179,237,.12)",
          }}>
            {/* Line label */}
            <Box sx={{
              px: 1.5, py: 0.8,
              background: "rgba(0,172,193,.12)",
              borderRight: "1px solid rgba(99,179,237,.12)",
              display: "flex", alignItems: "center",
              minWidth: 64, flexShrink: 0,
            }}>
              <Typography sx={{
                fontSize: 10, fontWeight: 700, letterSpacing: 1,
                textTransform: "uppercase", color: "#00ACC1",
                fontFamily: "'DM Mono', monospace",
              }}>
                Line {i + 1}
              </Typography>
            </Box>
            {/* Line value */}
            <Box sx={{ px: 1.5, py: 0.8, background: "#080d16", flex: 1 }}>
              <Typography sx={{
                fontFamily: "'DM Mono', monospace", fontSize: 13,
                color: "#7dd3fc", letterSpacing: 0.5,
              }}>
                {line}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    );
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
          <Typography variant="subtitle1" sx={{ mb: 1.5, color: "#38bdf8", fontWeight: "bold" }}>
            Sample Test Case
          </Typography>
          <Paper sx={{ backgroundColor: "#0f172a", p: 2, mb: 2, border: "1px solid rgba(99,179,237,.12)" }}>

            {/* Input */}
            {question.sampleInput && (
              <Box sx={{ mb: 2 }}>
                <Typography sx={{
                  fontWeight: 700, mb: 1, fontSize: 12,
                  color: "#475569", letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}>
                  Input
                </Typography>
                {renderSampleInput(question.sampleInput)}
              </Box>
            )}

            {/* Divider between input and output */}
            {question.sampleInput && question.sampleOutput && (
              <Divider sx={{ my: 1.5, borderColor: "rgba(99,179,237,.08)" }} />
            )}

            {/* Output */}
            {question.sampleOutput && (
              <Box>
                <Typography sx={{
                  fontWeight: 700, mb: 1, fontSize: 12,
                  color: "#475569", letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}>
                  Output
                </Typography>
                <Box sx={{
                  display: "inline-flex", alignItems: "center",
                  background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.2)",
                  borderRadius: 1, px: 1.5, py: 0.8,
                }}>
                  <Typography sx={{
                    fontFamily: "'DM Mono', monospace", fontSize: 13,
                    color: "#4ade80", letterSpacing: 0.5,
                  }}>
                    {question.sampleOutput}
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>

          {/* Tip box — only shown when input has multiple lines */}
          {question.sampleInput?.includes("\n") && (
            <Box sx={{
              display: "flex", alignItems: "flex-start", gap: 1,
              background: "rgba(251,191,36,.06)", border: "1px solid rgba(251,191,36,.2)",
              borderRadius: 2, p: 1.5, mb: 2,
            }}>
              <Typography sx={{ fontSize: 14, flexShrink: 0 }}>💡</Typography>
              <Typography sx={{ fontSize: 12, color: "#fbbf24", lineHeight: 1.6 }}>
                <strong>Custom Input tip:</strong> Type each line separately in the input box —
                one line per row, exactly as shown above.
              </Typography>
            </Box>
          )}
        </>
      )}

      {/* ── Navigation ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3, gap: 1 }}>
        <Button
          variant="outlined"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(prev => prev - 1)}
          sx={{ borderColor: "#00ACC1", color: "#00ACC1", fontFamily: "'Syne', sans-serif", fontWeight: 700 }}
        >
          ← Previous
        </Button>

        {isLast ? (
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
            <Box />
          )
        ) : (
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