import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { codingQuestions, mcqQuestions } from "./data/questionBank";

import Register          from "./components/Register";
import Login             from "./components/Login";
import TrainerDashboard  from "./components/Trainerdashboard";
import StudentDashboard  from "./components/Studentdashboard";
import AssessmentLayout  from "./components/AssessmentLayout";
import Results           from "./components/Results";

// ── sessionStorage helpers ─────────────────────────────────────────────────
const SS = {
  save:    (step, mode) => {
    sessionStorage.setItem("tt_step", step);
    sessionStorage.setItem("tt_mode", mode || "");
  },
  getStep: () => sessionStorage.getItem("tt_step"),
  getMode: () => sessionStorage.getItem("tt_mode") || null,
  clear:   () => {
    sessionStorage.removeItem("tt_step");
    sessionStorage.removeItem("tt_mode");
  },
};

// ── Role guard: only route to dashboard if role is confirmed ───────────────
function routeByRole(profile) {
  const role = profile?.role;
  if (role === "trainer" || role === "student") return "dashboard";
  // Unknown role — kick back to login, don't guess
  return "login";
}

export default function App() {
  const [step,    setStep]    = useState("loading");
  const [profile, setProfile] = useState(null);
  const [user,    setUser]    = useState(null);
  const [mode,    setMode]    = useState(null);
  const [result,  setResult]  = useState(null);

  // ── Load profile — STRICT: never fall back to a default role ──────────────
  const loadProfile = async (authUser) => {
    const { data: prof, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    // If profile is missing or errored — sign out and show clear error
    // Do NOT guess the role — this is the root cause of the trainer/student mix-up
    if (error || !prof) {
      console.warn("Profile not found for:", authUser.id, error?.message);
      await supabase.auth.signOut();
      SS.clear();
      setStep("login");
      setProfile(null);
      setUser(null);
      return;
    }

    // Profile loaded — role is now guaranteed from DB
    setUser(authUser);
    setProfile(prof);

    // Restore page from sessionStorage — but ALWAYS re-validate role
    const savedStep = SS.getStep();
    const savedMode = SS.getMode();

    if (savedStep === "exam" && savedMode) {
      setMode(savedMode);
      setStep("exam");
    } else {
      // Always land on dashboard — role determines WHICH dashboard in render
      setStep("dashboard");
      SS.save("dashboard", null);
    }
  };

  // ── Session restore + auth listener ───────────────────────────────────────
  useEffect(() => {
    let initialised = false;

    const safetyTimer = setTimeout(() => {
      if (!initialised) {
        console.warn("Session check timed out — redirecting to login");
        SS.clear();
        setStep("login");
        initialised = true;
      }
    }, 6000);

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      clearTimeout(safetyTimer);
      if (error) {
        console.warn("Session error:", error.message);
        SS.clear();
        try { await supabase.auth.signOut(); } catch (_) {}
        setStep("login");
      } else if (session?.user) {
        await loadProfile(session.user);
      } else {
        SS.clear();
        setStep("login");
      }
      initialised = true;
    }).catch(() => {
      clearTimeout(safetyTimer);
      SS.clear();
      setStep("login");
      initialised = true;
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!initialised) return;
        if (event === "SIGNED_IN"      && session?.user) await loadProfile(session.user);
        if (event === "TOKEN_REFRESHED" && session?.user) await loadProfile(session.user);
        if (event === "SIGNED_OUT") {
          SS.clear();
          setUser(null); setProfile(null); setMode(null); setResult(null);
          setStep("login");
        }
      }
    );
    return () => { clearTimeout(safetyTimer); subscription.unsubscribe(); };
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleRegistered = () => {
    // After register → always go to login, never auto-login
    SS.clear();
    setProfile(null);
    setUser(null);
    setStep("login");
  };

  const handleLoggedIn = async (_prof, authUser) => {
    await loadProfile(authUser);
  };

  const handleSignOut = async () => {
    SS.clear();
    await supabase.auth.signOut();
  };

  const handleModeSelect = (m) => {
    setMode(m);
    SS.save("exam", m);
    setStep("exam");
  };

  const backToDashboard = () => {
    setResult(null); setMode(null);
    SS.save("dashboard", null);
    setStep("dashboard");
  };

  // ── Submit exam ────────────────────────────────────────────────────────────
  const submitExam = async (scores) => {
    const { codingScore, mcqScore, codingPassed, mcqCorrect, totalCoding, totalMCQ, totalMarks } = scores;
    const totalScore = codingScore + mcqScore;
    const percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;
    setResult({ ...scores, totalScore, percentage, avgScore: totalScore, avgPercentage: percentage });
    SS.save("result", null);
    setStep("result");

    const { data: inserted, error: insertError } = await supabase.from("results").insert([{
      user_id:       user?.id ?? null,
      name:          profile?.name ?? null,
      email:         profile?.email ?? null,
      phone:         profile?.phone ?? null,
      stream:        profile?.stream ?? null,
      mode:          mode ?? null,
      coding_score:  codingScore,
      mcq_score:     mcqScore,
      total_score:   totalScore,
      percentage,
      coding_passed: codingPassed ? 1 : 0,
      mcq_correct:   mcqCorrect,
    }]).select("id").single();

    if (insertError) { console.error("Insert failed:", insertError.message); return; }

    const { data: allRows } = await supabase.from("results")
      .select("total_score, percentage").eq("user_id", user?.id).eq("mode", "test");

    if (allRows?.length) {
      const avgScore      = Math.round(allRows.reduce((s,r) => s+(r.total_score||0),0)/allRows.length);
      const avgPercentage = Math.round(allRows.reduce((s,r) => s+(r.percentage||0),0)/allRows.length);
      await supabase.from("results").update({ total_score: avgScore, percentage: avgPercentage }).eq("id", inserted.id);
      setResult(prev => ({ ...prev, avgScore, avgPercentage, attemptNumber: allRows.length }));
    }
  };

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (step === "loading") return (
    <div style={{
      minHeight: "100vh", background: "#060a14", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Mono',monospace", color: "#00ACC1", fontSize: 13, letterSpacing: 3
    }}>
      LOADING...
    </div>
  );

  // ── Role strictly from DB — never inferred ─────────────────────────────────
  const isTrainer = profile?.role === "trainer";
  const isStudent = profile?.role === "student";

  return (
    <div>
      {step === "register" && (
        <Register onRegistered={handleRegistered} goToLogin={() => setStep("login")} />
      )}

      {step === "login" && (
        <Login onLoggedIn={handleLoggedIn} goToRegister={() => setStep("register")} />
      )}

      {/* ── TRAINER dashboard — only renders if role is exactly "trainer" ── */}
      {step === "dashboard" && profile && isTrainer && (
        <TrainerDashboard profile={profile} onModeSelect={handleModeSelect} onSignOut={handleSignOut} />
      )}

      {/* ── STUDENT dashboard — only renders if role is exactly "student" ── */}
      {step === "dashboard" && profile && isStudent && (
        <StudentDashboard profile={profile} onModeSelect={handleModeSelect} onSignOut={handleSignOut} />
      )}

      {/* ── Safety: dashboard step but role is neither trainer nor student ── */}
      {step === "dashboard" && profile && !isTrainer && !isStudent && (
        <div style={{
          minHeight: "100vh", background: "#060a14", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          fontFamily: "'DM Mono',monospace", color: "#f87171", gap: 16,
        }}>
          <div style={{ fontSize: 32 }}>⚠️</div>
          <div style={{ fontSize: 14 }}>Account role not recognised. Please contact admin.</div>
          <button onClick={handleSignOut} style={{
            marginTop: 8, padding: "8px 20px", background: "#0e7490", border: "none",
            borderRadius: 8, color: "#fff", cursor: "pointer", fontFamily: "inherit",
          }}>
            Sign Out
          </button>
        </div>
      )}

      {step === "exam" && profile && (
        <AssessmentLayout
          trainer={{ ...profile, mode }}
          codingQuestions={codingQuestions}
          mcqQuestions={mcqQuestions}
          submitExam={submitExam}
          onExitPractice={backToDashboard}
        />
      )}

      {step === "result" && result && (
        <Results trainer={profile} result={result} onRetake={backToDashboard} />
      )}
    </div>
  );
}