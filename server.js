const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// JSON Persistence Database file
const DB_FILE = path.join(__dirname, 'otp_db.json');

function loadDb() {
  if (!fs.existsSync(DB_FILE)) {
    return { otps: {}, users: {} };
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return { otps: {}, users: {} };
  }
}

function saveDb(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving DB:', e);
  }
}

// Serve static frontend files
app.use(express.static(__dirname));

// ===================================================
// API: 1) SEND OTP & STORE IN DATABASE
// ===================================================
app.post('/api/send-otp', (req, res) => {
  const { phone, name } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number is required.' });
  }

  const normalizedPhone = phone.replace(/\s/g, '');
  const db = loadDb();

  // 2) Generate a random 6-digit code
  const otp = String(Math.floor(100000 + Math.random() * 900000));

  // 3) Expiration time: 5 minutes from now
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  // Store in database
  db.otps[normalizedPhone] = {
    phone: normalizedPhone,
    name: name || (db.users[normalizedPhone] ? db.users[normalizedPhone].name : 'Guest'),
    otp: otp,
    expires: expiresAt,
    createdAt: new Date().toISOString()
  };

  saveDb(db);

  console.log(`\n[OTP DB STORED] Phone: ${normalizedPhone}`);
  console.log(`[OTP DB RECORD] ${JSON.stringify(db.otps[normalizedPhone], null, 2)}\n`);

  // 4) Send the code to the user
  return res.json({
    success: true,
    message: 'Verification code sent successfully!',
    otp: otp, // Passed for UI SMS notification bubble simulation
    expires: expiresAt,
    phone: normalizedPhone
  });
});

// ===================================================
// API: 5 & 6 & 7) VERIFY OTP & COMPARE WITH STORED CODE
// ===================================================
app.post('/api/verify-otp', (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ success: false, message: 'Phone number and verification code are required.' });
  }

  const normalizedPhone = phone.replace(/\s/g, '');
  const db = loadDb();
  const record = db.otps[normalizedPhone];

  // Check if OTP record exists
  if (!record) {
    return res.status(400).json({ success: false, message: 'No verification code requested for this phone number.' });
  }

  // Check expiration time (5 minutes)
  if (new Date() > new Date(record.expires)) {
    return res.status(400).json({ success: false, message: 'Code has expired. Please request a new code.' });
  }

  // 6) Compare entered code with stored code
  if (code !== record.otp) {
    return res.status(400).json({ success: false, message: 'Incorrect verification code. Please try again.' });
  }

  // 7) If correct, verify the user & update database
  const user = {
    name: record.name || 'Coffee Lover',
    phone: normalizedPhone,
    verifiedAt: new Date().toISOString(),
    points: db.users[normalizedPhone] ? db.users[normalizedPhone].points : 0
  };

  db.users[normalizedPhone] = user;
  delete db.otps[normalizedPhone]; // Clean up verified OTP
  saveDb(db);

  console.log(`\n[USER VERIFIED] Phone: ${normalizedPhone} | Name: ${user.name}\n`);

  return res.json({
    success: true,
    message: 'User verified successfully!',
    user: user
  });
});

// ===================================================
// API: RESEND OTP
// ===================================================
app.post('/api/resend-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number is required.' });
  }

  const normalizedPhone = phone.replace(/\s/g, '');
  const db = loadDb();
  const record = db.otps[normalizedPhone];

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  db.otps[normalizedPhone] = {
    phone: normalizedPhone,
    name: record ? record.name : 'Guest',
    otp: otp,
    expires: expiresAt,
    createdAt: new Date().toISOString()
  };

  saveDb(db);

  console.log(`\n[OTP RESENT & STORED] Phone: ${normalizedPhone} | Code: ${otp}\n`);

  return res.json({
    success: true,
    message: 'New verification code sent!',
    otp: otp,
    expires: expiresAt
  });
});

app.listen(PORT, () => {
  console.log(`☕ Coffee Place Backend Server running at http://localhost:${PORT}`);
});
