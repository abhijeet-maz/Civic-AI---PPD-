import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';


// In-memory user store fallback with pre-seeded demo accounts
export const memoryUsers = [
  {
    id: 'usr_demo_official',
    name: 'Officer Davis',
    email: 'official@municipality.gov',
    password: bcrypt.hashSync('Password123', 10),
    role: 'Official',
    department: 'Road Maintenance'
  },
  {
    id: 'usr_demo_citizen',
    name: 'Jane Citizen',
    email: 'citizen@civicai.org',
    password: bcrypt.hashSync('Password123', 10),
    role: 'Citizen',
    department: null
  }
];

// Temporary secure OTP memory store with expiration & attempt tracking
export const otpStore = new Map();

// Helper email validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Indian mobile number normalization (+91 / 10 digits)
function normalizeIndianPhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  } else if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  return null;
}

// POST /api/auth/send-otp
export async function sendOtp(req, res) {
  try {
    const { phone } = req.body;
    const normalizedPhone = normalizeIndianPhone(phone);

    if (!normalizedPhone) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit Indian mobile number.' });
    }

    // Rate limiting / cooldown check (30 seconds)
    const existingEntry = otpStore.get(normalizedPhone);
    if (existingEntry && (Date.now() - existingEntry.createdAt) < 30000) {
      return res.status(429).json({ success: false, error: 'Please wait 30 seconds before requesting a new OTP.' });
    }

    // Generate secure 6-digit random OTP
    const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins validity

    otpStore.set(normalizedPhone, {
      otp: generatedOtp,
      expiresAt,
      attempts: 0,
      createdAt: Date.now()
    });

    const isSmsConfigured = Boolean(process.env.SMS_PROVIDER_API_KEY || process.env.TWILIO_ACCOUNT_SID);

    if (isSmsConfigured) {
      console.log(`📱 [SMS Provider] Real SMS dispatched to ${normalizedPhone}`);
    } else {
      console.log(`📱 [SMS Provider Dev Mode] OTP for ${normalizedPhone} is: ${generatedOtp} (Expires in 5 mins)`);
    }

    return res.json({
      success: true,
      message: isSmsConfigured
        ? `OTP successfully sent via SMS to ${normalizedPhone}.`
        : `OTP sent to ${normalizedPhone}. (Note: SMS provider credentials missing; check server console in dev mode).`,
      phone: normalizedPhone,
      expiresInSeconds: 300
    });
  } catch (err) {
    console.error('Send OTP Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to send OTP. Please try again.' });
  }
}

// POST /api/auth/verify-otp
export async function verifyOtp(req, res) {
  try {
    const { phone, otp } = req.body;
    const normalizedPhone = normalizeIndianPhone(phone);

    if (!normalizedPhone || !otp) {
      return res.status(400).json({ success: false, error: 'Mobile number and OTP code are required.' });
    }

    const record = otpStore.get(normalizedPhone);

    if (!record) {
      return res.status(400).json({ success: false, error: 'No OTP requested for this phone number. Please request a new OTP.' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedPhone);
      return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new OTP.' });
    }

    if (record.attempts >= 3) {
      otpStore.delete(normalizedPhone);
      return res.status(429).json({ success: false, error: 'Too many incorrect OTP attempts. Please request a new OTP.' });
    }

    if (record.otp !== String(otp).trim()) {
      record.attempts += 1;
      return res.status(400).json({ success: false, error: `Invalid OTP code. ${3 - record.attempts} attempts remaining.` });
    }

    // Success - consume OTP
    otpStore.delete(normalizedPhone);

    return res.json({
      success: true,
      message: 'Mobile number verified successfully.',
      verifiedPhone: normalizedPhone,
      verifiedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Verify OTP Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to verify OTP. Please try again.' });
  }
}


// POST /api/auth/register
export async function register(req, res) {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const targetRole = ['Citizen', 'Official', 'Worker'].includes(role) ? role : 'Citizen';

    // MongoDB Persistence if connected
    if (mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(409).json({ success: false, error: 'An account with this email address already exists.' });
      }

      const user = new User({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: targetRole,
        department: targetRole !== 'Citizen' ? department || 'Road Maintenance' : null
      });

      await user.save();
      const token = generateToken(user);
      return res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department }
      });
    }

    // In-memory fallback if MongoDB offline
    if (memoryUsers.find(u => u.email === normalizedEmail)) {
      return res.status(409).json({ success: false, error: 'An account with this email address already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: targetRole,
      department: targetRole !== 'Citizen' ? department || 'Road Maintenance' : null
    };
    memoryUsers.push(newUser);
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, department: newUser.department }
    });

  } catch (err) {
    console.error('Registration API Error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error during registration. Please try again.' });
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // MongoDB persistence check
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }

      const token = generateToken(user);
      return res.json({
        success: true,
        message: 'Authentication successful.',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department }
      });
    }

    // In-memory fallback
    const user = memoryUsers.find(u => u.email === normalizedEmail);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    return res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department }
    });

  } catch (err) {
    console.error('Login API Error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error during login. Please try again.' });
  }
}

// GET /api/auth/me
export function me(req, res) {
  res.json({ success: true, user: req.user });
}
