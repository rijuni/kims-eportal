import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import API from "../services/api";
import { CalendarRange, UploadCloud, Trash2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import "../styles/managedashboard.css"; // Reuse styling for consistency

const ManageHolidays = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUploadedFile, setLastUploadedFile] = useState("");
  const [showFileInfoDetail, setShowFileInfoDetail] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fetchHolidays = async () => {
    try {
      const res = await API.get("/holidays");
      if (res.data) setHolidays(res.data);

      // Fetch the last synced filename from global settings
      const settingsRes = await API.get("/settings/last_holiday_sync_file");
      if (settingsRes.data && settingsRes.data.value) {
        setLastUploadedFile(settingsRes.data.value);
      }
    } catch (err) {
      console.error("Error fetching holidays:", err);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleFileUpload = async () => {
    setSyncError("");
    if (!excelFile) {
      setSyncError("Please select an Excel file first!");
      return;
    }

    // Duplicate Block
    if (excelFile.name === lastUploadedFile) {
      setSyncError("This file already uploaded. Please rename or choose another.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("excelFile", excelFile);

    try {
      const res = await API.post("/holidays/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        setSuccessMsg("Holiday list successfully updated from Excel!");
        setTimeout(() => setSuccessMsg(""), 5000); // Clear after 5s
        if (res.data.filename) {
          setLastUploadedFile(res.data.filename);
        }
        setShowFileInfoDetail(true);
        setExcelFile(null);
        if (document.getElementById("holiday-upload-input")) {
          document.getElementById("holiday-upload-input").value = "";
        }
        fetchHolidays();
      } else {
        setSyncError("Error: " + res.data.message);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setSyncError(err.response?.data?.message || "Network or parse error on upload");
    } finally {
      setLoading(false);
    }
  };

  const handleTrashClick = () => {
    setIsDeleting(true);
    setSyncError("");
    setSuccessMsg("");
  };

  const resetDeleteState = () => {
    setIsDeleting(false);
    setDeleteInput("");
  };

  const handleDeleteAll = async () => {
    if (deleteInput !== "DELETE") return;

    try {
      setLoading(true);
      const res = await API.delete("/holidays");
      if (res.data.success) {
        setHolidays([]);
        setLastUploadedFile("");
        setSyncError("");
        setSuccessMsg("Holiday list and sync history cleared successfully.");
        setTimeout(() => setSuccessMsg(""), 5000); // Clear after 5s
        resetDeleteState();
        fetchHolidays();
      }
    } catch (err) {
      console.error("Error clearing holidays:", err);
      setSyncError("Failed to clear holiday list.");
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
            <h1 className="manage-page-title">Manage Holiday List</h1>
          </div>
          <p className="manage-page-sub">Upload an Excel sheet to bulk-update the holiday calendar for the year.</p>

          <div className="manage-grid">

            {/* Upload Box */}
            <div className="manage-box box-green">
              <div className="box-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <UploadCloud size={24} /> <h2>Bulk Holiday Upload (Excel)</h2>
                </div>
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
                <p className="upload-hint">
                  Upload a valid Excel (.xlsx) file with headers like: Sl No, Event, Date, Days.
                </p>

                <div className="file-info-bar">
                  <div className="info-text">
                    <strong>Synced File:</strong> {lastUploadedFile || "None"}
                  </div>
                  {lastUploadedFile && !isDeleting && (
                    <button
                      className="trash-btn"
                      onClick={handleTrashClick}
                      title="Clear All Holidays"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {isDeleting && (
                  <div className="delete-confirm-box">
                    <p className="confirm-msg">Are you sure? Type <strong>DELETE</strong> to confirm.</p>
                    <input
                      type="text"
                      className="confirm-input"
                      placeholder="Type DELETE"
                      value={deleteInput}
                      onChange={(e) => setDeleteInput(e.target.value)}
                    />
                    <div className="confirm-actions">
                      <button
                        className="btn-cancel"
                        onClick={resetDeleteState}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn-confirm"
                        disabled={deleteInput !== "DELETE" || loading}
                        onClick={handleDeleteAll}
                      >
                        {loading ? "Clearing..." : "Delete Permanently"}
                      </button>
                    </div>
                  </div>
                )}

                <div className="file-drop-area">
                  <input
                    id="holiday-upload-input"
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={e => setExcelFile(e.target.files[0])}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleFileUpload}
                  className="action-btn-orange"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Sync Holiday List via Excel"}
                </button>

                <div className="feedback-area">
                  {syncError && <div className="sync-error-msg">{syncError}</div>}
                  {successMsg && <div className="sync-success-msg">{successMsg}</div>}
                </div>

                {lastUploadedFile && showFileInfoDetail && (
                  <div className="file-name-display">
                    Filename: {lastUploadedFile}
                  </div>
                )}
              </div>
            </div>

            {/* Preview Box */}
            <div className="manage-box box-teal">
              <div className="box-header">
                <CalendarRange size={24} /> <h2>Current Holiday List</h2>
              </div>
              <div className="data-list">
                {holidays.length > 0 ? (
                  holidays.map(h => (
                    <div key={h.id} className="data-row">
                      <div className="holiday-info">
                        <span className="h-date">{h.date}</span>
                        <span className="h-event">{h.event}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No holidays found in database.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageHolidays;
