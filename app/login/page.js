"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API = "http://localhost:5000/api";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    return newErrors;
  };

  const handleLogin = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        // ✅ FIX: sessionId set karo login ke baad
        // console.log("sessionId set:", sessionStorage.getItem("sessionId"));
        if (data.sessionId) {
          sessionStorage.setItem("sessionId", data.sessionId);
        }
        router.push("/dashboard");
      } else {
        setErrors({ server: data.message || "Login failed. Please try again." });
      }
    } catch (err) {
      setErrors({ server: "Server se connection nahi ho paya. Backend chal raha hai?" });
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Enter key se bhi login ho
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  const isDisabled = !email || !password || loading;

  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      height: "100vh", backgroundColor: "#0f172a",
    }}>
      <div style={{
        width: "340px", padding: "30px", borderRadius: "10px",
        backgroundColor: "#1e293b", boxShadow: "0 0 20px rgba(0,0,0,0.5)",
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "24px", color: "white", fontSize: "22px" }}>
          Login
        </h2>

        {/* Server Error */}
        {errors.server && (
          <div style={{
            backgroundColor: "#450a0a", border: "1px solid #ef4444",
            borderRadius: "6px", padding: "10px 12px", marginBottom: "16px",
          }}>
            <p style={{ color: "#ef4444", fontSize: "13px", margin: 0 }}>
              ❌ {errors.server}
            </p>
          </div>
        )}

        {/* Email */}
        <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>Email</p>
        <input
          type="email"
          placeholder="you@example.com"
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width: "100%", padding: "10px", marginBottom: "4px",
            borderRadius: "5px", backgroundColor: "#0f172a", color: "white",
            border: errors.email ? "1px solid #ef4444" : "1px solid #334155",
            outline: "none", boxSizing: "border-box",
          }}
        />
        {errors.email && (
          <p style={{ color: "#ef4444", fontSize: "12px", marginBottom: "12px" }}>
            ❌ {errors.email}
          </p>
        )}

        {/* Password */}
        <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px", marginTop: "8px" }}>
          Password
        </p>
        <input
          type="password"
          placeholder="••••••••"
          autoComplete="off"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width: "100%", padding: "10px", marginBottom: "4px",
            borderRadius: "5px", backgroundColor: "#0f172a", color: "white",
            border: errors.password ? "1px solid #ef4444" : "1px solid #334155",
            outline: "none", boxSizing: "border-box",
          }}
        />
        {errors.password && (
          <p style={{ color: "#ef4444", fontSize: "12px", marginBottom: "12px" }}>
            ❌ {errors.password}
          </p>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={isDisabled}
          style={{
            width: "100%", padding: "11px", marginTop: "16px",
            backgroundColor: isDisabled ? "#334155" : "#22c55e",
            color: isDisabled ? "#64748b" : "white",
            border: "none", borderRadius: "6px",
            cursor: isDisabled ? "not-allowed" : "pointer",
            fontSize: "15px", fontWeight: "500",
            transition: "background-color 0.2s",
          }}
        >
          {loading ? "⏳ Logging in..." : "Login"}
        </button>

        {/* Forgot Password */}
        <p style={{ textAlign: "center", marginTop: "14px" }}>
          <a href="/forgot-password" style={{ color: "#3b82f6", fontSize: "13px", textDecoration: "none" }}>
            Forgot Password?
          </a>
        </p>

        {/* Signup Link */}
        <p style={{ textAlign: "center", marginTop: "10px", color: "#94a3b8", fontSize: "14px" }}>
          Don&apos;t have an account?{" "}
          <a href="/signup" style={{ color: "#3b82f6", textDecoration: "none" }}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}