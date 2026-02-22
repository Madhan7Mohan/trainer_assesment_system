require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Send OTP endpoint
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const { data, error } = await resend.emails.send({
      from: 'hr@thopstech.com',
      to: email,
      subject: 'Your Trainer Assessment OTP',
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2 style="margin-bottom:8px">Trainer Assessment</h2>
        <p>Your OTP code is:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:8px;margin:10px 0">${otp}</p>
        <p>This code expires in 10 minutes.</p>
      </div>`,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
