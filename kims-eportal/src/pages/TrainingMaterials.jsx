import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { ChevronRight } from "lucide-react";
import { FaFilePdf } from "react-icons/fa6";
import "../styles/training.css";

const TrainingMaterials = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const documents = [
        { id: 1, topic: "IP Billing User Manual", topicArea: "IP Billing" },
        { id: 2, topic: "OP Billing User Manual", topicArea: "OP Billing" },
        { id: 3, topic: "Registration User Manual", topicArea: "Registration" },
        { id: 4, topic: "Radiology Token Generation & Report Dispatch User Manual", topicArea: "Radiology Token Generation & Report Dispatch" },
        { id: 5, topic: "OT Role User Manual", topicArea: "OP Pharmacy Sales" },
        { id: 6, topic: "Lab Sample Collection & Send User Manual", topicArea: "IP Pharmacy User Role" },
        { id: 7, topic: "HR Role User Manual", topicArea: "HR Role" },
    ];

    return (
        <div className={`dashboard-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`}>
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
                        {documents.map((doc) => (
                            <div className="document-item" key={doc.id}>
                                <div className="doc-info-grid">
                                    <div className="doc-row">
                                        <span className="doc-label">Topic</span>
                                        <span className="doc-value">: {doc.topic}</span>
                                    </div>
                                    <div className="doc-row">
                                        <span className="doc-label">Topic Area</span>
                                        <span className="doc-value">: {doc.topicArea}</span>
                                    </div>
                                </div>

                                <div className="doc-actions">
                                    <div className="pdf-icon-box bg-transparent flex items-center justify-center">
                                        <FaFilePdf size={22} className="text-[#e53e3e] drop-shadow-sm cursor-pointer hover:scale-105 transition-transform" />
                                    </div>
                                    <a href="#" className="download-link">Download</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainingMaterials;
