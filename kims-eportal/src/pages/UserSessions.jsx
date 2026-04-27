import React, { useEffect, useState, useContext } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "../styles/Accountcenter.css"; // Base table styles
import "../styles/UserSessions.css"; // Overriding session-specific styles
import { User, Clock, RefreshCcw, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserSessions = () => {
  const { user } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(() => fetchSessions(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await API.get("/sessions");
      if (Array.isArray(res.data)) {
        setSessions(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to force terminate this session?")) return;
    try {
      const res = await API.post(`/sessions/${sessionId}/terminate`);
      if (res.data.success) {
        fetchSessions(true);
      }
    } catch (err) {
      console.error("Failed to terminate session:", err);
      alert("Failed to terminate session.");
    }
  };

  if (user && user.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f0f9ff]">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-rose-100">
          <h2 className="text-2xl font-bold text-rose-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="main-content">
        <Header toggleSidebar={toggleSidebar} />

        <div className="dashboard-container">
          <div className="sessions-glass-card animate-fade-in w-full">
            <div className="glass-header flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/account-center")}
                  className="back-btn-pill"
                  title="Back to Accounts"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="flex flex-col">
                  <h3 className="glass-title">User Session Management</h3>
                  <p className="glass-subtitle">Monitor and manage active user logins</p>
                </div>
              </div>

              <button
                className="refresh-button-premium"
                onClick={() => fetchSessions()}
                title="Refresh Sessions"
              >
                <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="inner-white-container account-center-container shadow-sm">
              <div className="account-table-wrapper" id="sessions-table-scroll">
                <table className="account-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Emp ID</th>
                      <th>Login Time</th>
                      <th>Logout Time</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th className="text-center">Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading && sessions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-8 py-20 text-center text-black font-bold text-sm">
                          Fetching sessions...
                        </td>
                      </tr>
                    ) : sessions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-8 py-20 text-center text-black font-bold text-sm">
                          No session history found.
                        </td>
                      </tr>
                    ) : (
                      sessions.map((s) => {
                        const login = new Date(s.login_time);
                        const logout = s.logout_time ? new Date(s.logout_time) : new Date();
                        const diffMs = logout - login;
                        const diffHrs = Math.floor(diffMs / 3600000);
                        const diffMins = Math.floor((diffMs % 3600000) / 60000);
                        const durationStr = (s.logout_time || s.status === 'active')
                          ? `${diffHrs}h ${diffMins}m`
                          : "N/A";

                        return (
                          <tr key={s.id}>
                            <td className="font-black text-indigo-600">{s.username}</td>
                            <td className="font-black text-indigo-700">{s.emp_id || "N/A"}</td>
                            <td className="font-bold text-slate-700">
                              {new Date(s.login_time).toLocaleString('en-IN', {
                                day: '2-digit', month: '2-digit', year: '2-digit',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </td>
                            <td className="font-bold text-slate-500">
                              {s.logout_time ? new Date(s.logout_time).toLocaleString('en-IN', {
                                day: '2-digit', month: '2-digit', year: '2-digit',
                                hour: '2-digit', minute: '2-digit'
                              }) : (s.status === 'active' ? '--' : 'Terminated')}
                            </td>
                            <td className="font-black text-slate-800">{durationStr}</td>
                            <td>
                              <div className={`role-badge ${s.status === 'active' ? 'role-user' : 'role-admin'}`} style={{ minWidth: '80px' }}>
                                {s.status === 'active' && <div className="pulse-circle mr-2"></div>}
                                {s.status.toUpperCase()}
                              </div>
                            </td>
                            <td className="text-center">
                              {s.status === 'active' ? (
                                <button
                                  className="terminate-btn-premium"
                                  onClick={() => handleTerminateSession(s.id)}
                                >
                                  <X size={14} /> Force Terminate
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-bold italic">Closed</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSessions;
