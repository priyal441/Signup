"use client";
import { useState } from "react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const[confirmPassword,setConfirmPassword]=useState("");
  const [errors, setErrors] = useState({});
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  const checkPasswordStrength = (pass) => {
    if (pass.length === 0) return "";
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^a-zA-Z0-9]/.test(pass)) strength++;
    if (strength <= 1) return "weak";
    if (strength === 2 || strength === 3) return "medium";
    return "strong";
  };

  const handleSignup = async () => {
    const newErrors = {};

    if (!name) {
      newErrors.name = "Name is required";
    } else if (!/^[a-zA-Z ]+$/.test(name)) {
      newErrors.name = "Name can only contain letters and numbers";
    } else if (name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]+$/.test(phone)) {
      newErrors.phone = "Phone number can only contain numbers";
    } else if (phone.length !== 10 && phone.length !== 11) {
      newErrors.phone = "Phone number must be exactly 10 or 11 digits";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (passwordStrength === "weak") {
      newErrors.password = "Password is too weak, make it stronger!";
    }
    if (!confirmPassword) {
  newErrors.confirmPassword = "Confirm Password is required";
} else if (password !== confirmPassword) {
  newErrors.confirmPassword = "Passwords do not match";
}

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const res = await fetch("http://localhost:5000/api/auth/signup", {
    
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setPasswordStrength("");
      setErrors({});
      setIsSignedUp(true);
    } else {
      const errorMsg = data.message;
      if (errorMsg.includes("Email")) {
        setErrors({ email: errorMsg });
      } else if (errorMsg.includes("Phone")) { // ← SIRF YE CHANGE HUA
        setErrors({ phone: errorMsg });
      } else {
        alert(errorMsg);
      }
    }
  };

  if (isSignedUp) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#0f172a" }}>
        <div style={{ width: "320px", padding: "30px", borderRadius: "10px", backgroundColor: "#1e293b", boxShadow: "0 0 10px rgba(0,0,0,0.5)", textAlign: "center" }}>
          <h2 style={{ color: "#22c55e", marginBottom: "10px" }}>🎉 Thank You!</h2>
          <p style={{ color: "white", marginBottom: "20px" }}>
            You are successfully signed up!
          </p>
          <a href="/login">
            <button style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}>
              Click here to Login
            </button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#0f172a" }}>
      <div style={{ width: "320px", padding: "20px", borderRadius: "10px", backgroundColor: "#1e293b", boxShadow: "0 0 10px rgba(0,0,0,0.5)" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "white" }}>Signup</h2>

        {/* Name Input */}
        <input
          type="text"
          placeholder="Name"
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "4px",
            borderRadius: "5px",
            border: errors.name ? "1px solid red" : "1px solid #ccc",
          }}
        />
        {errors.name && (
          <p style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}>
            ❌ {errors.name}
          </p>
        )}

        {/* Email Input */}
        <input
          type="email"
          placeholder="Email"
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "4px",
            borderRadius: "5px",
            border: errors.email ? "1px solid red" : "1px solid #ccc",
          }}
        />
        {errors.email && (
          <p style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}>
            ❌ {errors.email}
          </p>
        )}

        {/* Phone Input */}
        <input
          type="tel"
          placeholder="Phone Number"
          autoComplete="off"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "4px",

            borderRadius: "5px",
            border: errors.phone ? "1px solid red" : "1px solid #ccc",
          }}
        />
        {errors.phone && (
          <p style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}>
            ❌ {errors.phone}
          </p>
        )}

        {/* Password Input */}
        <input
          type="password"
          placeholder="Password"
          autoComplete="off"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordStrength(checkPasswordStrength(e.target.value));
          }}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "4px",
            borderRadius: "5px",
            border: errors.password ? "1px solid red" : "1px solid #ccc",
          }}
        />

        {/* Password Strength Bar */}
        {password && (
          <div style={{ marginBottom: "8px" }}>
            <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
              <div style={{
                height: "4px", flex: 1, borderRadius: "2px",
                backgroundColor: passwordStrength === "weak" || passwordStrength === "medium" || passwordStrength === "strong" ? "#ef4444" : "#374151"
              }} />
              <div style={{
                height: "4px", flex: 1, borderRadius: "2px",
                backgroundColor: passwordStrength === "medium" || passwordStrength === "strong" ? "#f59e0b" : "#374151"
              }} />
              <div style={{
                height: "4px", flex: 1, borderRadius: "2px",
                backgroundColor: passwordStrength === "strong" ? "#22c55e" : "#374151"
              }} />
            </div>
            <p style={{
              fontSize: "12px",
              color: passwordStrength === "weak" ? "#ef4444" : passwordStrength === "medium" ? "#f59e0b" : "#22c55e"
            }}>
              {passwordStrength === "weak" && "🔴 Weak — add uppercase, numbers, special characters"}
              {passwordStrength === "medium" && "🟡 Medium — almost there!"}
              {passwordStrength === "strong" && "🟢 Strong password!"}
            </p>
          </div>
        )}

        {errors.password && (
          <p style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}>
            ❌ {errors.password}
          </p>
        )}

        {/* Confirm Password Input */}
<input
  type="password"
  placeholder="Confirm Password"
  autoComplete="off"
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "4px",
    borderRadius: "5px",
    border: errors.confirmPassword ? "1px solid red" : "1px solid #ccc",
  }}
/>

{errors.confirmPassword && (
  <p style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}>
    ❌ {errors.confirmPassword}
  </p>
)}

        <button
          onClick={handleSignup}
          disabled={!name || !email || !phone || !password}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
            backgroundColor: !name || !email || !phone || !password ? "#94a3b8" : "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: !name || !email || !phone || !password ? "not-allowed" : "pointer",
          }}
        >
          Signup
        </button>
        <p style={{ textAlign: "center", marginTop: "10px", color: "white", fontSize: "14px" }}>
  Already have an account?{" "}
  <a href="/login" style={{ color: "#3b82f6" }}>
    Login
  </a>
</p>
{/* <input
  type="text"
  placeholder="Name"
  autoComplete="off"  // ← ye add karo
/> */}
      </div>
    </div>
  );
}