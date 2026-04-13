"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile states
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editMsg, setEditMsg] = useState('');

  // Change Password states
  const [showPass, setShowPass] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');

  // ─── Load Data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { router.push("/login"); return; }

    const loadData = async () => {
      try {
        const [profileRes, historyRes] = await Promise.all([
          fetch(`${API}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }),
          fetch(`${API}/user/login-history`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }),
        ]);

        if (profileRes.status === 401) { router.push("/login"); return; }

        if (profileRes.ok) {
          const data = await profileRes.json();
          setUser(data.user);
          setEditName(data.user.name);
          setEditPhone(data.user.phone);
        }
        if (historyRes.ok) {
          const data = await historyRes.json();
          setHistory(data.history);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  // ─── Update Profile ──────────────────────────────────────────────────────────
  const handleUpdateProfile = async () => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${API}/user/update-profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify({ name: editName, phone: editPhone }),
    });
    const data = await res.json();
    setEditMsg(data.message);
    if (res.ok) {
      setUser((prev) => ({ ...prev, name: editName, phone: editPhone }));
      setTimeout(() => { setShowEdit(false); setEditMsg(""); }, 1500);
    }
  };

  // ─── Change Password ─────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${API}/user/change-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    const data = await res.json();
    setPassMsg(data.message);
    if (res.ok) {
      setTimeout(() => {
        setShowPass(false);
        setPassMsg("");
        setOldPassword("");
        setNewPassword("");
      }, 1500);
    }
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

      {/* Edit Profile Modal */}
      {showEdit && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.7)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 999 }}>
          <div style={{ backgroundColor: "#1e293b", padding: "30px",
            borderRadius: "10px", width: "350px" }}>
            <h3 style={{ color: "#22c55e", marginBottom: "20px" }}>✏️ Edit Profile</h3>

            <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>Name</p>
            <input value={editName} onChange={(e) => setEditName(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "15px",
                borderRadius: "5px", border: "1px solid #334155",
                backgroundColor: "#0f172a", color: "white" }} />

            <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>Phone</p>
            <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "15px",
                borderRadius: "5px", border: "1px solid #334155",
                backgroundColor: "#0f172a", color: "white" }} />

            {editMsg && (
              <p style={{ color: editMsg.includes("gayi") ? "#22c55e" : "#ef4444",
                marginBottom: "10px", fontSize: "13px" }}>{editMsg}</p>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleUpdateProfile}
                style={{ flex: 1, padding: "10px", backgroundColor: "#22c55e",
                  color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                Save
              </button>
              <button onClick={() => { setShowEdit(false); setEditMsg(""); }}
                style={{ flex: 1, padding: "10px", backgroundColor: "#475569",
                  color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPass && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.7)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 999 }}>
          <div style={{ backgroundColor: "#1e293b", padding: "30px",
            borderRadius: "10px", width: "350px" }}>
            <h3 style={{ color: "#22c55e", marginBottom: "20px" }}>🔒 Change Password</h3>

            <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>Old Password</p>
            <input type="password" value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "15px",
                borderRadius: "5px", border: "1px solid #334155",
                backgroundColor: "#0f172a", color: "white" }} />

            <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>New Password</p>
            <input type="password" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "15px",
                borderRadius: "5px", border: "1px solid #334155",
                backgroundColor: "#0f172a", color: "white" }} />

            {passMsg && (
              <p style={{ color: passMsg.includes("gaya") ? "#22c55e" : "#ef4444",
                marginBottom: "10px", fontSize: "13px" }}>{passMsg}</p>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleChangePassword}
                style={{ flex: 1, padding: "10px", backgroundColor: "#22c55e",
                  color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                Change
              </button>
              <button onClick={() => { setShowPass(false); setPassMsg(""); }}
                style={{ flex: 1, padding: "10px", backgroundColor: "#475569",
                  color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: "700px", margin: "0 auto" }}>

        {/* ─── NAVBAR ─────────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: "30px" }}>
          <h1 style={{ color: "white", fontSize: "24px" }}>👤 Profile</h1>
          <button onClick={() => router.push("/dashboard")}
            style={{ padding: "8px 20px", backgroundColor: "#3b82f6",
              color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            ← Back to Dashboard
          </button>
        </div>

        {/* ─── PROFILE CARD ────────────────────────────────────────────────────── */}
        {user && (
          <div style={{ backgroundColor: "#1e293b", borderRadius: "10px",
            padding: "20px", marginBottom: "20px" }}>

            {/* Avatar + Name */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px",
              marginBottom: "20px" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%",
                backgroundColor: "#6366f1", display: "flex", alignItems: "center",
                justifyContent: "center", color: "white", fontWeight: "bold",
                fontSize: "24px" }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ color: "white", fontWeight: "bold", fontSize: "18px" }}>{user.name}</p>
                <p style={{ color: "#94a3b8", fontSize: "13px" }}>{user.email}</p>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
                <button onClick={() => setShowEdit(true)}
                  style={{ padding: "6px 14px", backgroundColor: "#3b82f6",
                    color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                  ✏️ Edit
                </button>
                <button onClick={() => setShowPass(true)}
                  style={{ padding: "6px 14px", backgroundColor: "#f59e0b",
                    color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                  🔒 Password
                </button>
              </div>
            </div>

            {/* Info Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ backgroundColor: "#0f172a", padding: "12px", borderRadius: "8px" }}>
                <p style={{ color: "#94a3b8", fontSize: "12px" }}>Name</p>
                <p style={{ color: "white", fontWeight: "bold" }}>{user.name}</p>
              </div>
              <div style={{ backgroundColor: "#0f172a", padding: "12px", borderRadius: "8px" }}>
                <p style={{ color: "#94a3b8", fontSize: "12px" }}>Email</p>
                <p style={{ color: "white", fontWeight: "bold" }}>{user.email}</p>
              </div>
              <div style={{ backgroundColor: "#0f172a", padding: "12px", borderRadius: "8px" }}>
                <p style={{ color: "#94a3b8", fontSize: "12px" }}>Phone</p>
                <p style={{ color: "white", fontWeight: "bold" }}>{user.phone}</p>
              </div>
              <div style={{ backgroundColor: "#0f172a", padding: "12px", borderRadius: "8px" }}>
                <p style={{ color: "#94a3b8", fontSize: "12px" }}>Status</p>
                <p style={{ color: "#22c55e", fontWeight: "bold" }}>✅ Active</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── LOGIN HISTORY ───────────────────────────────────────────────────── */}
        <div style={{ backgroundColor: "#1e293b", borderRadius: "10px", padding: "20px" }}>
          <h2 style={{ color: "#22c55e", marginBottom: "15px" }}>🕐 Login History</h2>
          {history.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>Koi history nahi mili.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #334155" }}>
                  <th style={{ color: "#94a3b8", padding: "10px", textAlign: "left" }}>#</th>
                  <th style={{ color: "#94a3b8", padding: "10px", textAlign: "left" }}>Email</th>
                  <th style={{ color: "#94a3b8", padding: "10px", textAlign: "left" }}>Login Time</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #0f172a" }}>
                    <td style={{ color: "white", padding: "10px" }}>{index + 1}</td>
                    <td style={{ color: "white", padding: "10px" }}>{item.email}</td>
                    <td style={{ color: "#94a3b8", padding: "10px" }}>
                      {new Date(item.login_time).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}