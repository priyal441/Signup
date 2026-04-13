"use client";
import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [message, setMessage] = useState("");

  // Step 1 — OTP bhejo
  const handleSendOtp = async () => {
    const newErrors = {};

    if (!name) newErrors.name = "Name is required";

    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const res = await fetch("http://localhost:5000/api/otp/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, phone }),
    });

    const data = await res.json();

    if (res.ok) {
      setOtpSent(true);
      // setMessage(`OTP generate hua: ${data.otp}`);
    } else {
      setErrors({ email: data.message });
    }
  };

  // Step 2 — OTP verify karo
  const handleVerifyOtp = async () => {
    if (!otp) {
      setErrors({ otp: "OTP required hai!" });
      return;
    }

    setErrors({});

    const res = await fetch("http://localhost:5000/api/otp/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (res.ok) {
      setOtpVerified(true);
      setMessage("");
    } else {
      setErrors({ otp: data.message });
    }
  };

  // Step 3 — Password reset karo
  const handleReset = async () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword }),
    });

    const data = await res.json();

    if (res.ok) {
      setSuccess(true);
    } else {
      setErrors({ newPassword: data.message });
    }
  };

  // Success screen
  if (success) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#0f172a" }}>
        <div style={{ width: "320px", padding: "30px", borderRadius: "10px", backgroundColor: "#1e293b", textAlign: "center" }}>
          <h2 style={{ color: "#22c55e", marginBottom: "10px" }}>✅ Password Reset!</h2>
          <p style={{ color: "white", marginBottom: "20px" }}>
            Password successfully reset ho gaya!
          </p>
          <a href="/login">
            <button style={{ width: "100%", padding: "10px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              Go to Login
            </button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#0f172a" }}>
      <div style={{ width: "320px", padding: "20px", borderRadius: "10px", backgroundColor: "#1e293b", boxShadow: "0 0 10px rgba(0,0,0,0.5)" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "white" }}>
          Reset Password
        </h2>

        {/* Name Input */}
        <input
          type="text"
          placeholder="Enter your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={otpSent}
          style={{
            width: "100%", padding: "10px", marginBottom: "4px",
            borderRadius: "5px",
            border: errors.name ? "1px solid red" : "1px solid #ccc",
            backgroundColor: otpSent ? "#334155" : "white",
            color: otpSent ? "#94a3b8" : "black",
            boxSizing: "border-box",
          }}
        />
        {errors.name && (
          <p style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}>
            ❌ {errors.name}
          </p>
        )}

        {/* Phone Input */}
        <input
          type="tel"
          placeholder="Enter your Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={otpSent}
          style={{
            width: "100%", padding: "10px", marginBottom: "4px",
            borderRadius: "5px",
            border: errors.phone ? "1px solid red" : "1px solid #ccc",
            backgroundColor: otpSent ? "#334155" : "white",
            color: otpSent ? "#94a3b8" : "black",
            boxSizing: "border-box",
          }}
        />
        {errors.phone && (
          <p style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}>
            ❌ {errors.phone}
          </p>
        )}

        {/* Email Input */}
        <input
          type="email"
          placeholder="Enter your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={otpSent}
          style={{
            width: "100%", padding: "10px", marginBottom: "4px",
            borderRadius: "5px",
            border: errors.email ? "1px solid red" : "1px solid #ccc",
            backgroundColor: otpSent ? "#334155" : "white",
            color: otpSent ? "#94a3b8" : "black",
            boxSizing: "border-box",
          }}
        />
        {errors.email && (
          <p style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}>
            ❌ {errors.email}
          </p>
        )}

        {/* OTP bheja — message dikhao */}
        {message && (
          <p style={{ color: "#22c55e", fontSize: "13px", marginBottom: "10px" }}>
            ✅ {message}
          </p>
        )}

        {/* Send OTP button */}
        {!otpSent && (
          <button
            onClick={handleSendOtp}
            disabled={!email || !name || !phone}
            style={{
              width: "100%", padding: "10px", marginBottom: "10px",
              backgroundColor: (!email || !name || !phone) ? "#94a3b8" : "#3b82f6",
              color: "white", border: "none", borderRadius: "5px",
              cursor: (!email || !name || !phone) ? "not-allowed" : "pointer",
            }}
          >
            Send OTP
          </button>
        )}

        {/* Step 2 — OTP Input */}
        {otpSent && !otpVerified && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{
                width: "100%", padding: "10px", marginBottom: "4px",
                borderRadius: "5px",
                border: errors.otp ? "1px solid red" : "1px solid #ccc",
                boxSizing: "border-box",
              }}
            />
            {errors.otp && (
              <p style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}>
                ❌ {errors.otp}
              </p>
            )}
            <button
              onClick={handleVerifyOtp}
              disabled={!otp}
              style={{
                width: "100%", padding: "10px", marginBottom: "10px",
                backgroundColor: !otp ? "#94a3b8" : "#22c55e",
                color: "white", border: "none", borderRadius: "5px",
                cursor: !otp ? "not-allowed" : "pointer",
              }}
            >
              Verify OTP
            </button>

            {/* Resend OTP */}
            <p
              onClick={handleSendOtp}
              style={{ color: "#3b82f6", fontSize: "12px", textAlign: "center", cursor: "pointer" }}
            >
              🔄 Resend OTP
            </p>
          </>
        )}

        {/* Step 3 — Naya Password */}
        {otpVerified && (
          <>
            <p style={{ color: "#22c55e", fontSize: "13px", marginBottom: "10px" }}>
              ✅ OTP verified!
            </p>
            <input
              type="password"
              placeholder="Enter New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                width: "100%", padding: "10px", marginBottom: "4px",
                borderRadius: "5px",
                border: errors.newPassword ? "1px solid red" : "1px solid #ccc",
                boxSizing: "border-box",
              }}
            />
            {errors.newPassword && (
              <p style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}>
                ❌ {errors.newPassword}
              </p>
            )}
            <button
              onClick={handleReset}
              disabled={!newPassword}
              style={{
                width: "100%", padding: "10px", marginTop: "5px",
                backgroundColor: !newPassword ? "#94a3b8" : "#3b82f6",
                color: "white", border: "none", borderRadius: "5px",
                cursor: !newPassword ? "not-allowed" : "pointer",
              }}
            >
              Reset Password
            </button>
          </>
        )}

        <p style={{ textAlign: "center", marginTop: "10px" }}>
          <a href="/login" style={{ color: "#3b82f6", fontSize: "12px" }}>
            Back to Login
          </a>
        </p>
      </div>
    </div>
  );
}
// "use client";
// import { useState } from "react";

