import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import NoticeBoard from "../components/NoticeBoard";
import EventsCard from "../components/EventsCard";
import BirthdayCard from "../components/BirthdayCard";
import { List, CalendarCheck, Cake } from "lucide-react";
import "../styles/dashboard.css";

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className={`dashboard-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="main-content">
                <Header toggleSidebar={toggleSidebar} />

                {/* Centered Content Container */}
                <div className="dashboard-container">
                    <div className="dashboard-flex">
                        {/* Left Column: Notice Board */}
                        <div className="notice-section">
                            <div className="section-title-wrap">
                                <h1 className="page-title">Notice Board</h1>
                                <p className="page-subtitle">Stay updated with the latest announcements</p>
                            </div>
                            <NoticeBoard />
                        </div>

                        {/* Right Column: Events & Birthdays Grouped */}
                        <div className="info-section">
                            {/* Top Action Pills */}
                            <div className="action-pills">
                                <a href="#" className="action-pill hover-scale">Hinai</a>
                                <a href="#" className="action-pill hover-scale">SAP</a>
                                <a href="#" className="action-pill hover-scale">Email</a>
                            </div>

                            <div className="right-panel-group">
                                {/* Upcoming Events */}
                                <div className="event-group">
                                    <div className="section-title-wrap flex items-center gap-3">
                                        <span className="w-8 h-8 rounded bg-[#f1f5f9] flex items-center justify-center">
                                            <CalendarCheck size={18} className="text-orange-500" />
                                        </span>
                                        <div>
                                            <h2 className="page-title">Upcoming Events</h2>
                                            <p className="page-subtitle">Be ready for every moment</p>
                                        </div>
                                    </div>
                                    <EventsCard />
                                </div>

                                {/* Birthdays */}
                                <div className="birthday-group">
                                    <div className="section-title-wrap flex items-center gap-3">
                                        <span className="w-8 h-8 rounded bg-[#f1f5f9] flex items-center justify-center">
                                            <Cake size={18} className="text-red-500" />
                                        </span>
                                        <div>
                                            <h2 className="page-title">Birthdays</h2>
                                            <p className="page-subtitle">Celebrating our team members</p>
                                        </div>
                                    </div>
                                    <BirthdayCard />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;