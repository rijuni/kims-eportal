import React, { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import API from "../services/api";
import { Hash, Calendar, Clock, Sun, Star } from "lucide-react";
import '../styles/holiday-list.css';

const HolidayList = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const fetchHolidays = async () => {
        try {
            const res = await API.get("/holidays");
            if (res.data) setHolidays(res.data);
        } catch (err) {
            console.error("Error fetching holidays:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, []);

    const getHolidayStatus = (dateStr) => {
        if (!dateStr) return null;
        try {
            let hDate;
            const trimmed = dateStr.trim();
            // Handle formats like 15/01/2026, 15-01-2026, 15.01.2026 or 15.01.26
            const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
            
            if (dmyMatch) {
                let year = parseInt(dmyMatch[3]);
                if (year < 100) year += 2000;
                hDate = new Date(year, parseInt(dmyMatch[2]) - 1, parseInt(dmyMatch[1]));
            } else {
                // Handle names and ordinals like "1st Jan 2026" or "15 Apr 2026"
                const cleaned = trimmed.replace(/(\d+)(st|nd|rd|th)/gi, '$1').trim();
                hDate = new Date(cleaned);
            }

            if (isNaN(hDate.getTime())) {
              console.warn("Invalid Holiday Date format:", dateStr);
              return null;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            hDate.setHours(0, 0, 0, 0);

            const diffTime = hDate.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
              console.log("Holiday detected for TODAY:", dateStr);
              return 'today';
            }
            if (diffDays > 0 && diffDays <= 3) return 'upcoming';
        } catch (e) {
            console.error("Holiday Parsing Error:", e);
            return null;
        }
        return null;
    };

    return (
        <div className={`holiday-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="main-content">
                <Header toggleSidebar={toggleSidebar} />

                <div className="holiday-container">
                    <div className="holiday-header-row">
                        <h1 className="holiday-title">Holiday List For The Year - 2026</h1>
                    </div>

                    <div className="holiday-card scrollable">
                        {loading ? (
                            <div className="loading-spinner">Loading holidays...</div>
                        ) : (
                            <div className="holiday-list-view">
                                <div className="holiday-table-header">
                                    <div className="header-col col-sl">
                                        <Hash size={14} />
                                        <span>Sl no</span>
                                    </div>
                                    <div className="header-col col-date">
                                        <Calendar size={14} />
                                        <span>Date</span>
                                    </div>
                                    <div className="header-col col-days">
                                        <Clock size={14} />
                                        <span>Days</span>
                                    </div>
                                    <div className="header-col col-nod">
                                        <Sun size={14} />
                                        <span>No of Days</span>
                                    </div>
                                    <div className="header-col col-event">
                                        <Star size={14} />
                                        <span>Event</span>
                                    </div>
                                </div>

                                <div className="holiday-items-container">
                                    {holidays.length > 0 ? (
                                        holidays.map((holiday) => {
                                            const status = getHolidayStatus(holiday.date);
                                            return (
                                                <div
                                                    className={`holiday-item ${status === 'today' ? 'holiday-today' : status === 'upcoming' ? 'holiday-blink' : ''}`}
                                                    key={holiday.id}
                                                >
                                                    <div className="col-sl">{holiday.sl_no}</div>
                                                    <div className="col-date">{holiday.date}</div>
                                                    <div className="col-days">{holiday.days}</div>
                                                    <div className="col-nod">{holiday.no_of_days}</div>
                                                    <div className="col-event">{holiday.event}</div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="no-data">No holidays listed for this year.</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HolidayList;
