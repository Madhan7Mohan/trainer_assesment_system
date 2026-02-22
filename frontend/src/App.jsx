import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { codingQuestions, mcqQuestions } from "./data/questionBank";

import Register         from "./components/Register";
import Login            from "./components/Login";
import Dashboard        from "./components/Dashboard";
import AssessmentLayout from "./components/AssessmentLayout";
import Results          from "./components/Results";

export default function App() {
  const [step,    setStep]    = useState("loading");
  const [profile, setProfile] = useState(null);
  const [user,    setUser]    = useState(null);
  const [mode,    setMode]    = useState(null);
  const [result,  setResult]  = useState(null);

  // ── Helper: fetch profile from DB and update state ─────────────────────────
  const loadProfile = async (authUser) => {
    const { data: prof, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (prof && !error) {
      setUser(authUser);
      setProfile(prof);
      setStep("dashboard");
    } else {
      console.warn("Profile not found:", authUser.id, error?.message);
      // Fallback: use auth metadata so user isn't stuck on a blank screen
      setUser(authUser);
      setProfile({
        id:    authUser.id,
        email: authUser.email,
        name:  authUser.user_metadata?.name || authUser.email,
      });
      setStep("dashboard");
    }
  };

  // ── Session restore + auth listener ───────────────────────────────────────
  useEffect(() => {
    let initialised = false; // declared first so the listener closure can read it

    // 1. Check for an existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await loadProfile(session.user);
      } else {
        setStep("login");
      }
      initialised = true; // mark AFTER getSession resolves
    });

    // 2. Listen for future auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!initialised) return; // ignore the initial replay before getSession resolves

        if (event === "SIGNED_IN" && session?.user) {
          await loadProfile(session.user);
        }

        if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setMode(null);
          setResult(null);
          setStep("login");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Auth handlers ──────────────────────────────────────────────────────────
  const handleRegistered = (prof, authUser) => {
    setProfile(prof);
    setUser(authUser);
    setStep("login");
  };

  const handleLoggedIn = async (prof, authUser) => {
    // Always reload fresh from DB on login
    await loadProfile(authUser);
  };

  // ── Sign out ───────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange SIGNED_OUT will clear state and go to login
  };

  // ── Mode selection ─────────────────────────────────────────────────────────
  const handleModeSelect = (m) => { setMode(m); setStep("exam"); };
  const backToDashboard  = () => { setResult(null); setMode(null); setStep("dashboard"); };

  // ── Submit exam & store results ────────────────────────────────────────────
  const submitExam = async (scores) => {
    const {
      codingScore, mcqScore, codingPassed, mcqCorrect,
      totalCoding, totalMCQ, totalMarks,
    } = scores;

    const totalScore = codingScore + mcqScore;
    const percentage = totalMarks > 0
      ? Math.round((totalScore / totalMarks) * 100)
      : 0;

    // Update UI immediately
    setResult({
      codingScore, mcqScore, totalScore, percentage,
      codingPassed, mcqCorrect, totalCoding, totalMCQ, totalMarks,
    });
    setStep("result");

    const { error } = await supabase.from("results").insert([{
      user_id:       user?.id        ?? null,
      name:          profile?.name   ?? null,
      email:         profile?.email  ?? null,
      phone:         profile?.phone  ?? null,
      stream:        profile?.stream ?? null,
      mode:          mode             ?? null,
      coding_score:  codingScore,
      mcq_score:     mcqScore,
      total_score:   totalScore,
      percentage,
      coding_passed: codingPassed ? 1 : 0,
      mcq_correct:   mcqCorrect,
    }]);

    if (error) {
      console.error("❌ Failed to store result:", error.message, error.details);
    } else {
      console.log("✅ Result stored successfully");
    }
  };

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (step === "loading") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#060a14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Mono', monospace",
        color: "#00ACC1",
        fontSize: 13,
        letterSpacing: 3,
      }}>
        LOADING...
      </div>
    );
  }

  return (
    <div>
      {step === "register" && (
        <Register onRegistered={handleRegistered} goToLogin={() => setStep("login")} />
      )}
      {step === "login" && (
        <Login onLoggedIn={handleLoggedIn} goToRegister={() => setStep("register")} />
      )}
      {step === "dashboard" && profile && (
        <Dashboard
          user={profile}
          onModeSelect={handleModeSelect}
          onSignOut={handleSignOut}
          onLogout={handleSignOut}
        />
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