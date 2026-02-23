import React, { useState, useEffect, useCallback, useRef } from "react";
import { SQL_SEED_DATA } from "../data/sqlQuestions";

// ── sql.js loader ─────────────────────────────────────────────────────────────
let SQL = null, db = null, sqlReadyPromise = null;
function loadSqlJs() {
  if (sqlReadyPromise) return sqlReadyPromise;
  sqlReadyPromise = new Promise((resolve, reject) => {
    if (window.initSqlJs) { resolve(window.initSqlJs); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js";
    s.async = true;
    s.onload  = () => window.initSqlJs ? resolve(window.initSqlJs) : reject(new Error("initSqlJs missing"));
    s.onerror = () => reject(new Error("Failed to load sql-wasm.js"));
    document.head.appendChild(s);
  });
  return sqlReadyPromise;
}
async function getDb() {
  if (db) return db;
  if (!SQL) {
    const init = await loadSqlJs();
    SQL = await init({ locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${f}` });
  }
  db = new SQL.Database();
  seedDb(db);
  return db;
}
function seedDb(database) {
  database.run(`CREATE TABLE IF NOT EXISTS employees (id INTEGER, name TEXT, department TEXT, salary INTEGER, hire_date TEXT, manager_id INTEGER, city TEXT)`);
  database.run(`CREATE TABLE IF NOT EXISTS departments (id INTEGER, name TEXT, budget INTEGER, location TEXT)`);
  database.run(`CREATE TABLE IF NOT EXISTS customers (id INTEGER, name TEXT, email TEXT, city TEXT, age INTEGER, joined_date TEXT)`);
  database.run(`CREATE TABLE IF NOT EXISTS products (id INTEGER, name TEXT, category TEXT, price INTEGER, stock INTEGER, supplier_id INTEGER)`);
  database.run(`CREATE TABLE IF NOT EXISTS orders (id INTEGER, customer_id INTEGER, product_id INTEGER, quantity INTEGER, amount INTEGER, order_date TEXT, status TEXT)`);
  database.run(`CREATE TABLE IF NOT EXISTS students (id INTEGER, name TEXT, course TEXT, marks INTEGER, grade TEXT, year INTEGER)`);
  database.run(`CREATE TABLE IF NOT EXISTS suppliers (id INTEGER, name TEXT, country TEXT, contact_email TEXT)`);
  database.run(`CREATE TABLE IF NOT EXISTS attendance (id INTEGER, student_id INTEGER, date TEXT, status TEXT)`);
  SQL_SEED_DATA.employees.forEach(r  => database.run(`INSERT INTO employees VALUES (?,?,?,?,?,?,?)`,  [r.id,r.name,r.department,r.salary,r.hire_date,r.manager_id,r.city]));
  SQL_SEED_DATA.departments.forEach(r => database.run(`INSERT INTO departments VALUES (?,?,?,?)`,      [r.id,r.name,r.budget,r.location]));
  SQL_SEED_DATA.customers.forEach(r  => database.run(`INSERT INTO customers VALUES (?,?,?,?,?,?)`,    [r.id,r.name,r.email,r.city,r.age,r.joined_date]));
  SQL_SEED_DATA.products.forEach(r   => database.run(`INSERT INTO products VALUES (?,?,?,?,?,?)`,     [r.id,r.name,r.category,r.price,r.stock,r.supplier_id]));
  SQL_SEED_DATA.orders.forEach(r     => database.run(`INSERT INTO orders VALUES (?,?,?,?,?,?,?)`,     [r.id,r.customer_id,r.product_id,r.quantity,r.amount,r.order_date,r.status]));
  SQL_SEED_DATA.students.forEach(r   => database.run(`INSERT INTO students VALUES (?,?,?,?,?,?)`,     [r.id,r.name,r.course,r.marks,r.grade,r.year]));
}

// ── Schema ───────────────────────────────────────────────────────────────────
const TABLES = {
  employees:   ["id","name","department","salary","hire_date","manager_id","city"],
  departments: ["id","name","budget","location"],
  customers:   ["id","name","email","city","age","joined_date"],
  products:    ["id","name","category","price","stock","supplier_id"],
  orders:      ["id","customer_id","product_id","quantity","amount","order_date","status"],
  students:    ["id","name","course","marks","grade","year"],
  suppliers:   ["id","name","country","contact_email"],
  attendance:  ["id","student_id","date","status"],
};

const KEYWORDS = [
  { label:"SELECT *",  insert:"SELECT * FROM " },
  { label:"WHERE",     insert:"WHERE " },
  { label:"JOIN",      insert:"JOIN  ON " },
  { label:"LEFT JOIN", insert:"LEFT JOIN  ON " },
  { label:"GROUP BY",  insert:"GROUP BY " },
  { label:"ORDER BY",  insert:"ORDER BY " },
  { label:"HAVING",    insert:"HAVING " },
  { label:"LIMIT",     insert:"LIMIT 10" },
  { label:"COUNT(*)",  insert:"COUNT(*)" },
  { label:"AVG()",     insert:"AVG()" },
  { label:"SUM()",     insert:"SUM()" },
  { label:"MAX()",     insert:"MAX()" },
  { label:"MIN()",     insert:"MIN()" },
  { label:"DISTINCT",  insert:"DISTINCT " },
  { label:"AS",        insert:" AS " },
  { label:"LIKE",      insert:"LIKE '%%'" },
  { label:"BETWEEN",   insert:"BETWEEN  AND " },
  { label:"IN ()",     insert:"IN ()" },
  { label:"IS NULL",   insert:"IS NULL" },
];

function friendlyError(msg) {
  if (!msg) return "Unknown error.";
  if (msg.includes("no such table")) {
    const t = msg.match(/no such table: (\w+)/)?.[1];
    return `Table "${t}" not found. Click a table name in the Schema panel to insert it.`;
  }
  if (msg.includes("no such column")) {
    const c = msg.match(/no such column: (\w+)/)?.[1];
    return `Column "${c}" not found. Click a column name in the Schema panel to insert it.`;
  }
  if (msg.includes("syntax error")) return "SQL syntax error — check for missing commas, quotes or keywords.";
  if (msg.includes("incomplete input")) return "Query looks incomplete — did you forget a closing parenthesis?";
  return msg;
}

// ── Draggable divider hook ────────────────────────────────────────────────────
function useDragDivider(initial, min, max, invert = false) {
  const [size, setSize]         = useState(initial);
  const [dragging, setDragging] = useState(false);
  const startX  = useRef(0);
  const startSz = useRef(initial);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    startX.current  = e.clientX;
    startSz.current = size;
    setDragging(true);
    const onMove = (ev) => {
      const delta = invert ? startX.current - ev.clientX : ev.clientX - startX.current;
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
*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

.sc-root {
  display:flex; flex-direction:column; height:100vh;
  background:#080d16; color:#e2e8f0;
  font-family:'Outfit',sans-serif; overflow:hidden;
}

/* Topbar */
.sc-topbar {
  display:flex; align-items:center; justify-content:space-between;
  padding:0 18px; height:50px; flex-shrink:0;
  background:#0c1525; border-bottom:1px solid rgba(99,179,237,.1);
}
.sc-topbar-l { display:flex; align-items:center; gap:10px; }
.sc-title { font-weight:800; font-size:14px; color:#e2e8f0; }
.sc-chip { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
.sc-chip-easy   { background:rgba(34,197,94,.15);  color:#22c55e; border:1px solid rgba(34,197,94,.3); }
.sc-chip-medium { background:rgba(250,204,21,.15); color:#facc15; border:1px solid rgba(250,204,21,.3); }
.sc-chip-hard   { background:rgba(239,68,68,.15);  color:#ef4444; border:1px solid rgba(239,68,68,.3); }
.sc-chip-marks  { background:rgba(56,189,248,.1);  color:#38bdf8; border:1px solid rgba(56,189,248,.2); }
.sc-db-pill {
  padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700;
  background:rgba(34,197,94,.1); color:#22c55e; border:1px solid rgba(34,197,94,.2);
}
.sc-db-pill.loading { background:rgba(249,115,22,.1); color:#f97316; border-color:rgba(249,115,22,.2); }

/* Body */
.sc-body { display:flex; flex:1; overflow:hidden; }

/* Drag divider */
.sc-divider {
  width:5px; flex-shrink:0; cursor:col-resize;
  background:rgba(99,179,237,.05); transition:background .15s; position:relative; z-index:10;
}
.sc-divider:hover,.sc-divider.active { background:rgba(0,172,193,.35); }
.sc-divider::after {
  content:''; position:absolute; top:50%; left:50%;
  transform:translate(-50%,-50%); width:2px; height:36px;
  border-radius:2px; background:rgba(99,179,237,.2);
}

/* Left: question + schema */
.sc-left {
  display:flex; flex-direction:column; overflow:hidden;
  background:#0a1120; border-right:1px solid rgba(99,179,237,.07); min-width:180px; max-width:55%;
}
.sc-left-inner { flex:1; overflow-y:auto; }
.sc-left-inner::-webkit-scrollbar { width:4px; }
.sc-left-inner::-webkit-scrollbar-thumb { background:rgba(99,179,237,.15); border-radius:4px; }

.sc-pane-head {
  font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase;
  color:#334155; padding:10px 14px; border-bottom:1px solid rgba(99,179,237,.06);
  display:flex; align-items:center; justify-content:space-between;
}
.sc-q-text { padding:14px; font-size:13px; color:#94a3b8; line-height:1.85; }
.sc-hint {
  margin:0 14px 14px; padding:9px 12px;
  background:rgba(251,191,36,.05); border:1px solid rgba(251,191,36,.18);
  border-radius:8px; font-size:12px; color:#fbbf24; line-height:1.6;
}

/* Schema accordion */
.sc-tbl-row { border-bottom:1px solid rgba(99,179,237,.05); }
.sc-tbl-name {
  display:flex; align-items:center; justify-content:space-between;
  padding:8px 14px; cursor:pointer; font-size:12px; font-weight:700;
  color:#38bdf8; user-select:none; transition:background .15s;
}
.sc-tbl-name:hover { background:rgba(56,189,248,.05); }
.sc-tbl-name span { font-size:10px; color:#1e3a52; font-weight:400; }
.sc-tbl-name .sc-tbl-click {
  cursor:pointer; padding:1px 6px; border-radius:4px;
  transition:background .15s;
}
.sc-tbl-click:hover { background:rgba(0,172,193,.15); color:#00ACC1; }
.sc-cols { padding:4px 14px 10px 26px; display:flex; flex-direction:column; gap:1px; }
.sc-col {
  font-family:'JetBrains Mono',monospace; font-size:11px; color:#475569;
  padding:3px 6px; border-radius:4px; cursor:pointer; transition:all .12s;
  display:flex; align-items:center; gap:6px;
}
.sc-col:hover { background:rgba(0,172,193,.1); color:#00ACC1; }
.sc-col-dot { width:4px; height:4px; background:#1e3a52; border-radius:50%; flex-shrink:0; }

/* Centre: keyword bar + editor + results */
.sc-centre { flex:1; display:flex; flex-direction:column; min-width:200px; overflow:hidden; }

.sc-kw-bar {
  display:flex; gap:5px; padding:7px 12px; flex-wrap:wrap; flex-shrink:0;
  background:#0b1220; border-bottom:1px solid rgba(99,179,237,.07);
}
.sc-kw {
  padding:3px 9px; border:1px solid rgba(99,179,237,.12); border-radius:5px;
  background:rgba(0,172,193,.05); color:#38bdf8;
  font-size:11px; font-weight:600; font-family:'JetBrains Mono',monospace;
  cursor:pointer; transition:all .12s; white-space:nowrap;
}
.sc-kw:hover { background:rgba(0,172,193,.14); border-color:rgba(0,172,193,.35); color:#00ACC1; }

.sc-editor-area { flex:1; display:flex; flex-direction:column; padding:12px; gap:10px; overflow-y:auto; }
.sc-editor-area::-webkit-scrollbar { width:4px; }
.sc-editor-area::-webkit-scrollbar-thumb { background:rgba(99,179,237,.15); border-radius:4px; }

.sc-editor-label { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#334155; margin-bottom:6px; }

.sc-textarea {
  width:100%; background:#070c14; color:#e2e8f0;
  border:1px solid rgba(0,172,193,.18); border-radius:10px;
  padding:14px; font-family:'JetBrains Mono',monospace; font-size:14px;
  resize:vertical; outline:none; line-height:1.75; min-height:150px;
  transition:border-color .2s, box-shadow .2s;
}
.sc-textarea:focus { border-color:rgba(0,172,193,.45); box-shadow:0 0 0 3px rgba(0,172,193,.06); }
.sc-textarea::placeholder { color:#111c2e; }

/* Result panel */
.sc-result { border:1px solid rgba(99,179,237,.1); border-radius:10px; overflow:hidden; }
.sc-result-head {
  display:flex; align-items:center; justify-content:space-between;
  padding:7px 14px; background:rgba(255,255,255,.015);
  border-bottom:1px solid rgba(99,179,237,.07);
  font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#334155;
}
.sc-result-body { padding:12px 14px; overflow-x:auto; max-height:240px; overflow-y:auto; background:#070c14; }
.sc-result-body::-webkit-scrollbar { width:4px; height:4px; }
.sc-result-body::-webkit-scrollbar-thumb { background:rgba(99,179,237,.15); border-radius:4px; }

.sc-err { padding:10px 14px; background:rgba(239,68,68,.06); border:1px solid rgba(239,68,68,.18); border-radius:8px; }
.sc-err-title { font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#ef4444; margin-bottom:5px; }
.sc-err-msg   { font-size:13px; color:#f87171; line-height:1.6; }
.sc-empty { font-size:13px; color:#1e3a52; }
.sc-ok-msg { font-size:13px; color:#4ade80; margin-bottom:8px; }

/* Table */
.sc-tbl { width:100%; border-collapse:collapse; font-family:'JetBrains Mono',monospace; font-size:12px; }
.sc-tbl th {
  padding:6px 14px; background:#080d16; color:#00ACC1;
  border-bottom:1px solid rgba(0,172,193,.2); text-align:left;
  white-space:nowrap; font-size:11px; letter-spacing:.5px; position:sticky; top:0;
}
.sc-tbl td { padding:5px 14px; color:#cbd5e1; border-bottom:1px solid rgba(30,41,59,.7); white-space:nowrap; }
.sc-tbl tr:nth-child(even) td { background:rgba(255,255,255,.02); }
.sc-tbl tr:hover td { background:rgba(0,172,193,.04); }
.sc-null { color:#1e3a52; font-style:italic; }

/* Score bar */
.sc-score {
  display:flex; align-items:center; gap:14px; padding:10px 18px;
  background:#0c1525; border-top:1px solid rgba(99,179,237,.1);
  animation:fadeUp .35s cubic-bezier(.16,1,.3,1); flex-shrink:0;
}
@keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
.sc-score-num { font-size:20px; font-weight:800; }
.sc-ok   { color:#22c55e; }
.sc-fail { color:#ef4444; }

/* Action bar */
.sc-actions {
  display:flex; align-items:center; justify-content:space-between;
  padding:0 18px; height:50px; flex-shrink:0;
  background:#0c1525; border-top:1px solid rgba(99,179,237,.08);
}
.sc-keys { display:flex; gap:14px; font-size:11px; color:#1e293b; }
.sc-keys kbd {
  background:#1a2540; border:1px solid rgba(99,179,237,.15); border-radius:4px;
  padding:1px 5px; font-family:'JetBrains Mono',monospace; font-size:10px; color:#334155;
}
.sc-btns { display:flex; gap:10px; }
.sc-btn {
  padding:8px 20px; border:none; border-radius:8px;
  font-family:'Outfit',sans-serif; font-size:13px; font-weight:700;
  cursor:pointer; transition:all .15s; display:flex; align-items:center; gap:6px;
}
.sc-btn:disabled { opacity:.4; cursor:not-allowed; }
.sc-btn:not(:disabled):hover { transform:translateY(-1px); filter:brightness(1.1); }
.sc-btn-run    { background:#0e7490; color:#fff; }
.sc-btn-submit { background:#15803d; color:#fff; }
.sc-spin {
  width:13px; height:13px; border:2px solid rgba(255,255,255,.2);
  border-top-color:#fff; border-radius:50%;
  animation:spin .55s linear infinite; display:inline-block;
}
@keyframes spin { to{transform:rotate(360deg)} }
`;

function ResultTable({ columns, rows }) {
  if (!rows?.length) return <div className="sc-empty">No rows returned.</div>;
  return (
    <table className="sc-tbl">
      <thead><tr>{columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => (
              <td key={ci}>{cell === null ? <span className="sc-null">NULL</span> : String(cell)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function SqlCompiler({ question, onScoreUpdate }) {
  const [query,      setQuery]     = useState("");
  const [result,     setResult]    = useState(null);
  const [error,      setError]     = useState("");
  const [loading,    setLoading]   = useState(false);
  const [scoreInfo,  setScore]     = useState(null);
  const [dbReady,    setDbReady]   = useState(false);
  const [openTables, setOpen]      = useState({ employees: true });
  const taRef = useRef(null);

  const [leftW, leftDrag, leftDragging] = useDragDivider(280, 160, 500, false);

  useEffect(() => {
    setQuery(""); setResult(null); setError(""); setScore(null);
  }, [question.id]);

  useEffect(() => {
    setDbReady(false);
    getDb().then(() => setDbReady(true)).catch(e => setError("SQL engine failed: " + e.message));
  }, []);

  const insertAtCursor = (text) => {
    const el = taRef.current;
    if (!el) { setQuery(q => q + text); return; }
    const s = el.selectionStart, e2 = el.selectionEnd;
    const next = query.substring(0, s) + text + query.substring(e2);
    setQuery(next);
    setTimeout(() => { el.selectionStart = el.selectionEnd = s + text.length; el.focus(); }, 0);
  };

  const handleRun = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true); setError(""); setResult(null); setScore(null);
    try {
      const database = await getDb();
      const res = database.exec(query);
      if (res.length === 0) setResult({ columns: [], rows: [], message: "✓ Query executed. No rows returned." });
      else setResult({ columns: res[0].columns, rows: res[0].values });
    } catch (e) { setError(friendlyError(e.message)); }
    setLoading(false);
  }, [query]);

  const handleSubmit = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true); setError(""); setResult(null); setScore(null);
    try {
      const database = await getDb();
      let userRows = [], userCols = [];
      try {
        const ur = database.exec(query);
        if (ur.length > 0) { userCols = ur[0].columns; userRows = ur[0].values; }
      } catch (e) {
        setError(friendlyError(e.message));
        setScore({ score: 0, correct: false });
        if (onScoreUpdate) onScoreUpdate(0);
        setLoading(false); return;
      }
      let expectedRows = [];
      try { const er = database.exec(question.answer); if (er.length > 0) expectedRows = er[0].values; } catch {}
      const norm = rows => rows.map(r => r.map(v => v === null ? "NULL" : String(v)).join("|")).sort().join("\n");
      const correct = norm(userRows) === norm(expectedRows);
      const finalScore = correct ? question.marks : 0;
      setScore({ score: finalScore, correct });
      setResult({ columns: userCols, rows: userRows });
      if (onScoreUpdate) onScoreUpdate(finalScore);
    } catch (e) { setError(friendlyError(e.message)); }
    setLoading(false);
  }, [query, question]);

  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Enter") { e.preventDefault(); handleSubmit(); }
      else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); handleRun(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [handleRun, handleSubmit]);

  const diffClass  = { Easy:"easy", Medium:"medium", Hard:"hard" }[question.difficulty] || "easy";
  const rowCount   = result?.rows?.length ?? 0;

  return (
    <>
      <style>{css}</style>
      <div className="sc-root">

        {/* Topbar */}
        <div className="sc-topbar">
          <div className="sc-topbar-l">
            <span className="sc-title">🗄️ SQL Editor</span>
            <span className={`sc-chip sc-chip-${diffClass}`}>{question.difficulty}</span>
            <span className="sc-chip sc-chip-marks">{question.marks} marks</span>
            <span className={`sc-db-pill${dbReady ? "" : " loading"}`}>
              {dbReady ? "✓ DB Ready" : "⏳ Loading…"}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="sc-body">

          {/* LEFT: Question + Schema */}
          <div className="sc-left" style={{ width: leftW, flexShrink: 0 }}>
            <div className="sc-left-inner">
              {/* Question */}
              <div className="sc-pane-head">📋 Question</div>
              <div className="sc-q-text">{question.question}</div>
              {question.hint && (
                <div className="sc-hint">💡 <strong>Hint:</strong> {question.hint}</div>
              )}

              {/* Schema */}
              <div className="sc-pane-head" style={{ marginTop: 4 }}>
                🗂️ Schema
                <span style={{ fontSize: 10, color: "#1e3a52", fontWeight: 400, letterSpacing: 0 }}>
                  click name/col to insert
                </span>
              </div>
              {Object.entries(TABLES).map(([tbl, cols]) => (
                <div className="sc-tbl-row" key={tbl}>
                  <div className="sc-tbl-name" onClick={() => setOpen(p => ({ ...p, [tbl]: !p[tbl] }))}>
                    <span
                      className="sc-tbl-click"
                      onClick={(e) => { e.stopPropagation(); insertAtCursor(tbl); }}
                    >
                      {tbl}
                    </span>
                    <span>{openTables[tbl] ? "▲" : "▼"} {cols.length}</span>
                  </div>
                  {openTables[tbl] && (
                    <div className="sc-cols">
                      {cols.map(col => (
                        <div className="sc-col" key={col} onClick={() => insertAtCursor(col)} title={`Insert "${col}"`}>
                          <div className="sc-col-dot" />
                          {col}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* DIVIDER */}
          <div className={`sc-divider${leftDragging ? " active" : ""}`} onMouseDown={leftDrag} title="Drag to resize" />

          {/* CENTRE: keywords + editor + results */}
          <div className="sc-centre">

            {/* Keyword bar */}
            <div className="sc-kw-bar">
              {KEYWORDS.map(kw => (
                <button key={kw.label} className="sc-kw" onClick={() => insertAtCursor(kw.insert)}>
                  {kw.label}
                </button>
              ))}
            </div>

            <div className="sc-editor-area">

              {/* Editor */}
              <div>
                <div className="sc-editor-label">SQL Query</div>
                <textarea
                  ref={taRef}
                  className="sc-textarea"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={"-- Click a keyword above or type your query\nSELECT * FROM employees LIMIT 10;"}
                  rows={9}
                  onKeyDown={e => {
                    if (e.key === "Tab") { e.preventDefault(); insertAtCursor("  "); }
                  }}
                />
              </div>

              {/* Results */}
              <div className="sc-result">
                <div className="sc-result-head">
                  <span>📊 Results</span>
                  {result && !error && rowCount > 0 && (
                    <span style={{ color: "#1e3a52", fontWeight: 400, fontSize: 11, letterSpacing: 0 }}>
                      {rowCount} row{rowCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className="sc-result-body">
                  {loading && <div className="sc-empty">⏳ Running…</div>}
                  {!loading && error && (
                    <div className="sc-err">
                      <div className="sc-err-title">⚠ Error</div>
                      <div className="sc-err-msg">{error}</div>
                    </div>
                  )}
                  {!loading && !error && result && (
                    <>
                      {result.message && <div className="sc-ok-msg">{result.message}</div>}
                      <ResultTable columns={result.columns} rows={result.rows} />
                    </>
                  )}
                  {!loading && !error && !result && (
                    <div className="sc-empty">Run a query to see results here.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Score bar */}
        {scoreInfo && (
          <div className="sc-score">
            <span className={`sc-score-num ${scoreInfo.correct ? "sc-ok" : "sc-fail"}`}>
              {scoreInfo.correct ? "✅ Correct!" : "❌ Incorrect"}
            </span>
            <span style={{ fontSize: 18, fontWeight: 800, color: scoreInfo.correct ? "#22c55e" : "#ef4444" }}>
              {scoreInfo.score}/{question.marks} marks
            </span>
            {!scoreInfo.correct && (
              <span style={{ fontSize: 12, color: "#334155" }}>Check your logic and try again.</span>
            )}
          </div>
        )}

        {/* Action bar */}
        <div className="sc-actions">
          <div className="sc-keys">
            <span><kbd>Ctrl</kbd>+<kbd>Enter</kbd> Run</span>
            <span><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Enter</kbd> Submit</span>
            <span><kbd>Tab</kbd> Indent</span>
          </div>
          <div className="sc-btns">
            <button className="sc-btn sc-btn-run" onClick={handleRun} disabled={loading || !dbReady}>
              {loading ? <span className="sc-spin" /> : "▶"} Run
            </button>
            <button className="sc-btn sc-btn-submit" onClick={handleSubmit} disabled={loading || !dbReady}>
              {loading ? <span className="sc-spin" /> : "✓"} Submit
            </button>
          </div>
        </div>

      </div>
    </>
  );
}