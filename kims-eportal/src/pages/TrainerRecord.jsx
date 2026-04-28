import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import API from "../services/api";
import { Search, ArrowLeft as ArrowLeftIcon, ArrowUp as ArrowUpIcon, Plus as PlusIcon, Save as SaveIcon, RefreshCcw as RefreshCcwIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/admintrainingdashboard.css"; // Using same CSS for consistency

const TrainerRecord = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [records, setRecords] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [trainerSearchTerm, setTrainerSearchTerm] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState({});
    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState('success');

    const showToast = (message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const [recordsRes, usersRes] = await Promise.all([
                API.get("/trainer-records"),
                API.get("/users")
            ]);
            
            if (Array.isArray(recordsRes.data)) {
                const processed = recordsRes.data.map(r => ({
                    ...r,
                    editTrainer: r.trainer_name || "n/a",
                    editType: r.training_type || "General",
                    editRemarks: r.remarks || "",
                    editFromTime: r.from_time || "",
                    editToTime: r.to_time || ""
                }));
                setRecords(processed);
            }

            if (Array.isArray(usersRes.data)) {
                setAllUsers(usersRes.data);
            }
        } catch (err) {
            console.error("Failed to fetch records:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const toggleGroup = (key) => {
        setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const groupedRecords = records.reduce((acc, r) => {
        const key = `${r.start_date}-${r.topic}-${r.module}-${r.from_time}-${r.to_time}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(r);
        return acc;
    }, {});

    const filteredKeys = Object.keys(groupedRecords).filter(key => {
        const group = groupedRecords[key];
        const first = group[0];
        const search = searchTerm.toLowerCase();
        return (
            (first.topic?.toLowerCase().includes(search)) ||
            (first.module?.toLowerCase().includes(search)) ||
            (first.trainer_name?.toLowerCase().includes(search)) ||
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
                                <ArrowLeftIcon size={18} />
                            </button>
                            <h1>Trainer Records Manager</h1>
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
                                <Search size={14} strokeWidth={3} />
                            </div>
                        </div>
                    </div>

                    <div className="admin-training-table-wrapper">
                        {/* Search Bar moved to header */}

                        <table className="admin-training-table">
                            <thead>
                                <tr>
                                    <th className="icon-col"></th>
                                    <th>Start Date</th>
                                    <th>Topic</th>
                                    <th>Sub Topic</th>
                                    <th>Module</th>
                                    <th className={editingId ? "blink-header" : ""} style={{ transition: 'color 0.2s' }}>From Time</th>
                                    <th className={editingId ? "blink-header" : ""} style={{ transition: 'color 0.2s' }}>To Time</th>
                                    <th className={editingId ? "blink-header" : ""} style={{ transition: 'color 0.2s' }}>Trainer Name</th>
                                    <th>Trainer Dept</th>
                                    <th className="text-center" style={{ width: '100px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="10" className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                            Fetching trainer records...
                                        </td>
                                    </tr>
                                ) : filteredKeys.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                            No records found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredKeys.map((key, idx) => {
                                        const group = groupedRecords[key];
                                        const first = group[0];
                                        const isExpanded = expandedGroups[key];

                                        return (
                                            <React.Fragment key={key}>
                                                <tr className={`group-header-row ${isExpanded ? 'active' : ''} ${idx % 2 === 0 ? '' : 'even-row'}`}>
                                                    <td className="text-center">
                                                        <button 
                                                            onClick={() => toggleGroup(key)}
                                                            className={`group-toggle-btn ${isExpanded ? 'expanded' : ''}`}
                                                        >
                                                            <PlusIcon size={12} style={{ transform: isExpanded ? 'rotate(45deg)' : 'none' }} />
                                                        </button>
                                                    </td>
                                                    <td className="font-bold">
                                                        {first.start_date ? new Date(first.start_date).toLocaleDateString('en-IN') : "N/A"}
                                                    </td>
                                                    <td className="font-semibold">{first.topic || "N/A"}</td>
                                                    <td>{first.sub_topic || "N/A"}</td>
                                                    <td className="font-bold text-indigo-600">{first.module || "N/A"}</td>
                                                    <td>
                                                        {editingId === key ? (
                                                            <input
                                                                type="time"
                                                                value={first.editFromTime}
                                                                onChange={(e) => {
                                                                    const newVal = e.target.value;
                                                                    setRecords(prev => prev.map(r => 
                                                                        group.some(gr => gr.request_id === r.request_id) ? { ...r, editFromTime: newVal } : r
                                                                    ));
                                                                }}
                                                                style={{ width: '85px', padding: '4px', fontSize: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#ffffff', color: '#1e293b', colorScheme: 'light' }}
                                                            />
                                                        ) : (
                                                            <span className="text-emerald-600 font-bold">{first.from_time || "n/a"}</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editingId === key ? (
                                                            <input
                                                                type="time"
                                                                value={first.editToTime}
                                                                onChange={(e) => {
                                                                    const newVal = e.target.value;
                                                                    setRecords(prev => prev.map(r => 
                                                                        group.some(gr => gr.request_id === r.request_id) ? { ...r, editToTime: newVal } : r
                                                                    ));
                                                                }}
                                                                style={{ width: '85px', padding: '4px', fontSize: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#ffffff', color: '#1e293b', colorScheme: 'light' }}
                                                            />
                                                        ) : (
                                                            <span className="text-rose-600 font-bold">{first.to_time || "n/a"}</span>
                                                        )}
                                                    </td>
                                                    <td style={{ position: 'relative' }}>
                                                        {editingId === key ? (
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search by ID or Name..."
                                                                    value={trainerSearchTerm}
                                                                    onChange={(e) => {
                                                                        setTrainerSearchTerm(e.target.value);
                                                                        setShowResults(true);
                                                                    }}
                                                                    style={{ 
                                                                        width: '100%', 
                                                                        backgroundColor: '#ffffff', 
                                                                        border: '1px solid #e2e8f0', 
                                                                        borderRadius: '8px', 
                                                                        padding: '7px 12px', 
                                                                        fontSize: '11px', 
                                                                        fontWeight: '600', 
                                                                        color: '#1e293b',
                                                                        outline: 'none',
                                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                                    }}
                                                                    autoFocus
                                                                />
                                                                {showResults && trainerSearchTerm && (
                                                                    <div 
                                                                        className="absolute left-0 top-full mt-2 z-[9999] animate-in fade-in zoom-in-95 duration-200"
                                                                        style={{ 
                                                                            backgroundColor: '#ffffff', 
                                                                            borderRadius: '12px', 
                                                                            boxShadow: '0 15px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)', 
                                                                            padding: '6px', 
                                                                            width: 'max-content',
                                                                            minWidth: '300px',
                                                                            border: '1px solid #e2e8f0'
                                                                        }}
                                                                    >
                                                                        {allUsers
                                                                            .filter(u => 
                                                                                u.username.toLowerCase().includes(trainerSearchTerm.toLowerCase()) || 
                                                                                u.hinai_id?.toLowerCase().includes(trainerSearchTerm.toLowerCase())
                                                                            )
                                                                            .slice(0, 7)
                                                                            .map(u => (
                                                                                <div 
                                                                                    key={u.id} 
                                                                                    className="group cursor-pointer transition-all duration-200"
                                                                                    style={{ 
                                                                                        display: 'flex', 
                                                                                        alignItems: 'center', 
                                                                                        gap: '10px', 
                                                                                        padding: '8px 12px', 
                                                                                        borderRadius: '8px',
                                                                                        marginBottom: '2px'
                                                                                    }}
                                                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                                    onClick={() => {
                                                                                        setRecords(prev => prev.map(r => 
                                                                                            group.some(gr => gr.request_id === r.request_id) ? { ...r, editTrainer: u.username } : r
                                                                                        ));
                                                                                        setTrainerSearchTerm(u.username);
                                                                                        setShowResults(false);
                                                                                    }}
                                                                                >
                                                                                    <div style={{ 
                                                                                        backgroundColor: '#2563eb', 
                                                                                        color: '#ffffff', 
                                                                                        fontSize: '9px', 
                                                                                        fontWeight: '800', 
                                                                                        padding: '3px 8px', 
                                                                                        borderRadius: '6px', 
                                                                                        minWidth: '40px', 
                                                                                        textAlign: 'center'
                                                                                    }}>
                                                                                        {u.hinai_id || "N/A"}
                                                                                    </div>
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                        <span style={{ 
                                                                                            fontSize: '11.5px', 
                                                                                            fontWeight: '700', 
                                                                                            color: '#1e293b', 
                                                                                            textTransform: 'uppercase'
                                                                                        }}>
                                                                                            {u.username}
                                                                                        </span>
                                                                                        <span style={{ color: '#cbd5e1', fontSize: '11px' }}>|</span>
                                                                                        <span style={{ 
                                                                                            fontSize: '9px', 
                                                                                            fontWeight: '600', 
                                                                                            color: '#64748b', 
                                                                                            textTransform: 'uppercase',
                                                                                            backgroundColor: '#f1f5f9',
                                                                                            padding: '1.5px 6px',
                                                                                            borderRadius: '4px'
                                                                                        }}>
                                                                                            {u.department || "General"}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10.5px] font-bold text-slate-700 uppercase">
                                                                {first.trainer_name || "NOT ASSIGNED"}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="text-slate-500">{first.trainer_dept || "N/A"}</td>
                                                    <td className="text-center">
                                                        {editingId === key ? (
                                                            <button 
                                                                style={{ 
                                                                    padding: '8px 16px', 
                                                                    backgroundColor: '#2563eb', 
                                                                    color: '#ffffff', 
                                                                    borderRadius: '8px', 
                                                                    fontSize: '10px', 
                                                                    fontWeight: '800', 
                                                                    textTransform: 'uppercase',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    boxShadow: '0 3px 10px rgba(37, 99, 235, 0.2)',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                onClick={async () => {
                                                                    const hasChanges = first.editTrainer !== (first.trainer_name || "n/a") || 
                                                                                       first.editFromTime !== (first.from_time || "") || 
                                                                                       first.editToTime !== (first.to_time || "");
                                                                                       
                                                                    if (!hasChanges) {
                                                                        showToast("Nothing to Update", "error");
                                                                        setEditingId(null);
                                                                        return;
                                                                    }

                                                                    setUpdatingId(key);
                                                                    try {
                                                                        await Promise.all(group.map(t => 
                                                                            API.put(`/trainer-data/${t.request_id}`, {
                                                                                trainer_name: first.editTrainer,
                                                                                training_type: first.editType,
                                                                                remarks: first.editRemarks,
                                                                                from_time: first.editFromTime,
                                                                                to_time: first.editToTime
                                                                            })
                                                                        ));
                                                                        setEditingId(null);
                                                                        fetchRecords();
                                                                        showToast("Trainer assigned successfully", "success");
                                                                    } catch (err) {
                                                                        showToast("Update failed.", "error");
                                                                    } finally {
                                                                        setUpdatingId(null);
                                                                    }
                                                                }}
                                                                disabled={updatingId === key}
                                                            >
                                                                {updatingId === key ? "Wait..." : "Revise"}
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                style={{ 
                                                                    padding: '7px 18px', 
                                                                    backgroundColor: '#2563eb', 
                                                                    color: '#ffffff', 
                                                                    borderRadius: '8px', 
                                                                    fontSize: '10px', 
                                                                    fontWeight: '800', 
                                                                    textTransform: 'uppercase',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                onClick={() => {
                                                                    setEditingId(key);
                                                                    setTrainerSearchTerm(first.trainer_name || "");
                                                                    setShowResults(false);
                                                                }}
                                                            >
                                                                Update
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr className="sub-trainee-row-wrapper">
                                                        <td colSpan="11">
                                                            <div className="sub-trainee-container">
                                                                <table className="sub-trainee-table">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>EMP ID</th>
                                                                            <th>Trainee Name</th>
                                                                            <th>Department</th>
                                                                            <th>Trainee Designation</th>
                                                                            <th>Contact no</th>
                                                                            <th>Date</th>
                                                                            <th>Type</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {group.map(req => {
                                                                            let nomineesList = [];
                                                                            try {
                                                                                nomineesList = typeof req.nominees === 'string' ? JSON.parse(req.nominees) : (req.nominees || []);
                                                                            } catch (e) { console.error(e); }

                                                                            return nomineesList.map((nom, nIdx) => (
                                                                                <tr key={`${req.request_id}-${nIdx}`}>
                                                                                    <td className="font-bold">{nom.hinai_id || "N/A"}</td>
                                                                                    <td className="font-semibold text-blue-600">{nom.username || nom.name || "N/A"}</td>
                                                                                    <td>{nom.department || "N/A"}</td>
                                                                                    <td>{nom.designation || "N/A"}</td>
                                                                                    <td>{nom.contact || nom.contact_no || "N/A"}</td>
                                                                                    <td className="font-semibold text-slate-700">{req.start_date ? new Date(req.start_date).toLocaleDateString('en-IN') : "N/A"}</td>
                                                                                    <td className="font-medium text-slate-500">{req.training_type || "General"}</td>
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
                <ArrowUpIcon size={16} />
            </div>
            
            {toastMessage && (
                <div style={{
                    position: 'fixed',
                    top: '5px',
                    right: '50px',
                    backgroundColor: toastType === 'success' ? '#10b981' : '#ef4444',
                    color: 'white',
                    padding: '6px 20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 9999,
                    fontWeight: 'bold',
                    fontSize: '12px',
                    letterSpacing: '0.5px'
                }}>
                    {toastMessage}
                </div>
            )}
            
            <div className="support-desk-tab">Support Desk</div>
        </div>
    );
};

export default TrainerRecord;
