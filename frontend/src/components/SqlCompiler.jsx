import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Paper, Chip } from "@mui/material";
import { SQL_SEED_DATA, SQL_SCHEMA } from "../data/sqlQuestions";

// ── Load sql.js via injected <script> tag (most reliable approach with Vite) ──
let SQL  = null;
let db   = null;
let sqlReadyPromise = null;

function loadSqlJsScript() {
  if (sqlReadyPromise) return sqlReadyPromise;
  sqlReadyPromise = new Promise((resolve, reject) => {
    // Already loaded by a previous render
    if (window.initSqlJs) { resolve(window.initSqlJs); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js";
    script.async = true;
    script.onload  = () => {
      if (window.initSqlJs) resolve(window.initSqlJs);
      else reject(new Error("sql-wasm.js loaded but initSqlJs not found on window"));
    };
    script.onerror = () => reject(new Error("Failed to load sql-wasm.js from CDN"));
    document.head.appendChild(script);
  });
  return sqlReadyPromise;
}

async function getDb() {
  if (db) return db;
  if (!SQL) {
    const initSqlJs = await loadSqlJsScript();
    SQL = await initSqlJs({
      locateFile: file =>
        `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`,
    });
  }
  db = new SQL.Database();
  seedDatabase(db);
  return db;
}

function seedDatabase(database) {
  database.run(`CREATE TABLE IF NOT EXISTS employees (
    id INTEGER, name TEXT, department TEXT, salary INTEGER,
    hire_date TEXT, manager_id INTEGER, city TEXT)`);
  database.run(`CREATE TABLE IF NOT EXISTS departments (id INTEGER, name TEXT, budget INTEGER, location TEXT)`);
  database.run(`CREATE TABLE IF NOT EXISTS customers (id INTEGER, name TEXT, email TEXT, city TEXT, age INTEGER, joined_date TEXT)`);
  database.run(`CREATE TABLE IF NOT EXISTS products (id INTEGER, name TEXT, category TEXT, price INTEGER, stock INTEGER, supplier_id INTEGER)`);
  database.run(`CREATE TABLE IF NOT EXISTS orders (id INTEGER, customer_id INTEGER, product_id INTEGER, quantity INTEGER, amount INTEGER, order_date TEXT, status TEXT)`);
  database.run(`CREATE TABLE IF NOT EXISTS students (id INTEGER, name TEXT, course TEXT, marks INTEGER, grade TEXT, year INTEGER)`);
  database.run(`CREATE TABLE IF NOT EXISTS suppliers (id INTEGER, name TEXT, country TEXT, contact_email TEXT)`);
  database.run(`CREATE TABLE IF NOT EXISTS attendance (id INTEGER, student_id INTEGER, date TEXT, status TEXT)`);

  SQL_SEED_DATA.employees.forEach(r => database.run(
    `INSERT INTO employees VALUES (?,?,?,?,?,?,?)`,
    [r.id, r.name, r.department, r.salary, r.hire_date, r.manager_id, r.city]));
  SQL_SEED_DATA.departments.forEach(r => database.run(
    `INSERT INTO departments VALUES (?,?,?,?)`, [r.id, r.name, r.budget, r.location]));
  SQL_SEED_DATA.customers.forEach(r => database.run(
    `INSERT INTO customers VALUES (?,?,?,?,?,?)`, [r.id, r.name, r.email, r.city, r.age, r.joined_date]));
  SQL_SEED_DATA.products.forEach(r => database.run(
    `INSERT INTO products VALUES (?,?,?,?,?,?)`, [r.id, r.name, r.category, r.price, r.stock, r.supplier_id]));
  SQL_SEED_DATA.orders.forEach(r => database.run(
    `INSERT INTO orders VALUES (?,?,?,?,?,?,?)`, [r.id, r.customer_id, r.product_id, r.quantity, r.amount, r.order_date, r.status]));
  SQL_SEED_DATA.students.forEach(r => database.run(
    `INSERT INTO students VALUES (?,?,?,?,?,?)`, [r.id, r.name, r.course, r.marks, r.grade, r.year]));
}

function ResultTable({ columns, rows }) {
  if (!rows || rows.length === 0)
    return <Typography sx={{ color: "#94a3b8", fontSize: 13, mt: 1 }}>No rows returned.</Typography>;
  return (
    <Box sx={{ overflowX: "auto", mt: 1 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c} style={{ padding: "6px 12px", background: "#0f172a", color: "#00ACC1",
                borderBottom: "1px solid rgba(0,172,193,0.3)", textAlign: "left", whiteSpace: "nowrap" }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? "#1e293b" : "#0f172a" }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: "5px 12px", color: "#e2e8f0",
                  borderBottom: "1px solid rgba(51,65,85,0.5)", whiteSpace: "nowrap" }}>
                  {cell === null ? <span style={{ color: "#475569" }}>NULL</span> : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}

export default function SqlCompiler({ question, onScoreUpdate }) {
  const [query,     setQuery]     = useState("");
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [score,     setScore]     = useState(null);
  const [dbReady,   setDbReady]   = useState(false);
  const [activeTab, setActiveTab] = useState("question");

  // Reset state when question changes
  useEffect(() => {
    setQuery("");
    setResult(null);
    setError("");
    setScore(null);
  }, [question.id]);

  // Boot the DB on mount
  useEffect(() => {
    setDbReady(false);
    getDb()
      .then(() => setDbReady(true))
      .catch(e => setError("Failed to load SQL engine: " + e.message));
  }, []);

  const runQuery = async (sql) => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const database = await getDb();
      const res = database.exec(sql);
      if (res.length === 0) {
        setResult({ columns: [], rows: [], message: "Query executed successfully (no rows returned)." });
      } else {
        setResult({ columns: res[0].columns, rows: res[0].values });
      }
      setActiveTab("result");
    } catch (e) {
      setError(e.message);
      setActiveTab("result");
    }
    setLoading(false);
  };

  const handleRun = () => runQuery(query);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const database = await getDb();

      let userRows = [], userCols = [];
      try {
        const userRes = database.exec(query);
        if (userRes.length > 0) { userCols = userRes[0].columns; userRows = userRes[0].values; }
      } catch (e) {
        setError("Your query has an error: " + e.message);
        setScore(0);
        if (onScoreUpdate) onScoreUpdate(0);
        setLoading(false);
        return;
      }

      let expectedRows = [];
      try {
        const expRes = database.exec(question.answer);
        if (expRes.length > 0) expectedRows = expRes[0].values;
      } catch { /* ignore expected query errors */ }

      const normalize = rows =>
        rows.map(r => r.map(v => v === null ? "NULL" : String(v)).join("|")).sort().join("\n");

      const correct    = normalize(userRows) === normalize(expectedRows);
      const finalScore = correct ? question.marks : 0;
      setScore(finalScore);
      if (onScoreUpdate) onScoreUpdate(finalScore);
      setResult({ columns: userCols, rows: userRows, correct });
      setActiveTab("result");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const difficultyColor = { Easy: "#16a34a", Medium: "#facc15", Hard: "#dc2626" };

  return (
    <Box sx={{ background: "#0a0f1a", minHeight: "100vh", color: "#fff", p: 3, fontFamily: "'DM Mono', monospace" }}>

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ color: "#00ACC1", fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>
          🗄️ SQL Compiler
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip label={question.difficulty} sx={{ background: difficultyColor[question.difficulty] || "#38bdf8", color: "#000", fontWeight: 700 }} />
          <Chip label={`${question.marks} Marks`} sx={{ background: "#38bdf8", color: "#000", fontWeight: 700 }} />
          {!dbReady
            ? <Chip label="Loading DB…" sx={{ background: "#f97316", color: "#000" }} />
            : <Chip label="✓ DB Ready" sx={{ background: "#16a34a", color: "#fff" }} />}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        {["question", "schema", "result"].map(tab => (
          <Button key={tab} size="small" onClick={() => setActiveTab(tab)}
            sx={{ textTransform: "capitalize", fontWeight: 600,
              color: activeTab === tab ? "#00ACC1" : "#64748b",
              borderBottom: activeTab === tab ? "2px solid #00ACC1" : "2px solid transparent",
              borderRadius: 0, px: 2 }}>
            {tab === "question" ? "📋 Question" : tab === "schema" ? "🗂️ Schema" : "📊 Result"}
          </Button>
        ))}
      </Box>

      {/* Tab content */}
      {activeTab === "question" && (
        <Paper sx={{ p: 2, background: "#0f172a", borderRadius: 2, mb: 2, border: "1px solid rgba(0,172,193,0.15)" }}>
          <Typography sx={{ color: "#e2e8f0", lineHeight: 1.8, mb: 1.5 }}>{question.question}</Typography>
          {question.hint && (
            <Typography sx={{ color: "#94a3b8", fontSize: 12 }}>💡 Hint: {question.hint}</Typography>
          )}
        </Paper>
      )}

      {activeTab === "schema" && (
        <Paper sx={{ p: 2, background: "#0f172a", borderRadius: 2, mb: 2, border: "1px solid rgba(0,172,193,0.15)" }}>
          <pre style={{ color: "#00ACC1", fontSize: 12, whiteSpace: "pre-wrap", margin: 0 }}>{SQL_SCHEMA}</pre>
          <Typography sx={{ mt: 2, color: "#f97316", fontSize: 12, fontWeight: 600 }}>Sample Data Preview:</Typography>
          <pre style={{ color: "#94a3b8", fontSize: 11, marginTop: 4 }}>
            {`employees: ${JSON.stringify(SQL_SEED_DATA.employees.slice(0, 2).map(e => ({ name: e.name, dept: e.department, salary: e.salary })), null, 2)}`}
          </pre>
        </Paper>
      )}

      {activeTab === "result" && (
        <Paper sx={{ p: 2, background: "#0f172a", borderRadius: 2, mb: 2, border: "1px solid rgba(0,172,193,0.15)", minHeight: 100 }}>
          {error && <Typography sx={{ color: "#f87171", fontSize: 13, whiteSpace: "pre-wrap" }}>⚠ {error}</Typography>}
          {result && !error && (
            <>
              {result.message && <Typography sx={{ color: "#86efac", fontSize: 13, mb: 1 }}>{result.message}</Typography>}
              <ResultTable columns={result.columns} rows={result.rows} />
              {score !== null && (
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Typography sx={{ fontSize: 28, fontWeight: 700, color: score > 0 ? "#22c55e" : "#ef4444" }}>
                    {score > 0 ? "✅ Correct!" : "❌ Incorrect"} — {score}/{question.marks} marks
                  </Typography>
                </Box>
              )}
            </>
          )}
          {!result && !error && (
            <Typography sx={{ color: "#475569", fontSize: 13 }}>Run a query to see results here.</Typography>
          )}
        </Paper>
      )}

      {/* SQL Editor */}
      <Paper sx={{ p: 2, background: "#111827", borderRadius: 2, mb: 2, border: "1px solid rgba(0,172,193,0.2)" }}>
        <Typography sx={{ color: "#00ACC1", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", mb: 1 }}>
          SQL Query
        </Typography>
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={"-- Write your SQL query here\nSELECT * FROM employees;"}
          rows={8}
          style={{
            width: "100%", background: "#0a0f1a", color: "#e2e8f0",
            border: "1px solid rgba(0,172,193,0.2)", borderRadius: 8,
            padding: "12px", fontFamily: "'DM Mono', monospace", fontSize: 14,
            resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.6,
          }}
          onKeyDown={e => {
            if (e.key === "Tab") {
              e.preventDefault();
              const s = e.target.selectionStart;
              setQuery(q => q.substring(0, s) + "  " + q.substring(s));
            }
          }}
        />
      </Paper>

      {/* Action buttons */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" onClick={handleRun} disabled={loading || !dbReady}
          sx={{ background: "#0891b2", fontFamily: "'Syne', sans-serif", fontWeight: 700, borderRadius: 2 }}>
          ▶ Run Query
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading || !dbReady}
          sx={{ background: "#16a34a", fontFamily: "'Syne', sans-serif", fontWeight: 700, borderRadius: 2 }}>
          ✓ Submit
        </Button>
      </Box>
    </Box>
  );
}