import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { AuthContext } from '../context/AuthContext';

const AdminPanel = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, loading } = useContext(AuthContext);

    if (loading) return null;

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className={`dashboard-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="main-content">
                <Header toggleSidebar={toggleSidebar} />

                <div className="dashboard-container">
                    <div className="section-header-row mb-4">
                        <div className="section-title-wrap">
                            <h1 className="page-title text-2xl font-bold text-white">Admin Panel</h1>
                            <p className="page-subtitle text-white/80">Manage portal content and settings</p>
                        </div>
                    </div>

                    <div className="card p-8 min-h-[500px]">
                        <h2 className="text-xl font-semibold mb-4 text-[#1a202c]">Welcome, {user.username}!</h2>
                        <p className="text-gray-600 mb-6">
                            This is the protected administration area. From here you can manage notices, events, and other portal content.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 border border-gray-100 rounded-xl bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition">
                                <span className="text-[#1FA463] font-bold text-lg">Manage Notices</span>
                            </div>
                            <div className="p-6 border border-gray-100 rounded-xl bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition">
                                <span className="text-[#1FA463] font-bold text-lg">Manage Events</span>
                            </div>
                            <div className="p-6 border border-gray-100 rounded-xl bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition">
                                <span className="text-[#1FA463] font-bold text-lg">User Directory</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