// export default function ForgotPassword() {
//   const [email, setEmail] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [errors, setErrors] = useState({});
//   const [success, setSuccess] = useState(false);

//   const handleReset = async () => {
//     const newErrors = {};

//     if (!email) {
//       newErrors.email = "Email is required";
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       newErrors.email = "Enter a valid email";
//     }

//     if (!newPassword) {
//       newErrors.newPassword = "New password is required";
//     } else if (newPassword.length < 6) {
//       newErrors.newPassword = "Password must be at least 6 characters";
//     }
//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }


//     setErrors({});

//     const res = await fetch("/api/auth/forgot-password", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, newPassword }),
//     });

//     const data = await res.json();

//     if (res.ok) {
//       setSuccess(true);
//     } else {
//       setErrors({ email: data.message });
//     }
//   };

//   if (success) {
//     return (
//       <div style={{ display: "flex", justifyContent:"center", alignItems: "center", height: "100vh", backgroundColor: "#0f172a" }}>
//         <div style={{ width: "320px", padding: "30px", borderRadius: "10px", backgroundColor: "#1e293b", textAlign: "center" }}>
//           <h2 style={{ color: "#22c55e", marginBottom: "10px" }}>✅ Password Reset!</h2>
//           <p style={{ color: "white", marginBottom: "20px" }}>
//             Your password has been reset successfully!
//           </p>
//           <a href="/login">
//             <button style={{ width: "100%", padding: "10px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
//               Go to Login
//             </button>
//           </a>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#0f172a" }}>
//       <div style={{ width: "320px", padding: "20px", borderRadius: "10px", backgroundColor: "#1e293b", boxShadow: "0 0 10px rgba(0,0,0,0.5)" }}>
//         <h2 style={{ textAlign: "center", marginBottom: "20px", color: "white" }}>
//           Reset Password
//         </h2>

//         {/* Email Input */}
//         <input
//           type="email"
//           placeholder="Enter your Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           style={{
//             width: "100%", padding: "10px", marginBottom: "4px",
//             borderRadius: "5px",
//             border: errors.email ? "1px solid red" : "1px solid #ccc",
//           }}
//         />
//         {errors.email && (
//           <p style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}>
//             ❌ {errors.email}
//           </p>
//         )}

//         {/* New Password Input */}
//         <input
//           type="password"
//           placeholder="Enter New Password"
//           value={newPassword}
//           onChange={(e) => setNewPassword(e.target.value)}
//           style={{
//             width: "100%", padding: "10px", marginBottom: "4px",
//             borderRadius: "5px",
//             border: errors.newPassword ? "1px solid red" : "1px solid #ccc",
//           }}
//         />
//         {errors.newPassword && (
//           <p style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}>
//             ❌ {errors.newPassword}
//           </p>
//         )}

//         <button
//           onClick={handleReset}
//           disabled={!email || !newPassword}
//           style={{
//             width: "100%", padding: "10px", marginTop: "5px",
//             backgroundColor: !email || !newPassword ? "#94a3b8" : "#3b82f6",
//             color: "white", border: "none", borderRadius: "5px",
//             cursor: !email || !newPassword ? "not-allowed" : "pointer",
//           }}
//         >
//           Reset Password
//         </button>
//         <p style={{ textAlign: "center", marginTop: "10px" }}>
//           <a href="/login" style={{ color: "#3b82f6", fontSize: "12px" }}>
//             Back to Login
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }