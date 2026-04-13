import db from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { email, newPassword } = await req.json();

  if (!email || !newPassword) {
    return Response.json({ message: "All fields required" }, { status: 400 });
  }

  try {
    // Email exist karta hai?
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return Response.json({ message: "Email not found!" }, { status: 404 });
    }

    // Naya password hash karo
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Database mein update karo
    await db.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedPassword, email]
    );

    return Response.json({ message: "Password reset successful!" }, { status: 200 });

  } catch (error) {
    console.error(error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}