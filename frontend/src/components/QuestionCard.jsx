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
    if (question.difficulty === "Easy") return "#22c55e";
    if (question.difficulty === "Medium") return "#facc15";
    if (question.difficulty === "Hard") return "#ef4444";
    return "#3b82f6";
  };

  const renderSampleInput = (input) => {
    if (!input) return null;
    const lines = input.split("\n");

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {lines.map((line, i) => (
          <Box key={i} sx={{
            display: "flex",
            borderRadius: 1,
            overflow: "hidden",
            border: "1px solid #e2e8f0"
          }}>
            <Box sx={{
              px: 1.5,
              py: 0.8,
              background: "#e0f2fe",
              minWidth: 60
            }}>
              <Typography sx={{ fontSize: 11, color: "#0369a1" }}>
                Line {i + 1}
              </Typography>
            </Box>

            <Box sx={{ px: 1.5, py: 0.8, background: "#f8fafc", flex: 1 }}>
              <Typography sx={{ fontSize: 13, color: "#2563eb" }}>
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
        background: "#f8fbff",
        minHeight: "100%",
        p: 3,
        borderRadius: 3,
        color: "#1e293b",
        animation: `${fadeIn} 0.4s ease`,
      }}
    >
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" sx={{ color: "#2563eb", fontWeight: "bold" }}>
          {question.title}
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip label={question.difficulty}
            sx={{ background: "#e0f2fe", color: "#0369a1" }}
          />
          <Chip label={`${question.marks} Marks`}
            sx={{ background: "#dbeafe", color: "#1d4ed8" }}
          />
          <Chip label={`${currentIndex + 1}/${total}`}
            sx={{ background: "#ede9fe", color: "#6d28d9" }}
          />
        </Box>
      </Box>

      {/* DESCRIPTION */}
      <Typography sx={{ mb: 2, color: "#475569" }}>
        {question.description}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* INPUT FORMAT */}
      {question.inputFormat && (
        <>
          <Typography sx={{ color: "#2563eb", fontWeight: "bold" }}>
            Input Format
          </Typography>
          <Typography sx={{ mb: 2 }}>{question.inputFormat}</Typography>
        </>
      )}

      {/* OUTPUT FORMAT */}
      {question.outputFormat && (
        <>
          <Typography sx={{ color: "#2563eb", fontWeight: "bold" }}>
            Output Format
          </Typography>
          <Typography sx={{ mb: 2 }}>{question.outputFormat}</Typography>
        </>
      )}

      {/* CONSTRAINTS */}
      {question.constraints && (
        <>
          <Typography sx={{ color: "#2563eb", fontWeight: "bold" }}>
            Constraints
          </Typography>
          <Paper sx={{
            background: "#eff6ff",
            p: 2,
            mb: 2,
            borderLeft: "4px solid #3b82f6"
          }}>
            {question.constraints}
          </Paper>
        </>
      )}

      {/* SAMPLE */}
      {(question.sampleInput || question.sampleOutput) && (
        <>
          <Typography sx={{ color: "#2563eb", fontWeight: "bold" }}>
            Sample Test Case
          </Typography>

          <Paper sx={{
            background: "#ffffff",
            p: 2,
            border: "1px solid #e2e8f0",
            mb: 2
          }}>
            {question.sampleInput && (
              <>
                <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                  Input
                </Typography>
                {renderSampleInput(question.sampleInput)}
              </>
            )}

            {question.sampleOutput && (
              <>
                <Typography sx={{ mt: 2, fontSize: 12, color: "#64748b" }}>
                  Output
                </Typography>

                <Box sx={{
                  background: "#ecfdf5",
                  border: "1px solid #86efac",
                  display: "inline-block",
                  px: 2,
                  py: 1,
                  borderRadius: 1
                }}>
                  <Typography sx={{ color: "#16a34a" }}>
                    {question.sampleOutput}
                  </Typography>
                </Box>
              </>
            )}
          </Paper>
        </>
      )}

      {/* BUTTONS */}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(prev => prev - 1)}
          sx={{ borderColor: "#3b82f6", color: "#3b82f6" }}
        >
          Previous
        </Button>

        {isLast ? (
          <Button
            variant="contained"
            onClick={onFinalSubmit}
            sx={{
              background: "#22c55e",
              "&:hover": { background: "#16a34a" }
            }}
          >
            Submit
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={() => setCurrentIndex(prev => prev + 1)}
            sx={{
              background: "#3b82f6",
              "&:hover": { background: "#2563eb" }
            }}
          >
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default QuestionCard;