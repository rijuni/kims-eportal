import React, { useEffect, useState, useContext, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "../styles/Accountcenter.css";
import { User, Shield, Clock, Search, RefreshCcw, MoreVertical, Check, X, ShieldCheck, ArrowLeft, CheckSquare, Square, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AccountCenter = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("all");
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // 'list', 'privileges', or 'config'
  const [tempRole, setTempRole] = useState("");
  const [selectedModules, setSelectedModules] = useState([]); // For Sub Admin config
  const [updating, setUpdating] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState([]); // For module hierarchy dropdowns
  const dropdownRef = useRef(null);

  const toggleModule = (moduleName) => {
    setSelectedModules(prev => 
      prev.includes(moduleName) 
        ? prev.filter(m => m !== moduleName) 
        : [...prev, moduleName]
    );
  };

  const handleSaveConfig = async () => {
    if (!selectedUser) return;
    setUpdating(true);
    try {
      await API.put(`/users/${selectedUser.id}/role`, { 
        permissions: selectedModules 
      });
      await fetchUsers(true);
      setViewMode("list");
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to save config:", err);
      alert("Failed to save configuration. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const dashboardModules = [
    { id: 'dashboard', label: 'Manage Dashboard', desc: 'Control main dashboard overview and statistics.' },
    { 
      id: 'training', 
      label: 'Manage Training Materials', 
      desc: 'Add, update or remove staff training documents.',
      subModules: [
        { id: 'trainer', label: 'Trainer Records', desc: 'Control trainer assignments, types, and session remarks.' }
      ]
    },
    { id: 'telephone', label: 'Manage Telephone Directory', desc: 'Manage department contacts and extensions.' },
    { id: 'holidays', label: 'Manage Holiday List', desc: 'Configure yearly holidays and institutional closures.' },
    { id: 'events', label: 'Manage Upcoming Events', desc: 'Create and broadcast upcoming hospital events.' }
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    fetchUsers();

    const interval = setInterval(() => {
      fetchUsers(true);
    }, 10000);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
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

  const handleSaveRole = async () => {
    if (!selectedUser || !tempRole) return;
    setUpdating(true);
    try {
      await API.put(`/users/${selectedUser.id}/role`, { role: tempRole });
      await fetchUsers(true);
      setViewMode("list");
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(u => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    
    if (searchBy === "name") {
      return (u.username || "").toLowerCase().includes(term);
    }
    if (searchBy === "role") {
      const roleText = u.role === 'admin' ? 'super admin' : u.role === 'sub_admin' ? 'sub admin' : 'user';
      return roleText.includes(term) || (u.role || "").toLowerCase().includes(term);
    }
    if (searchBy === "emp_id") {
      return (u.hinai_id || "").toLowerCase().includes(term);
    }
    
    // Default: search all
    return (u.username || "").toLowerCase().includes(term) ||
           (u.role || "").toLowerCase().includes(term) ||
           (u.hinai_id || "").toLowerCase().includes(term);
  }) : [];

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
          {viewMode === "list" ? (
            <div className="glass-card w-full" style={{ height: '560px' }}>
              <div className="glass-header flex flex-wrap justify-between items-center gap-4">
                <div className="flex flex-col">
                  <h3 className="glass-title">Account Center</h3>
                  <p className="glass-subtitle">Manage existing user accounts and permissions</p>
                </div>

                <div className="account-actions-flex">
                  <button 
                    className="sessions-button-premium" 
                    onClick={() => navigate('/user-sessions')}
                  >
                    <Clock size={16} />
                    <span>Sessions</span>
                  </button>
                  <div className="search-container-box">
                    <div className="search-icon-float">
                      <Search size={14} />
                    </div>
                    <select 
                      className="search-by-select"
                      value={searchBy}
                      onChange={(e) => setSearchBy(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="name">Name</option>
                      <option value="role">Role</option>
                      <option value="emp_id">Emp ID</option>
                    </select>
                    <input
                      type="text"
                      placeholder={`Search ${searchBy === 'all' ? 'accounts...' : searchBy === 'emp_id' ? 'ID...' : searchBy + '...'}`}
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
                        <th>Emp ID</th>
                        <th>User ID</th>
                        <th>Account Name</th>
                        <th>Role</th>
                        <th>Designation</th>
                        <th>Mail Id</th>
                        <th>Contact No</th>
                        <th>Created Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr>
                          <td colSpan="10" className="px-8 py-20 text-center text-black font-bold text-sm">
                            Fetching accounts...
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="px-8 py-20 text-center text-black font-bold text-sm">
                            No user accounts found.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr
                            key={u.id}
                            style={{
                              position: 'relative',
                              zIndex: activeDropdownId === u.id ? 100 : 1
                            }}
                          >
                            <td className="font-black text-indigo-600">{u.hinai_id || "N/A"}</td>
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
                                {u.role === 'admin' ? 'Super Admin' : u.role === 'sub_admin' ? 'Sub Admin' : 'User'}
                              </div>
                            </td>
                            <td className="font-bold text-slate-700 text-[12px]">{u.designation || "N/A"}</td>
                            <td className="font-medium text-slate-600 text-[12px]">{u.email || "N/A"}</td>
                            <td className="font-medium text-slate-600 text-[12px]">{u.contact_no || u.contact || "N/A"}</td>
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
                            <td className="px-2 text-center">
                              <div className="relative inline-block">
                                <button
                                  className={`action-btn-more ${activeDropdownId === u.id ? 'active' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdownId(activeDropdownId === u.id ? null : u.id);
                                  }}
                                >
                                  <MoreVertical size={16} />
                                </button>

                                {activeDropdownId === u.id && (
                                  <div className="account-dropdown-menu animate-dropdown-in" ref={dropdownRef}>
                                    <div className="dropdown-arrow"></div>
                                    <div className="dropdown-buttons-row">
                                      <button
                                        className="dropdown-action-pill privileges"
                                        onClick={() => {
                                          setSelectedUser(u);
                                          setTempRole(u.role);
                                          setViewMode("privileges");
                                          setActiveDropdownId(null);
                                        }}
                                      >
                                        <Shield size={12} />
                                        <span>Privileges</span>
                                      </button>
                                      <button 
                                        className={`dropdown-action-pill config ${u.role !== 'sub_admin' ? 'opacity-30 pointer-events-none' : ''}`}
                                        onClick={() => {
                                          setSelectedUser(u);
                                          setViewMode("config");
                                          setActiveDropdownId(null);
                                          // Initialize with existing permissions or empty array
                                          setSelectedModules(u.permissions || []);
                                        }}
                                      >
                                        <RefreshCcw size={12} />
                                        <span>Config</span>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : viewMode === "privileges" ? (
            /* Privileges Management Page View */
            <div className="privileges-glass-card animate-fade-in">
              <div className="glass-header flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setViewMode("list")}
                    className="back-btn-pill"
                    title="Back to Accounts"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div style={{ paddingLeft: '12px' }}>
                    <h3 className="glass-title" style={{ color: '#000000', margin: '0', padding: '0', lineHeight: '1.1', fontSize: '16px' }}>Privileges Management</h3>
                    <p className="font-semibold" style={{ color: '#000000', margin: '1px 0 0 0', padding: '0', fontSize: '10px' }}>Configure account access level for <span className="text-indigo-600 font-black tracking-tight">@{selectedUser.username}</span></p>
                  </div>
                </div>

                <button
                  onClick={handleSaveRole}
                  disabled={updating}
                  className="save-btn-premium"
                >
                  {updating ? <RefreshCcw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  {updating ? 'Saving Changes...' : 'Save Privileges'}
                </button>
              </div>

              <div className="privileges-inner-white-container shadow-sm">
                <div className="privileges-page-wrapper">
                  {/* User Info Header */}
                  <div className="user-hero-card">
                    <div className="user-avatar-premium">
                      <User size={22} />
                    </div>
                    <div>
                      <h4 className="font-black tracking-tight leading-none" style={{ color: '#000000', fontSize: '14px' }}>{selectedUser.username}</h4>
                      <div className="flex items-center mt-1" style={{ gap: '10px' }}>
                        <span className="font-black uppercase tracking-[1px]" style={{ color: '#000000', fontSize: '7.5px' }}>Current Role</span>
                        <div className={`role-badge ${selectedUser.role === 'admin' ? 'role-admin' : 'role-user'}`} style={{ fontSize: '8px', padding: '0px 6px', marginLeft: '6px' }}>
                          <Shield size={7} />
                          {selectedUser.role === 'admin' ? 'Super Admin' : selectedUser.role === 'sub_admin' ? 'Sub Admin' : 'General User'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Role Selector Section */}
                  <div className="space-y-4">
                    <h5 className="text-[11px] font-black uppercase tracking-[3px] mb-6" style={{ color: '#000000' }}>Select Desired Role</h5>

                    {[
                      { id: 'admin', label: 'Super User (Super Admin)', desc: 'Unrestricted system access, user management, and global configurations.', icon: <Shield size={20} /> },
                      { id: 'sub_admin', label: 'Sub Admin', desc: 'Can manage portal content (Events, Holidays, Notices) but cannot manage other users.', icon: <ShieldCheck size={20} /> },
                      { id: 'user', label: 'General User', desc: 'Default staff access. Can view all portal sections but has no management access.', icon: <User size={20} /> }
                    ].map((role) => (
                      <div
                        key={role.id}
                        onClick={() => setTempRole(role.id)}
                        className={`role-card-premium ${tempRole === role.id ? 'selected' : ''}`}
                      >
                        <div className="custom-checkbox-premium">
                          <Check size={14} strokeWidth={4} />
                        </div>
                        <div className="role-icon-box">
                          {role.icon}
                        </div>
                        <div className="role-info-content">
                          <h5>{role.label}</h5>
                          <p>{role.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Info Note */}
                  <div className="security-alert-box">
                    <div className="alert-icon-shield">
                      <Shield size={20} />
                    </div>
                    <div className="alert-text-content">
                      <h6>Security Notice</h6>
                      <p>Assigning a user as a 'Super User' gives them full control over the database and system settings. Ensure this role is only given to authorized senior IT personnel.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* NEW Configuration Management Page View */
            <div className="privileges-glass-card animate-fade-in">
              <div className="glass-header flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setViewMode("list")}
                    className="back-btn-pill"
                    title="Back to Accounts"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div style={{ paddingLeft: '12px' }}>
                    <h3 className="glass-title" style={{ color: '#000000', margin: '0', padding: '0', lineHeight: '1.1', fontSize: '16px' }}>Module Configuration</h3>
                    <p className="font-semibold" style={{ color: '#000000', margin: '1px 0 0 0', padding: '0', fontSize: '10px' }}>Set module access for Sub Admin <span className="text-indigo-600 font-black tracking-tight">@{selectedUser?.username}</span></p>
                  </div>
                </div>

                <button
                  onClick={handleSaveConfig}
                  disabled={updating}
                  className="save-btn-premium"
                >
                  {updating ? <RefreshCcw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  {updating ? 'Applying...' : 'Save Configuration'}
                </button>
              </div>

              <div className="privileges-inner-white-container shadow-sm">
                <div className="privileges-page-wrapper">
                  {/* User Info Header */}
                  <div className="user-hero-card">
                    <div className="user-avatar-premium">
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <h4 className="font-black tracking-tight leading-none" style={{ color: '#000000', fontSize: '14px' }}>{selectedUser?.username}</h4>
                      <p className="text-[10px] font-bold mt-1 uppercase tracking-wider" style={{ color: '#000000' }}>Limited Management Access (Add, Edit, Delete)</p>
                    </div>
                  </div>

                  {/* Modules Section */}
                    <div className="space-y-4">
                      <h5 className="text-[11px] font-black uppercase tracking-[3px] mb-4" style={{ color: '#000000' }}>Select Authorized Modules</h5>

                      {dashboardModules.map((module) => {
                        const hasSubModules = !!module.subModules;
                        const isExpanded = expandedGroups.includes(module.id);
                        
                        return (
                          <div key={module.id} className="module-group-container mb-3">
                            <div
                              onClick={() => {
                                if (hasSubModules) {
                                  setExpandedGroups(prev => 
                                    prev.includes(module.id) ? prev.filter(id => id !== module.id) : [...prev, module.id]
                                  );
                                } else {
                                  toggleModule(module.id);
                                }
                              }}
                              className={`role-card-premium ${selectedModules.includes(module.id) ? 'selected' : ''} ${hasSubModules ? 'parent-module-card' : ''}`}
                              style={{ cursor: 'pointer', position: 'relative' }}
                            >
                              <div 
                                className="custom-checkbox-premium"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleModule(module.id);
                                }}
                              >
                                <Check size={14} strokeWidth={4} />
                              </div>
                              <div className="role-info-content">
                                <h5 style={{ fontSize: '12.5px', fontWeight: '800' }}>{module.label}</h5>
                                <p style={{ fontSize: '10px', color: '#64748b' }}>{module.desc}</p>
                              </div>
                              
                              {hasSubModules && (
                                <button 
                                  className="dropdown-trigger-btn-black ml-auto"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedGroups(prev => 
                                      prev.includes(module.id) ? prev.filter(id => id !== module.id) : [...prev, module.id]
                                    );
                                  }}
                                >
                                  <ChevronDown 
                                    size={16} 
                                    className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                                  />
                                </button>
                              )}
                            </div>

                            {/* Render Sub Modules in Dropdown */}
                            {hasSubModules && isExpanded && (
                              <div className="sub-module-dropdown animate-dropdown-in ml-10 mt-2 space-y-2 border-l-2 border-slate-200 pl-4 pb-4">
                                {module.subModules.map((sub) => (
                                  <div
                                    key={sub.id}
                                    onClick={() => toggleModule(sub.id)}
                                    className={`role-card-premium sub-card ${selectedModules.includes(sub.id) ? 'selected' : ''}`}
                                    style={{ 
                                      padding: '10px 14px', 
                                      minHeight: 'auto',
                                      borderStyle: 'dashed',
                                      borderColor: selectedModules.includes(sub.id) ? '#4f46e5' : '#e2e8f0'
                                    }}
                                  >
                                    <div className="custom-checkbox-premium" style={{ width: '18px', height: '18px', borderRadius: '6px' }}>
                                      <Check size={12} strokeWidth={4} />
                                    </div>
                                    <div className="role-info-content">
                                      <h5 style={{ fontSize: '11.5px', fontWeight: '700' }}>{sub.label}</h5>
                                      <p style={{ fontSize: '9.5px', color: '#64748b' }}>{sub.desc}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>

                  {/* Info Note */}
                  <div className="security-alert-box" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="alert-icon-shield" style={{ background: '#f1f5f9', color: '#64748b' }}>
                      <Clock size={18} />
                    </div>
                    <div className="alert-text-content">
                      <h6 style={{ color: '#475569' }}>Access Control Note</h6>
                      <p style={{ color: '#64748b' }}>Permissions are applied instantly. Sub Admins will only see the selected modules in their administrative sidebar upon next login.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountCenter;
