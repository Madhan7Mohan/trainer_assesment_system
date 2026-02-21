import React, { useState, useEffect } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;}

  .mcq-root{background:linear-gradient(135deg,#1e293b,#0f172a);min-height:100%;padding:24px;border-radius:14px;color:#fff;font-family:'DM Mono',monospace;animation:fsl .35s ease;}
  @keyframes fsl{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}

  .mcq-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:8px;}
  .mcq-tag{display:inline-flex;align-items:center;gap:5px;background:rgba(0,172,193,.15);border:1px solid rgba(0,172,193,.3);border-radius:20px;padding:3px 11px;font-size:10px;font-weight:500;color:#00ACC1;letter-spacing:1px;text-transform:uppercase;}
  .mcq-badges{display:flex;gap:7px;flex-wrap:wrap;}
  .badge{border-radius:20px;padding:3px 11px;font-size:11px;font-weight:600;font-family:'DM Mono',monospace;}
  .b-marks{background:#38bdf8;color:#000;}
  .b-timer{background:#f97316;color:#000;}
  .b-prog{background:#a78bfa;color:#000;}

  .mcq-q{font-family:'Syne',sans-serif;font-size:17px;font-weight:700;color:#f1f5f9;line-height:1.55;margin-bottom:24px;}

  .mcq-opts{display:flex;flex-direction:column;gap:10px;margin-bottom:22px;}
  .mcq-opt{display:flex;align-items:center;gap:13px;padding:12px 16px;border:1.5px solid rgba(148,163,184,.15);border-radius:11px;cursor:pointer;transition:all .18s;background:rgba(30,41,59,.5);font-size:13px;color:#e2e8f0;user-select:none;}
  .mcq-opt:hover:not(.locked){border-color:rgba(0,172,193,.4);background:rgba(0,172,193,.05);}
  .mcq-opt.chosen:not(.submitted){border-color:#00ACC1;background:rgba(0,172,193,.12);color:#fff;}
  .mcq-opt.correct{border-color:#22c55e;background:rgba(34,197,94,.1);color:#86efac;}
  .mcq-opt.wrong{border-color:#ef4444;background:rgba(239,68,68,.08);color:#fca5a5;}
  .mcq-opt.locked{cursor:default;}

  .opt-ltr{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;background:rgba(148,163,184,.1);color:#94a3b8;flex-shrink:0;transition:all .18s;font-family:'Syne',sans-serif;}
  .mcq-opt.chosen:not(.submitted) .opt-ltr{background:#00ACC1;color:#fff;}
  .mcq-opt.correct .opt-ltr{background:#22c55e;color:#fff;}
  .mcq-opt.wrong .opt-ltr{background:#ef4444;color:#fff;}

  .mcq-fb{padding:12px 16px;border-radius:9px;font-size:13px;font-weight:600;margin-bottom:18px;display:flex;align-items:flex-start;gap:8px;line-height:1.4;}
  .fb-ok{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.25);color:#86efac;}
  .fb-no{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);color:#fca5a5;}

  .mcq-actions{display:flex;justify-content:space-between;align-items:center;}
  .mcq-btn{padding:9px 20px;border-radius:8px;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;cursor:pointer;border:none;transition:all .18s;}
  .btn-outline{background:transparent;border:1.5px solid rgba(0,172,193,.4);color:#00ACC1;}
  .btn-outline:hover:not(:disabled){background:rgba(0,172,193,.08);}
  .btn-primary{background:linear-gradient(135deg,#00ACC1,#0891b2);color:#fff;box-shadow:0 4px 12px rgba(0,172,193,.22);}
  .btn-primary:hover:not(:disabled){transform:translateY(-1px);}
  .btn-submit{background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;box-shadow:0 4px 12px rgba(34,197,94,.18);}
  .btn-final{background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;box-shadow:0 4px 14px rgba(34,197,94,.28);font-size:14px;padding:9px 22px;}
  .btn-final:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(34,197,94,.4);}
  .mcq-btn:disabled{opacity:.35;cursor:not-allowed;}
`;

const LETTERS = ["A","B","C","D"];

/**
 * MCQCard
 * Props:
 *   question, currentIndex, setCurrentIndex, total, timeLeft
 *   onAnswer        — (id, selected, isCorrect) => void
 *   savedAnswer     — previously selected option string (if any)
 *   isLast          — true when this is the final question
 *   onFinalSubmit   — called when "Final Submit" is clicked (null in practice mode)
 */
export default function MCQCard({
  question, currentIndex, setCurrentIndex, total,
  timeLeft, onAnswer, savedAnswer,
  isLast, onFinalSubmit,
}) {
  const [selected,  setSelected]  = useState(savedAnswer || null);
  const [submitted, setSubmitted] = useState(!!savedAnswer);

  useEffect(() => {
    setSelected(savedAnswer || null);
    setSubmitted(!!savedAnswer);
  }, [question.id, savedAnswer]);

  const handleSubmitAnswer = () => {
    if (!selected || submitted) return;
    setSubmitted(true);
    onAnswer(question.id, selected, selected === question.answer);
  };

  const isCorrect = submitted && selected === question.answer;

  return (
    <>
      <style>{css}</style>
      <div className="mcq-root">
        {/* Header */}
        <div className="mcq-head">
          <span className="mcq-tag">🧠 MCQ</span>
          <div className="mcq-badges">
            <span className="badge b-marks">{question.marks} Marks</span>
            {timeLeft !== undefined && <span className="badge b-timer">⏱ {timeLeft}s</span>}
            <span className="badge b-prog">{currentIndex + 1} / {total}</span>
          </div>
        </div>

        {/* Question */}
        <div className="mcq-q">{question.question}</div>

        {/* Options */}
        <div className="mcq-opts">
          {question.options.map((opt, i) => {
            let cls = "mcq-opt";
            if (submitted) {
              cls += " locked";
              if (opt === question.answer) cls += " correct";
              else if (opt === selected)  cls += " wrong";
            } else if (opt === selected) cls += " chosen";

            return (
              <div key={opt} className={cls} onClick={() => !submitted && setSelected(opt)}>
                <span className="opt-ltr">{LETTERS[i]}</span>
                <span>{opt}</span>
              </div>
            );
          })}
        </div>

        {/* Feedback after submitting answer */}
        {submitted && (
          <div className={`mcq-fb ${isCorrect ? "fb-ok" : "fb-no"}`}>
            {isCorrect
              ? "✅ Correct!"
              : <>❌ Incorrect — correct answer: <strong>{question.answer}</strong></>}
          </div>
        )}

        {/* Navigation */}
        <div className="mcq-actions">

          {/* Previous — always visible, disabled on Q1 */}
          <button
            className="mcq-btn btn-outline"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(p => p - 1)}
          >
            ← Prev
          </button>

          <div style={{ display: "flex", gap: 8 }}>
            {/* Submit Answer button — visible until the MCQ is answered */}
            {!submitted && (
              <button className="mcq-btn btn-submit" disabled={!selected} onClick={handleSubmitAnswer}>
                Submit Answer
              </button>
            )}

            {/* Right nav: Next OR Final Submit */}
            {isLast ? (
              // Last question in test mode only
              onFinalSubmit ? (
                <button className="mcq-btn btn-final" onClick={onFinalSubmit}>
                  Final Submit ✓
                </button>
              ) : null  // practice mode — nothing on right
            ) : (
              // Not last — Next button
              <button className="mcq-btn btn-primary" onClick={() => setCurrentIndex(p => p + 1)}>
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}