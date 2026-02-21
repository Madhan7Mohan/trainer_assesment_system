import React, { useState, useEffect, useCallback } from "react";
import QuestionCard from "./QuestionCard";
import CodeCompiler from "./CodeCompiler";
import MCQCard from "./MCQCard";

// ── helpers ──────────────────────────────────────────────────────────────────
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const buildTestBank = (codingQs, mcqQs) => {
  const coding = shuffle(codingQs).slice(0, 6);
  const mcq    = shuffle(mcqQs).slice(0, 4);
  return shuffle([...coding, ...mcq]);
};

const fmt = (sec) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h > 0 ? h + ":" : ""}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// ── styles ────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;}

  .al-root{display:flex;height:100vh;background:#060a14;font-family:'DM Mono',monospace;overflow:hidden;}

  /* ── left panel ── */
  .al-left{width:42%;min-width:360px;display:flex;flex-direction:column;border-right:1px solid rgba(0,172,193,.12);overflow:hidden;}

  .al-topbar{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;background:#080e1c;border-bottom:1px solid rgba(0,172,193,.1);flex-shrink:0;gap:8px;flex-wrap:wrap;}
  .tb-brand{font-family:'Syne',sans-serif;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#00ACC1;}

  .tb-timer{display:flex;align-items:center;gap:6px;background:rgba(249,115,22,.12);border:1px solid rgba(249,115,22,.25);border-radius:20px;padding:5px 14px;font-size:13px;font-weight:600;color:#f97316;font-family:'DM Mono',monospace;transition:all .3s;}
  .tb-timer.urgent{background:rgba(239,68,68,.15);border-color:rgba(239,68,68,.4);color:#ef4444;animation:tpulse 1s infinite;}
  @keyframes tpulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4);}50%{box-shadow:0 0 0 4px rgba(239,68,68,0);}}

  .tb-badge{display:flex;align-items:center;gap:5px;font-size:10px;padding:4px 11px;border-radius:20px;font-family:'DM Mono',monospace;font-weight:500;}
  .tb-badge.practice{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.25);color:#22c55e;}
  .tb-badge.test{background:rgba(0,172,193,.1);border:1px solid rgba(0,172,193,.25);color:#00ACC1;}

  /* question navigator */
  .q-nav{display:flex;gap:5px;padding:10px 14px;background:#080e1c;border-bottom:1px solid rgba(0,172,193,.08);overflow-x:auto;flex-shrink:0;scrollbar-width:thin;scrollbar-color:rgba(0,172,193,.3) transparent;}
  .q-btn{flex-shrink:0;width:28px;height:28px;border-radius:7px;font-size:10px;font-weight:700;border:1.5px solid rgba(148,163,184,.15);background:rgba(30,41,59,.6);color:#64748b;cursor:pointer;transition:all .15s;font-family:'DM Mono',monospace;}
  .q-btn:hover{border-color:rgba(0,172,193,.4);color:#00ACC1;}
  .q-btn.active{border-color:#00ACC1;background:rgba(0,172,193,.15);color:#00ACC1;}
  .q-btn.done-code{border-color:rgba(34,197,94,.5);background:rgba(34,197,94,.08);color:#22c55e;}
  .q-btn.done-mcq{border-color:rgba(167,139,250,.5);background:rgba(167,139,250,.08);color:#a78bfa;}
  .q-btn.is-mcq{border-style:dashed;}

  /* scroll area */
  .al-qscroll{flex:1;overflow-y:auto;padding:14px;scrollbar-width:thin;scrollbar-color:rgba(0,172,193,.2) transparent;}

  /* no bottom bar needed — navigation is inside each card */

  /* right panel */
  .al-right{flex:1;overflow-y:auto;scrollbar-width:thin;scrollbar-color:rgba(0,172,193,.2) transparent;}

  /* MCQ placeholder */
  .al-mcq-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#334155;font-size:13px;text-align:center;gap:12px;padding:40px;}
  .al-mcq-placeholder .icon{font-size:52px;}

  /* Legend */
  .al-legend{display:flex;gap:12px;padding:8px 14px;background:#080e1c;border-bottom:1px solid rgba(0,172,193,.06);flex-shrink:0;flex-wrap:wrap;}
  .leg-item{display:flex;align-items:center;gap:5px;font-size:10px;color:#64748b;}
  .leg-dot{width:8px;height:8px;border-radius:2px;}
`;

// ── Component ─────────────────────────────────────────────────────────────────
export default function AssessmentLayout({
  trainer,
  codingQuestions,
  mcqQuestions,
  submitExam,
  onExitPractice,
}) {
  const isTest    = trainer.mode === "test";
  const TEST_SECS = 80 * 60;

  const [questions] = useState(() =>
    isTest ? buildTestBank(codingQuestions, mcqQuestions) : codingQuestions
  );

  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [timeLeft,      setTimeLeft]       = useState(TEST_SECS);
  const [codingScores,  setCodingScores]   = useState({});   // { id: score }
  const [mcqAnswers,    setMcqAnswers]     = useState({});   // { id: { selected, isCorrect } }

  // ── auto-submit when timer hits 0 ────────────────────────────────────────
  const doSubmit = useCallback(() => {
    if (!isTest) return;
    const codingQs    = questions.filter(q => q.type === "coding");
    const mcqQs       = questions.filter(q => q.type === "mcq");
    const codingScore = Object.values(codingScores).reduce((a, b) => a + b, 0);
    const mcqCorrect  = Object.values(mcqAnswers).filter(a => a.isCorrect).length;
    const mcqScore    = mcqCorrect * 2;
    const codingPassed= codingQs.filter(q => (codingScores[q.id] || 0) > 0).length;
    const totalMarks  = codingQs.reduce((a, q) => a + q.marks, 0) + mcqQs.length * 2;

    submitExam({
      codingScore, mcqScore,
      codingPassed, mcqCorrect,
      totalCoding: codingQs.length,
      totalMCQ:    mcqQs.length,
      totalMarks,
    });
  }, [isTest, questions, codingScores, mcqAnswers, submitExam]);

  useEffect(() => {
    if (!isTest) return;
    if (timeLeft <= 0) { doSubmit(); return; }
    const id = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { clearInterval(id); doSubmit(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isTest, doSubmit]);

  // ── score callbacks ───────────────────────────────────────────────────────
  const handleCodingScore = (qId, score) =>
    setCodingScores(p => ({ ...p, [qId]: score }));

  const handleMCQAnswer = (qId, selected, isCorrect) =>
    setMcqAnswers(p => ({ ...p, [qId]: { selected, isCorrect } }));

  // ── helpers ───────────────────────────────────────────────────────────────
  const isAnswered = (q) =>
    q.type === "mcq" ? !!mcqAnswers[q.id] : codingScores[q.id] !== undefined;

  const currentQ = questions[currentIndex];

  return (
    <>
      <style>{css}</style>
      <div className="al-root">

        {/* ── LEFT PANEL ── */}
        <div className="al-left">

          {/* Top bar */}
          <div className="al-topbar">
            <span className="tb-brand">CodeArena</span>

            {isTest ? (
              <span className={`tb-timer${timeLeft < 300 ? " urgent" : ""}`}>
                ⏱ {fmt(timeLeft)}
              </span>
            ) : (
              <span className="tb-badge practice">📚 Practice</span>
            )}

            {isTest && <span className="tb-badge test">🎯 Test · {trainer.name}</span>}
          </div>

          {/* Legend */}
          <div className="al-legend">
            <span className="leg-item"><span className="leg-dot" style={{ background: "rgba(0,172,193,.6)" }} />Current</span>
            <span className="leg-item"><span className="leg-dot" style={{ background: "rgba(34,197,94,.6)" }} />Coding done</span>
            {isTest && <span className="leg-item"><span className="leg-dot" style={{ background: "rgba(167,139,250,.6)", borderRadius: "50%" }} />MCQ done</span>}
            {isTest && <span className="leg-item"><span className="leg-dot" style={{ background: "transparent", border: "1.5px dashed #64748b" }} />MCQ type</span>}
          </div>

          {/* Question navigator */}
          <div className="q-nav">
            {questions.map((q, i) => {
              let cls = "q-btn";
              if (q.type === "mcq") cls += " is-mcq";
              if (i === currentIndex) cls += " active";
              else if (isAnswered(q)) cls += q.type === "mcq" ? " done-mcq" : " done-code";
              return (
                <button key={q.id} className={cls} onClick={() => setCurrentIndex(i)}>
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Question content */}
          <div className="al-qscroll">
            {currentQ.type === "mcq" ? (
              <MCQCard
                question={currentQ}
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
                total={questions.length}
                timeLeft={isTest ? timeLeft : undefined}
                onAnswer={handleMCQAnswer}
                savedAnswer={mcqAnswers[currentQ.id]?.selected}
                isLast={currentIndex === questions.length - 1}
                onFinalSubmit={isTest ? doSubmit : null}
              />
            ) : (
              <QuestionCard
                question={currentQ}
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
                total={questions.length}
                timeLeft={isTest ? timeLeft : undefined}
                isLast={currentIndex === questions.length - 1}
                onFinalSubmit={isTest ? doSubmit : null}
              />
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="al-right">
          {currentQ.type === "mcq" ? (
            <div className="al-mcq-placeholder">
              <div className="icon">🧠</div>
              <div>This is an MCQ question.<br />Answer it in the panel on the left.</div>
            </div>
          ) : (
            <CodeCompiler
              question={currentQ}
              onScoreUpdate={(score) => handleCodingScore(currentQ.id, score)}
            />
          )}
        </div>

      </div>
    </>
  );
}