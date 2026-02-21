import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { codingQuestions, mcqQuestions } from "./data/questionBank";

import Register         from "./components/Register";
import OTPVerify        from "./components/OTPVerify";
import Login            from "./components/Login";
import Dashboard        from "./components/Dashboard";
import AssessmentLayout from "./components/AssessmentLayout";
import Results          from "./components/Results";

export default function App() {
  const [step,           setStep]           = useState("register");
  const [authEmail,      setAuthEmail]      = useState("");
  const [pendingProfile, setPendingProfile] = useState(null); // held until OTP verified
  const [profile,        setProfile]        = useState(null); // public.users row
  const [user,           setUser]           = useState(null); // supabase auth user
  const [mode,           setMode]           = useState(null);
  const [result,         setResult]         = useState(null);

  // ── Restore session on page refresh ─────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
        setStep("dashboard");
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
    });
    return () => listener?.subscription?.unsubscribe();
  }, []);

  const fetchProfile = async (uid) => {
    const { data, error } = await supabase
      .from("users").select("*").eq("id", uid).single();
    if (data) { setProfile(data); setStep("dashboard"); }
    else console.error("fetchProfile error:", error?.message);
  };

  // Register sends (email, profileData) — profile NOT saved to DB yet
  const handleRegistered = (email, profileData) => {
    setAuthEmail(email);
    setPendingProfile(profileData); // passed to OTPVerify
    setStep("otp");
  };

  // OTPVerify inserts the profile row AFTER session is confirmed, then calls this
  const handleOTPVerified = () => {
    setPendingProfile(null);
    setStep("login");
  };

  const handleLoggedIn = async (authUser) => {
    setUser(authUser);
    await fetchProfile(authUser.id);
  };

  const handleModeSelect = (m) => { setMode(m); setStep("exam"); };
  const backToDashboard  = () => { setResult(null); setMode(null); setStep("dashboard"); };

  const submitExam = async (scores) => {
    const { codingScore, mcqScore, codingPassed, mcqCorrect, totalCoding, totalMCQ, totalMarks } = scores;
    const totalScore = codingScore + mcqScore;
    const percentage = Math.round((totalScore / totalMarks) * 100);

    setResult({ codingScore, mcqScore, totalScore, percentage, codingPassed, mcqCorrect, totalCoding, totalMCQ, totalMarks });
    setStep("result");

    const { error } = await supabase.from("results").insert([{
      user_id:       user?.id,
      name:          profile?.name,
      email:         profile?.email,
      phone:         profile?.phone,
      stream:        profile?.stream,
      mode,
      coding_score:  codingScore,
      mcq_score:     mcqScore,
      total_score:   totalScore,
      percentage,
      coding_passed: codingPassed,
      mcq_correct:   mcqCorrect,
    }]);
    if (error) console.error("Result insert error:", error.message);
  };

  return (
    <div>
      {step === "register" && (
        <Register
          onRegistered={handleRegistered}
          goToLogin={() => setStep("login")}
        />
      )}
      {step === "otp" && (
        <OTPVerify
          email={authEmail}
          pendingProfile={pendingProfile}
          onVerified={handleOTPVerified}
        />
      )}
      {step === "login" && (
        <Login
          onLoggedIn={handleLoggedIn}
          goToRegister={() => setStep("register")}
        />
      )}
      {step === "dashboard" && profile && (
        <Dashboard user={profile} onModeSelect={handleModeSelect} />
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