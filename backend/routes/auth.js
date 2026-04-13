const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const verifyToken = require("../middleware/auth");
const crypto = require("crypto");

// ─── Helper ───────────────────────────────────────────────────────────────────

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

//─── SIGNUP ───────────────────────────────────────────────────────────────────

router.post("/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password)
    return res.status(400).json({ message: "All fields required" });

  try {
    const existingEmail = await prisma.users.findUnique({ where: { email } });
    if (existingEmail)
      return res.status(409).json({ message: "Email already registered!" });

    const existingPhone = await prisma.users.findUnique({ where: { phone } });
    if (existingPhone)
      return res.status(409).json({ message: "Phone already registered!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.users.create({
      data: { name, email, phone, password: hashedPassword },
    });
    return res.status(201).json({ message: "User created!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "All fields required" });

  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials!" });

    const { accessToken, refreshToken } = generateTokens(user);

    // ✅ Session aur login history alag try/catch mein — error clearly dikhe
    let sessionId = null;

    try {
      // Login history
      await prisma.login_history.create({
        data: { user_id: user.id, email },
      });
      console.log("✅ login_history saved");
    } catch (err) {
      console.error("❌ login_history ERROR:", err.message);
    }

    try {
      // Session create
      sessionId = crypto.randomBytes(32).toString("hex");
      await prisma.sessions.create({
        data: {
          session_id: sessionId,
          user_id: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      console.log("✅ session saved:", sessionId);

      // Cookie set
      res.cookie("sessionId", sessionId, {
        httpOnly: true,
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
        // secure: true  // production mein uncomment karo
      });

    } catch (err) {
      console.error("❌ sessions CREATE ERROR:", err.message);
      sessionId = null; // null bhejo agar fail hua
    }

    // console.log("📤 Sending response with sessionId:", sessionId);

    return res.status(200).json({
      message: "Login successful!",
      accessToken,
      refreshToken,
      sessionId,
    });

  } catch (error) {
    console.error("❌ LOGIN MAIN ERROR:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// ─── LOGOUT ───────────────────────────────────────────────────────────────────

router.post("/logout", async (req, res) => {
  const sessionId = req.cookies?.sessionId;

  if (sessionId) {
    try {
      await prisma.sessions.deleteMany({
        where: { session_id: sessionId },
      });
    } catch (err) {
      console.error("❌ Logout session delete error:", err.message);
    }
  }

  res.clearCookie("sessionId", { path: "/" });
  return res.status(200).json({ message: "Logged out successfully!" });
});

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────

router.post("/forgot-password", async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword)
    return res.status(400).json({ message: "All fields required" });

  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user)
      return res.status(404).json({ message: "Email not found!" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });
    return res.status(200).json({ message: "Password reset successful!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

router.get("/dashboard", verifyToken, (req, res) => {
  res.json({ message: "Welcome to dashboard!", user: req.user });
});

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: "Refresh token not found!" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(401).json({ message: "Refresh token invalid!" });
  }
});

module.exports = router;