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
        { title: "Dashboard", icon: <Clipboard />, desc: "Manage Dashboard", theme: "green", link: "/admin/manage-dashboard" },
        { title: "Training Materials", icon: <BookOpen />, desc: "Manage Training Materials", theme: "green" },
        { title: "Telephone Directory", icon: <Contact />, desc: "Manage Telephone Directory", theme: "red" },
        { title: "Holiday List", icon: <CalendarRange />, desc: "Manage Holiday List", theme: "orange" },
        { title: "Upcoming Events", icon: <CalendarClock />, desc: "Manage Upcoming Events", theme: "teal" },
        { title: "People", icon: <Users />, desc: "Manage People", theme: "amber" },
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
                                link={section.link}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;