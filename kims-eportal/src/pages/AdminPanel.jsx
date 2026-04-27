import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { AuthContext } from '../context/AuthContext';
import { Clipboard, BookOpen, Contact, CalendarRange, CalendarClock, Users, ShieldCheck, LayoutDashboard, GraduationCap } from 'lucide-react';
import AdminCard from '../components/AdminCard';
import '../styles/Adminpanel.css';

const AdminPanel = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, loading } = useContext(AuthContext);

    if (loading) return null;

    if (!user || (user.role !== 'admin' && user.role !== 'sub_admin')) {
        return <Navigate to="/login" replace />;
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const allSections = [
        { id: 'dashboard', title: "Dashboard", icon: <Clipboard />, desc: "Manage Dashboard", theme: "green", link: "/admin/manage-dashboard" },
        { id: 'training', title: "Training Materials", icon: <BookOpen />, desc: "Manage Training Documents", theme: "teal", link: "/admin/manage-training" },
        { id: 'training_dashboard', title: "Training Dashboard", icon: <LayoutDashboard />, desc: "Monitor Training Requests", theme: "blue", link: "/admin-training-dashboard" },
        { id: 'trainer', title: "Trainer Records", icon: <GraduationCap />, desc: "Manage Trainer Assignments", theme: "teal", link: "/admin-trainer-dashboard" },
        { id: 'telephone', title: "Telephone Directory", icon: <Contact />, desc: "Manage Telephone Directory", theme: "blue", link: "/admin/manage-telephone" },
        { id: 'holidays', title: "Holiday List", icon: <CalendarRange />, desc: "Manage Holiday List", theme: "green", link: "/admin/manage-holidays" },
        { id: 'events', title: "Upcoming Events", icon: <CalendarClock />, desc: "Manage Upcoming Events", theme: "teal", link: "/admin/manage-events" },
        { id: 'people', title: "People", icon: <Users />, desc: "Manage People", theme: "blue" },
    ];

    // Filter sections if user is a sub_admin
    const adminSections = user.role === 'admin' 
        ? allSections 
        : allSections.filter(s => (user.permissions || []).includes(s.id));

    return (
        <div className={`dashboard-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="main-content">
                <Header toggleSidebar={toggleSidebar} />

                <div className="admin-dashboard-container">
                    {adminSections.length > 0 ? (
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
                    ) : (
                        <div className="flex flex-col items-center justify-center p-20 glass-card mx-auto w-fit">
                            <ShieldCheck size={40} className="text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-800">No Modules Assigned</h3>
                            <p className="text-sm text-slate-500">Please contact a Super Admin to configure your access.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;