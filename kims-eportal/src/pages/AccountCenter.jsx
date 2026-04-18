import React, { useEffect, useState, useContext } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "../styles/Accountcenter.css";
import { User, Shield, Clock, Search, RefreshCcw, MoreVertical } from "lucide-react";

const AccountCenter = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    fetchUsers();

    // Auto refresh every 10 seconds
    const interval = setInterval(() => {
      fetchUsers(true); // pass true to indicate it's a silent refresh if we want, but standard fetch is fine
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async (isSilent = false) => {
    const startTime = Date.now();
    try {
      if (!isSilent) setLoading(true);
      setRefreshing(true);
      const res = await API.get("/users");
      // CRITICAL: Ensure we only set array data to prevent crashes
      if (Array.isArray(res.data)) {
        setUsers(res.data);
      } else if (res.data && Array.isArray(res.data.users)) {
        setUsers(res.data.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    } finally {
      // Ensure the spin animation is visible for at least 800ms
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 800 - elapsedTime);
      
      setTimeout(() => {
        setLoading(false);
        setRefreshing(false);
      }, remainingTime);
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(u =>
    (u.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role || "").toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

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
          <div className="glass-card w-full">
            <div className="glass-header flex flex-wrap justify-between items-center gap-4">
              <div>
                <h3 className="glass-title">Account Center</h3>
                <p className="text-[11px] text-black font-semibold mt-1">Manage existing user accounts and permissions</p>
              </div>

              <div className="account-actions-flex">
                <div className="search-container-box">
                  <div className="search-icon-float">
                    <Search size={14} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search accounts name or role..."
                    className="search-input-premium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  className="refresh-button-premium"
                  onClick={() => fetchUsers()}
                  title="Refresh Data"
                >
                  <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            <div className="inner-white-container account-center-container shadow-sm">
              <div className="account-table-wrapper">
                <table className="account-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Account Name</th>
                      <th>Role</th>
                      <th>Created Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="px-8 py-20 text-center text-black font-bold text-sm">
                          Fetching accounts...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-8 py-20 text-center text-black font-bold text-sm">
                          No user accounts found.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id}>
                          <td className="font-black">{u.username}</td>
                          <td>
                            <div className="flex items-center gap-4">
                              <div className="avatar-wrapper">
                                <User size={16} />
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-black">{u.username}</span>
                                {user && user.id === u.id && (
                                  <span className="me-indicator">YOU</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className={`role-badge ${u.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                              <Shield size={14} />
                              {u.role}
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center font-bold text-[13px] text-slate-800">
                              <Clock size={13} className="text-slate-600" style={{ marginRight: '8px' }} />
                              {new Date(u.created_at).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: '2-digit'
                              })}
                            </div>
                          </td>
                          <td>
                            <div className="status-flex">
                              <div className="pulse-circle"></div>
                            </div>
                          </td>
                          <td>
                            <button className="action-btn-more">
                              <MoreVertical size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
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

export default AccountCenter;
