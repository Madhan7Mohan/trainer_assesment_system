import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { codingQuestions, mcqQuestions } from "./data/questionBank";

import Register         from "./components/Register";
import Login            from "./components/Login";
import Dashboard        from "./components/Dashboard";
import AssessmentLayout from "./components/AssessmentLayout";
import Results          from "./components/Results";

export default function App() {
  const [step,    setStep]    = useState("register");
  const [profile, setProfile] = useState(null);
  const [user,    setUser]    = useState(null);
  const [mode,    setMode]    = useState(null);
  const [result,  setResult]  = useState(null);

  // ── Restore session on page refresh ────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: prof, error } = await supabase
          .from("users").select("*").eq("id", session.user.id).single();
        if (prof && !error) {
          setUser(session.user);
          setProfile(prof);
          setStep("dashboard");
        }
      }
    });

    // Listen for auth state changes (handles token refresh, external signout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
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

  const handleLoggedIn = (prof, authUser) => {
    setProfile(prof);
    setUser(authUser);
    setStep("dashboard");
  };

  // ── Sign out (call this from Dashboard's sign-out button) ──────────────────
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange above will clear state and redirect to login
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

    // Update UI immediately — don't wait for DB
    setResult({
      codingScore, mcqScore, totalScore, percentage,
      codingPassed, mcqCorrect, totalCoding, totalMCQ, totalMarks,
    });
    setStep("result");

    // Store in Supabase — log any error so it's easy to debug
    const { error } = await supabase.from("results").insert([{
      user_id:       user?.id       ?? null,
      name:          profile?.name  ?? null,
      email:         profile?.email ?? null,
      phone:         profile?.phone ?? null,
      stream:        profile?.stream ?? null,
      mode:          mode            ?? null,
      coding_score:  codingScore,
      mcq_score:     mcqScore,
      total_score:   totalScore,
      percentage,
      coding_passed: codingPassed ? 1 : 0,   // ← DB column is INTEGER, not boolean
      mcq_correct:   mcqCorrect,
    }]);

    if (error) {
      console.error("❌ Failed to store result in Supabase:", error.message, error.details);
    } else {
      console.log("✅ Result stored successfully");
    }
  };

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
          onSignOut={handleSignOut}   // ← pass down to Dashboard
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