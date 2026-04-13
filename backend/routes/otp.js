const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); 
};

// Step 1 — OTP bhejo
router.post("/send-otp", async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ message: "Sab fields required hain!" });
  }
  try {
    // Email pehle se registered toh nahi?
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });
    if (!existingUser) {
      return res.status(404).json({ message: "Email is not  registered!" });
    }
    // OTP generate karo
    const otp = generateOtp();

    // DB mein save karo
    await prisma.otp_verifications.create({
      data: {
        email,
        otp,
        is_used: false
      }
    });

    // Abhi sirf console mein dikhao (baad mein email bhejenge)
    // console.log(`OTP for ${email}: ${otp}`);

    return res.status(200).json({ 
      message: "OTP generate!",
      otp // ← testing ke liye, baad mein hata dena
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Step 2 — OTP verify karo
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP is required!" });
  }

  try {
  
    const latestOtp = await prisma.otp_verifications.findFirst({
      where: {
        email,
        is_used: false
      },
      orderBy: {
        created_at: "desc" // ← latest 
      }
    });

    if (!latestOtp) {
      return res.status(404).json({ message: "OTP is not found!" });
    }

    if (latestOtp.otp !== otp) {
      return res.status(401).json({ message: "OTP is wrong!" });
    }


    await prisma.otp_verifications.update({
      where: { id: latestOtp.id },
      data: { is_used: true }
    });

    return res.status(200).json({ message: "OTP verified!" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;