import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import API from "../services/api";
import { CalendarHeart, UploadCloud, Trash2, Eye, EyeOff, ArrowLeft, MapPin, ChevronDown, ChevronUp, Pencil, X, Maximize2, Minimize2 } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/managedashboard.css";

const ManageEvents = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUploadedFile, setLastUploadedFile] = useState("");
  const [showFileInfoDetail, setShowFileInfoDetail] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [isEventsFullScreen, setIsEventsFullScreen] = useState(false);


  // Manual Form State
  const [manualName, setManualName] = useState("");
  const [manualDate, setManualDate] = useState(null);
  const [manualLocation, setManualLocation] = useState("");
  const [manualType, setManualType] = useState("");
  const [manualDetails, setManualDetails] = useState("");
  const [manualImage, setManualImage] = useState(null);

  // Edit Form State
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editType, setEditType] = useState("");
  const [editDetails, setEditDetails] = useState("");
  const [editImage, setEditImage] = useState(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fetchEvents = async () => {
    try {
      const res = await API.get("/events/upcoming");
      if (res.data) setEvents(res.data);

      const settingsRes = await API.get("/settings/last_event_sync_file");
      if (settingsRes.data && settingsRes.data.value) {
        setLastUploadedFile(settingsRes.data.value);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setSyncError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      // Format date for backend (e.g., 15th Jan 2026, 10:00 AM)
      const formattedDate = manualDate ? manualDate.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }) : "";

      const formData = new FormData();
      formData.append("event_name", manualName);
      formData.append("event_date", formattedDate);
      formData.append("location", manualLocation);
      formData.append("event_type", manualType);
      formData.append("event_details", manualDetails);
      if (manualImage) {
        formData.append("eventImage", manualImage);
      }

      const res = await API.post("/events", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setSuccessMsg("Event added successfully!");
        setTimeout(() => setSuccessMsg(""), 5000);
        setManualName("");
        setManualDate(null);
        setManualLocation("");
        setManualType("");
        setManualDetails("");
        setManualImage(null);
        fetchEvents();
      }
    } catch (err) {
      setSyncError("Failed to add event.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    setSyncError("");
    setSuccessMsg("");
    if (!excelFile) {
      setSyncError("Please select an Excel file first!");
      return;
    }

    if (excelFile.name === lastUploadedFile) {
      setSyncError("This file already uploaded. Please rename or choose another.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("excelFile", excelFile);

    try {
      const res = await API.post("/events/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setSuccessMsg("Events successfully synced from Excel!");
        setTimeout(() => setSuccessMsg(""), 5000);
        if (res.data.filename) setLastUploadedFile(res.data.filename);
        setExcelFile(null);
        if (document.getElementById("event-upload-input")) {
          document.getElementById("event-upload-input").value = "";
        }
        fetchEvents();
      }
    } catch (err) {
      setSyncError("Failed to sync events. Check file format.");
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
      const res = await API.delete("/events");
      if (res.data.success) {
        setEvents([]);
        setLastUploadedFile("");
        setSuccessMsg("All events cleared successfully.");
        setTimeout(() => setSuccessMsg(""), 5000);
        resetDeleteState();
      }
    } catch (err) {
      setSyncError("Failed to clear events.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (event) => {
    setEditingEvent(event);
    setEditName(event.event_name);
    setEditDate(event.event_date);
    setEditLocation(event.location);
    setEditType(event.event_type);
    setEditDetails(event.event_details || "");
    setEditImage(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSyncError("");
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("event_name", editName);
    formData.append("event_date", editDate);
    formData.append("location", editLocation);
    formData.append("event_type", editType);
    formData.append("event_details", editDetails);
    if (editImage) {
      formData.append("eventImage", editImage);
    }

    try {
      const res = await API.put(`/events/${editingEvent.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        setSuccessMsg("Event updated successfully!");
        setTimeout(() => setSuccessMsg(""), 5000);
        setIsEditModalOpen(false);
        setEditingEvent(null);
        fetchEvents();
      }
    } catch (err) {
      setSyncError("Failed to update event.");
    } finally {
      setLoading(false);
    }
  };

  const handleSingleDelete = async (id) => {
    if (window.confirm("Remove this event?")) {
      try {
        await API.delete(`/events/${id}`);
        fetchEvents();
      } catch (err) {
        setSyncError("Error deleting event.");
      }
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
            <h1 className="manage-page-title">Manage Upcoming Events</h1>
          </div>
          <p className="manage-page-sub">Add events manually or sync them in bulk via Excel sheet.</p>

          <div className="manage-grid">

            <div className="manage-box box-teal">
              <div className="box-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CalendarHeart size={24} /> <h2>Add Single Event</h2>
                </div>
                <button className="toggle-view-btn" onClick={() => setShowManualForm(!showManualForm)}>
                  {showManualForm ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>

              {showManualForm && (
                <>
                  <form onSubmit={handleManualSubmit} className="manual-form">
                    <input required className="light-input" type="text" placeholder="Event Name" value={manualName} onChange={e => setManualName(e.target.value)} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '8px' }}>
                      <DatePicker
                        selected={manualDate}
                        onChange={(date) => setManualDate(date)}
                        dateFormat="MMMM d, yyyy"
                        placeholderText="Select Date"
                        className="light-input"
                        todayButton="Today"
                        portalId="root"
                        required
                      />
                      <DatePicker
                        selected={manualDate}
                        onChange={(date) => setManualDate(date)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                        placeholderText="Time"
                        className="light-input"
                        portalId="root"
                        required
                      />
                    </div>
                    <select required className="light-input" value={manualType} onChange={e => setManualType(e.target.value)} style={{ appearance: 'none', background: 'white' }}>
                      <option value="" disabled>Select Event Type</option>
                      <option value="Health">Health</option>
                      <option value="Study">Study</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Conference">Conference</option>
                      <option value="Personal">Personal</option>
                      <option value="Work">Work</option>
                      <option value="Travel">Travel</option>
                      <option value="Holiday">Holiday</option>
                      <option value="Social">Social</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Other">Other</option>
                    </select>
                    <input required className="light-input" type="text" placeholder="Location/Venue" value={manualLocation} onChange={e => setManualLocation(e.target.value)} />
                    <textarea
                      className="light-input"
                      placeholder="Event Details (Visible on click)"
                      value={manualDetails}
                      onChange={e => setManualDetails(e.target.value)}
                      rows={3}
                      style={{ resize: 'none' }}
                    ></textarea>
                    
                    <div className="file-input-wrapper">
                      <label style={{ fontSize: '12px', fontWeight: '500', color: '#475569', marginLeft: '2px' }}>Event Background Image (Optional)</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="light-input" 
                        style={{ padding: '8px 12px', background: '#f8fafc' }} 
                        onChange={e => setManualImage(e.target.files[0])} 
                      />
                    </div>
                    <button type="submit" className="action-btn-teal" disabled={loading}>
                      {loading ? "Adding..." : "Add Event to Portal"}
                    </button>
                  </form>
                  <div className="divider" style={{ margin: '5px 0', borderTop: '1px solid #eee' }}></div>
                </>
              )}

              <div className="box-header">
                <UploadCloud size={24} /> <h2>Bulk Sync (Excel)</h2>
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
                <p className="upload-hint">Upload Excel with headers: Event, Date, Location.</p>
                <div className="file-info-bar">
                  <div className="info-text"><strong>Synced:</strong> {lastUploadedFile || "None"}</div>
                  {lastUploadedFile && !isDeleting && (
                    <button
                      className="trash-btn"
                      onClick={handleTrashClick}
                      title="Clear All Upcoming Events"
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
                        onClick={handleDeleteAll}
                      >
                        {loading ? "Clearing..." : "Delete Permanently"}
                      </button>
                    </div>
                  </div>
                )}

                <div className="file-drop-area">
                  <input id="event-upload-input" type="file" accept=".xlsx, .xls" onChange={e => setExcelFile(e.target.files[0])} />
                </div>

                <button onClick={handleFileUpload} className="action-btn-teal" disabled={loading}>
                  {loading ? "Processing..." : "Sync Events via Excel"}
                </button>

                <div className="feedback-area">
                  {syncError && <div className="sync-error-msg">{syncError}</div>}
                  {successMsg && <div className="sync-success-msg">{successMsg}</div>}
                </div>

                {lastUploadedFile && showFileInfoDetail && (
                  <div className="file-name-display">Filename: {lastUploadedFile}</div>
                )}
              </div>
            </div>

            <div className={`manage-box box-blue ${isEventsFullScreen ? 'is-fullscreen' : ''}`}>
              <div className="box-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CalendarHeart size={24} /> <h2>Existing Events</h2>
                </div>
                <button 
                  className="toggle-view-btn" 
                  onClick={() => setIsEventsFullScreen(!isEventsFullScreen)}
                  title={isEventsFullScreen ? "Exit Full Screen" : "Full Screen"}
                >
                  {isEventsFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
              </div>

              <div className="table-responsive" style={{ marginTop: '10px' }}>
                <table className="upcoming-table">
                  <thead>
                    <tr>
                      <th style={{ padding: '12px 15px' }}>Date</th>
                      <th style={{ padding: '12px 15px' }}>Event</th>
                      <th style={{ padding: '12px 15px' }}>Location</th>
                      <th style={{ padding: '12px 15px' }}>Type</th>
                      <th style={{ padding: '12px 15px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.length > 0 ? (
                      events.map(ev => (
                        <tr key={ev.id} className="upcoming-row">
                          <td style={{ padding: '12px 15px' }}>
                            <span style={{ fontSize: '13px', color: '#0d9488', fontWeight: '600' }}>{ev.event_date}</span>
                          </td>
                          <td style={{ padding: '12px 15px' }}>
                            <span style={{ fontSize: '13.5px', fontWeight: '600', color: '#1e293b' }}>{ev.event_name}</span>
                          </td>
                          <td style={{ padding: '12px 15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b' }}>
                              <MapPin size={12} /> {ev.location}
                            </div>
                          </td>
                          <td style={{ padding: '12px 15px' }}>
                            <span style={{ fontSize: '9px', background: '#f0fdfa', color: '#0d9488', padding: '2px 8px', borderRadius: '10px', fontWeight: '700', textTransform: 'uppercase' }}>
                              {ev.event_type}
                            </span>
                          </td>
                          <td style={{ padding: '12px 15px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button onClick={() => handleEditClick(ev)} className="edit-btn" title="Edit Event Details"><Pencil size={14} /></button>
                              <button onClick={() => handleSingleDelete(ev.id)} className="del-btn" title="Delete Event"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '13px' }}>No events found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
      {isEditModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Pencil size={20} /> <h2>Edit Event Details</h2>
              </div>
              <button className="close-modal-btn" onClick={() => setIsEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="modal-form-content">
              <div className="form-group">
                <label>Event Name</label>
                <input required className="light-input" type="text" value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Date & Timing</label>
                <input required className="light-input" type="text" value={editDate} onChange={e => setEditDate(e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select required className="light-input" value={editType} onChange={e => setEditType(e.target.value)} style={{ appearance: 'none', background: 'white' }}>
                    <option value="Health">Health</option>
                    <option value="Study">Study</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Conference">Conference</option>
                    <option value="Personal">Personal</option>
                    <option value="Work">Work</option>
                    <option value="Travel">Travel</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Social">Social</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input required className="light-input" type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Description / Details</label>
                <textarea
                  className="light-input"
                  value={editDetails}
                  onChange={e => setEditDetails(e.target.value)}
                  rows={3}
                  style={{ resize: 'none' }}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Background Image</label>
                {editingEvent?.image_url && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flexShrink: 0 }}>
                      <img 
                        src={`http://${window.location.hostname}:5000${editingEvent.image_url}`} 
                        alt="Profile" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>
                    <div style={{ fontSize: '12px', color: '#1e293b', fontWeight: '500', wordBreak: 'break-all' }}>
                      {editingEvent.image_url.split('/').pop()}
                    </div>
                  </div>
                )}
                <label style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', display: 'block' }}>Update Image (Leave empty to keep current)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="light-input" 
                  style={{ padding: '8px 12px', background: '#f8fafc' }} 
                  onChange={e => setEditImage(e.target.files[0])} 
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="action-btn-teal" disabled={loading}>
                  {loading ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;
