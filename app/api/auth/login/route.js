import db from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { email, password } = await req.json();

  
  if (!email || !password) {
    return Response.json({ message: "All fields required" }, { status: 400 });
  }

  try {
    // User dhundho
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return Response.json({ message: "User not found!" }, { status: 404 });
    }

    const user = rows[0];

    // Password check karo
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return Response.json({ message: "Wrong password!" }, { status: 401 });
    }

    // ← Login history save karo
    await db.query(
      "INSERT INTO login_history (user_id, email) VALUES (?, ?)",
      [user.id, email]
    );

    return Response.json({ message: "Login successful!" }, { status: 200 });

  } catch (error) {
    console.error(error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}


// import db from "@/lib/db";
// import bcrypt from "bcryptjs";

// export async function POST(req) {
//   const { email, password } = await req.json();

//   if (!email || !password) {
//     return Response.json({ message: "All fields required" }, { status: 400 });
//   }

//   try {
//     // Email se user dhundho MySQL mein
//     const [rows] = await db.query(
//       "SELECT * FROM users WHERE email = ?",
//       [email]
//     );

//     // User mila ya nahi
//     if (rows.length === 0) {
//       return Response.json({ message: "User not found!" }, { status: 404 });
//     }

//     const user = rows[0];

//     // Password check karo
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return Response.json({ message: "Wrong password!" }, { status: 401 });
//     }

//     return Response.json({ message: "Login successful!" }, { status: 200 });

//   } catch (error) {
//     console.error(error);
//     return Response.json({ message: "Server error" }, { status: 500 });
//   }
// }

// // import { users } from "@/lib/db";
// // import bcrypt from "bcryptjs";

// // export async function POST(req) {
// //   const { name, password } = await req.json();

// //   if (!name || !password) {
// //     return Response.json({ message: "All fields required" }, { status: 400 });
// //   }

// //   const user = users.find((u) => u.name === name);

// //   if (!user) {
// //     return Response.json({ message: "User not found!" }, { status: 404 });
// //   }

 
// //   // Password compare karo — bcrypt khud decode karke check karega
// //   const isMatch = await bcrypt.compare(password, user.password);
// //   //                      ↑
// //   //              plain password vs hashed password compare

// //   if (!isMatch) {
// //     return Response.json({ message: "Wrong password!" }, { status: 401 });
// //   }

// //   return Response.json({ message: "Login successful!" }, { status: 200 });

// // }



