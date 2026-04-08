import React, { useState } from 'react';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { CalendarDays, MapPin, Gift } from "lucide-react";
import '../styles/upcoming-events.css';

const UpcomingEvents = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const events = [
        { id: 1, name: "World Cancer Day", date: "4th February, 2026", location: "KIMS Cancer Centre", category: "Health" },
        { id: 2, name: "International Women's Day", date: "8th March, 2026", location: "KIMS Lobby", category: "Celebration" },
        { id: 3, name: "World Kidney Day", date: "13th March, 2026", location: "KIMS Super speciality & Cancer Centre", category: "Health" },
        { id: 4, name: "Employee Wellness Workshop", date: "25th March, 2026", location: "KIMS Auditorium", category: "Training" },
        { id: 5, name: "World Health Day", date: "7th April, 2026", location: "KIMS Campus", category: "General" },
        { id: 6, name: "Doctor's Appreciation Night", date: "15th June, 2026", location: "KIMS Grand Ballroom", category: "Corporate" },
        { id: 7, name: "Independence Day Celebration", date: "15th August, 2026", location: "KIMS Main Gate", category: "National" },
    ];

    return (
        <div className={`upcoming-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="main-content">
                <Header toggleSidebar={toggleSidebar} />

                <div className="upcoming-container">
                    <div className="upcoming-header-row">
                        <h1 className="upcoming-title">Be ready for every important moment</h1>
                    </div>

                    <div className="upcoming-card scrollable">
                        <div className="event-grid">
                            {events.map((event) => (
                                <div className="full-event-item" key={event.id}>
                                    <div className="event-icon-box">
                                        <CalendarDays size={24} />
                                    </div>
                                    <div className="event-details">
                                        <h3 className="event-name">{event.name}</h3>
                                        <div className="event-meta">
                                            <div className="meta-item">
                                                <CalendarDays size={14} className="text-[#1fa463]" />
                                                <span>{event.date}</span>
                                            </div>
                                            <div className="meta-item">
                                                <MapPin size={14} className="text-[#1fa463]" />
                                                <span>{event.location}</span>
                                            </div>
                                            <div className="meta-item">
                                                <span className="bg-[#1fa46315] text-[#1fa463] text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                                                    {event.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="doc-actions">
                                        <button className="download-btn">View Details</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpcomingEvents;
