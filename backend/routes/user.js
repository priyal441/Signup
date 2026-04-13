const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const verifyToken = require("../middleware/auth");

// ─── PROFILE ─────────────────────────────────────────────────────────────────

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true }
    });
    if (!user) return res.status(404).json({ message: "User not found!" });
    return res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ─── LOGIN HISTORY ────────────────────────────────────────────────────────────

router.get('/login-history', verifyToken, async (req, res) => {
  try {
    const history = await prisma.login_history.findMany({
      where: { user_id: req.user.id },
      orderBy: { login_time: 'desc' },
      take: 5
    });
    return res.status(200).json({ history });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────

router.put('/update-profile', verifyToken, async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone)
    return res.status(400).json({ message: "Name and phone required!" });
  try {
    const existing = await prisma.users.findFirst({
      where: { phone, NOT: { id: req.user.id } }
    });
    if (existing)
      return res.status(409).json({ message: "Phone no is already somebody else!" });

    await prisma.users.update({
      where: { id: req.user.id },
      data: { name, phone }
    });
    return res.status(200).json({ message: "Profile update ho gayi!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────

router.put('/change-password', verifyToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return res.status(400).json({ message: "Dono fields required hain!" });
  try {
    const user = await prisma.users.findUnique({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Old password is wrong!" });
    if (oldPassword === newPassword)
      return res.status(400).json({ message: "Naya password alag hona chahiye!" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });
    return res.status(200).json({ message: "Password change ho gaya!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;