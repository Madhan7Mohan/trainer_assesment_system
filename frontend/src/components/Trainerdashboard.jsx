import React, { useState, useEffect, useCallback } from "react";
import AttemptBlockModal from "./AttemptBlock";
import EditProfile from "./EditProfile";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { background:#060a14; }
  .td-root { min-height:100vh; background:#060a14; font-family:'DM Mono',monospace; }
  .td-grid { position:fixed; inset:0; background-image:linear-gradient(rgba(0,172,193,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,172,193,.03) 1px,transparent 1px); background-size:40px 40px; pointer-events:none; z-index:0; }
  .td-nav { position:sticky; top:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:14px 32px; background:rgba(6,10,20,.95); border-bottom:1px solid rgba(0,172,193,.1); backdrop-filter:blur(10px); flex-wrap:wrap; gap:10px; }
  .td-nav-brand { display:flex; align-items:center; gap:10px; }
  .td-dot { width:8px; height:8px; border-radius:50%; background:#00ACC1; box-shadow:0 0 10px #00ACC1; animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(.8);} }
  .td-brand-text { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#00ACC1; letter-spacing:1px; }
  .td-brand-role { font-size:10px; color:#475569; margin-left:4px; }
  .td-nav-right { display:flex; align-items:center; gap:16px; }
  .td-nav-greeting { font-size:11px; color:#64748b; }
  .td-nav-greeting span { color:#00ACC1; }
  .td-time { font-size:11px; color:#334155; display:flex; align-items:center; gap:5px; }
  .td-time-dot { width:5px; height:5px; border-radius:50%; background:#22c55e; animation:pulse 1.5s infinite; }
  .td-logout { padding:6px 14px; background:transparent; border:1px solid rgba(239,68,68,.3); border-radius:8px; font-family:'DM Mono',monospace; font-size:11px; color:#ef4444; cursor:pointer; transition:all .2s; }
  .td-logout:hover { background:rgba(239,68,68,.08); border-color:rgba(239,68,68,.5); }
  .td-body { position:relative; z-index:1; max-width:1200px; margin:0 auto; padding:32px 24px 80px; }
  .td-tabs { display:flex; gap:6px; margin-bottom:32px; background:rgba(15,23,42,.6); border:1px solid rgba(148,163,184,.08); border-radius:14px; padding:6px; flex-wrap:wrap; }
  .td-tab { padding:10px 20px; border:none; border-radius:10px; font-family:'Syne',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:all .2s; background:transparent; color:#475569; display:flex; align-items:center; gap:7px; }
  .td-tab.active { background:rgba(0,172,193,.15); color:#00ACC1; box-shadow:0 0 0 1px rgba(0,172,193,.25); }
  .td-tab:not(.active):hover { color:#94a3b8; background:rgba(148,163,184,.06); }
  .td-section-title { font-family:'Syne',sans-serif; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#475569; margin-bottom:20px; display:flex; align-items:center; gap:10px; }
  .td-section-title::after { content:''; flex:1; height:1px; background:rgba(148,163,184,.08); }
  .news-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:16px; }
  .news-card { background:rgba(15,23,42,.8); border:1px solid rgba(148,163,184,.08); border-radius:14px; padding:18px 20px; transition:all .25s; cursor:pointer; text-decoration:none; display:block; }
  .news-card:hover { border-color:rgba(0,172,193,.3); transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,172,193,.08); }
  .news-card-meta { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
  .news-card-source { font-size:10px; color:#00ACC1; font-weight:600; letter-spacing:1px; text-transform:uppercase; }
  .news-card-pts { font-size:10px; color:#475569; }
  .news-card-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#e2e8f0; line-height:1.5; margin-bottom:10px; }
  .news-card-url { font-size:10px; color:#334155; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .news-loading { display:flex; align-items:center; gap:10px; color:#475569; font-size:13px; padding:40px 0; }
  .news-spinner { width:18px; height:18px; border:2px solid rgba(0,172,193,.2); border-top-color:#00ACC1; border-radius:50%; animation:spin .8s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg);} }
  .news-refresh { padding:8px 18px; background:transparent; border:1px solid rgba(0,172,193,.3); border-radius:8px; font-family:'DM Mono',monospace; font-size:11px; color:#00ACC1; cursor:pointer; transition:all .2s; margin-bottom:20px; }
  .news-refresh:hover { background:rgba(0,172,193,.08); }
  .mode-cards { display:grid; grid-template-columns:1fr 1fr; gap:20px; max-width:700px; }
  @media(max-width:580px){.mode-cards{grid-template-columns:1fr;}}
  .mode-card { background:rgba(15,23,42,.8); border:1.5px solid rgba(148,163,184,.1); border-radius:20px; padding:28px 24px; cursor:pointer; transition:all .25s; }
  .mode-card.practice:hover { border-color:rgba(34,197,94,.4); box-shadow:0 12px 40px rgba(34,197,94,.1); transform:translateY(-3px); }
  .mode-card.test:hover     { border-color:rgba(0,172,193,.4);  box-shadow:0 12px 40px rgba(0,172,193,.1);  transform:translateY(-3px); }
  .mode-icon  { font-size:36px; margin-bottom:14px; }
  .mode-title { font-family:'Syne',sans-serif; font-size:20px; font-weight:800; color:#f1f5f9; margin-bottom:8px; }
  .mode-desc  { font-size:12px; color:#64748b; line-height:1.7; margin-bottom:18px; }
  .mode-btn { width:100%; padding:11px; border:none; border-radius:10px; font-family:'Syne',sans-serif; font-size:13px; font-weight:700; color:#fff; cursor:pointer; transition:all .2s; }
  .btn-p { background:linear-gradient(135deg,#22c55e,#16a34a); }
  .btn-t { background:linear-gradient(135deg,#00ACC1,#0891b2); }
  .mode-btn:hover { filter:brightness(1.1); }
  .act-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
  .act-card { background:rgba(15,23,42,.8); border:1px solid rgba(148,163,184,.08); border-radius:14px; padding:20px; transition:border-color .2s; }
  .act-card:hover { border-color:rgba(167,139,250,.3); }
  .act-card-icon { font-size:32px; margin-bottom:12px; }
  .act-card-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; color:#e2e8f0; margin-bottom:8px; }
  .act-card-desc  { font-size:12px; color:#64748b; line-height:1.6; margin-bottom:16px; }
  .act-tag { display:inline-block; padding:3px 10px; border-radius:20px; font-size:10px; font-weight:600; background:rgba(167,139,250,.1); border:1px solid rgba(167,139,250,.25); color:#a78bfa; margin-right:6px; }
  .act-expand { margin-top:14px; padding:10px 0; }
  .act-puzzle { background:rgba(6,10,20,.6); border:1px solid rgba(0,172,193,.15); border-radius:10px; padding:16px; margin-top:10px; }
  .act-puzzle-q { font-size:13px; color:#cbd5e1; margin-bottom:12px; line-height:1.6; }
  .act-puzzle-code { background:#0a0f1a; border-radius:8px; padding:12px; font-size:12px; color:#00ACC1; font-family:'DM Mono',monospace; margin-bottom:12px; white-space:pre; overflow-x:auto; }
  .act-reveal-btn { padding:8px 16px; background:rgba(0,172,193,.1); border:1px solid rgba(0,172,193,.25); border-radius:8px; font-family:'DM Mono',monospace; font-size:11px; color:#00ACC1; cursor:pointer; transition:all .2s; }
  .act-reveal-btn:hover { background:rgba(0,172,193,.2); }
  .act-answer { margin-top:10px; padding:10px 14px; background:rgba(34,197,94,.08); border:1px solid rgba(34,197,94,.2); border-radius:8px; font-size:12px; color:#86efac; }
  .quiz-wrap { max-width:620px; }
  .quiz-q-box { background:rgba(15,23,42,.8); border:1px solid rgba(0,172,193,.15); border-radius:14px; padding:24px; margin-bottom:20px; }
  .quiz-q-num  { font-size:10px; color:#475569; letter-spacing:1px; text-transform:uppercase; margin-bottom:10px; }
  .quiz-q-text { font-size:14px; color:#e2e8f0; line-height:1.7; }
  .quiz-opts { display:flex; flex-direction:column; gap:10px; margin-bottom:20px; }
  .quiz-opt { padding:12px 16px; background:rgba(15,23,42,.8); border:1.5px solid rgba(148,163,184,.1); border-radius:10px; font-size:13px; color:#cbd5e1; cursor:pointer; transition:all .2s; display:flex; align-items:center; gap:10px; }
  .quiz-opt:hover:not(.locked) { border-color:rgba(0,172,193,.4); color:#e2e8f0; }
  .quiz-opt.selected { border-color:#00ACC1; background:rgba(0,172,193,.1); color:#fff; }
  .quiz-opt.correct  { border-color:#22c55e; background:rgba(34,197,94,.1); color:#86efac; }
  .quiz-opt.wrong    { border-color:#ef4444; background:rgba(239,68,68,.08); color:#fca5a5; }
  .quiz-opt.locked   { cursor:default; }
  .quiz-opt-letter { width:24px; height:24px; border-radius:50%; background:rgba(0,172,193,.15); color:#00ACC1; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; flex-shrink:0; }
  .quiz-result { padding:14px 18px; border-radius:10px; font-size:13px; margin-bottom:16px; }
  .quiz-result.correct  { background:rgba(34,197,94,.1);  border:1px solid rgba(34,197,94,.25);  color:#86efac; }
  .quiz-result.wrong    { background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.25); color:#fca5a5; }
  .quiz-next { padding:10px 22px; background:linear-gradient(135deg,#00ACC1,#0891b2); border:none; border-radius:10px; font-family:'Syne',sans-serif; font-size:13px; font-weight:700; color:#fff; cursor:pointer; }
  .quiz-score { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; color:#00ACC1; margin-bottom:6px; }
`;

async function fetchHNStories() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch("https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=18", { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.hits || []).map(h => ({
      id: h.objectID, title: h.title, url: h.url || null,
      score: h.points || 0, descendants: h.num_comments || 0,
    }));
  } finally { clearTimeout(timeout); }
}

function getHostname(url) {
  if (!url) return null;
  try { return new URL(url).hostname.replace("www.", ""); } catch { return null; }
}

const ACTIVITIES = [
  { icon:"🧩", title:"Code Golf Challenge", tag:"Fun", desc:"Solve the problem in the fewest characters possible.",
    puzzle:{ q:"Print numbers 1 to 100. FizzBuzz for multiples of 3/5. Can you do it in under 80 chars in Python?",
      code:`for i in range(1,101):\n    if i%15==0: print("FizzBuzz")\n    elif i%3==0: print("Fizz")\n    elif i%5==0: print("Buzz")\n    else: print(i)`,
      answer:`[print("FizzBuzz"if i%15==0 else"Fizz"if i%3==0 else"Buzz"if i%5==0 else i)for i in range(1,101)]` }},
  { icon:"🔍", title:"Debug The Bug", tag:"Challenge", desc:"Find and fix the bug in the snippet below.",
    puzzle:{ q:"Why does this Python function always return None?",
      code:`def find_max(arr):\n    max_val = arr[0]\n    for x in arr:\n        if x > max_val:\n            max_val = x\n\nresult = find_max([3, 1, 7, 2])\nprint(result)  # Prints: None`,
      answer:"The function is missing a return statement! Add 'return max_val' before the function ends." }},
  { icon:"🎯", title:"Reverse Engineering", tag:"Logic", desc:"Look at the output and figure out what the code does.",
    puzzle:{ q:"Given these input→output pairs, what is this mystery function doing?\n1→1, 2→4, 3→9, 4→16",
      code:`def mystery(n):\n    return ???`,
      answer:"It returns n squared (n**2). The function computes the square of the input!" }},
  { icon:"⚡", title:"One-Liner Challenge", tag:"Python", desc:"Convert this multi-line code into a single Python expression.",
    puzzle:{ q:"Rewrite this in one line using list comprehension:",
      code:`result = []\nfor x in range(10):\n    if x % 2 == 0:\n        result.append(x ** 2)\nprint(result)`,
      answer:"result = [x**2 for x in range(10) if x%2==0]\nprint(result)  # [0, 4, 16, 36, 64]" }},
  { icon:"🏆", title:"Time Complexity Race", tag:"DSA", desc:"Two solutions, same result. Which is faster?",
    puzzle:{ q:"Both check if a number exists. Which is O(n) and which is O(1)?",
      code:`# A: target in list_var   # B: target in set(list_var)`,
      answer:"A is O(n). B's set() conversion is O(n) once, but lookup is O(1) average." }},
  { icon:"🌀", title:"Recursion Unwind", tag:"Hard", desc:"Trace through this recursive function manually.",
    puzzle:{ q:"What does mystery(5) return?",
      code:`def mystery(n):\n    if n <= 0: return 0\n    return n + mystery(n - 2)`,
      answer:"mystery(5)=5+mystery(3)=5+3+mystery(1)=5+3+1+mystery(-1)=9" }},
];

const QUIZ_QUESTIONS = [
  { q:"What is the time complexity of binary search?", opts:["O(n)","O(log n)","O(n²)","O(1)"], ans:1 },
  { q:"Which data structure uses LIFO order?", opts:["Queue","Stack","Heap","Tree"], ans:1 },
  { q:"What keyword defines a function in Python?", opts:["function","define","def","fun"], ans:2 },
  { q:"What does SQL JOIN do?", opts:["Delete rows","Combine rows from two tables","Sort results","Add a column"], ans:1 },
  { q:"What is the output of: print(type([]))?", opts:["<class 'list'>","list","[]","<list>"], ans:0 },
  { q:"Which sort has worst-case O(n log n)?", opts:["Bubble Sort","Quick Sort","Merge Sort","Selection Sort"], ans:2 },
  { q:"What is a foreign key?", opts:["Primary ID","Key from another table","Encrypted field","Index"], ans:1 },
  { q:"What does 'git stash' do?", opts:["Deletes changes","Temporarily saves uncommitted changes","Commits changes","Pushes to remote"], ans:1 },
  { q:"What is encapsulation in OOP?", opts:["Inheriting methods","Hiding internal state","Creating objects","Overriding methods"], ans:1 },
  { q:"What does REST stand for?", opts:["Remote Execution State Transfer","Representational State Transfer","Runtime External State Tool","None"], ans:1 },
];

const LETTERS = ["A","B","C","D"];

function LiveTime() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <span className="td-time">
      <span className="td-time-dot" />
      {t.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit" })}
    </span>
  );
}

export default function TrainerDashboard({ profile, onModeSelect, onSignOut, attemptBlock }) {
  const [tab, setTab] = useState("news");
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState("");
  const [openAct, setOpenAct] = useState(null);
  const [revealed, setRevealed] = useState({});
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [quizCount, setQuizCount] = useState(0);
  const [showBlock, setShowBlock] = useState(false);

  const firstName = profile?.name?.split(" ")[0] || "Trainer";
  const greeting  = (() => { const h=new Date().getHours(); return h<12?"Good morning":h<17?"Good afternoon":"Good evening"; })();
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => { if (attemptBlock) setShowBlock(true); }, [attemptBlock]);

  const loadNews = useCallback(async () => {
    setNewsLoading(true); setNewsError("");
    try {
      const stories = await fetchHNStories();
      if (stories.length === 0) setNewsError("No stories returned. Try refreshing.");
      else setNews(stories);
    } catch (err) {
      setNewsError(err.name === "AbortError" ? "Request timed out." : `Failed to load news: ${err.message}.`);
    }
    setNewsLoading(false);
  }, []);

  useEffect(() => { if (tab === "news") loadNews(); }, [tab, loadNews]);

  const shuffledQuestions = React.useMemo(() => {
    return [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
  }, [quizCount]);

  const currentQ = shuffledQuestions[qIdx];
  const handleSelect = (i) => {
    if (answered) return;
    setSelected(i); setAnswered(true);
    if (i === currentQ.ans) setQuizScore(s => s + 1);
  };
  const handleNext = () => {
    if (qIdx + 1 >= shuffledQuestions.length) setQuizDone(true);
    else { setQIdx(q => q + 1); setSelected(null); setAnswered(false); }
  };
  const restartQuiz = () => {
    setQIdx(0); setSelected(null); setAnswered(false);
    setQuizScore(0); setQuizDone(false); setQuizCount(c => c + 1);
  };
  const optClass = (i) => {
    let c = "quiz-opt";
    if (!answered) return c;
    c += " locked";
    if (i === currentQ.ans) return c + " correct";
    if (i === selected && i !== currentQ.ans) return c + " wrong";
    return c;
  };

  if (showEdit) {
    return (
      <EditProfile
        profile={profile}
        onBack={() => setShowEdit(false)}
        onProfileUpdated={(updated) => {
          if (onProfileUpdated) onProfileUpdated(updated);
          setShowEdit(false);
        }}
      />
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="td-root">
        <div className="td-grid" />

        {showBlock && attemptBlock && (
          <AttemptBlockModal attemptBlock={attemptBlock} onClose={() => setShowBlock(false)} />
        )}

        <nav className="td-nav">
          <div className="td-nav-brand">
            <div className="td-dot" />
            <div>
              <span className="td-brand-text">ThopsTech · Trainer Portal</span>
              <span className="td-brand-role"> — {profile?.employee_id || "Trainer"}</span>
            </div>
          </div>
          <div className="td-nav-right">
            <LiveTime />
            <span className="td-nav-greeting">{greeting}, <span>{firstName}</span></span>
            <button
              onClick={() => setShowEdit(true)}
              style={{ padding:"6px 14px", background:"transparent", border:"1px solid rgba(0,172,193,.3)", borderRadius:"8px", fontFamily:"'DM Mono',monospace", fontSize:"11px", color:"#00ACC1", cursor:"pointer", transition:"all .2s" }}
            >✏️ Edit Profile</button>
            <button className="td-logout" onClick={onSignOut}>Sign Out</button>
          </div>
        </nav>

        <div className="td-body">
          <div className="td-tabs">
            {[
              { key:"news",       label:"📰 Tech News"       },
              { key:"practice",   label:"📚 Practice & Test" },
              { key:"activities", label:"🎮 Fun Activities"   },
              { key:"quiz",       label:"🧠 Quick Quiz"       },
            ].map(t => (
              <button key={t.key} className={`td-tab${tab===t.key?" active":""}`} onClick={() => setTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "news" && (
            <div>
              <div className="td-section-title">Live Tech News · HackerNews Top Stories</div>
              <button className="news-refresh" onClick={loadNews} disabled={newsLoading}>
                {newsLoading ? "Loading..." : "↻ Refresh"}
              </button>
              {newsLoading ? (
                <div className="news-loading"><div className="news-spinner" /> Fetching latest stories...</div>
              ) : newsError ? (
                <div style={{ padding:"24px 0" }}>
                  <div style={{ background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)", borderRadius:12, padding:"20px 24px", color:"#f87171", fontSize:13, marginBottom:16 }}>⚠ {newsError}</div>
                  <button className="news-refresh" onClick={loadNews}>↻ Try Again</button>
                </div>
              ) : (
                <div className="news-grid">
                  {news.map((story, i) => {
                    const hostname = getHostname(story.url);
                    const href = story.url || `https://news.ycombinator.com/item?id=${story.id}`;
                    return (
                      <a key={story.id || i} className="news-card" href={href} target="_blank" rel="noopener noreferrer">
                        <div className="news-card-meta">
                          <span className="news-card-source">HN</span>
                          <span className="news-card-pts">▲ {story.score || 0} pts · {story.descendants || 0} comments</span>
                        </div>
                        <div className="news-card-title">{story.title}</div>
                        {hostname && <div className="news-card-url">{hostname}</div>}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "practice" && (
            <div>
              <div className="td-section-title">Choose Mode</div>
              <div className="mode-cards">
                <div className="mode-card practice" onClick={() => onModeSelect("practice")}>
                  <div className="mode-icon">📚</div>
                  <div className="mode-title">Practice Mode</div>
                  <div className="mode-desc">Browse all questions at your own pace. No timer, no pressure.</div>
                  <button className="mode-btn btn-p">Start Practice →</button>
                </div>
                <div className="mode-card test" onClick={() => onModeSelect("test")}>
                  <div className="mode-icon">🎯</div>
                  <div className="mode-title">Timed Test</div>
                  <div className="mode-desc">Full 60-minute assessment. 10 coding + 20 aptitude + 10 SQL. Score is recorded.</div>
                  <button className="mode-btn btn-t">Take Test →</button>
                </div>
              </div>
            </div>
          )}

          {tab === "activities" && (
            <div>
              <div className="td-section-title">Fun Programming Activities</div>
              <div className="act-grid">
                {ACTIVITIES.map((act, i) => (
                  <div key={i} className="act-card">
                    <div className="act-card-icon">{act.icon}</div>
                    <div className="act-card-title">{act.title}</div>
                    <div className="act-card-desc">{act.desc}</div>
                    <span className="act-tag">{act.tag}</span>
                    <div className="act-expand">
                      <button className="act-reveal-btn" onClick={() => setOpenAct(openAct === i ? null : i)}>
                        {openAct === i ? "▲ Hide" : "▼ Open Challenge"}
                      </button>
                      {openAct === i && (
                        <div className="act-puzzle">
                          <div className="act-puzzle-q">{act.puzzle.q}</div>
                          <pre className="act-puzzle-code">{act.puzzle.code}</pre>
                          <button className="act-reveal-btn" onClick={() => setRevealed(r => ({ ...r, [i]: !r[i] }))}>
                            {revealed[i] ? "🙈 Hide Answer" : "💡 Reveal Answer"}
                          </button>
                          {revealed[i] && <div className="act-answer">✅ {act.puzzle.answer}</div>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "quiz" && (
            <div className="quiz-wrap">
              <div className="td-section-title">Quick Tech Quiz · 10 Questions</div>
              {!quizDone ? (
                <>
                  <div className="quiz-q-box">
                    <div className="quiz-q-num">Question {qIdx + 1} of {shuffledQuestions.length}</div>
                    <div className="quiz-q-text">{currentQ?.q}</div>
                  </div>
                  <div className="quiz-opts">
                    {currentQ?.opts.map((opt, i) => (
                      <div key={i} className={optClass(i)} onClick={() => handleSelect(i)}>
                        <span className="quiz-opt-letter">{LETTERS[i]}</span>
                        {opt}
                      </div>
                    ))}
                  </div>
                  {answered && (
                    <>
                      <div className={`quiz-result ${selected === currentQ.ans ? "correct" : "wrong"}`}>
                        {selected === currentQ.ans ? "✅ Correct!" : `❌ Wrong! Answer: ${currentQ.opts[currentQ.ans]}`}
                      </div>
                      <button className="quiz-next" onClick={handleNext}>
                        {qIdx + 1 >= shuffledQuestions.length ? "See Results" : "Next →"}
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div style={{ textAlign:"center", padding:"40px 0" }}>
                  <div className="quiz-score">{quizScore} / {shuffledQuestions.length}</div>
                  <div style={{ color:"#64748b", fontSize:13, marginBottom:24 }}>
                    {quizScore >= 8 ? "🏆 Excellent!" : quizScore >= 5 ? "👍 Good effort!" : "💪 Keep practising!"}
                  </div>
                  <button className="quiz-next" onClick={restartQuiz}>↩ Try Again</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}