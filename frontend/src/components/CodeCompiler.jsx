import React, { useState, useEffect, useCallback, useRef } from "react";
import Editor from "@monaco-editor/react";
//import { executeCode } from "../utils/judge0";

// ── Language meta ─────────────────────────────────────────────────────────────
const LANG_META = {
  python:     { id: 71, label: "Python 3",  icon: "🐍" },
  java:       { id: 62, label: "Java",       icon: "☕" },
  javascript: { id: 63, label: "JavaScript", icon: "⚡" },
};

// Build starter code from functionSignature on the question object.
// question.functionSignature = { python: "def isPalindrome(s):", java: "...", javascript: "..." }
function buildCode(lang, question) {
  const sig = question?.functionSignature?.[lang];
  if (!sig) {
    return {
      python:     `# Write your solution here\n`,
      java:       `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}`,
      javascript: `// Write your solution here\n`,
    }[lang];
  }
  if (lang === "python")     return `${sig}\n    # Write your solution here\n    pass\n`;
  if (lang === "javascript") return `${sig}\n    // Write your solution here\n};\n`;
  if (lang === "java")       return `import java.util.*;\npublic class Main {\n    ${sig} {\n        // Write your solution here\n    }\n}`;
  return `// Write your solution here\n`;
}

// ── Draggable divider hook ────────────────────────────────────────────────────
function useDragDivider(initial, min, max, invert = false) {
  const [size, setSize]           = useState(initial);
  const [dragging, setDragging]   = useState(false);
  const startX  = useRef(0);
  const startSz = useRef(initial);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    startX.current  = e.clientX;
    startSz.current = size;
    setDragging(true);

    const onMove = (ev) => {
      const delta = invert
        ? startX.current - ev.clientX
        : ev.clientX - startX.current;
      setSize(Math.min(max, Math.max(min, startSz.current + delta)));
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [size, min, max, invert]);

  return [size, onMouseDown, dragging];
}

// ── Styles ────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@400;600;700;800&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ROOT */
.cc-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fbff;
  color: #1e293b;
  font-family: 'Outfit', sans-serif;
  overflow: hidden;
}

/* TOPBAR */
.cc-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  height: 50px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

.cc-title {
  font-weight: 800;
  font-size: 14px;
  color: #1e293b;
}

/* CHIPS */
.cc-chip {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}

.cc-chip-easy {
  background: #dcfce7;
  color: #16a34a;
}

.cc-chip-medium {
  background: #fef9c3;
  color: #ca8a04;
}

.cc-chip-hard {
  background: #fee2e2;
  color: #dc2626;
}

.cc-chip-marks {
  background: #dbeafe;
  color: #1d4ed8;
}

