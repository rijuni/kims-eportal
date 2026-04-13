import React, { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { CalendarDays, MapPin } from "lucide-react";
import '../styles/upcoming-events.css';
import API from "../services/api";

const UpcomingEvents = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        API.get("/events/upcoming")
            .then(res => { if(res.data) setEvents(res.data); })
            .catch(console.error);
    }, []);

    return (
        <div className={`upcoming-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="main-content">
                <Header toggleSidebar={toggleSidebar} />

                <div className="upcoming-container">
                    <div className="upcoming-header-row">
                        <h1 className="upcoming-title">Be ready for every important moment</h1>
                    </div>

                    <div className="upcoming-card">
                        <div className="table-responsive">
                            <table className="upcoming-table">
                                <thead>
                                    <tr>
                                        <th>Date & Timing</th>
                                        <th>Event Name</th>
                                        <th>Location</th>
                                        <th>Type</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map((event) => (
                                        <tr key={event.id} className="upcoming-row">
                                            <td className="date-cell">
                                                <div className="flex-cell">
                                                    <CalendarDays size={14} className="text-[#1fa463]" />
                                                    <span>{event.event_date}</span>
                                                </div>
                                            </td>
                                            <td className="event-cell">
                                                <span className="event-name-text">{event.event_name}</span>
                                            </td>
                                            <td className="location-cell">
                                                <div className="flex-cell">
                                                    <MapPin size={14} className="text-[#1fa463]" />
                                                    <span>{event.location}</span>
                                                </div>
                                            </td>
                                            <td className="type-cell">
                                                <span className="type-badge-pill">
                                                    {event.event_type}
                                                </span>
                                            </td>
                                            <td className="action-cell">
                                                <button 
                                                    className="detail-action-btn" 
                                                    onClick={() => setSelectedEvent(event)}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {selectedEvent && (
                <div className="event-modal-overlay" onClick={() => setSelectedEvent(null)}>
                    <div className="event-modal-box" onClick={e => e.stopPropagation()}>
                        {selectedEvent.image_url ? (
                            <div 
                                className="modal-hero-bg" 
                                style={{ 
                                    backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7)), url(http://localhost:5000${selectedEvent.image_url})` 
                                }}
                            >
                                <button className="close-btn-overlay" onClick={() => setSelectedEvent(null)}>&times;</button>
                                <div className="hero-content">
                                    <span className="m-badge-hero">{selectedEvent.event_type}</span>
                                    <h2>{selectedEvent.event_name}</h2>
                                </div>
                            </div>
                        ) : (
                            <div className="modal-header">
                                <h2>{selectedEvent.event_name}</h2>
                                <button className="close-btn" onClick={() => setSelectedEvent(null)}>&times;</button>
                            </div>
                        )}
                        <div className="modal-body">
                            {!selectedEvent.image_url && (
                                <div className="modal-meta">
                                    <div className="m-item"><CalendarDays size={14} /> {selectedEvent.event_date}</div>
                                    <div className="m-item"><MapPin size={14} /> {selectedEvent.location}</div>
                                    <div className="m-badge">{selectedEvent.event_type}</div>
                                </div>
                            )}
                            {selectedEvent.image_url && (
                                <div className="modal-meta-hero">
                                    <div className="m-item"><CalendarDays size={14} /> {selectedEvent.event_date}</div>
                                    <div className="m-item"><MapPin size={14} /> {selectedEvent.location}</div>
                                </div>
                            )}
                           <div className="modal-details-content">
                                <h3>About this Event</h3>
                                <p>{selectedEvent.event_details || "No additional details provided for this event."}</p>
                           </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpcomingEvents;
