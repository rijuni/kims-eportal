import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import API from "../services/api";
import { Plus, Minus, ArrowUp, ArrowLeft, Save, RefreshCcw, ChevronDown } from "lucide-react";
import "../styles/admintrainingdashboard.css"; // Using same CSS

const AdminTrainerDashboard = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [trainers, setTrainers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState('success');

    const showToast = (message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(null), 3000);
    };
    const [editingGroup, setEditingGroup] = useState(null);
    const [expandedGroups, setExpandedGroups] = useState({});
    const todayStr = new Date().toLocaleDateString('en-IN');

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [trainerRes, usersRes] = await Promise.all([
                API.get("/trainer-data"),
                API.get("/users")
            ]);

            if (Array.isArray(trainerRes.data)) {
                const processed = trainerRes.data.map(t => {
                    let parsedNominees = [];
                    try {
                        parsedNominees = typeof t.nominees === 'string' ? JSON.parse(t.nominees) : (t.nominees || []);
                    } catch (e) { }
                    return {
                        ...t,
                        editTrainer: t.username || "n/a",
                        editType: t.training_type || "",
                        editRemarks: t.remarks || "",
                        editNominees: parsedNominees
                    };
                });
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

        const hasChanges = group.some(t => {
            const originalTrainer = t.username || "n/a";
            let parsedOriginalNominees = [];
            try { parsedOriginalNominees = typeof t.nominees === 'string' ? JSON.parse(t.nominees) : (t.nominees || []); } catch (e) { }

            return t.editTrainer !== originalTrainer ||
                JSON.stringify(t.editNominees) !== JSON.stringify(parsedOriginalNominees);
        });

        if (!hasChanges) {
            showToast("Nothing to Update", "error");
            setEditingGroup(null);
            return;
        }

        setUpdatingId(groupKey);
        try {
            await Promise.all(group.map(t =>
                API.put(`/trainer-data/${t.id}`, {
                    trainer_name: first.editTrainer,
                    training_type: t.editType,
                    remarks: t.editRemarks,
                    nominees: JSON.stringify(t.editNominees)
                })
            ));
            showToast("Trainee Record Updated Successfully", "success");
            fetchData();
        } catch (err) {
            showToast("Update failed.", "error");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDuplicateNominees = (groupKey) => {
        const todayStr = new Date().toLocaleDateString('en-IN');
        const group = groupedTrainers[groupKey];

        const alreadyExists = group.some(req =>
            (req.editNominees || []).some(nom => {
                const dateToCheck = nom.start_date || req.start_date;
                return dateToCheck && new Date(dateToCheck).toLocaleDateString('en-IN') === todayStr;
            })
        );

        if (alreadyExists) {
            showToast("Records for today already exist!", "error");
            return;
        }

        setTrainers(prev => prev.map(t => {
            if (group.some(req => req.id === t.id)) {
                let originalNominees = [];
                try {
                    originalNominees = typeof t.nominees === 'string' ? JSON.parse(t.nominees) : (t.nominees || []);
                } catch (e) { }

                const duplicated = originalNominees.map(nom => ({
                    ...nom,
                    start_date: new Date().toISOString(),
                    training_type: "",
                    remarks: ""
                }));

                return {
                    ...t,
                    editNominees: [...t.editNominees, ...duplicated]
                };
            }
            return t;
        }));
    };

    const handleRemoveDuplicatedNominees = (groupKey) => {
        const todayStr = new Date().toLocaleDateString('en-IN');
        const group = groupedTrainers[groupKey];

        setTrainers(prev => prev.map(t => {
            if (group.some(req => req.id === t.id)) {
                return {
                    ...t,
                    editNominees: (t.editNominees || []).filter(nom => {
                        if (!nom.start_date) return true;
                        return new Date(nom.start_date).toLocaleDateString('en-IN') !== todayStr;
                    })
                };
            }
            return t;
        }));
        showToast("Added records removed", "success");
    };

    const toggleGroup = (groupKey) => {
        setExpandedGroups(prev => {
            const isCurrentlyExpanded = prev[groupKey];
            return { [groupKey]: !isCurrentlyExpanded };
        });
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
                                    <th>Trainer<br />Dept</th>
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
                                                        <span className="text-[10.5px] font-bold text-slate-700 uppercase">
                                                            {first.username && first.username !== "n/a" ? first.username : "NOT ASSIGNED"}
                                                        </span>
                                                    </td>
                                                    <td className="text-slate-500">{first.department || "N/A"}</td>
                                                    <td className="text-center">
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
                                                                if (editingGroup === groupKey) {
                                                                    handleUpdate(groupKey);
                                                                    setEditingGroup(null);
                                                                } else {
                                                                    // Update status to In-Progress when starting revision
                                                                    const ids = group.map(r => r.id);
                                                                    try {
                                                                        await API.put("/training-requests/bulk-status", { ids, status: "In-Progress" });
                                                                        setTrainers(prev => prev.map(t => ids.includes(t.id) ? { ...t, status: "In-Progress" } : t));
                                                                    } catch (err) {
                                                                        console.error("Failed to update status:", err);
                                                                    }
                                                                    setEditingGroup(groupKey);
                                                                    if (!isExpanded) toggleGroup(groupKey);
                                                                }
                                                            }}
                                                            disabled={updatingId === groupKey}
                                                        >
                                                            {updatingId === groupKey ? "Wait..." : (editingGroup === groupKey ? "Save" : "Revise")}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr className="sub-trainee-row-wrapper">
                                                        <td colSpan="11">
                                                            <div className="sub-trainee-container" style={{ position: 'relative' }}>
                                                                <button
                                                                    onClick={() => {
                                                                        handleDuplicateNominees(groupKey);
                                                                    }}
                                                                    title="Duplicate nominees for today"
                                                                    style={{
                                                                        position: 'absolute',
                                                                        left: '12px',
                                                                        top: '35px',
                                                                        width: '26px',
                                                                        height: '26px',
                                                                        borderRadius: '50%',
                                                                        backgroundColor: '#10b981',
                                                                        color: 'white',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        border: 'none',
                                                                        cursor: 'pointer',
                                                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                                                        zIndex: 10
                                                                    }}
                                                                >
                                                                    <Plus size={16} strokeWidth={3} />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        handleRemoveDuplicatedNominees(groupKey);
                                                                    }}
                                                                    disabled={!group.some(req =>
                                                                        (req.editNominees || []).some(nom => {
                                                                            if (!nom.start_date) return false;
                                                                            return new Date(nom.start_date).toLocaleDateString('en-IN') === new Date().toLocaleDateString('en-IN');
                                                                        })
                                                                    )}
                                                                    title="Remove added records for today"
                                                                    style={{
                                                                        position: 'absolute',
                                                                        left: '12px',
                                                                        top: '66px',
                                                                        width: '26px',
                                                                        height: '26px',
                                                                        borderRadius: '50%',
                                                                        backgroundColor: group.some(req =>
                                                                            (req.editNominees || []).some(nom => {
                                                                                if (!nom.start_date) return false;
                                                                                return new Date(nom.start_date).toLocaleDateString('en-IN') === new Date().toLocaleDateString('en-IN');
                                                                            })
                                                                        ) ? '#ef4444' : '#fda4af',
                                                                        color: 'white',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        border: 'none',
                                                                        cursor: group.some(req =>
                                                                            (req.editNominees || []).some(nom => {
                                                                                if (!nom.start_date) return false;
                                                                                return new Date(nom.start_date).toLocaleDateString('en-IN') === new Date().toLocaleDateString('en-IN');
                                                                            })
                                                                        ) ? 'pointer' : 'not-allowed',
                                                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                                                        zIndex: 10,
                                                                        opacity: group.some(req =>
                                                                            (req.editNominees || []).some(nom => {
                                                                                if (!nom.start_date) return false;
                                                                                return new Date(nom.start_date).toLocaleDateString('en-IN') === new Date().toLocaleDateString('en-IN');
                                                                            })
                                                                        ) ? 1 : 0.6
                                                                    }}
                                                                >
                                                                    <Minus size={16} strokeWidth={3} />
                                                                </button>
                                                                <table className="sub-trainee-table">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>EMP ID</th>
                                                                            <th>Trainee Name</th>
                                                                            <th>Department</th>
                                                                            <th>Designation</th>
                                                                            <th>Module</th>
                                                                            <th>Date</th>
                                                                            <th>Training Types</th>
                                                                            <th>Remarks</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {group.map(req => {
                                                                            return (req.editNominees || []).map((nom, nIdx) => (
                                                                                <tr key={`${req.id}-${nIdx}`}>
                                                                                    <td className="font-bold">{nom.hinai_id || "N/A"}</td>
                                                                                    <td className="font-semibold text-blue-600">{nom.username || nom.name || "N/A"}</td>
                                                                                    <td>{nom.department || "N/A"}</td>
                                                                                    <td>{nom.designation || "N/A"}</td>
                                                                                    <td className="font-bold text-indigo-600">{req.module || nom.module || "N/A"}</td>
                                                                                    <td className="font-semibold text-slate-700">{(nom.start_date || req.start_date) ? new Date(nom.start_date || req.start_date).toLocaleDateString('en-IN') : "N/A"}</td>
                                                                                    <td className="text-slate-500">
                                                                                        {editingGroup === groupKey && (nom.start_date || req.start_date) && (new Date(nom.start_date || req.start_date).toLocaleDateString('en-IN') === todayStr) ? (
                                                                                            <select
                                                                                                value={nom.training_type || ""}
                                                                                                onChange={(e) => {
                                                                                                    const newVal = e.target.value;
                                                                                                    setTrainers(prev => prev.map(t => {
                                                                                                        if (t.id === req.id) {
                                                                                                            const newNoms = [...t.editNominees];
                                                                                                            newNoms[nIdx] = { ...newNoms[nIdx], training_type: newVal };
                                                                                                            return { ...t, editNominees: newNoms };
                                                                                                        }
                                                                                                        return t;
                                                                                                    }));
                                                                                                }}
                                                                                                className="border border-slate-300 rounded"
                                                                                                style={{ padding: '4px 6px', fontSize: '11px', backgroundColor: '#ffffff', color: '#1e293b', colorScheme: 'light', outline: 'none' }}
                                                                                            >
                                                                                                <option value="">Select</option>
                                                                                                <option value="General">General</option>
                                                                                                <option value="Doctor Training & Practice Session - 1">Doctor Training & Practice Session - 1</option>
                                                                                                <option value="Doctor Training & Practice Session - 2">Doctor Training & Practice Session - 2</option>
                                                                                                <option value="Training & Practice Session - 1">Training & Practice Session - 1</option>
                                                                                                <option value="Training & Practice Session - 2">Training & Practice Session - 2</option>
                                                                                                <option value="Training & Practice Session - 3">Training & Practice Session - 3</option>
                                                                                                <option value="Training & Practice Session - 4">Training & Practice Session - 4</option>
                                                                                                <option value="Training & Practice Session - 5">Training & Practice Session - 5</option>
                                                                                                <option value="Training & Practice Session - 6">Training & Practice Session - 6</option>
                                                                                                <option value="Training & Practice Session - 7">Training & Practice Session - 7</option>
                                                                                                <option value="Training & Practice Session - 8">Training & Practice Session - 8</option>
                                                                                                <option value="Training & Practice Session - 9">Training & Practice Session - 9</option>
                                                                                                <option value="Training & Practice Session - 10">Training & Practice Session - 10</option>
                                                                                                <option value="User Test">User Test</option>
                                                                                            </select>
                                                                                        ) : (
                                                                                            nom.training_type || req.training_type || "General"
                                                                                        )}
                                                                                    </td>
                                                                                    <td className="text-slate-500">
                                                                                        {editingGroup === groupKey && (nom.start_date || req.start_date) && (new Date(nom.start_date || req.start_date).toLocaleDateString('en-IN') === todayStr) ? (
                                                                                            <select
                                                                                                value={nom.remarks || ""}
                                                                                                onChange={(e) => {
                                                                                                    const newVal = e.target.value;
                                                                                                    setTrainers(prev => prev.map(t => {
                                                                                                        if (t.id === req.id) {
                                                                                                            const newNoms = [...t.editNominees];
                                                                                                            newNoms[nIdx] = { ...newNoms[nIdx], remarks: newVal };
                                                                                                            return { ...t, editNominees: newNoms };
                                                                                                        }
                                                                                                        return t;
                                                                                                    }));
                                                                                                }}
                                                                                                className="border border-slate-300 rounded"
                                                                                                style={{ padding: '4px 6px', fontSize: '11px', backgroundColor: '#ffffff', color: '#1e293b', colorScheme: 'light', outline: 'none' }}
                                                                                            >
                                                                                                <option value="">Select</option>
                                                                                                <option value="Present">Present</option>
                                                                                                <option value="Absent">Absent</option>
                                                                                            </select>
                                                                                        ) : (
                                                                                            <span style={
                                                                                                (nom.remarks || req.remarks)?.trim() === 'Present' ? { color: '#16a34a', fontWeight: 'bold' } :
                                                                                                    (nom.remarks || req.remarks)?.trim() === 'Absent' ? { color: '#e11d48', fontWeight: 'bold' } :
                                                                                                        {}
                                                                                            }>
                                                                                                {nom.remarks || req.remarks || "-"}
                                                                                            </span>
                                                                                        )}
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

export default AdminTrainerDashboard;
