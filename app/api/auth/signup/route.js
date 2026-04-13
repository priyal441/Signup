import db from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { name, email, phone, password } = await req.json();

  if (!name || !email || !phone || !password) {
    return Response.json({ message: "All fields required" }, { status: 400 });
  }

  
  try {
    // Duplicate email check
    const [existingEmail] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingEmail.length > 0) {
      return Response.json({ message: "Email already registered! Please use another email." }, { status: 409 });
    }

    // Duplicate phone check
    const [existingPhone] = await db.query(
      "SELECT * FROM users WHERE phone = ?",
      [phone]
    );
    if (existingPhone.length > 0) {
      return Response.json({ message: "Phone already registered! Please use another number." }, { status: 409 });
    }


    // Password hash karo
    const hashedPassword = await bcrypt.hash(password, 10);

    // MySQL mein save karo
    await db.query(
      "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)",
      [name, email, phone, hashedPassword]
    );

    return Response.json({ message: "User created" }, { status: 201 });//201- usercreated 

  } catch (error) {
    console.error(error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}