const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || "re_9Zt4Q8CC_B5R3z5oNi5usqpWRZooY3wT5";
const OTP_STORAGE_KEY = "trainer_assessment_otp";
const OTP_EXPIRY_MS = 10 * 60 * 1000;

const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;

const readOtpStore = () => {
  try {
    return JSON.parse(sessionStorage.getItem(OTP_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const writeOtpStore = (store) => {
  sessionStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(store));
};

export const createAndSendOtp = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const otp = generateOtp();

  const payload = {
    from: "Trainer Assessment <onboarding@resend.dev>",
    to: [normalizedEmail],
    subject: "Your Trainer Assessment OTP",
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6">
      <h2 style="margin-bottom:8px">Trainer Assessment</h2>
      <p>Your OTP code is:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:8px;margin:10px 0">${otp}</p>
      <p>This code expires in 10 minutes.</p>
    </div>`,
  };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let msg = "Failed to send OTP email.";
    try {
      const body = await response.json();
      msg = body?.message || msg;
    } catch {
      // no-op
    }
    return { error: msg };
  }

  const store = readOtpStore();
  store[normalizedEmail] = {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  };
  writeOtpStore(store);

  return { error: null };
};

export const verifyStoredOtp = (email, otp) => {
  const normalizedEmail = email.trim().toLowerCase();
  const store = readOtpStore();
  const entry = store[normalizedEmail];

  if (!entry) return { valid: false, error: "No OTP found. Please resend OTP." };
  if (Date.now() > entry.expiresAt) return { valid: false, error: "OTP expired. Please resend OTP." };
  if (entry.otp !== otp) return { valid: false, error: "Invalid OTP. Please try again." };

  delete store[normalizedEmail];
  writeOtpStore(store);
  return { valid: true, error: null };
};
