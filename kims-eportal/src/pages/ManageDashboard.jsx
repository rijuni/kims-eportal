import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import API from "../services/api";
import { CopyPlus, CalendarHeart, Trash2, UploadCloud, Bell, ArrowLeft, Eye, EyeOff } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/managedashboard.css";

const ManageDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Data states
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [refresh, setRefresh] = useState(0); // Quick trigger to re-fetch arrays

  // Notice Form
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeIssuedBy, setNoticeIssuedBy] = useState("");
  const [noticeDate, setNoticeDate] = useState(null);
  const [noticeFile, setNoticeFile] = useState(null);

  // Event Form
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");

  // Excel File State
  const [excelFile, setExcelFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUploadedFile, setLastUploadedFile] = useState("");
  const [showFileInfoDetail, setShowFileInfoDetail] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [syncError, setSyncError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    // Fetch initial records
    API.get("/notices").then((res) => { if(res.data) setNotices(res.data) }).catch(console.error);
    API.get("/events/upcoming").then((res) => { if(res.data) setEvents(res.data) }).catch(console.error);
    
    // Fetch last birthday sync file
    API.get("/settings/last_birthday_sync_file").then(res => {
      if (res.data && res.data.value) setLastUploadedFile(res.data.value);
    }).catch(console.error);
  }, [refresh]);

  // Handle Notices
  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", noticeTitle);
      formData.append("issued_by", noticeIssuedBy);
      
      // Format date for backend (e.g., 15th Jan 2026)
      const formattedDate = noticeDate ? noticeDate.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) : "";
      
      formData.append("date", formattedDate);
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
        setNoticeTitle("");
        setNoticeIssuedBy("");
        setNoticeDate(null);
        setNoticeFile(null);
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

  // Handle Birthdays Upload
  const handleFileUploadMenu = async () => {
    if (!excelFile) {
      alert("Please select an Excel file first!");
      return;
    }

    if (excelFile.name === lastUploadedFile) {
        alert("This file already uploaded. Please rename or choose another.");
        return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("excelFile", excelFile);
    try {
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
        if (data.filename) setLastUploadedFile(data.filename);
        setExcelFile(null);
        document.getElementById("excel-upload-input").value = "";
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Network or parse error on upload");
    } finally {
      setLoading(false);
    }
  };

  const handleTrashClick = () => {
    setIsDeleting(true);
  };

  const resetDeleteState = () => {
    setIsDeleting(false);
    setDeleteInput("");
  };

  const handleDeleteAllBirthdays = async () => {
    if (deleteInput !== "DELETE") return;
    try {
      setLoading(true);
      const res = await API.delete("/birthdays");
      if (res.data.success) {
        setLastUploadedFile("");
        resetDeleteState();
        alert("Birthdays cleared successfully.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to clear birthdays");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`dashboard-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <Header toggleSidebar={toggleSidebar} />
        
        <div className="admin-manage-container">
          <div className="page-header-row">
            <button className="back-btn" onClick={() => navigate("/admin")} title="Back to Admin Panel">
              <ArrowLeft size={20} />
            </button>
            <h1 className="manage-page-title">Manage Dashboard Content</h1>
          </div>
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
                <DatePicker
                    selected={noticeDate}
                    onChange={(date) => setNoticeDate(date)}
                    dateFormat="MMMM d, yyyy"
                    placeholderText="Select Notice Date"
                    className="light-input"
                    todayButton="Select Today"
                    portalId="root"
                    required
                />
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

            {/* Birthdays Excel Upload Box */}
            <div className="manage-box box-orange">
              <div className="box-header">
                <UploadCloud size={24} /> <h2>Bulk Birthdays (Excel)</h2>
                {lastUploadedFile && (
                  <button 
                    className="toggle-view-btn" 
                    onClick={() => setShowFileInfoDetail(!showFileInfoDetail)}
                    title={showFileInfoDetail ? "Hide Name" : "Show Name"}
                  >
                    {showFileInfoDetail ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
              <div className="upload-container">
                <p className="upload-hint">Upload a valid Excel (.xlsx) file with headers: Name, Department, Date of Birth.</p>
                
                <div className="file-info-bar">
                  <div className="info-text"><strong>Synced:</strong> {lastUploadedFile || "None"}</div>
                  {lastUploadedFile && !isDeleting && (
                    <button 
                      className="trash-btn" 
                      onClick={handleTrashClick} 
                      title="Clear All Birthdays"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {isDeleting && (
                  <div className="delete-confirm-box">
                    <p className="confirm-msg">Are you sure? Type <strong>DELETE</strong> to confirm.</p>
                    <input type="text" className="confirm-input" placeholder="DELETE" value={deleteInput} onChange={e => setDeleteInput(e.target.value)} />
                    <div className="confirm-actions">
                      <button className="btn-cancel" onClick={resetDeleteState}>Cancel</button>
                      <button 
                        className="btn-confirm" 
                        disabled={deleteInput !== "DELETE" || loading} 
                        onClick={handleDeleteAllBirthdays}
                      >
                        {loading ? "Clearing..." : "Delete Permanently"}
                      </button>
                    </div>
                  </div>
                )}

                <div className="file-drop-area">
                  <input id="excel-upload-input" type="file" accept=".xlsx, .xls" onChange={e => setExcelFile(e.target.files[0])} />
                </div>
                <button 
                  type="button" 
                  onClick={handleFileUploadMenu} 
                  className="action-btn-orange" 
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Sync Database via Excel"}
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ManageDashboard;
