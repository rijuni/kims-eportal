import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import API from "../services/api";
import { Plus, ArrowUp, ArrowLeft, Save, RefreshCcw } from "lucide-react";
import "../styles/admintrainingdashboard.css";

const AdminTrainingDashboard = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [requests, setRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedGroups, setExpandedGroups] = useState({});
    const [loading, setLoading] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await API.get("/training-requests");
            if (Array.isArray(res.data)) {
                setRequests(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch requests", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const toggleGroup = (groupKey) => {
        setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
    };

    // Grouping Logic
    const groupedRequests = requests.reduce((acc, req) => {
        const key = `${req.start_date}-${req.topic}-${req.module_subject}-${req.trainer_name}-${req.from_time}-${req.to_time}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(req);
        return acc;
    }, {});

    const sortedGroupKeys = Object.keys(groupedRequests).filter(key => {
        const group = groupedRequests[key];
        const first = group[0];
        const search = searchTerm.toLowerCase();
        return (
            (first.topic?.toLowerCase().includes(search)) ||
            (first.module_subject?.toLowerCase().includes(search)) ||
            (first.trainer_name?.toLowerCase().includes(search))
        );
    }).sort((a, b) => {
        const dateA = new Date(groupedRequests[a][0].created_at).getTime();
        const dateB = new Date(groupedRequests[b][0].created_at).getTime();
        return dateB - dateA; // Newest first
    });

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === 'n/a') return 'n/a';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getStatusClass = (status) => {
        const s = status ? status.toLowerCase() : '';
        if (s.includes('scheduled')) return 'status-scheduled';
        if (s.includes('progress')) return 'status-progress';
        return 'status-pending'; 
    };

    return (
        <div className={`dashboard-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="main-content">
                <Header toggleSidebar={toggleSidebar} />
                
                <div className="dashboard-container p-4" style={{ marginTop: '20px' }}>
                    <div className="admin-training-header-banner">
                        <div className="flex items-center gap-4">
                            <button className="back-btn-dashboard" onClick={() => navigate("/training-materials")}>
                                <ArrowLeft size={18} />
                            </button>
                            <h1>Admin Training Dashboard</h1>
                        </div>
                        
                        <div className="header-search-wrapper">
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
                            
                            <button 
                                className="refresh-btn-dashboard"
                                style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)', padding: '8px 16px', borderRadius: '50px', color: '#1e293b', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                                onClick={fetchRequests}
                            >
                                <RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> REFRESH
                            </button>
                        </div>
                    </div>

                    <div className="admin-training-table-wrapper animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <table className="admin-training-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}></th>
                                    <th>Start Date</th>
                                    <th>Topic</th>
                                    <th>Sub Topic</th>
                                    <th>Module</th>
                                    <th>From Time</th>
                                    <th>To Time</th>
                                    <th>Trainer Name</th>
                                    <th>Trainer Department</th>
                                    <th className="status-col">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="10" className="text-center py-12 text-gray-500 font-bold">Fetching training data...</td>
                                    </tr>
                                ) : sortedGroupKeys.length > 0 ? (
                                    sortedGroupKeys.map((key) => {
                                        const group = groupedRequests[key];
                                        const first = group[0];
                                        const isExpanded = expandedGroups[key];

                                        return (
                                            <React.Fragment key={key}>
                                                <tr className="group-header-row">
                                                    <td className="icon-col cursor-pointer" onClick={() => toggleGroup(key)}>
                                                        <div className={`group-toggle-btn ${isExpanded ? 'expanded' : ''}`}>
                                                            {isExpanded ? <Plus size={14} style={{ transform: 'rotate(45deg)' }} /> : <Plus size={14} />}
                                                        </div>
                                                    </td>
                                                    <td className="font-bold">{formatDate(first.start_date)}</td>
                                                    <td className="font-semibold text-slate-700">{first.topic || 'n/a'}</td>
                                                    <td className="text-slate-600">{first.sub_topic || 'n/a'}</td>
                                                    <td className="font-medium text-indigo-700">{first.module_subject || 'n/a'}</td>
                                                    <td className="text-[11px] font-bold text-emerald-600">{first.from_time || 'n/a'}</td>
                                                    <td className="text-[11px] font-bold text-rose-600">{first.to_time || 'n/a'}</td>
                                                    <td className="font-bold">{first.trainer_name || 'n/a'}</td>
                                                    <td className="text-slate-500 font-medium">{first.trainer_dept || 'n/a'}</td>
                                                    <td className={`status-cell ${getStatusClass(first.status)}`}>
                                                        {first.status || 'n/a'}
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr className="expanded-details-row">
                                                        <td colSpan="10">
                                                            <div className="sub-trainee-container">
                                                                <div className="flex justify-between items-center p-3 border-b border-slate-100 mb-2">
                                                                    <div className="text-[12px] font-bold text-slate-500">
                                                                        Scheduled Participants (Nominees)
                                                                    </div>
                                                                    <div className="flex gap-4 text-[11px]">
                                                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-bold border border-slate-200">
                                                                            LOCATION: {first.branch_location || 'GENERAL'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <table className="sub-trainee-table">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>EMP ID</th>
                                                                                    <th>Trainee Name</th>
                                                                                    <th>Department</th>
                                                                                    <th>Trainee Designation</th>
                                                                                    <th>Contact no</th>
                                                                                    <th>Training Type</th>
                                                                                    <th>Trainer Name</th>
                                                                                    <th>Status</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {group.map((req) => {
                                                                                    let nominees = [];
                                                                                    try {
                                                                                        nominees = typeof req.nominees === 'string' ? JSON.parse(req.nominees) : (req.nominees || []);
                                                                                    } catch (e) { console.error(e); }

                                                                                    return nominees.map((nom, nIdx) => (
                                                                                        <tr key={`${req.id}-${nIdx}`}>
                                                                                            <td className="font-bold">{nom.hinai_id || 'n/a'}</td>
                                                                                            <td className="font-semibold text-blue-600">{nom.username || nom.name || 'n/a'}</td>
                                                                                            <td>{nom.department || 'n/a'}</td>
                                                                                            <td>{nom.designation || 'n/a'}</td>
                                                                                            <td>{nom.contact || nom.contact_no || 'n/a'}</td>
                                                                                            <td className="font-medium text-slate-500">{req.training_type || 'General'}</td>
                                                                                            <td className="font-bold text-indigo-600">{req.trainer_name || 'N/A'}</td>
                                                                                            <td className={`status-cell ${getStatusClass(req.status)}`} style={{ background: 'transparent', padding: '0' }}>
                                                                                                {req.status || 'Pending'}
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
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="text-center py-8 text-gray-500 font-bold">No training requests found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div className="scroll-top-btn">
                <ArrowUp size={16} />
            </div>
            
            <div className="support-desk-tab">
                Support Desk
            </div>
        </div>
    );
};

export default AdminTrainingDashboard;
