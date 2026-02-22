const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export const createAndSendOtp = async (email) => {
  try {
    const res = await fetch(`${BACKEND}/api/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Failed to send OTP" };
    return { error: null };
  } catch {
    return { error: "Cannot reach server. Is it running?" };
  }
};

export const verifyStoredOtp = async (email, otp) => {
  try {
    const res = await fetch(`${BACKEND}/api/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!res.ok || !data.valid) return { valid: false, error: data.error || "Verification failed" };
    return { valid: true, error: null };
  } catch {
    return { valid: false, error: "Cannot reach server. Is it running?" };
  }
};