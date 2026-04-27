import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import API from "../services/api";
import { Plus, ArrowUp, ArrowLeft, Save, RefreshCcw, ChevronDown } from "lucide-react";
import "../styles/admintrainingdashboard.css"; // Using same CSS

const AdminTrainerDashboard = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [trainers, setTrainers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [expandedGroups, setExpandedGroups] = useState({});

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [trainerRes, usersRes] = await Promise.all([
                API.get("/trainer-data"),
                API.get("/users")
            ]);
            
            if (Array.isArray(trainerRes.data)) {
                const processed = trainerRes.data.map(t => ({
                    ...t,
                    editTrainer: t.username || "n/a"
                }));
                setTrainers(processed);
            }

            if (Array.isArray(usersRes.data)) {
                setAllUsers(usersRes.data);
            }
        } catch (err) {
            console.error("Failed to fetch data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdate = async (groupKey) => {
        const group = groupedTrainers[groupKey];
        const first = group[0];
        setUpdatingId(groupKey);
        try {
            await Promise.all(group.map(t => 
                API.put(`/trainer-data/${t.id}`, {
                    trainer_name: first.editTrainer,
                    training_type: t.training_type,
                    remarks: t.remarks
                })
            ));
            alert("Trainer assigned successfully!");
            fetchData();
        } catch (err) {
            alert("Update failed.");
        } finally {
            setUpdatingId(null);
        }
    };

    const toggleGroup = (groupKey) => {
        setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
    };

    const groupedTrainers = trainers.reduce((acc, t) => {
        const key = `${t.start_date}-${t.topic}-${t.module}-${t.from_time}-${t.to_time}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(t);
        return acc;
    }, {});

    const filteredGroupKeys = Object.keys(groupedTrainers).filter(key => {
        const group = groupedTrainers[key];
        const first = group[0];
        const search = searchTerm.toLowerCase();
        return (
            (first.topic?.toLowerCase().includes(search)) ||
            (first.module?.toLowerCase().includes(search)) ||
            (first.username?.toLowerCase().includes(search))
        );
    });

    return (
        <div className={`dashboard-wrapper training-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="main-content">
                <Header toggleSidebar={toggleSidebar} />
                
                <div className="dashboard-container p-4">
                    <div className="admin-training-header-banner">
                        <div className="flex items-center gap-4">
                            <button className="back-btn-dashboard" onClick={() => navigate("/training-materials")}>
                                <ArrowLeft size={18} />
                            </button>
                            <h1>Admin Trainer Dashboard</h1>
                        </div>
                        
                        <div className="header-search-container">
                            <span className="header-search-label">Filter</span>
                            <input 
                                type="text" 
                                placeholder="Topic, Trainer, or Module..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="header-search-input"
                            />
                            <div className="header-search-icon-box">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="admin-training-table-wrapper">
                        {/* Search removed from here as it's now in the header */}

                        <table className="admin-training-table">
                            <thead>
                                <tr>
                                    <th className="icon-col"></th>
                                    <th>Start Date</th>
                                    <th>Topic</th>
                                    <th>Sub Topic</th>
                                    <th>Module</th>
                                    <th>From Time</th>
                                    <th>To Time</th>
                                    <th>Trainer Name</th>
                                    <th>Trainer Dept</th>
                                    <th className="text-center" style={{ width: '100px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="10" className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                            Fetching trainer data...
                                        </td>
                                    </tr>
                                ) : filteredGroupKeys.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                            No trainers found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredGroupKeys.map((groupKey, idx) => {
                                        const group = groupedTrainers[groupKey];
                                        const first = group[0];
                                        const isExpanded = expandedGroups[groupKey];

                                        return (
                                            <React.Fragment key={groupKey}>
                                                <tr className={`group-header-row ${isExpanded ? 'active' : ''} ${idx % 2 === 0 ? '' : 'even-row'}`}>
                                                    <td className="text-center">
                                                        <button 
                                                            onClick={() => toggleGroup(groupKey)}
                                                            className={`group-toggle-btn ${isExpanded ? 'expanded' : ''}`}
                                                        >
                                                            <Plus size={12} style={{ transform: isExpanded ? 'rotate(45deg)' : 'none' }} />
                                                        </button>
                                                    </td>
                                                    <td className="font-bold">
                                                        {first.start_date ? new Date(first.start_date).toLocaleDateString('en-IN') : "N/A"}
                                                    </td>
                                                    <td className="font-semibold">{first.topic || "N/A"}</td>
                                                    <td>{first.sub_topic || "N/A"}</td>
                                                    <td className="font-bold text-blue-800">{first.module || "N/A"}</td>
                                                    <td className="text-emerald-600 font-bold">{first.from_time || "n/a"}</td>
                                                    <td className="text-rose-600 font-bold">{first.to_time || "n/a"}</td>
                                                    <td>
                                                        <select
                                                            value={first.editTrainer}
                                                            onChange={(e) => {
                                                                const newVal = e.target.value;
                                                                setTrainers(prev => prev.map(t => 
                                                                    group.some(gt => gt.id === t.id) ? { ...t, editTrainer: newVal } : t
                                                                ));
                                                            }}
                                                            className="w-full bg-transparent border-none text-[10.5px] font-bold focus:ring-0 cursor-pointer"
                                                            style={{ padding: '0' }}
                                                        >
                                                            <option value="n/a">SELECT TRAINER</option>
                                                            {allUsers.map(u => (
                                                                <option key={u.id} value={u.username}>{u.username.toUpperCase()}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="text-slate-500">{first.department || "N/A"}</td>
                                                    <td className="text-center">
                                                        <button 
                                                            className="px-3 py-1 bg-blue-600 text-white rounded text-[9px] font-bold uppercase hover:bg-blue-700 transition-colors disabled:bg-slate-300"
                                                            onClick={() => handleUpdate(groupKey)}
                                                            disabled={updatingId === groupKey}
                                                        >
                                                            {updatingId === groupKey ? "Wait..." : "Save"}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr className="sub-trainee-row-wrapper">
                                                        <td colSpan="11">
                                                            <div className="sub-trainee-container">
                                                                <div className="flex justify-between items-center p-3 border-b border-slate-100 mb-2">
                                                                    <div className="text-[11px] font-bold text-slate-500 uppercase">
                                                                        Session Participants (Nominees)
                                                                    </div>
                                                                </div>
                                                                <table className="sub-trainee-table">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>EMP ID</th>
                                                                            <th>Trainee Name</th>
                                                                            <th>Department</th>
                                                                            <th>Designation</th>
                                                                            <th>Contact no</th>
                                                                            <th>Type</th>
                                                                            <th>Status</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {group.map(req => {
                                                                            let nominees = [];
                                                                            try {
                                                                                nominees = typeof req.nominees === 'string' ? JSON.parse(req.nominees) : (req.nominees || []);
                                                                            } catch (e) { console.error(e); }

                                                                            return nominees.map((nom, nIdx) => (
                                                                                <tr key={`${req.id}-${nIdx}`}>
                                                                                    <td className="font-bold">{nom.hinai_id || "N/A"}</td>
                                                                                    <td className="font-semibold text-blue-600">{nom.username || nom.name || "N/A"}</td>
                                                                                    <td>{nom.department || "N/A"}</td>
                                                                                    <td>{nom.designation || "N/A"}</td>
                                                                                    <td>{nom.contact || nom.contact_no || "N/A"}</td>
                                                                                    <td className="text-slate-500">{req.training_type || "General"}</td>
                                                                                    <td className={`status-cell ${req.status?.toLowerCase().includes('scheduled') ? 'status-scheduled' : req.status?.toLowerCase().includes('progress') ? 'status-progress' : 'status-pending'}`} style={{ background: 'transparent', padding: '0' }}>
                                                                                        {req.status || "Pending"}
                                                                                    </td>
                                                                                </tr>
                                                                            ));
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div className="scroll-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <ArrowUp size={16} />
            </div>
            
            <div className="support-desk-tab">Support Desk</div>
        </div>
    );
};

export default AdminTrainerDashboard;
