import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import API from "../services/api";
import { CopyPlus, CalendarHeart, Trash2, UploadCloud, Bell } from "lucide-react";
import "../styles/managedashboard.css";

const ManageDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Data states
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [refresh, setRefresh] = useState(0); // Quick trigger to re-fetch arrays

  // Notice Form
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeIssuedBy, setNoticeIssuedBy] = useState("");
  const [noticeDate, setNoticeDate] = useState("");
  const [noticeFile, setNoticeFile] = useState(null);

  // Event Form
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");

  // Excel File State
  const [excelFile, setExcelFile] = useState(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    // Fetch initial records
    API.get("/notices").then((res) => { if(res.data) setNotices(res.data) }).catch(console.error);
    API.get("/events/upcoming").then((res) => { if(res.data) setEvents(res.data) }).catch(console.error);
  }, [refresh]);

  // Handle Notices
  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", noticeTitle);
      formData.append("issued_by", noticeIssuedBy);
      formData.append("date", noticeDate);
      if (noticeFile) {
        formData.append("noticeFile", noticeFile);
      }

      // Check if API service supports multipart or use fetch
      let url = "http://localhost:5000/api/notices";
      if (window.location.hostname !== 'localhost') {
         url = `http://${window.location.hostname}:5000/api/notices`;
      }

      const res = await fetch(url, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        setNoticeTitle(""); setNoticeIssuedBy(""); setNoticeDate(""); setNoticeFile(null);
        // Clear file input
        const fileInput = document.getElementById("notice-file-input");
        if (fileInput) fileInput.value = "";
        
        setRefresh(prev => prev + 1);
        alert("Notice added successfully!");
      } else {
        alert("Error adding notice: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error adding notice");
    }
  };

  const handleNoticeDelete = async (id) => {
    if(window.confirm("Delete this notice?")) {
      try {
        await API.delete(`/notices/${id}`);
        setRefresh(prev => prev + 1);
      } catch (err) { alert("Error deleting"); }
    }
  };

  // Handle Events
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/events", { event_name: eventName, event_date: eventDate, location: eventLocation });
      setEventName(""); setEventDate(""); setEventLocation("");
      setRefresh(prev => prev + 1);
      alert("Event added successfully!");
    } catch (err) {
      alert("Error adding event");
    }
  };

  const handleEventDelete = async (id) => {
    if(window.confirm("Delete this event?")) {
      try {
        await API.delete(`/events/${id}`);
        setRefresh(prev => prev + 1);
      } catch (err) { alert("Error deleting"); }
    }
  };

  // Handle Upload
  const handleFileUploadMenu = async () => {
    if (!excelFile) {
      alert("Please select an Excel file first!");
      return;
    }
    const formData = new FormData();
    formData.append("excelFile", excelFile);
    try {
      // Must use axios directly or fetch to handle multipart correctly if 'API' is not setup for it
      // Standard fetch logic pointing to local dev
      let url = "http://localhost:5000/api/birthdays/upload";
      if (window.location.hostname !== 'localhost') {
         url = `http://${window.location.hostname}:5000/api/birthdays/upload`;
      }
      
      const res = await fetch(url, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        alert("Birthdays successfully synced from Excel!");
        setExcelFile(null);
        document.getElementById("excel-upload-input").value = "";
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Network or parse error on upload");
    }
  };

  return (
    <div className={`dashboard-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <Header toggleSidebar={toggleSidebar} />
        
        <div className="admin-manage-container">
          <h1 className="manage-page-title">Manage Dashboard Content</h1>
          <p className="manage-page-sub">Add notices, upcoming events, or execute bulk birthday uploads.</p>
          
          <div className="manage-grid">
            
            {/* Notices Box */}
            <div className="manage-box box-blue">
              <div className="box-header">
                <Bell size={24} /> <h2>Notice Board</h2>
              </div>
              <form onSubmit={handleNoticeSubmit}>
                <input required type="text" placeholder="Notice Title" value={noticeTitle} onChange={e => setNoticeTitle(e.target.value)} />
                <input required type="text" placeholder="Issued By" value={noticeIssuedBy} onChange={e => setNoticeIssuedBy(e.target.value)} />
                <input required type="text" placeholder="Date (e.g. 1st Jan 2026)" value={noticeDate} onChange={e => setNoticeDate(e.target.value)} />
                <div className="file-input-wrapper">
                  <label htmlFor="notice-file-input">Select PDF (Mandatory):</label>
                  <input required id="notice-file-input" type="file" accept=".pdf" onChange={e => setNoticeFile(e.target.files[0])} />
                </div>
                <button type="submit" className="action-btn-blue">Add Notice</button>
              </form>
              <div className="data-list">
                {notices.map(n => (
                  <div key={n.id} className="data-row">
                    <span>{n.title}</span>
                    <button type="button" onClick={() => handleNoticeDelete(n.id)} className="del-btn"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Events Box */}
            <div className="manage-box box-teal">
              <div className="box-header">
                <CalendarHeart size={24} /> <h2>Upcoming Events</h2>
              </div>
              <form onSubmit={handleEventSubmit}>
                <input required type="text" placeholder="Event Name" value={eventName} onChange={e => setEventName(e.target.value)} />
                <input required type="text" placeholder="Event Date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
                <input required type="text" placeholder="Location" value={eventLocation} onChange={e => setEventLocation(e.target.value)} />
                <button type="submit" className="action-btn-teal">Add Event</button>
              </form>
              <div className="data-list">
                {events.map(e => (
                  <div key={e.id} className="data-row">
                    <span>{e.event_name}</span>
                    <button type="button" onClick={() => handleEventDelete(e.id)} className="del-btn"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Birthdays Excel Upload Box */}
            <div className="manage-box box-orange">
              <div className="box-header">
                <UploadCloud size={24} /> <h2>Bulk Birthdays (Excel)</h2>
              </div>
              <div className="upload-container">
                <p className="upload-hint">Upload a valid Excel (.xlsx) file containing employee birthdays. Expected columns: Name, Department, Date of Birth. This will overwrite existing birthday entries.</p>
                <div className="file-drop-area">
                  <input id="excel-upload-input" type="file" accept=".xlsx, .xls" onChange={e => setExcelFile(e.target.files[0])} />
                </div>
                <button type="button" onClick={handleFileUploadMenu} className="action-btn-orange">Sync Database via Excel</button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ManageDashboard;
