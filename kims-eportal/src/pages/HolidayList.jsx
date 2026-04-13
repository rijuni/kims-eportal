import React, { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import API from "../services/api";
import '../styles/holiday-list.css';

const HolidayList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
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
    fetchHolidays();
  }, []);

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
              <table className="holiday-table">
                <thead>
                  <tr>
                    <th className="col-sl">Sl no</th>
                    <th className="col-date">Date</th>
                    <th className="col-days">Days</th>
                    <th className="col-nod text-center">No of Days</th>
                    <th className="col-event">Event</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.length > 0 ? (
                    holidays.map((holiday) => (
                      <tr key={holiday.id}>
                        <td className="col-sl">{holiday.sl_no}</td>
                        <td className="col-date">{holiday.date}</td>
                        <td className="col-days">{holiday.days}</td>
                        <td className="col-nod text-center">{holiday.no_of_days}</td>
                        <td className="col-event">{holiday.event}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">No holidays listed for this year.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HolidayList;
