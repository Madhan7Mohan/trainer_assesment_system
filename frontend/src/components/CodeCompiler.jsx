import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
  Box,
  Button,
  Select,
  MenuItem,
  Typography,
  TextField,
  Paper,
  CircularProgress
} from "@mui/material";
import { keyframes } from "@mui/system";
import { executeCode } from "../utils/judge0";

/**
 * CodeCompiler
 * Props:
 *  - question:       the current coding question object
 *  - onScoreUpdate:  (score: number) => void — called when user submits
 */
function CodeCompiler({ question, onScoreUpdate }) {

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [score, setScore] = useState(null);
  const [passedCount, setPassedCount] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [consoleOutput, setConsoleOutput] = useState("");
  const [errorOutput, setErrorOutput] = useState("");
  const [detailedTest, setDetailedTest] = useState(null);
  const [loading, setLoading] = useState(false);

  const boilerplates = {
    python: `# Write your solution here\n`,
    java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}`,
    javascript: `// Write your solution here\n`,
  };

  const popAnimation = keyframes`
    0% { transform: scale(0.8); opacity: 0; }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  `;

  // Reset when question changes
  useEffect(() => {
    const saved = localStorage.getItem(`code_question_${question.id}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setCode(parsed.code);
      setLanguage(parsed.language);
    } else {
      setLanguage("python");
      setCode(boilerplates["python"]);
    }
    setDetailedTest(null);
    setScore(null);
    setPassedCount(0);
    setConsoleOutput("");
    setErrorOutput("");
  }, [question.id]);

  const getLanguageId = () => {
    if (language === "python") return 71;
    if (language === "java") return 62;
    if (language === "javascript") return 63;
  };

  const runWithCustomInput = async () => {
    setLoading(true);
    setConsoleOutput("Running...");
    setErrorOutput("");
    try {
      const res = await executeCode(code, getLanguageId(), customInput);
      if (res.stderr) {
        setErrorOutput(res.stderr);
        setConsoleOutput("");
      } else {
        setConsoleOutput(res.stdout || "No Output");
      }
    } catch (e) {
      setErrorOutput("Execution error. Check your code.");
    }
    setLoading(false);
  };

  const evaluate = async () => {
    setLoading(true);
    let passed = 0;
    let firstTest = null;

    for (let i = 0; i < question.testCases.length; i++) {
      const tc = question.testCases[i];
      try {
        const res = await executeCode(code, getLanguageId(), tc.input);
        const actual = res.stdout?.trim() || "";
        const expected = tc.expected.trim();
        const isPassed = actual === expected;
        if (isPassed) passed++;
        if (i === 0) {
          firstTest = {
            index: 1,
            status: isPassed ? "Pass" : "Fail",
            output: actual || res.stderr || "No Output",
          };
        }
      } catch {
        if (i === 0) firstTest = { index: 1, status: "Fail", output: "Error" };
      }
    }

    const finalScore = Math.round((passed / question.testCases.length) * question.marks);
    setScore(finalScore);
    setPassedCount(passed);
    setDetailedTest(firstTest);

    // Notify parent layout
    if (onScoreUpdate) onScoreUpdate(finalScore);

    localStorage.setItem(
      `code_question_${question.id}`,
      JSON.stringify({ code, language })
    );

    setLoading(false);
  };

  return (
    <Box sx={{ backgroundColor: "#0f172a", minHeight: "100vh", color: "#fff", p: 3 }}>

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ color: "#00ACC1", fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>
          Code Editor
        </Typography>
        <Select
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            setCode(boilerplates[e.target.value]);
          }}
          size="small"
          sx={{ backgroundColor: "#1e293b", borderRadius: 1, minWidth: 150, color: "#e2e8f0",
            "& .MuiSelect-icon": { color: "#94a3b8" },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,172,193,0.3)" },
          }}
        >
          <MenuItem value="python">🐍 Python</MenuItem>
          <MenuItem value="java">☕ Java</MenuItem>
          <MenuItem value="javascript">⚡ JavaScript</MenuItem>
        </Select>
      </Box>

      {/* Editor */}
      <Paper elevation={6} sx={{ mb: 3, borderRadius: 2, overflow: "hidden", border: "1px solid rgba(0,172,193,0.15)" }}>
        <Editor
          height="380px"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
          options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false }}
        />
      </Paper>

      {/* Input & Output */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Paper elevation={4} sx={{ flex: 1, p: 2, backgroundColor: "#1e293b", borderRadius: 2 }}>
          <Typography sx={{ mb: 1, color: "#00ACC1", fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
            Custom Input
          </Typography>
          <TextField
            multiline rows={5} fullWidth
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Enter test input here..."
            sx={{
              "& .MuiInputBase-root": { backgroundColor: "#0f172a", color: "#e2e8f0", borderRadius: 1 },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,172,193,0.2)" },
            }}
          />
        </Paper>

        <Paper elevation={4} sx={{ flex: 1, p: 2, backgroundColor: "#0f172a", borderRadius: 2, border: "1px solid rgba(0,172,193,0.1)" }}>
          <Typography sx={{ mb: 1, color: "#00ACC1", fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
            Output Console
          </Typography>
          {loading && <CircularProgress size={18} sx={{ color: "#00ACC1" }} />}
          <pre style={{ margin: 0, color: "#e2e8f0", fontFamily: "'DM Mono', monospace", fontSize: 13, whiteSpace: "pre-wrap" }}>
            {consoleOutput}
          </pre>
          {errorOutput && (
            <pre style={{ color: "#f87171", marginTop: 8, fontFamily: "'DM Mono', monospace", fontSize: 12, whiteSpace: "pre-wrap" }}>
              {errorOutput}
            </pre>
          )}
        </Paper>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          onClick={runWithCustomInput}
          disabled={loading}
          sx={{ backgroundColor: "#0891b2", fontFamily: "'Syne', sans-serif", fontWeight: 700, borderRadius: 2 }}
        >
          ▶ Run Code
        </Button>
        <Button
          variant="contained"
          onClick={evaluate}
          disabled={loading}
          sx={{ backgroundColor: "#16a34a", fontFamily: "'Syne', sans-serif", fontWeight: 700, borderRadius: 2 }}
        >
          ✓ Submit
        </Button>
      </Box>

      {/* Score Section */}
      {detailedTest && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography sx={{
            fontSize: "36px", fontWeight: "bold",
            color: score > 0 ? "#22c55e" : "#ef4444",
            fontFamily: "'Syne', sans-serif",
            animation: `${popAnimation} 0.6s ease`,
          }}>
            Score: {score} / {question.marks}
          </Typography>

          <Typography sx={{
            fontSize: "18px", mt: 1, fontWeight: 600,
            color: passedCount === question.testCases.length ? "#22c55e" : "#facc15",
            animation: `${popAnimation} 0.8s ease`,
          }}>
            Passed {passedCount} / {question.testCases.length} test cases
          </Typography>

          <Paper sx={{
            mt: 3, p: 3, borderRadius: 2,
            backgroundColor: detailedTest.status === "Pass" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${detailedTest.status === "Pass" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.25)"}`,
          }}>
            <Typography sx={{ fontWeight: 700, fontSize: "16px", color: detailedTest.status === "Pass" ? "#22c55e" : "#f87171" }}>
              {detailedTest.status === "Pass" ? "✅ Test Case 1 Passed" : "❌ Test Case 1 Failed"}
            </Typography>
            {detailedTest.status === "Fail" && (
              <Typography sx={{ mt: 1, color: "#94a3b8", fontSize: 13 }}>
                Your output: <span style={{ color: "#e2e8f0" }}>{detailedTest.output}</span>
              </Typography>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
}

export default CodeCompiler;