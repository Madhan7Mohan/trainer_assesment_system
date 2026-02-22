import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { codingQuestions, mcqQuestions } from "./data/questionBank";

import Register          from "./components/Register";
import Login             from "./components/Login";
import TrainerDashboard  from "./components/Trainerdashboard";
import StudentDashboard  from "./components/Studentdashboard";
import AssessmentLayout  from "./components/AssessmentLayout";
import Results           from "./components/Results";

export default function App() {
  const [step,    setStep]    = useState("loading");
  const [profile, setProfile] = useState(null);
  const [user,    setUser]    = useState(null);
  const [mode,    setMode]    = useState(null);
  const [result,  setResult]  = useState(null);

  const loadProfile = async (authUser) => {
    const { data: prof, error } = await supabase
      .from("users").select("*").eq("id", authUser.id).single();
    if (prof && !error) {
      setUser(authUser); setProfile(prof); setStep("dashboard");
    } else {
      setUser(authUser);
      setProfile({ id: authUser.id, email: authUser.email, name: authUser.email, role: "student" });
      setStep("dashboard");
    }
  };

  useEffect(() => {
    let initialised = false;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) await loadProfile(session.user);
      else setStep("login");
      initialised = true;
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!initialised) return;
        if (event === "SIGNED_IN"  && session?.user) await loadProfile(session.user);
        if (event === "SIGNED_OUT") {
          setUser(null); setProfile(null); setMode(null); setResult(null);
          setStep("login");
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const handleRegistered = (prof, authUser) => { setProfile(prof); setUser(authUser); setStep("login"); };
  const handleLoggedIn   = async (_prof, authUser) => { await loadProfile(authUser); };
  const handleSignOut    = async () => { await supabase.auth.signOut(); };
  const handleModeSelect = (m) => { setMode(m); setStep("exam"); };
  const backToDashboard  = () => { setResult(null); setMode(null); setStep("dashboard"); };

  const submitExam = async (scores) => {
    const { codingScore, mcqScore, codingPassed, mcqCorrect, totalCoding, totalMCQ, totalMarks } = scores;
    const totalScore = codingScore + mcqScore;
    const percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;
    setResult({ ...scores, totalScore, percentage, avgScore: totalScore, avgPercentage: percentage });
    setStep("result");
    const { data: inserted, error: insertError } = await supabase.from("results").insert([{
      user_id: user?.id ?? null, name: profile?.name ?? null, email: profile?.email ?? null,
      phone: profile?.phone ?? null, stream: profile?.stream ?? null, mode: mode ?? null,
      coding_score: codingScore, mcq_score: mcqScore, total_score: totalScore,
      percentage, coding_passed: codingPassed ? 1 : 0, mcq_correct: mcqCorrect,
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

  if (step === "loading") return (
    <div style={{ minHeight:"100vh", background:"#060a14", display:"flex", alignItems:"center",
      justifyContent:"center", fontFamily:"'DM Mono',monospace", color:"#00ACC1", fontSize:13, letterSpacing:3 }}>
      LOADING...
    </div>
  );

  const isTrainer = profile?.role === "trainer";

  return (
    <div>
      {step === "register" && <Register onRegistered={handleRegistered} goToLogin={() => setStep("login")} />}
      {step === "login"    && <Login onLoggedIn={handleLoggedIn} goToRegister={() => setStep("register")} />}
      {step === "dashboard" && profile && isTrainer && (
        <TrainerDashboard profile={profile} onModeSelect={handleModeSelect} onSignOut={handleSignOut} />
      )}
      {step === "dashboard" && profile && !isTrainer && (
        <StudentDashboard profile={profile} onModeSelect={handleModeSelect} onSignOut={handleSignOut} />
      )}
      {step === "exam" && profile && (
        <AssessmentLayout trainer={{ ...profile, mode }} codingQuestions={codingQuestions}
          mcqQuestions={mcqQuestions} submitExam={submitExam} onExitPractice={backToDashboard} />
      )}
      {step === "result" && result && (
        <Results trainer={profile} result={result} onRetake={backToDashboard} />
      )}
    </div>
  );
}