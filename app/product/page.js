"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

export default function Product() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ useEffect ke andar check karo — tab sessionStorage available hoti hai
    const sessionId = sessionStorage.getItem("sessionId");
    const token = localStorage.getItem("accessToken");

    console.log("sessionId:", sessionId); // debug ke liye
    console.log("token:", token);         // debug ke liye

    // ✅ Dono nahi hain toh login pe bhejo
    if (!sessionId || !token) {
      router.push("/login");
      return;
    }

    const loadUser = async () => {
      try {
        const res = await fetch(`${API}/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-session-id": sessionId,
          },
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // ✅ Session invalid — sab clear karo aur login pe bhejo
          sessionStorage.removeItem("sessionId");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          router.push("/login");
        }
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const handleLogout = async () => {
    await fetch(`${API}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("sessionId");
    router.push("/login");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center",
        alignItems: "center", height: "100vh", backgroundColor: "#0f172a" }}>
        <p style={{ color: "white", fontSize: "18px" }}>⏳ Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", padding: "30px" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>

        {/* ─── NAVBAR ───────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: "30px",
          backgroundColor: "#1e293b", padding: "15px 20px", borderRadius: "10px" }}>

          <h1 style={{ color: "white", fontSize: "20px" }}>🛒 Product</h1>

          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>

            {/* Name + Email */}
            <div style={{ textAlign: "right" }}>
              <p style={{ color: "white", fontWeight: "bold",
                fontSize: "14px", margin: 0 }}>{user?.name}</p>
              <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>
                {user?.email}
              </p>
            </div>

            {/* Avatar */}
            <div style={{ width: "36px", height: "36px", borderRadius: "50%",
              backgroundColor: "#6366f1", display: "flex", alignItems: "center",
              justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "16px" }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            {/* Back to Dashboard */}
            <button onClick={() => router.push("/dashboard")}
              style={{ padding: "8px 16px", backgroundColor: "#3b82f6",
                color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              ← Dashboard
            </button>

            {/* Logout */}
            <button onClick={handleLogout}
              style={{ padding: "8px 20px", backgroundColor: "#ef4444",
                color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              Logout
            </button>

          </div>
        </div>

        {/* ─── PRODUCT CONTENT ──────────────────────────────────────────────── */}
        <div style={{ backgroundColor: "#1e293b", borderRadius: "10px", padding: "20px" }}>
          <h2 style={{ color: "#22c55e", marginBottom: "20px" }}>📦 Products</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            {[
              { name: "Product 1", price: "₹999",  status: "Available" },
              { name: "Product 2", price: "₹1499", status: "Available" },
              { name: "Product 3", price: "₹599",  status: "Out of Stock" },
              { name: "Product 4", price: "₹2999", status: "Available" },
            ].map((product, index) => (
              <div key={index} style={{ backgroundColor: "#0f172a",
                padding: "15px", borderRadius: "8px", border: "1px solid #334155" }}>
                <p style={{ color: "white", fontWeight: "bold",
                  fontSize: "16px", marginBottom: "8px" }}>{product.name}</p>
                <p style={{ color: "#22c55e", fontSize: "18px",
                  fontWeight: "bold", marginBottom: "8px" }}>{product.price}</p>
                <p style={{ color: product.status === "Available" ? "#22c55e" : "#ef4444",
                  fontSize: "12px" }}>
                  {product.status === "Available" ? "✅" : "❌"} {product.status}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}