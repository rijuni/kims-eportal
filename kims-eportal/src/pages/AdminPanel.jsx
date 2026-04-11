import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { AuthContext } from '../context/AuthContext';
import { Clipboard, BookOpen, Contact, CalendarRange, CalendarClock, Users } from 'lucide-react';
import AdminCard from '../components/AdminCard';
import '../styles/Adminpanel.css';

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

    const adminSections = [
        { title: "Dashboard", icon: <Clipboard />, desc: "Revert services to the desired status", theme: "blue" },
        { title: "Training Materials", icon: <BookOpen />, desc: "Blood Bag Cross-Match", theme: "green" },
        { title: "Telephone Directory", icon: <Contact />, desc: "Revert invoices to the desired status", theme: "red" },
        { title: "Holiday List", icon: <CalendarRange />, desc: "Remove death details for a patient", theme: "orange" },
        { title: "Upcoming Events", icon: <CalendarClock />, desc: "Revert OT request to pending status", theme: "teal" },
        { title: "People", icon: <Users />, desc: "Revert patient status to IP", theme: "amber" },
    ];

    return (
        <div className={`dashboard-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="main-content">
                <Header toggleSidebar={toggleSidebar} />

                <div className="admin-dashboard-container">
                    <div className="grid-container">
                        {adminSections.map((section, idx) => (
                            <AdminCard
                                key={idx}
                                title={section.title}
                                icon={section.icon}
                                description={section.desc}
                                theme={section.theme}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;