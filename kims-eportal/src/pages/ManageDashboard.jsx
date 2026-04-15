import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import API from "../services/api";
import { Bell, UploadCloud, Trash2, Eye, EyeOff, ArrowLeft, User } from "lucide-react";
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
  const [noticeError, setNoticeError] = useState("");
  const [noticeSuccess, setNoticeSuccess] = useState("");
  const [birthdayError, setBirthdayError] = useState("");
  const [birthdaySuccess, setBirthdaySuccess] = useState("");

  // Notice deletion verification
  const [deletingNoticeId, setDeletingNoticeId] = useState(null);
  const [noticesDeleteInput, setNoticesDeleteInput] = useState("");
  const [showNoticesList, setShowNoticesList] = useState(true);
  const [showBirthdayUpload, setShowBirthdayUpload] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    // Fetch initial records
    API.get("/notices").then((res) => { if (res.data) setNotices(res.data) }).catch(console.error);
    API.get("/events/upcoming").then((res) => { if (res.data) setEvents(res.data) }).catch(console.error);

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

      const formattedDate = noticeDate ? noticeDate.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) : "";

      formData.append("date", formattedDate);
      if (noticeFile) {
        formData.append("noticeFile", noticeFile);
      }

      const res = await API.post("/notices", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setNoticeTitle("");
        setNoticeIssuedBy("");
        setNoticeDate(null);
        setNoticeFile(null);
        setNoticeSuccess("Notice added successfully!");
        setTimeout(() => setNoticeSuccess(""), 5000);
        setRefresh(prev => prev + 1);
      } else {
        setNoticeError("Error: " + res.data.message);
      }
    } catch (err) {
      setNoticeError("Error adding notice");
    }
  };

  const handleNoticeDeleteClick = (id) => {
    setDeletingNoticeId(id);
    setNoticesDeleteInput("");
    setNoticeError("");
    setNoticeSuccess("");
  };

  const handleExecuteNoticeDelete = async () => {
    if (noticesDeleteInput !== "DELETE") return;
    try {
      setLoading(true);
      await API.delete(`/notices/${deletingNoticeId}`);
      setDeletingNoticeId(null);
      setNoticesDeleteInput("");
      setRefresh(prev => prev + 1);
      setNoticeSuccess("Notice deleted successfully.");
      setTimeout(() => setNoticeSuccess(""), 5000);
    } catch (err) {
      setNoticeError("Error deleting notice");
    } finally {
      setLoading(false);
    }
  };

  const handleNoticeToggleVisibility = async (id) => {
    try {
      await API.patch(`/notices/${id}/toggle-visibility`);
      setRefresh(prev => prev + 1);
    } catch (err) {
      setNoticeError("Error toggling visibility");
    }
  };


  // Handle Birthdays Upload
  const handleFileUploadMenu = async () => {
    setBirthdayError("");
    setBirthdaySuccess("");
    if (!excelFile) {
      setBirthdayError("Please select an Excel file first!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("excelFile", excelFile);
    try {
      const res = await API.post("/birthdays/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        setBirthdaySuccess("Birthdays successfully synced from Excel!");
        if (res.data.filename) setLastUploadedFile(res.data.filename);
        setExcelFile(null);
        setTimeout(() => setBirthdaySuccess(""), 5000);
      } else {
        setBirthdayError("Error: " + res.data.message);
      }
    } catch (err) {
      setBirthdayError("Network or parse error on upload");
    } finally {
      setLoading(false);
    }
  };

  const handleTrashClick = () => {
    setIsDeleting(true);
    setBirthdayError("");
    setBirthdaySuccess("");
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
        setBirthdaySuccess("Birthdays cleared successfully.");
        setTimeout(() => setBirthdaySuccess(""), 5000);
      }
    } catch (err) {
      setBirthdayError("Failed to clear birthdays");
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Bell size={24} /> <h2>Notice Board</h2>
                  <button
                    className="toggle-view-btn"
                    onClick={() => setShowNoticesList(!showNoticesList)}
                    title={showNoticesList ? "Hide Existing Notices" : "Show Existing Notices"}
                  >
                    {showNoticesList ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>


              <form onSubmit={handleNoticeSubmit}>
                <input required className="light-input" type="text" placeholder="Notice Title" value={noticeTitle} onChange={e => setNoticeTitle(e.target.value)} />
                <input required className="light-input" type="text" placeholder="Issued By" value={noticeIssuedBy} onChange={e => setNoticeIssuedBy(e.target.value)} />
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

                <div className="feedback-area">
                  {noticeError && <div className="sync-error-msg">{noticeError}</div>}
                  {noticeSuccess && <div className="sync-success-msg">{noticeSuccess}</div>}
                </div>
              </form>

              {showNoticesList && (
                <div className="data-list">
                  {notices.map(n => (
                    <div key={n.id} className="notice-item-wrapper" style={{ marginBottom: '4px' }}>
                      <div className="data-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
                          <span>{n.title}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button type="button" onClick={() => handleNoticeDeleteClick(n.id)} className="del-btn" title="Delete Notice">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {deletingNoticeId === n.id && (
                        <div className="delete-confirm-box" style={{ marginTop: '2px', padding: '6px' }}>
                          <p className="confirm-msg" style={{ fontSize: '10.5px', marginBottom: '4px' }}>Delete this notice? Type <strong>DELETE</strong></p>
                          <input
                            type="text"
                            className="confirm-input"
                            placeholder="DELETE"
                            value={noticesDeleteInput}
                            onChange={(e) => setNoticesDeleteInput(e.target.value)}
                            style={{ padding: '4px', fontSize: '12px', marginBottom: '8px' }}
                          />
                          <div className="confirm-actions">
                            <button className="btn-cancel" onClick={() => setDeletingNoticeId(null)} style={{ padding: '4px' }}>Cancel</button>
                            <button
                              className="btn-confirm"
                              disabled={noticesDeleteInput !== "DELETE" || loading}
                              onClick={handleExecuteNoticeDelete}
                              style={{ padding: '4px' }}
                            >
                              {loading ? "..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Birthdays Excel Upload Box */}
            <div className="manage-box box-orange">
              <div className="box-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <UploadCloud size={24} /> <h2>Bulk Birthdays (Excel)</h2>
                  <button
                    className="toggle-view-btn"
                    onClick={() => setShowBirthdayUpload(!showBirthdayUpload)}
                    title={showBirthdayUpload ? "Hide Upload Section" : "Show Upload Section"}
                  >
                    {showBirthdayUpload ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {showBirthdayUpload && (
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

                  <div className="feedback-area">
                    {birthdayError && <div className="sync-error-msg">{birthdayError}</div>}
                    {birthdaySuccess && <div className="sync-success-msg">{birthdaySuccess}</div>}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageDashboard;