/* LANGUAGE BUTTONS */
.cc-langs {
  display: flex;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.cc-lang-btn {
  padding: 5px 14px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.cc-lang-btn.active {
  background: #e0f2fe;
  color: #0284c7;
}

/* BODY */
.cc-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  position-relative;
}

/* DIVIDER */
.cc-divider {
  width: 5px;
  cursor: col-resize;
  background: #e2e8f0;
}

/* CENTRE */
.cc-centre {
  display: flex;
  flex-direction: column;
  flex: 1;
   min-width: 0;
}
   .cc-editor-wrap {
  flex: 1;
  min-height: 0;
  width:100%;
}

/* EDITOR HEADER */
.cc-editor-header {
  padding: 8px 14px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  font-size: 12px;
  color: #475569;
  font-weight: 600;
}

/* SIGNATURE */
.cc-sig-bar {
  padding: 8px 14px;
  background: #f1f5f9;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #2563eb;
}

/* IO SECTION */
.cc-io {
  height: 180px;
  border-top: 1px solid #e2e8f0;
}

.cc-io-tabs {
  display: flex;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

.cc-io-tab {
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.cc-io-tab.active {
  color: #2563eb;
  border-bottom: 2px solid #2563eb;
}

.cc-io-body {
  padding: 10px;
  background: #f8fafc;
}

.cc-io-ta {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  color: #1e293b;
  font-family: 'JetBrains Mono', monospace;
}

/* OUTPUT */
.cc-out.ok {
  color: #16a34a;
}

.cc-out.err {
  color: #dc2626;
}

.cc-out.idle {
  color: #64748b;
}

/* RIGHT PANEL */
.cc-right {
  background: #ffffff;
  border-left: 1px solid #e2e8f0;
}

/* TEST CASE CARD */
.cc-tc {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  margin-bottom: 10px;
}


  .cc-tc-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  font-weight: 600;
  color: #475569;

}
  .cc-tc-title {
  font-size: 13px;
  font-weight: 600;
  min-width: 80px;
}

.cc-tc-status {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 600;
  min-width: 80px;
  text-align: center;
}

.cc-tc-body {
  padding: 10px;
}

/* TEST INPUT BOX */
.cc-tc-val {
  background: #ffffff;
  color: #2563eb;
  padding: 6px;
  border-radius: 5px;
  border: 1px solid #e2e8f0;
  font-family: 'JetBrains Mono', monospace;
}

/* SCORE */
.cc-score {
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 10px 18px;
}

/* ACTION BAR */
.cc-actions {
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 10px 18px;
}

/* BUTTONS */
.cc-btn-run {
  background: #3b82f6;
  color: white;
}

.cc-btn-submit {
  background: #22c55e;
  color: white;
}
  /* FIX MISSING CLASSES */

.cc-topbar-l {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cc-topbar-r {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cc-focus-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  border: 1px solid #e2e8f0;
}

.cc-focus-pill.on {
  background: #e0f2fe;
  color: #0284c7;
}

.cc-focus-pill.off {
  background: #f1f5f9;
  color: #64748b;
}

.cc-focus-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.cc-right-header {
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #475569;
}

.cc-right-inner {
  padding: 10px;
  overflow-y: auto;
  padding-bottom: 100px;
   height: 100%;
}

.cc-tc-status {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 20px;
}

.cc-tc-status.pass {
  background: #dcfce7;
  color: #16a34a;
}

.cc-tc-status.fail {
  background: #fee2e2;
  color: #dc2626;
}

.cc-tc-status.running {
  background: #e0f2fe;
  color: #0284c7;
}

.cc-locked-box {
  padding: 12px;
  text-align: center;
  border: 1px dashed #e2e8f0;
  border-radius: 10px;
  color: #64748b;
}

.cc-btns {
  display: flex;
  gap: 10px;
}

.cc-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.cc-spin {
  width: 14px;
  height: 14px;
  border: 2px solid #ccc;
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.cc-prog {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 4px;
}

.cc-prog-fill {
  height: 100%;
  border-radius: 4px;
}
  .cc-toggle-btn {
  position: absolute;
  right: 16px;
  top: 60px;
  z-index: 20;

  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;

  font-size: 12px;
  font-weight: 600;
  cursor: pointer;

  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transition: all 0.2s ease;
}

.cc-toggle-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
}

.cc-toggle-btn:active {
  transform: scale(0.97);
}
  /* Show Test Cases Button (next to Output tab) */
.cc-show-tc-btn {
  margin-left: auto;   /* pushes button to right */
  margin-right: 8px;

  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;

  border: none;
  border-radius: 6px;

  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;

  cursor: pointer;
  transition: all 0.2s ease;
}

/* Hover effect */
.cc-show-tc-btn:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

/* Click effect */
.cc-show-tc-btn:active {
  transform: scale(0.97);
}

/* Optional: when active (showing test cases) */
.cc-show-tc-btn.active {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}
  /* FIX TEST CASE LAYOUT */

.cc-tc-head {
  padding: 8px 10px;
  border-bottom: 1px solid #e2e8f0;
}

.cc-tc-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cc-tc-title {
  font-size: 13px;
  font-weight: 600;
}

.cc-tc-body {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cc-tc-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cc-tc-lbl {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}
`;
const VISIBLE_TC = 2; // visible before submit

export default function CodeCompiler({ question, onScoreUpdate }) {
  const [showTestCases, setShowTestCases] = useState(true);
  const [language,    setLanguage]  = useState("python");
  const [code,        setCode]      = useState(() => buildCode("python", question));
  const [focusMode,   setFocusMode] = useState(true);
  const [customInput, setInput]     = useState("");
  const [output,      setOutput]    = useState({ text: "", type: "idle" });
  const [loading,     setLoading]   = useState(false);
  const [ioTab,       setIoTab]     = useState("input");
  const [tcResults,   setTcResults] = useState([]);
  const [submitted,   setSubmitted] = useState(false);
  const [scoreInfo,   setScore]     = useState(null);

  // Draggable panels
  const [rightW, rightDrag, rightDragging] = useDragDivider(260, 160, 460, true);

  // Reset on question change
  useEffect(() => {
    const saved = localStorage.getItem(`code_q_${question.id}`);
    if (saved) {
      try { const p = JSON.parse(saved); setCode(p.code); setLanguage(p.language); } catch {}
    } else {
      setLanguage("python"); setCode(buildCode("python", question));
    }
    setTcResults([]); setScore(null); setSubmitted(false);
    setOutput({ text: "", type: "idle" }); setInput(""); setIoTab("input");
  }, [question.id]);

  const switchLang = (lang) => {
    setLanguage(lang); setCode(buildCode(lang, question));
    setTcResults([]); setScore(null); setSubmitted(false);
    setOutput({ text: "", type: "idle" });
  };

  const langId = () => LANG_META[language].id;

  const handleRun = useCallback(async () => {
     setShowTestCases(true); // ✅ AUTO SHOW PANEL

  setLoading(true); 
  setIoTab("output");
  setOutput({ text: "Running…", type: "idle" });

  try {
    const res = await executeCode(code, langId(), customInput);
    setOutput(res.stderr
      ? { text: res.stderr, type: "err" }
      : { text: res.stdout || "(no output)", type: "ok" });
  } catch {
    setOutput({ text: "Execution failed.", type: "err" });
  }

  setLoading(false);
}, [code, language, customInput]);

  const handleSubmit = useCallback(async () => {
    setLoading(true); setSubmitted(false); setScore(null);
    setTcResults(question.testCases.map(() => ({ status: "running" })));
    setIoTab("output"); setOutput({ text: "Evaluating all test cases…", type: "idle" });

    const results = []; let passed = 0; let hiddenPassed = 0;
    for (let i = 0; i < question.testCases.length; i++) {
      const tc = question.testCases[i];
      try {
        const res = await executeCode(code, langId(), tc.input);
        const got = res.stdout?.trim() ?? "";
        const ok  = got === tc.expected.trim();
        if (ok) passed++;
        // Only hidden test cases (index >= VISIBLE_TC) contribute to score
        if (i >= VISIBLE_TC && ok) hiddenPassed++;
        results.push({ status: ok ? "pass" : "fail", got, stderr: res.stderr });
      } catch { results.push({ status: "fail", got: "Error", stderr: "" }); }
      setTcResults([...results, ...Array(question.testCases.length - results.length).fill({ status: "running" })]);
    }

    setTcResults(results);
    const hiddenTotal = Math.max(question.testCases.length - VISIBLE_TC, 0);
    // Score ONLY from hidden test cases; fallback to all if none hidden
    const finalScore = hiddenTotal > 0
      ? Math.round((hiddenPassed / hiddenTotal) * question.marks)
      : Math.round((passed / question.testCases.length) * question.marks);
    setScore({ score: finalScore, passed, total: question.testCases.length, hiddenPassed, hiddenTotal });
    setSubmitted(true);
    setOutput({ text: `${passed}/${question.testCases.length} test cases passed. Score from ${hiddenTotal} hidden cases.`, type: passed === question.testCases.length ? "ok" : "err" });
    if (onScoreUpdate) onScoreUpdate(finalScore);
    localStorage.setItem(`code_q_${question.id}`, JSON.stringify({ code, language }));
    setLoading(false);
  }, [code, language, question]);

  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Enter") { e.preventDefault(); handleSubmit(); }
      else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); handleRun(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [handleRun, handleSubmit]);

  const diffClass  = { Easy: "easy", Medium: "medium", Hard: "hard" }[question.difficulty] || "easy";
  const scoreColor = !scoreInfo ? "score-ok"
    : scoreInfo.passed === scoreInfo.total ? "score-ok"
    : scoreInfo.passed === 0 ? "score-fail" : "score-part";

  return (
    <>
      <style>{css}</style>
      <div className="cc-root">

        {/* Topbar */}
        <div className="cc-topbar">
          <div className="cc-topbar-l">
            <span className="cc-title">Code Editor</span>
            <span className={`cc-chip cc-chip-${diffClass}`}>{question.difficulty}</span>
            <span className="cc-chip cc-chip-marks">{question.marks} marks</span>
          </div>
          <div className="cc-topbar-r">
            <div className="cc-langs">
              {Object.entries(LANG_META).map(([k, m]) => (
                <button key={k} className={`cc-lang-btn${language === k ? " active" : ""}`} onClick={() => switchLang(k)}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3-pane body */}
        <div className="cc-body">


          {/* CENTRE: Editor + I/O */}
          <div className="cc-centre">
            <div className="cc-editor-header">
              <span>⌨ Editor</span>
              <div
                className={`cc-focus-pill ${focusMode ? "on" : "off"}`}
                onClick={() => setFocusMode(f => !f)}
                title="Focus Mode: shows function signature above — write only the body"
              >
                <span className="cc-focus-dot" style={{ background: focusMode ? "#00ACC1" : "#334155" }} />
                {focusMode ? "Function Focus ON" : "Full File Mode"}
              </div>
            </div>

            {/* Signature bar in focus mode */}
            {focusMode && question.functionSignature?.[language] && (
              <div className="cc-sig-bar">
                <span style={{ color: "#1e3a52" }}>{"// signature → "}</span>
                <span style={{ color: "#38bdf8" }}>{question.functionSignature[language]}</span>
                <span style={{ color: "#1e3a52" }}>{" ← write your body below"}</span>
              </div>
            )}

            <div className="cc-editor-wrap">
              <Editor
                height="100%"
                width="100%"
                language={language}
                theme="light"
                value={code}
                onChange={v => setCode(v ?? "")}
                options={{
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: "on",
                  renderLineHighlight: "line",
                  padding: { top: 12 },
                  tabSize: 2,
                  wordWrap: "on",
                }}
              />
            </div>

            {/* I/O strip */}
            <div className="cc-io">
              <div className="cc-io-tabs">
                <button className={`cc-io-tab${ioTab === "input" ? " active" : ""}`} onClick={() => setIoTab("input")}>⌨ Custom Input</button>
                <button className={`cc-io-tab${ioTab === "output" ? " active" : ""}`} onClick={() => setIoTab("output")}>📤 Output</button>
                <button
    className="cc-show-tc-btn"
    onClick={() => setShowTestCases(prev => !prev)}
  >
    {showTestCases ? "Hide Test Cases" : "Show Test Cases"}
  </button>
              </div>
              <div className="cc-io-body">
                {ioTab === "input" && (
                  <textarea className="cc-io-ta" placeholder="Paste custom test input here to try your own cases…" value={customInput} onChange={e => setInput(e.target.value)} />
                )}
                {ioTab === "output" && (
                  <pre className={`cc-out ${output.type}`}>{output.text || "Run your code to see output here."}</pre>
                )}
              </div>
            </div>
          </div>

          {/* DIVIDER 2 — right resize (inverted) */}
          {showTestCases && (
          <div className={`cc-divider${rightDragging ? " active" : ""}`} 
          onMouseDown={rightDrag}
           />
            
)}
          {/* RIGHT: Test cases */}
          {showTestCases && (
          <div className="cc-right" style={{ width: rightW ,flexShrink :0  }}>
            <div className="cc-right-header">
              <span>🧪 Test Cases</span>
              {submitted && (
                <span style={{ color: tcResults.filter(r => r.status === "pass").length === question.testCases.length ? "#22c55e" : "#facc15" }}>
                  {tcResults.filter(r => r.status === "pass").length}/{question.testCases.length} passed
                </span>
              )}
            </div>
            <div className="cc-right-inner">
              {question.testCases
                ?.slice(0, submitted ? question.testCases.length : VISIBLE_TC)
                .map((tc, i) => {
                  const r = tcResults[i];
                  const status = r?.status ?? "idle";
                  return (
                    <div className="cc-tc" key={i}>
                     <div className="cc-tc-head">
  <span className="cc-tc-title">Test {i + 1}</span>

  <span className={`cc-tc-status ${status}`}>
    {status === "idle"
      ? "—"
      : status === "running"
      ? "⏳ Running"
      : status === "pass"
      ? "✓ Pass"
      : "✗ Fail"}
  </span>
</div>
                      <div className="cc-tc-body">
                        <div className="cc-tc-block">
                          <div className="cc-tc-lbl">Input</div>
                          <code className="cc-tc-val">{tc.input || "(none)"}</code>
                        </div>
                        <div className="cc-tc-block">
                          <div className="cc-tc-lbl">Expected</div>
                          <code className="cc-tc-val">{tc.expected}</code>
                        </div>
                        {r && (r.status === "pass" || r.status === "fail") && (
                          <div className="cc-tc-block">
                            <div className="cc-tc-lbl">Your Output</div>
                            <code className={`cc-tc-val ${r.status === "pass" ? "ok" : "bad"}`}>
                              {r.got || r.stderr || "(none)"}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
               
              {!submitted && question.testCases?.length > VISIBLE_TC && (
                <div className="cc-locked-box">
                  <strong>🔒 {question.testCases.length - VISIBLE_TC} hidden test cases</strong>
                  Submit to reveal all results.
                </div>
              )}
            </div>
          </div>
          )}
        </div>
          
        {/* Score bar */}
        {scoreInfo && (
          <div className="cc-score">
            <span className={`cc-score-num ${scoreColor}`}>
              {scoreInfo.passed === scoreInfo.total ? "🎉" : scoreInfo.passed === 0 ? "❌" : "⚡"}
              {" "}{scoreInfo.score}/{question.marks} pts
            </span>
            <div className="cc-prog">
              <div className="cc-prog-fill" style={{
                width: `${(scoreInfo.passed / scoreInfo.total) * 100}%`,
                background: scoreInfo.passed === scoreInfo.total ? "#22c55e" : scoreInfo.passed === 0 ? "#ef4444" : "#facc15",
              }} />
            </div>
            <span style={{ fontSize: 12, color: "#475569" }}>{scoreInfo.passed}/{scoreInfo.total} test cases</span>
          </div>
        )}

        {/* Action bar */}
        <div className="cc-actions">
          <div className="cc-keys">
            
          </div>
          <div className="cc-btns">
            <button className="cc-btn cc-btn-run" onClick={handleRun} disabled={loading}>
              {loading ? <span className="cc-spin" /> : "▶"} Run
            </button>
            <button className="cc-btn cc-btn-submit" onClick={handleSubmit} disabled={loading}>
              {loading ? <span className="cc-spin" /> : "✓"} Submit
            </button>
          </div>
        </div>

      </div>
    </>
  );
}