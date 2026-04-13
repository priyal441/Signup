
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

export default function Dashboard() {
  const router = useRouter();
  const [sessionExpired, setSessionExpired] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editMsg, setEditMsg] = useState('');

  const [showPass, setShowPass] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  const getSessionId = () => sessionStorage.getItem("sessionId");

  // ─── Load User Data ──────────────────────────────────────────────────────────
  const loadUserData = async (token) => {
    try {
      const profileRes = await fetch(`${API}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-session-id": getSessionId(),
        },
        credentials: "include",
      });

      if (profileRes.ok) {
        const data = await profileRes.json();
        setUser(data.user);
        setEditName(data.user.name);
        setEditPhone(data.user.phone);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Logout ──────────────────────────────────────────────────────────────────
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

  // ─── Token Refresh ───────────────────────────────────────────────────────────
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) { router.push("/login"); return null; }

    const res = await fetch(`${API}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ refreshToken }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("accessToken", data.accessToken);
      return data.accessToken;
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("sessionId");
      router.push("/login");
      return null;
    }
  };

  // ─── Update Profile ──────────────────────────────────────────────────────────
  const handleUpdateProfile = async () => {
    let token = localStorage.getItem("accessToken");

    let res = await fetch(`${API}/user/update-profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-session-id": getSessionId(),
      },
      credentials: "include",
      body: JSON.stringify({ name: editName, phone: editPhone }),
    });

    if (res.status === 401) {
      token = await refreshAccessToken();
      if (!token) return;
      res = await fetch(`${API}/user/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-session-id": getSessionId(),
        },
        credentials: "include",
        body: JSON.stringify({ name: editName, phone: editPhone }),
      });
    }

    const data = await res.json();
    setEditMsg(data.message);
    if (res.ok) {
      setUser((prev) => ({ ...prev, name: editName, phone: editPhone }));
      setTimeout(() => { setShowEdit(false); setEditMsg(""); }, 1500);
    }
  };

  // ─── Change Password ─────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    let token = localStorage.getItem("accessToken");

    let res = await fetch(`${API}/user/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-session-id": getSessionId(),
      },
      credentials: "include",
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (res.status === 401) {
      token = await refreshAccessToken();
      if (!token) return;
      res = await fetch(`${API}/user/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-session-id": getSessionId(),
        },
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword }),
      });
    }

    const data = await res.json();
    setPassMsg(data.message);
    setPassSuccess(res.ok);
    if (res.ok) {
      setTimeout(() => {
        setShowPass(false);
        setPassMsg("");
        setPassSuccess(false);
        setOldPassword("");
        setNewPassword("");
      }, 1500);
    }
  };

  // ─── useEffect ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) { router.push("/login"); return; }

    const fetchDashboard = async (token) => {
      const res = await fetch(`${API}/auth/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-session-id": getSessionId(),
        },
        credentials: "include",
      });

      if (res.ok) {
        await loadUserData(token);
      } else if (res.status === 401) {
        const latestRefresh = localStorage.getItem("refreshToken");
        if (!latestRefresh) { router.push("/login"); return; }

        const refreshRes = await fetch(`${API}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ refreshToken: latestRefresh }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem("accessToken", data.accessToken);
          await fetchDashboard(data.accessToken);
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          sessionStorage.removeItem("sessionId");
          setSessionExpired(true);
          setTimeout(() => { router.push("/login"); }, 3000);
        }
      }
    };

    const accessToken = localStorage.getItem("accessToken");
    fetchDashboard(accessToken);

    const interval = setInterval(() => {
      const latestToken = localStorage.getItem("accessToken");
      const latestRefresh = localStorage.getItem("refreshToken");
      if (!latestRefresh) { router.push("/login"); return; }
      fetchDashboard(latestToken);
    }, 25000);

    return () => clearInterval(interval);
  }, [router]);

  // ─── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center",
        alignItems: "center", height: "100vh", backgroundColor: "#0f172a" }}>
        <p style={{ color: "white", fontSize: "18px" }}>⏳ Loading...</p>
      </div>
    );
  }

  // ─── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", padding: "30px" }}>

      {/* Session Expired Banner */}
      {sessionExpired && (
        <div style={{ position: "fixed", top: "20px", left: "50%",
          transform: "translateX(-50%)", backgroundColor: "#ef4444",
          color: "white", padding: "15px 30px", borderRadius: "10px",
          fontSize: "16px", zIndex: 9999 }}>
          ⚠️ Session expired! Redirecting to login...
        </div>
      )}

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
                backgroundColor: "#0f172a", color: "white", boxSizing: "border-box" }} />

            <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>Phone</p>
            <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "15px",
                borderRadius: "5px", border: "1px solid #334155",
                backgroundColor: "#0f172a", color: "white", boxSizing: "border-box" }} />

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
                backgroundColor: "#0f172a", color: "white", boxSizing: "border-box" }} />

            <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>New Password</p>
            <input type="password" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "15px",
                borderRadius: "5px", border: "1px solid #334155",
                backgroundColor: "#0f172a", color: "white", boxSizing: "border-box" }} />

            {passMsg && (
              <p style={{ color: passSuccess ? "#22c55e" : "#ef4444",
                marginBottom: "10px", fontSize: "13px" }}>
                {passSuccess ? "✅" : "❌"} {passMsg}
              </p>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleChangePassword}
                style={{ flex: 1, padding: "10px", backgroundColor: "#22c55e",
                  color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                Change
              </button>
              <button onClick={() => { setShowPass(false); setPassMsg(""); setPassSuccess(false); }}
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

          <h1 style={{ color: "white", fontSize: "24px" }}>📊 Dashboard</h1>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

            {/* Profile Button */}
            <div onClick={() => router.push("/profile")}
              style={{ display: "flex", alignItems: "center", gap: "8px",
                backgroundColor: "#1e293b", padding: "8px 16px",
                borderRadius: "8px", cursor: "pointer", border: "1px solid #334155" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%",
                backgroundColor: "#6366f1", display: "flex", alignItems: "center",
                justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "14px" }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span style={{ color: "white", fontSize: "14px" }}>{user?.name}</span>
            </div>

            {/* ✅ Products Button */}
            <button onClick={() => router.push("/product")}
              style={{ padding: "8px 16px", backgroundColor: "#6366f1",
                color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              🛒 Products
            </button>

            {/* Logout Button */}
            <button onClick={handleLogout}
              style={{ padding: "8px 20px", backgroundColor: "#ef4444",
                color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              Logout
            </button>

          </div>
        </div>

        {/* ─── PROFILE CARD ────────────────────────────────────────────────────── */}
        {user && (
          <div style={{ backgroundColor: "#1e293b", borderRadius: "10px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: "15px" }}>
              <h2 style={{ color: "#22c55e" }}>👤 Profile</h2>
              <div style={{ display: "flex", gap: "10px" }}>
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

      </div>
    </div>
  );
}
// "use client";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";

// const API = "http://localhost:5000/api";

// export default function Dashboard() {
//   const router = useRouter();
//   const [sessionExpired, setSessionExpired] = useState(false);
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const [showEdit, setShowEdit] = useState(false);
//   const [editName, setEditName] = useState("");
//   const [editPhone, setEditPhone] = useState("");
//   const [editMsg, setEditMsg] = useState("");
//   const [editSuccess, setEditSuccess] = useState(false); // ✅ FIX: hindi word check hata diya

//   const [showPass, setShowPass] = useState(false);
//   const [oldPassword, setOldPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [passMsg, setPassMsg] = useState("");
//   const [passSuccess, setPassSuccess] = useState(false); // ✅ FIX: hindi word check hata diya

//   // ✅ sessionId helper
//   const getSessionId = () => sessionStorage.getItem("sessionId") || "";

//   // ─── Load User Data ──────────────────────────────────────────────────────────
//   const loadUserData = async (token) => {
//     try {
//       const profileRes = await fetch(`${API}/user/profile`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "x-session-id": getSessionId(),
//         },
//         credentials: "include",
//       });

//       if (profileRes.ok) {
//         const data = await profileRes.json();
//         setUser(data.user);
//         setEditName(data.user.name);
//         setEditPhone(data.user.phone);
//       }
//     } catch (err) {
//       console.error("Profile load error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

 
//   // ─── Logout ──────────────────────────────────────────────────────────────────
//   const handleLogout = async () => {
//     try {
//       await fetch(`${API}/auth/logout`, {
//         method: "POST",
//         credentials: "include",
//       });
//     } catch (err) {
//       console.error("Logout error:", err);
//     }
//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("refreshToken");
//     sessionStorage.removeItem("sessionId");
//     router.push("/login");
//   };

//   // ─── Token Refresh ───────────────────────────────────────────────────────────
//   const refreshAccessToken = async () => {
//     const refreshToken = localStorage.getItem("refreshToken");
//     if (!refreshToken) {
//       router.push("/login");
//       return null;
//     }

//     try {
//       const res = await fetch(`${API}/auth/refresh`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ refreshToken }),
//       });

//       if (res.ok) {
//         const data = await res.json();
//         localStorage.setItem("accessToken", data.accessToken);
//         return data.accessToken;
//       } else {
//         localStorage.removeItem("accessToken");
//         localStorage.removeItem("refreshToken");
//         sessionStorage.removeItem("sessionId");
//         router.push("/login");
//         return null;
//       }
//     } catch (err) {
//       console.error("Token refresh error:", err);
//       router.push("/login");
//       return null;
//     }
//   };

//   // ─── Fetch Dashboard (with auto-refresh) ─────────────────────────────────────
//   const fetchDashboard = async (token) => {
//     // ✅ FIX: null token guard
//     const useToken = token || "";

//     try {
//       const res = await fetch(`${API}/auth/dashboard`, {
//         headers: {
//           Authorization: `Bearer ${useToken}`,
//           "x-session-id": getSessionId(),
//         },
//         credentials: "include",
//       });

//       if (res.ok) {
//         await loadUserData(useToken);
//       } else if (res.status === 401) {
//         const newToken = await refreshAccessToken();
//         if (newToken) {
//           const retryRes = await fetch(`${API}/auth/dashboard`, {
//             headers: {
//               Authorization: `Bearer ${newToken}`,
//               "x-session-id": getSessionId(),
//             },
//             credentials: "include",
//           });
//           if (retryRes.ok) {
//             await loadUserData(newToken);
//           } else {
//             localStorage.removeItem("accessToken");
//             localStorage.removeItem("refreshToken");
//             sessionStorage.removeItem("sessionId");
//             setSessionExpired(true);
//             setTimeout(() => { router.push("/login"); }, 3000);
//           }
//         }
//       }
//     } catch (err) {
//       console.error("Dashboard fetch error:", err);
//       setLoading(false);
//     }
//   };

//   // ─── Update Profile ──────────────────────────────────────────────────────────
//   const handleUpdateProfile = async () => {
//     let token = localStorage.getItem("accessToken") || "";

//     let res = await fetch(`${API}/user/update-profile`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//         "x-session-id": getSessionId(),
//       },
//       credentials: "include",
//       body: JSON.stringify({ name: editName, phone: editPhone }),
//     });

//     if (res.status === 401) {
//       token = await refreshAccessToken();
//       if (!token) return;
//       res = await fetch(`${API}/user/update-profile`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//           "x-session-id": getSessionId(),
//         },
//         credentials: "include",
//         body: JSON.stringify({ name: editName, phone: editPhone }),
//       });
//     }

//     const data = await res.json();
//     setEditMsg(data.message);
//     setEditSuccess(res.ok); // ✅ FIX: res.ok se success check karo

//     if (res.ok) {
//       setUser((prev) => ({ ...prev, name: editName, phone: editPhone }));
//       setTimeout(() => {
//         setShowEdit(false);
//         setEditMsg("");
//         setEditSuccess(false);
//       }, 1500);
//     }
//   };

//   // ─── Change Password ─────────────────────────────────────────────────────────
//   const handleChangePassword = async () => {
//     let token = localStorage.getItem("accessToken") || "";

//     let res = await fetch(`${API}/user/change-password`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//         "x-session-id": getSessionId(),
//       },
//       credentials: "include",
//       body: JSON.stringify({ oldPassword, newPassword }),
//     });

//     if (res.status === 401) {
//       token = await refreshAccessToken();
//       if (!token) return;
//       res = await fetch(`${API}/user/change-password`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//           "x-session-id": getSessionId(),
//         },
//         credentials: "include",
//         body: JSON.stringify({ oldPassword, newPassword }),
//       });
//     }

//     const data = await res.json();
//     setPassMsg(data.message);
//     setPassSuccess(res.ok); // ✅ FIX: res.ok se success check karo

//     if (res.ok) {
//       setTimeout(() => {
//         setShowPass(false);
//         setPassMsg("");
//         setPassSuccess(false);
//         setOldPassword("");
//         setNewPassword("");
//       }, 1500);
//     }
//   };

//   // ─── useEffect ───────────────────────────────────────────────────────────────
//   useEffect(() => {
//     const refreshToken = localStorage.getItem("refreshToken");
//     if (!refreshToken) {
//       setLoading(false);
//       router.push("/login");
//       return;
//     }

//     const accessToken = localStorage.getItem("accessToken") || ""; // ✅ FIX: null guard
//     fetchDashboard(accessToken);

//     const interval = setInterval(() => {
//       const latestRefresh = localStorage.getItem("refreshToken");
//       if (!latestRefresh) {
//         router.push("/login");
//         return;
//       }
//       const latestToken = localStorage.getItem("accessToken") || "";
//       fetchDashboard(latestToken);
//     }, 25000);

//     return () => clearInterval(interval);
//   }, [router]);

//   // ─── Loading ─────────────────────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <div style={{
//         display: "flex", justifyContent: "center",
//         alignItems: "center", height: "100vh", backgroundColor: "#0f172a",
//       }}>
//         <p style={{ color: "white", fontSize: "18px" }}>⏳ Loading...</p>
//       </div>
//     );
//   }

//   // ─── Render ──────────────────────────────────────────────────────────────────
//   return (
//     <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", padding: "30px" }}>

//       {/* Session Expired Toast */}
//       {sessionExpired && (
//         <div style={{
//           position: "fixed", top: "20px", left: "50%",
//           transform: "translateX(-50%)", backgroundColor: "#ef4444",
//           color: "white", padding: "15px 30px", borderRadius: "10px",
//           fontSize: "16px", zIndex: 9999,
//         }}>
//           ⚠️ Session expired! Redirecting to login...
//         </div>
//       )}

//       {/* Edit Profile Modal */}
//       {showEdit && (
//         <div style={{
//           position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
//           backgroundColor: "rgba(0,0,0,0.7)", display: "flex",
//           justifyContent: "center", alignItems: "center", zIndex: 999,
//         }}>
//           <div style={{
//             backgroundColor: "#1e293b", padding: "30px",
//             borderRadius: "10px", width: "350px",
//           }}>
//             <h3 style={{ color: "#22c55e", marginBottom: "20px" }}>✏️ Edit Profile</h3>

//             <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>Name</p>
//             <input
//               value={editName}
//               onChange={(e) => setEditName(e.target.value)}
//               style={{
//                 width: "100%", padding: "10px", marginBottom: "15px",
//                 borderRadius: "5px", border: "1px solid #334155",
//                 backgroundColor: "#0f172a", color: "white", boxSizing: "border-box",
//               }}
//             />

//             <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>Phone</p>
//             <input
//               value={editPhone}
//               onChange={(e) => setEditPhone(e.target.value)}
//               style={{
//                 width: "100%", padding: "10px", marginBottom: "15px",
//                 borderRadius: "5px", border: "1px solid #334155",
//                 backgroundColor: "#0f172a", color: "white", boxSizing: "border-box",
//               }}
//             />

//             {editMsg && (
//               <p style={{
//                 color: editSuccess ? "#22c55e" : "#ef4444", // ✅ FIX: editSuccess flag use karo
//                 marginBottom: "10px", fontSize: "13px",
//               }}>
//                 {editSuccess ? "✅" : "❌"} {editMsg}
//               </p>
//             )}

//             <div style={{ display: "flex", gap: "10px" }}>
//               <button
//                 onClick={handleUpdateProfile}
//                 style={{
//                   flex: 1, padding: "10px", backgroundColor: "#22c55e",
//                   color: "white", border: "none", borderRadius: "5px", cursor: "pointer",
//                 }}
//               >
//                 Save
//               </button>
//               <button
//                 onClick={() => { setShowEdit(false); setEditMsg(""); setEditSuccess(false); }}
//                 style={{
//                   flex: 1, padding: "10px", backgroundColor: "#475569",
//                   color: "white", border: "none", borderRadius: "5px", cursor: "pointer",
//                 }}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Change Password Modal */}
//       {showPass && (
//         <div style={{
//           position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
//           backgroundColor: "rgba(0,0,0,0.7)", display: "flex",
//           justifyContent: "center", alignItems: "center", zIndex: 999,
//         }}>
//           <div style={{
//             backgroundColor: "#1e293b", padding: "30px",
//             borderRadius: "10px", width: "350px",
//           }}>
//             <h3 style={{ color: "#22c55e", marginBottom: "20px" }}>🔒 Change Password</h3>

//             <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>Old Password</p>
//             <input
//               type="password"
//               value={oldPassword}
//               onChange={(e) => setOldPassword(e.target.value)}
//               style={{
//                 width: "100%", padding: "10px", marginBottom: "15px",
//                 borderRadius: "5px", border: "1px solid #334155",
//                 backgroundColor: "#0f172a", color: "white", boxSizing: "border-box",
//               }}
//             />

//             <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>New Password</p>
//             <input
//               type="password"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               style={{
//                 width: "100%", padding: "10px", marginBottom: "15px",
//                 borderRadius: "5px", border: "1px solid #334155",
//                 backgroundColor: "#0f172a", color: "white", boxSizing: "border-box",
//               }}
//             />

//             {passMsg && (
//               <p style={{
//                 color: passSuccess ? "#22c55e" : "#ef4444", // ✅ FIX: passSuccess flag use karo
//                 marginBottom: "10px", fontSize: "13px",
//               }}>
//                 {passSuccess ? "✅" : "❌"} {passMsg}
//               </p>
//             )}

//             <div style={{ display: "flex", gap: "10px" }}>
//               <button
//                 onClick={handleChangePassword}
//                 style={{
//                   flex: 1, padding: "10px", backgroundColor: "#22c55e",
//                   color: "white", border: "none", borderRadius: "5px", cursor: "pointer",
//                 }}
//               >
//                 Change
//               </button>
//               <button
//                 onClick={() => { setShowPass(false); setPassMsg(""); setPassSuccess(false); }}
//                 style={{
//                   flex: 1, padding: "10px", backgroundColor: "#475569",
//                   color: "white", border: "none", borderRadius: "5px", cursor: "pointer",
//                 }}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//  {/* Profile Button ke baad, Logout se pehle */}
// <button onClick={() => router.push("/product")}
//   style={{ padding: "8px 16px", backgroundColor: "#6366f1",
//     color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
//   🛒 Products
// </button>
//       {/* Main Content */}
//       <div style={{ maxWidth: "700px", margin: "0 auto" }}>

//         {/* Header */}
//         <div style={{
//           display: "flex", justifyContent: "space-between",
//           alignItems: "center", marginBottom: "30px",
//         }}>
//           <h1 style={{ color: "white", fontSize: "24px" }}>📊 Dashboard</h1>
//           <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//             <div
//               onClick={() => router.push("/profile")}
//               style={{
//                 display: "flex", alignItems: "center", gap: "8px",
//                 backgroundColor: "#1e293b", padding: "8px 16px",
//                 borderRadius: "8px", cursor: "pointer", border: "1px solid #334155",
//               }}
//             >
//               <div style={{
//                 width: "32px", height: "32px", borderRadius: "50%",
//                 backgroundColor: "#6366f1", display: "flex", alignItems: "center",
//                 justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "14px",
//               }}>
//                 {user?.name?.charAt(0).toUpperCase()}
//               </div>
//               <span style={{ color: "white", fontSize: "14px" }}>{user?.name}</span>
//             </div>
//             <button
//               onClick={handleLogout}
//               style={{
//                 padding: "8px 20px", backgroundColor: "#ef4444",
//                 color: "white", border: "none", borderRadius: "5px", cursor: "pointer",
//               }}
//             >
//               Logout
//             </button>
//           </div>
//         </div>

//         {/* Profile Card */}
//         {user && (
//           <div style={{
//             backgroundColor: "#1e293b", borderRadius: "10px", padding: "20px",
//           }}>
//             <div style={{
//               display: "flex", justifyContent: "space-between",
//               alignItems: "center", marginBottom: "15px",
//             }}>
//               <h2 style={{ color: "#22c55e" }}>👤 Profile</h2>
//               <div style={{ display: "flex", gap: "10px" }}>
//                 <button
//                   onClick={() => setShowEdit(true)}
//                   style={{
//                     padding: "6px 14px", backgroundColor: "#3b82f6",
//                     color: "white", border: "none", borderRadius: "5px", cursor: "pointer",
//                   }}
//                 >
//                   ✏️ Edit
//                 </button>
//                 <button
//                   onClick={() => setShowPass(true)}
//                   style={{
//                     padding: "6px 14px", backgroundColor: "#f59e0b",
//                     color: "white", border: "none", borderRadius: "5px", cursor: "pointer",
//                   }}
//                 >
//                   🔒 Password
//                 </button>
//               </div>
//             </div>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
//               <div style={{ backgroundColor: "#0f172a", padding: "12px", borderRadius: "8px" }}>
//                 <p style={{ color: "#94a3b8", fontSize: "12px" }}>Name</p>
//                 <p style={{ color: "white", fontWeight: "bold" }}>{user.name}</p>
//               </div>
//               <div style={{ backgroundColor: "#0f172a", padding: "12px", borderRadius: "8px" }}>
//                 <p style={{ color: "#94a3b8", fontSize: "12px" }}>Email</p>
//                 <p style={{ color: "white", fontWeight: "bold" }}>{user.email}</p>
//               </div>
//               <div style={{ backgroundColor: "#0f172a", padding: "12px", borderRadius: "8px" }}>
//                 <p style={{ color: "#94a3b8", fontSize: "12px" }}>Phone</p>
//                 <p style={{ color: "white", fontWeight: "bold" }}>{user.phone}</p>
//               </div>
//               <div style={{ backgroundColor: "#0f172a", padding: "12px", borderRadius: "8px" }}>
//                 <p style={{ color: "#94a3b8", fontSize: "12px" }}>Status</p>
//                 <p style={{ color: "#22c55e", fontWeight: "bold" }}>✅ Active</p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
