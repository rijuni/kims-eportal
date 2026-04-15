import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { ChevronRight, FileText } from "lucide-react";
import { FaFilePdf } from "react-icons/fa6";
import API from "../services/api";
import "../styles/training.css";

const TrainingMaterials = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [documents, setDocuments] = useState([]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const fetchDocuments = async () => {
        try {
            const res = await API.get("/training");
            if (res.data) setDocuments(res.data);
        } catch (err) {
            console.error("Error fetching documents:", err);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const getFullUrl = (url) => {
        if (!url) return "#";
        const finalBase = `http://${window.location.hostname}:5000`;
        return `${finalBase}${url}`;
    };

    return (
        <div className={`dashboard-wrapper training-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="main-content">
                <Header toggleSidebar={toggleSidebar} />

                <div className="dashboard-container">
                    <div className="training-header-row">
                        <h1 className="training-title">Referral Library Documents</h1>
                        <button className="training-request-btn">
                            Training Request <ChevronRight size={18} />
                        </button>
                    </div>

                    <div className="documents-card">
                        {documents.length > 0 ? (
                            documents.map((doc) => (
                                <div className="document-item" key={doc.id}>
                                    <div className="doc-info-grid">
                                        <div className="doc-row">
                                            <span className="doc-label">Topic</span>
                                            <span className="doc-value">: {doc.topic}</span>
                                        </div>
                                        <div className="doc-row">
                                            <span className="doc-label">Topic Area</span>
                                            <span className="doc-value">: {doc.topic_area}</span>
                                        </div>
                                    </div>

                                    <div className="doc-actions">
                                        <div className="pdf-icon-box bg-transparent flex items-center justify-center">
                                            <FaFilePdf size={22} className="text-[#e53e3e] drop-shadow-sm cursor-pointer transition-colors" />
                                        </div>
                                        <a 
                                            href={getFullUrl(doc.document_url)} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="download-link"
                                            download
                                        >
                                            Download
                                        </a>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                No training materials found in the library.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainingMaterials;
