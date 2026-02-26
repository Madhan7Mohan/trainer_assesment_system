import React, { useState, useEffect, useCallback, useRef } from "react";
import Editor from "@monaco-editor/react";
import { executeCode } from "../utils/judge0";

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
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.cc-root {
  display: flex; flex-direction: column; height: 100vh;
  background: #080d16; color: #e2e8f0;
  font-family: 'Outfit', sans-serif; overflow: hidden;
}

/* Topbar */
.cc-topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 18px; height: 50px; flex-shrink: 0;
  background: #0c1525; border-bottom: 1px solid rgba(99,179,237,.1);
}
.cc-topbar-l { display: flex; align-items: center; gap: 10px; }
.cc-topbar-r { display: flex; align-items: center; gap: 8px; }
.cc-title { font-weight: 800; font-size: 14px; color: #e2e8f0; }
.cc-chip { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.cc-chip-easy   { background:rgba(34,197,94,.15);  color:#22c55e; border:1px solid rgba(34,197,94,.3); }
.cc-chip-medium { background:rgba(250,204,21,.15); color:#facc15; border:1px solid rgba(250,204,21,.3); }
.cc-chip-hard   { background:rgba(239,68,68,.15);  color:#ef4444; border:1px solid rgba(239,68,68,.3); }
.cc-chip-marks  { background:rgba(56,189,248,.1);  color:#38bdf8; border:1px solid rgba(56,189,248,.2); }

.cc-langs { display:flex; background:#111c30; border:1px solid rgba(99,179,237,.12); border-radius:8px; overflow:hidden; }
.cc-lang-btn {
  padding:5px 14px; border:none; background:transparent; cursor:pointer;
  font-family:'Outfit',sans-serif; font-size:12px; font-weight:600;
  color:#4b6080; transition:all .15s; display:flex; align-items:center; gap:5px;
}
.cc-lang-btn.active { background:rgba(0,172,193,.15); color:#00ACC1; }
.cc-lang-btn:hover:not(.active) { color:#94a3b8; }

/* 3-pane body */
.cc-body { display:flex; flex:1; overflow:hidden; position:relative; }

/* Drag divider */
.cc-divider {
  width:5px; flex-shrink:0; cursor:col-resize;
  background:rgba(99,179,237,.05); transition:background .15s; position:relative; z-index:10;
}
.cc-divider:hover, .cc-divider.active { background:rgba(0,172,193,.35); }
.cc-divider::after {
  content:''; position:absolute; top:50%; left:50%;
  transform:translate(-50%,-50%); width:2px; height:36px;
  border-radius:2px; background:rgba(99,179,237,.2);
}

/* Left: question */


/* Centre */
.cc-centre { display:flex; flex-direction:column; flex:1; min-width:200px; overflow:hidden; }

.cc-editor-header {
  display:flex; align-items:center; justify-content:space-between;
  padding:6px 14px; background:#0c1525; border-bottom:1px solid rgba(99,179,237,.08);
  font-size:11px; color:#334155; font-weight:600; letter-spacing:1px; text-transform:uppercase; flex-shrink:0;
}
.cc-focus-pill {
  display:flex; align-items:center; gap:6px; font-size:11px; font-weight:700;
  cursor:pointer; padding:3px 10px; border-radius:6px;
  transition:all .15s;
}
.cc-focus-pill.on  { color:#00ACC1; background:rgba(0,172,193,.1);  border:1px solid rgba(0,172,193,.2); }
.cc-focus-pill.off { color:#475569; background:rgba(71,85,105,.08); border:1px solid rgba(71,85,105,.15); }
.cc-focus-dot { width:7px; height:7px; border-radius:50%; }

.cc-sig-bar {
  padding:7px 14px; background:#070c14; font-family:'JetBrains Mono',monospace; font-size:12px;
  border-bottom:1px solid rgba(99,179,237,.06); flex-shrink:0; user-select:none;
}

.cc-editor-wrap { flex:1; overflow:hidden; }

/* I/O strip */
.cc-io { height:175px; flex-shrink:0; display:flex; flex-direction:column; border-top:1px solid rgba(99,179,237,.08); }
.cc-io-tabs { display:flex; background:#0a1120; border-bottom:1px solid rgba(99,179,237,.06); flex-shrink:0; }
.cc-io-tab {
  padding:7px 16px; font-size:11px; font-weight:700; letter-spacing:.5px; text-transform:uppercase;
  border:none; background:transparent; cursor:pointer; color:#334155;
  border-bottom:2px solid transparent; transition:all .15s;
}
.cc-io-tab.active { color:#00ACC1; border-bottom-color:#00ACC1; }
.cc-io-tab:hover:not(.active) { color:#64748b; }
.cc-io-body { flex:1; overflow:auto; padding:10px 14px; background:#080d16; }
.cc-io-ta {
  width:100%; height:100%; background:transparent; border:none;
  color:#e2e8f0; font-family:'JetBrains Mono',monospace; font-size:13px;
  resize:none; outline:none; line-height:1.6;
}
.cc-io-ta::placeholder { color:#1e293b; }
.cc-out { font-family:'JetBrains Mono',monospace; font-size:13px; white-space:pre-wrap; line-height:1.6; margin:0; }
.cc-out.ok   { color:#4ade80; }
.cc-out.err  { color:#f87171; }
.cc-out.idle { color:#334155; }

/* Right: test cases */
.cc-right {
  display:flex; flex-direction:column; overflow:hidden;
  background:#0a1120; border-left:1px solid rgba(99,179,237,.07); min-width:160px; max-width:45%;
}
.cc-right-header {
  display:flex; align-items:center; justify-content:space-between;
  padding:8px 12px; background:rgba(255,255,255,.01); border-bottom:1px solid rgba(99,179,237,.06);
  font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#334155; flex-shrink:0;
}
.cc-right-inner { flex:1; overflow-y:auto; padding:12px; }
.cc-right-inner::-webkit-scrollbar { width:4px; }
.cc-right-inner::-webkit-scrollbar-thumb { background:rgba(99,179,237,.15); border-radius:4px; }

.cc-tc { background:#111c2e; border:1px solid rgba(99,179,237,.1); border-radius:10px; overflow:hidden; margin-bottom:10px; }
.cc-tc-head {
  display:flex; align-items:center; justify-content:space-between;
  padding:7px 12px; background:rgba(255,255,255,.02); font-size:11px; font-weight:700; color:#475569;
}
.cc-tc-status { font-size:10px; font-weight:700; padding:2px 8px; border-radius:20px; }
.cc-tc-status.pass    { background:rgba(34,197,94,.15);  color:#22c55e; }
.cc-tc-status.fail    { background:rgba(239,68,68,.1);   color:#ef4444; }
.cc-tc-status.idle    { background:rgba(100,116,139,.1); color:#475569; }
.cc-tc-status.running { background:rgba(56,189,248,.1);  color:#38bdf8; }
.cc-tc-body { padding:10px 12px; display:flex; flex-direction:column; gap:7px; }
.cc-tc-lbl { font-size:10px; color:#334155; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-bottom:2px; }
.cc-tc-val {
  font-family:'JetBrains Mono',monospace; font-size:11px; color:#64748b;
  background:#080d16; padding:4px 8px; border-radius:5px; display:block;
  white-space:pre-wrap; word-break:break-all;
}
.cc-tc-val.ok  { color:#4ade80; }
.cc-tc-val.bad { color:#f87171; }

.cc-locked-box {
  text-align:center; padding:14px 10px;
  background:rgba(15,23,42,.6); border:1px dashed rgba(99,179,237,.12);
  border-radius:10px; font-size:12px; color:#334155; line-height:1.7;
}
.cc-locked-box strong { color:#3d5166; display:block; margin-bottom:3px; font-size:13px; }

/* Score bar */
.cc-score {
  display:flex; align-items:center; gap:14px; padding:10px 18px;
  background:#0c1525; border-top:1px solid rgba(99,179,237,.1);
  animation:slideUp .4s cubic-bezier(.16,1,.3,1); flex-shrink:0;
}
@keyframes slideUp { from{transform:translateY(14px);opacity:0} to{transform:none;opacity:1} }
.cc-score-num { font-size:20px; font-weight:800; }
.score-ok   { color:#22c55e; }
.score-part { color:#facc15; }
.score-fail { color:#ef4444; }
.cc-prog { flex:1; height:5px; background:#1e293b; border-radius:3px; overflow:hidden; }
.cc-prog-fill { height:100%; border-radius:3px; transition:width .6s ease; }

/* Action bar */
.cc-actions {
  display:flex; align-items:center; justify-content:space-between;
  padding:0 18px; height:50px; flex-shrink:0;
  background:#0c1525; border-top:1px solid rgba(99,179,237,.08);
}
.cc-keys { display:flex; gap:14px; font-size:11px; color:#1e293b; }
.cc-keys kbd {
  background:#1a2540; border:1px solid rgba(99,179,237,.15); border-radius:4px;
  padding:1px 5px; font-family:'JetBrains Mono',monospace; font-size:10px; color:#334155;
}
.cc-btns { display:flex; gap:10px; }
.cc-btn {
  padding:8px 20px; border:none; border-radius:8px;
  font-family:'Outfit',sans-serif; font-size:13px; font-weight:700;
  cursor:pointer; transition:all .15s; display:flex; align-items:center; gap:6px;
}
.cc-btn:disabled { opacity:.4; cursor:not-allowed; }
.cc-btn:not(:disabled):hover { transform:translateY(-1px); filter:brightness(1.1); }
.cc-btn-run    { background:#0e7490; color:#fff; }
.cc-btn-submit { background:#15803d; color:#fff; }
.cc-spin {
  width:13px; height:13px; border:2px solid rgba(255,255,255,.2);
  border-top-color:#fff; border-radius:50%;
  animation:spin .55s linear infinite; display:inline-block;
}
@keyframes spin { to{transform:rotate(360deg)} }
`;

const VISIBLE_TC = 2; // visible before submit

export default function CodeCompiler({ question, onScoreUpdate }) {
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
    setLoading(true); setIoTab("output");
    setOutput({ text: "Running…", type: "idle" });
    try {
      const res = await executeCode(code, langId(), customInput);
      setOutput(res.stderr
        ? { text: res.stderr, type: "err" }
        : { text: res.stdout || "(no output)", type: "ok" });
    } catch { setOutput({ text: "Execution failed.", type: "err" }); }
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
                language={language}
                theme="vs-dark"
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
          <div className={`cc-divider${rightDragging ? " active" : ""}`} onMouseDown={rightDrag} title="Drag to resize" />

          {/* RIGHT: Test cases */}
          <div className="cc-right" style={{ width: rightW, flexShrink: 0 }}>
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
                        <span>Test {i + 1}</span>
                        <span className={`cc-tc-status ${status}`}>
                          {status === "idle" ? "—" : status === "running" ? "⏳" : status === "pass" ? "✓ Pass" : "✗ Fail"}
                        </span>
                      </div>
                      <div className="cc-tc-body">
                        <div>
                          <div className="cc-tc-lbl">Input</div>
                          <code className="cc-tc-val">{tc.input || "(none)"}</code>
                        </div>
                        <div>
                          <div className="cc-tc-lbl">Expected</div>
                          <code className="cc-tc-val">{tc.expected}</code>
                        </div>
                        {r && (r.status === "pass" || r.status === "fail") && (
                          <div>
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
            <span><kbd>Ctrl</kbd>+<kbd>Enter</kbd> Run</span>
            <span><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Enter</kbd> Submit</span>
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