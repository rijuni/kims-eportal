import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import API from "../services/api";
import { BookOpen, UploadCloud, Trash2, ArrowLeft, FileText } from "lucide-react";
import "../styles/managedashboard.css";

const ManageTraining = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // Form State
    const [topic, setTopic] = useState("");
    const [topicArea, setTopicArea] = useState("");
    const [pdfFile, setPdfFile] = useState(null);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const fetchMaterials = async () => {
        try {
            const res = await API.get("/training");
            if (res.data) setMaterials(res.data);
        } catch (err) {
            console.error("Error fetching materials:", err);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        if (!pdfFile) {
            setErrorMsg("Please select a PDF file.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("topic", topic);
        formData.append("topic_area", topicArea);
        formData.append("trainingFile", pdfFile);

        try {
            const res = await API.post("/training", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.success) {
                setSuccessMsg("Document added successfully!");
                setTopic("");
                setTopicArea("");
                setPdfFile(null);
                if (document.getElementById("training-file-input")) {
                    document.getElementById("training-file-input").value = "";
                }
                fetchMaterials();
                setTimeout(() => setSuccessMsg(""), 5000);
            }
        } catch (err) {
            setErrorMsg("Failed to add document.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Remove this document?")) {
            try {
                await API.delete(`/training/${id}`);
                fetchMaterials();
                setSuccessMsg("Document deleted.");
                setTimeout(() => setSuccessMsg(""), 3000);
            } catch (err) {
                setErrorMsg("Error deleting document.");
            }
        }
    };

    return (
        <div className={`dashboard-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="main-content">
                <Header toggleSidebar={toggleSidebar} />

                <div className="admin-manage-container">
                    <div className="page-header-row">
                        <button className="back-btn" onClick={() => navigate("/admin")} title="Back to Admin Panel">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="manage-page-title">Manage Training Materials</h1>
                    </div>
                    <p className="manage-page-sub">Upload PDF user manuals and training documents to the Referral Library.</p>

                    <div className="manage-grid">
                        
                        <div className="manage-box box-teal" style={{ height: 'auto' }}>
                            <div className="box-header">
                                <UploadCloud size={24} /> <h2>Upload New Document</h2>
                            </div>
                            <form onSubmit={handleFormSubmit} className="manual-form">
                                <input 
                                    required 
                                    className="light-input" 
                                    type="text" 
                                    placeholder="Topic Name (e.g., OP Billing User Manual)" 
                                    value={topic} 
                                    onChange={e => setTopic(e.target.value)} 
                                />
                                <input 
                                    required 
                                    className="light-input" 
                                    type="text" 
                                    placeholder="Topic Area (e.g., Billing, Pharmacy, HR)" 
                                    value={topicArea} 
                                    onChange={e => setTopicArea(e.target.value)} 
                                />
                                <div className="file-input-wrapper">
                                    <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', marginLeft: '2px' }}>Document PDF (Mandatory)</label>
                                    <input 
                                        id="training-file-input"
                                        required
                                        type="file" 
                                        accept=".pdf" 
                                        className="light-input" 
                                        style={{ padding: '8px 12px', background: '#f8fafc' }} 
                                        onChange={e => setPdfFile(e.target.files[0])} 
                                    />
                                </div>
                                <button type="submit" className="action-btn-teal" disabled={loading}>
                                    {loading ? "Uploading..." : "Add to Library"}
                                </button>
                                {successMsg && <div className="sync-success-msg" style={{ marginTop: '10px' }}>{successMsg}</div>}
                                {errorMsg && <div className="sync-error-msg" style={{ marginTop: '10px' }}>{errorMsg}</div>}
                            </form>
                        </div>

                        <div className="manage-box box-blue" style={{ height: 'auto', minHeight: '400px' }}>
                            <div className="box-header">
                                <BookOpen size={24} /> <h2>Existing Materials ({materials.length})</h2>
                            </div>
                            <div className="table-responsive" style={{ marginTop: '10px' }}>
                                <table className="upcoming-table">
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '12px 15px' }}>Topic</th>
                                            <th style={{ padding: '12px 15px' }}>Area</th>
                                            <th style={{ padding: '12px 15px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {materials.length > 0 ? (
                                            materials.map(m => (
                                                <tr key={m.id} className="upcoming-row">
                                                    <td style={{ padding: '12px 15px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <FileText size={16} color="#3b82f6" />
                                                            <span style={{ fontSize: '13.5px', fontWeight: '600', color: '#1e293b' }}>{m.topic}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px 15px' }}>
                                                        <span style={{ fontSize: '12px', color: '#64748b' }}>{m.topic_area}</span>
                                                    </td>
                                                    <td style={{ padding: '12px 15px', textAlign: 'right' }}>
                                                        <button onClick={() => handleDelete(m.id)} className="del-btn" title="Delete Material">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '13px' }}>No documents found.</td>
                                            </tr>
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

export default ManageTraining;
