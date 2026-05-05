const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const passport = require('passport');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

console.log(`[AUTH] SMTP Config Check: user=${!!process.env.SMTP_EMAIL}, pass=${!!process.env.SMTP_PASSWORD}`);
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  },
  logger: true,
  debug: true,
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000
});

// Helper to send OTP
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Gridox Fashion" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: 'Gridox - Your Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
        <h2 style="color: #ff0000; text-align: center;">Gridox Verification</h2>
        <p>Hello,</p>
        <p>Your verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 10px; background: #f9f9f9; border-radius: 5px; color: #333; letter-spacing: 5px;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 14px; text-align: center; margin-top: 20px;">
          This code will expire in 10 minutes. If you didn't request this, please ignore this email.
        </p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

// Helper to generate tokens
const generateTokens = (user) => {
  if (!user || !user._id) {
    console.error('[AUTH] Cannot generate tokens: Invalid user object', user);
    throw new Error('Invalid user object for token generation');
  }

  const accessToken = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// POST /send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { email, type } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const trimmedEmail = email.trim().toLowerCase();

    // If login, check if user exists
    if (type === 'login') {
      const user = await User.findOne({ email: trimmedEmail });
      if (!user) {
        return res.status(404).json({ message: 'No account found with this email' });
      }
    }

    // If signup, check if user already exists
    if (type === 'signup') {
      const user = await User.findOne({ email: trimmedEmail });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to DB
    await OTP.findOneAndUpdate(
      { email: trimmedEmail },
      { otp, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    // Send Email
    console.log(`[AUTH] Sending OTP ${otp} to ${trimmedEmail}...`);
    try {
      await sendOTPEmail(trimmedEmail, otp);
      console.log(`[AUTH] OTP email sent successfully to ${trimmedEmail}`);
    } catch (mailError) {
      console.error(`[AUTH] Failed to send OTP email to ${trimmedEmail}:`, mailError);
      // Still return 200 in development if SMTP fails, so developer can see the OTP in logs
      if (process.env.NODE_ENV !== 'production') {
        return res.status(200).json({ 
          message: 'OTP sent (Email failed, check server logs)', 
          devOtp: otp,
          warning: 'SMTP error: ' + mailError.message 
        });
      }
      return res.status(500).json({ 
        message: 'Failed to send verification email. Please try again later.', 
        error: mailError.message 
      });
    }

    res.status(200).json({ message: 'OTP sent successfully to your email' });
  } catch (error) {
    console.error('[AUTH] /send-otp global error:', error);
    res.status(500).json({ message: 'Error processing request', error: error.message });
  }
});

// POST /signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    console.log(`[AUTH] Signup attempt: email=${email}, name=${name}, hasPassword=${!!password}, hasOtp=${!!otp}`);

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: 'All fields (Name, Email, Password, OTP) are required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.trim();

    // Verify OTP
    console.log(`[AUTH] Verifying OTP for signup: ${trimmedEmail} -> ${trimmedOtp}`);
    const otpRecord = await OTP.findOne({ email: trimmedEmail, otp: trimmedOtp });
    if (!otpRecord) {
      console.log(`[AUTH] OTP verification failed for ${trimmedEmail}`);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    let user = await User.findOne({ email: trimmedEmail });
    if (user) {
      console.log(`[AUTH] Signup failed: User already exists (${trimmedEmail})`);
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log(`[AUTH] Creating new user: ${trimmedEmail}`);
    user = new User({ name, email: trimmedEmail, password });
    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;

    await user.save();
    console.log(`[AUTH] User saved successfully: ${trimmedEmail}`);

    // Delete OTP after successful signup
    await OTP.deleteOne({ email: trimmedEmail });

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    };

    res.cookie('accessToken', tokens.accessToken, cookieOptions);
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

    console.log(`[AUTH] Signup complete for ${trimmedEmail}. Cookies set.`);
    res.status(201).json({ message: 'User created successfully', user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error('[AUTH] Signup error:', error);
    res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    const trimmedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
      console.log(`[AUTH] Login failed: User ${trimmedEmail} not found`);
      return res.status(404).json({ 
        message: 'No account found with this email',
        debug: {
          db: mongoose.connection.name,
          host: mongoose.connection.host,
          timestamp: new Date().toISOString()
        }
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`[AUTH] Login failed: Incorrect password for ${trimmedEmail}`);
      return res.status(401).json({ 
        message: 'Incorrect password. Please try again.',
        debug: {
          db: mongoose.connection.name,
          timestamp: new Date().toISOString()
        }
      });
    }

    // If OTP is not provided, it's the first step of login
    if (!otp) {
      // Generate and send OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      await OTP.findOneAndUpdate(
        { email: trimmedEmail },
        { otp: generatedOtp, createdAt: Date.now() },
        { upsert: true, new: true }
      );
      
      console.log(`[AUTH] Login OTP for ${trimmedEmail}: ${generatedOtp}`);
      
      try {
        await sendOTPEmail(trimmedEmail, generatedOtp);
        console.log(`Login OTP emailed successfully to ${trimmedEmail}`);
      } catch (mailError) {
        console.error(`[AUTH] Failed to email login OTP:`, mailError);
        return res.status(500).json({ 
          message: 'Failed to send verification email. Please try again later.',
          error: mailError.message 
        });
      }
      
      return res.status(200).json({ message: 'OTP sent to your email', otpRequired: true });
    }

    // Verify OTP
    const trimmedOtp = otp.trim();

    console.log(`[AUTH] Verifying Login OTP for ${trimmedEmail}: ${trimmedOtp}`);
    const otpRecord = await OTP.findOne({ email: trimmedEmail, otp: trimmedOtp });
    
    if (!otpRecord) {
      console.log(`[AUTH] Invalid OTP for ${trimmedEmail}. Entered: ${trimmedOtp}`);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    console.log(`[AUTH] OTP valid for ${trimmedEmail}. Generating tokens...`);
    const tokens = generateTokens(user);
    
    console.log(`[AUTH] Tokens generated for ${trimmedEmail}. Updating user...`);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    console.log(`[AUTH] User updated. Deleting OTP record for ${trimmedEmail}...`);
    // Delete OTP after successful login
    await OTP.deleteOne({ email: trimmedEmail });

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    };

    res.cookie('accessToken', tokens.accessToken, cookieOptions);
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

    console.log(`[AUTH] Login complete for ${trimmedEmail}. Cookies set.`);
    res.status(200).json({ message: 'Login successful', user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

/* --- GOOGLE OAUTH ROUTES --- */

router.get('/google', (req, res, next) => {
  const referer = req.headers.referer || '';
  let targetFrontend = process.env.FRONTEND_URL || 'https://griddox.vercel.app';

  if (referer.includes('localhost') || referer.includes('127.0.0.1')) {
    try {
      const refUrl = new URL(referer);
      targetFrontend = `${refUrl.protocol}//${refUrl.host}`;
    } catch (e) {
      targetFrontend = 'http://localhost:8080';
    }
  } else if (referer.includes('ownersite') || referer.includes('owner')) {
    targetFrontend = 'https://ownersite-psi.vercel.app';
  }

  const redirectPath = req.query.redirect || '';

  res.cookie('auth_redirect_to', targetFrontend, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 5 * 60 * 1000 // 5 minutes
  });

  if (redirectPath) {
    res.cookie('auth_final_redirect', redirectPath, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 5 * 60 * 1000
    });
  }

  let host = req.get('host');
  
  // If on localhost, try to use the referer's host (e.g. localhost:8080)
  // because Google will redirect to that host, and Vite proxy will forward it to us.
  // This is often what users have configured in their Google Console.
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    if (referer && (referer.includes('localhost') || referer.includes('127.0.0.1'))) {
      try {
        const refUrl = new URL(referer);
        host = refUrl.host;
      } catch (e) {}
    }
  }

  if (host.includes('127.0.0.1')) {
    host = host.replace('127.0.0.1', 'localhost');
  }
  
  // Ensure we use https for callback URL in production (unless it's localhost)
  const protocol = (host.includes('localhost') || host.includes('127.0.0.1')) ? 'http' : 'https';
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || `${protocol}://${host}/api/auth/google/callback`;

  console.log(`[AUTH] Google Login Attempt - Host: ${req.get('host')}, Referer: ${referer}, Constructed Callback: ${callbackURL}`);

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    callbackURL
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  const referer = req.headers.referer || '';
  let host = req.get('host');
  
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    if (referer && (referer.includes('localhost') || referer.includes('127.0.0.1'))) {
      try {
        const refUrl = new URL(referer);
        host = refUrl.host;
      } catch (e) {}
    }
  }

  if (host.includes('127.0.0.1')) {
    host = host.replace('127.0.0.1', 'localhost');
  }
  
  const protocol = (host.includes('localhost') || host.includes('127.0.0.1')) ? 'http' : 'https';
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || `${protocol}://${host}/api/auth/google/callback`;

  console.log(`[AUTH] Google Callback Received - Host: ${req.get('host')}, Constructed Callback: ${callbackURL}`);

  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'https://griddox.vercel.app'}/auth?error=google_failed`,
    session: false,
    callbackURL
  })(req, res, next);
}, async (req, res) => {
  console.log('--- GOOGLE AUTH SUCCESS CALLBACK ---');
  try {
    if (!req.user) {
      console.error('[GOOGLE AUTH] No user object found in request');
      const fallback = req.cookies.auth_redirect_to || process.env.FRONTEND_URL || 'https://griddox.vercel.app';
      return res.redirect(`${fallback}/auth?error=no_user`);
    }

    const userEmail = req.user.email || (req.user._json && req.user._json.email);
    console.log(`[GOOGLE AUTH] Authenticated user: ${userEmail}`);

    if (!userEmail) {
      console.error('[GOOGLE AUTH] No email found in Google profile');
      const fallback = req.cookies.auth_redirect_to || process.env.FRONTEND_URL;
      return res.redirect(`${fallback}/auth?error=no_email`);
    }

    // Generate and save OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const trimmedEmail = userEmail.trim().toLowerCase();

    console.log(`[GOOGLE AUTH] Step 1: Saving OTP ${otp} for ${trimmedEmail}`);
    await OTP.findOneAndUpdate(
      { email: trimmedEmail },
      { otp, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    console.log(`[GOOGLE AUTH] Step 2: Attempting to email OTP...`);
    try {
      await sendOTPEmail(trimmedEmail, otp);
      console.log(`[GOOGLE AUTH] Email sent successfully to ${trimmedEmail}`);
    } catch (mailError) {
      console.error(`[GOOGLE AUTH] Email failed:`, mailError.message);
      // Don't block the user if email fails in dev
      if (process.env.NODE_ENV === 'production') {
        const fallback = req.cookies.auth_redirect_to || process.env.FRONTEND_URL;
        return res.redirect(`${fallback}/auth?error=email_failed`);
      }
    }

    // Set a temporary cookie to identify the pending Google user
    res.cookie('pending_google_email', userEmail, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 10 * 60 * 1000, // 10 minutes
      path: '/'
    });

    const redirectTo = req.cookies.auth_redirect_to || process.env.FRONTEND_URL || 'https://griddox.vercel.app';
    const finalRedirect = req.cookies.auth_final_redirect || '';

    let url = `${redirectTo}/auth?google_otp=true&email=${encodeURIComponent(userEmail)}`;
    if (finalRedirect) {
      url += `&redirect=${encodeURIComponent(finalRedirect)}`;
    }

    console.log(`[GOOGLE AUTH] Step 3: Redirecting user to frontend: ${url}`);
    
    res.clearCookie('auth_final_redirect', { secure: true, sameSite: 'none', path: '/' });
    res.redirect(url);
  } catch (error) {
    console.error('[GOOGLE AUTH] CRITICAL CALLBACK ERROR:', error);
    const fallback = req.cookies.auth_redirect_to || process.env.FRONTEND_URL;
    res.redirect(`${fallback}/auth?error=callback_err&msg=${encodeURIComponent(error.message)}`);
  }
});

// POST /google/verify-otp
router.post('/google/verify-otp', async (req, res) => {
  try {
    const { otp, email: emailFromBody } = req.body;
    const rawEmail = req.cookies.pending_google_email || emailFromBody;

    if (!rawEmail) {
      console.log('[GOOGLE AUTH] No email found in session or body');
      return res.status(400).json({ message: 'Email session missing. Please try again.' });
    }

    const email = rawEmail.trim().toLowerCase();
    const trimmedOtp = otp ? otp.trim() : '';

    console.log(`[GOOGLE AUTH] Verifying OTP for ${email}: ${trimmedOtp}`);

    const otpRecord = await OTP.findOne({ email, otp: trimmedOtp });
    if (!otpRecord) {
      console.log(`[GOOGLE AUTH] Invalid OTP for ${email}`);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      // Auto-create user for Google sign-in if they don't exist
      user = new User({
        email,
        name: email.split('@')[0], // Fallback name
        password: Math.random().toString(36).slice(-10) // Random password
      });
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Cleanup
    await OTP.deleteOne({ email });
    res.clearCookie('pending_google_email', { secure: true, sameSite: 'none', path: '/' });

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    };

    res.cookie('accessToken', tokens.accessToken, cookieOptions);
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

    console.log(`[AUTH] Verification complete for ${email}. Cookies set.`);
    res.status(200).json({ message: 'Login successful', user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('accessToken', { secure: true, sameSite: 'none' });
  res.clearCookie('refreshToken', { secure: true, sameSite: 'none' });
  res.status(200).json({ message: 'Logged out successfully' });
});

// POST /admin-login
router.post('/admin-login', async (req, res) => {
  console.log('--- ADMIN LOGIN ATTEMPT ---', req.body.username);
  try {
    const { username, password } = req.body;

    // Find user by name (case-insensitive)
    const user = await User.findOne({ name: new RegExp(`^${username}$`, 'i') });

    if (!user) {
      return res.status(404).json({ message: 'Invalid credentials' });
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    };

    res.cookie('accessToken', tokens.accessToken, cookieOptions);
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

    res.status(200).json({
      message: 'Admin login successful',
      user: { name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
