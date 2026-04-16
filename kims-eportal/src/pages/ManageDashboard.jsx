import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import API from "../services/api";
import { Bell, UploadCloud, Trash2, Eye, EyeOff, ArrowLeft, User, MoreVertical, Edit, Check, X as XIcon, Camera } from "lucide-react";
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
  const [showNoticesList, setShowNoticesList] = useState(false);
  const [showBirthdayUpload, setShowBirthdayUpload] = useState(true);
  const [isBirthdaysFullScreen, setIsBirthdaysFullScreen] = useState(false);
  const [birthdayList, setBirthdayList] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingBirthday, setEditingBirthday] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editDOB, setEditDOB] = useState("");

  const handleIndividualDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      setLoading(true);
      await API.delete(`/employees/birthdays/${id}`);
      setRefresh(prev => prev + 1);
      setBirthdaySuccess("Birthday deleted successfully.");
      setTimeout(() => setBirthdaySuccess(""), 3000);
    } catch (err) {
      setBirthdayError("Failed to delete record.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (emp) => {
    setEditingBirthday(emp.id);
    setEditName(emp.name);
    setEditDept(emp.designation || emp.department || 'Staff');
    setEditDOB(emp.birthday || emp.date_of_birth);
    setActiveMenuId(null);
  };

  const cancelEdit = () => {
    setEditingBirthday(null);
  };

  const saveEdit = async (id) => {
    try {
      setLoading(true);
      await API.put(`/employees/birthdays/${id}`, {
        name: editName,
        department: editDept,
        date_of_birth: editDOB
      });
      setEditingBirthday(null);
      setRefresh(prev => prev + 1);
      setBirthdaySuccess("Saved successfully!");
      setTimeout(() => setBirthdaySuccess(""), 3000);
    } catch (err) {
      setBirthdayError("Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpdate = async (id, file) => {
    if (!file) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("profileImage", file);
      const res = await API.post(`/employees/birthdays/${id}/upload-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        setBirthdaySuccess("Photo uploaded successfully!");
        setTimeout(() => setBirthdaySuccess(""), 3000);
        setRefresh(prev => prev + 1);
        setActiveMenuId(null);
      }
    } catch (err) {
      setBirthdayError("Failed to upload photo.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    // Fetch initial records
    API.get("/notices").then((res) => { if (res.data) setNotices(res.data) }).catch(console.error);
    API.get("/events/upcoming").then((res) => { if (res.data) setEvents(res.data) }).catch(console.error);

    // Fetch last birthday sync file
    API.get("/settings/last_birthday_sync_file").then(res => {
      if (res.data && res.data.value) setLastUploadedFile(res.data.value);
    }).catch(console.error);

    API.get("/employees/birthdays").then(res => {
      if (res.data) setBirthdayList(res.data);
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
        setRefresh(prev => prev + 1);
      } else {
        setBirthdayError(res.data.message || "Invalid Excel Format for Birthday");
      }
    } catch (err) {
      setBirthdayError("Invalid Excel Format for Birthday or network error");
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
            <div className={`manage-box box-orange ${isBirthdaysFullScreen ? 'is-fullscreen' : ''}`}>
              <div className="box-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <UploadCloud size={24} /> <h2>Bulk Birthdays (Excel)</h2>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {lastUploadedFile && (
                    <button
                      className="toggle-view-btn"
                      onClick={() => setShowFileInfoDetail(!showFileInfoDetail)}
                      title={showFileInfoDetail ? "Hide File Info" : "Show File Info"}
                    >
                      {showFileInfoDetail ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                  <button
                    className="view-detail-btn"
                    onClick={() => setIsBirthdaysFullScreen(!isBirthdaysFullScreen)}
                  >
                    {isBirthdaysFullScreen ? "Close Detail" : "View Details"}
                  </button>
                </div>
              </div>
              <div className="upload-container">
                {!isBirthdaysFullScreen && (
                  <>
                    <p className="upload-hint">Upload a valid Excel (.xlsx) file with headers: Name, Designation, Birthday.</p>

                    {showFileInfoDetail && lastUploadedFile && (
                      <div className="file-info-bar">
                        <div className="info-text"><strong>Synced:</strong> {lastUploadedFile}</div>
                        {!isDeleting && (
                          <button
                            className="trash-btn"
                            onClick={handleTrashClick}
                            title="Clear All Birthdays"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    )}

                    {showFileInfoDetail && isDeleting && (
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
                  </>
                )}

                {isBirthdaysFullScreen && (
                  <div className="table-responsive" style={{ marginTop: '5px' }}>
                    <table className="upcoming-table">
                      <thead>
                        <tr>
                          <th style={{ padding: '12px 15px' }}>Name</th>
                          <th style={{ padding: '12px 15px' }}>Designation</th>
                          <th style={{ padding: '12px 15px' }}>Birthday</th>
                          <th style={{ padding: '12px 15px' }}>Image Name</th>
                          <th style={{ padding: '12px 15px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <input
                          type="file"
                          id="birthday-photo-upload"
                          hidden
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handlePhotoUpdate(activeMenuId, e.target.files[0]);
                              e.target.value = null; // reset
                            }
                          }}
                        />
                        {birthdayList.length > 0 ? (
                          birthdayList.map((emp, idx) => (
                            <tr key={idx} className={`upcoming-row ${editingBirthday === emp.id ? 'is-editing' : ''}`}>
                              {editingBirthday === emp.id ? (
                                <>
                                  <td style={{ padding: '12px 15px' }}>
                                    <input className="edit-input-small" value={editName} onChange={e => setEditName(e.target.value)} />
                                  </td>
                                  <td style={{ padding: '12px 15px' }}>
                                    <input className="edit-input-small" value={editDept} onChange={e => setEditDept(e.target.value)} />
                                  </td>
                                  <td style={{ padding: '12px 15px' }}>
                                    <input className="edit-input-small" value={editDOB} onChange={e => setEditDOB(e.target.value)} />
                                  </td>
                                  <td style={{ padding: '12px 15px' }}>
                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{emp.image ? emp.image.split('/').pop() : 'No Image'}</span>
                                  </td>
                                  <td style={{ padding: '12px 15px' }}>
                                    <div className="edit-actions-wrap">
                                      <button className="edit-btn-circle save" onClick={() => saveEdit(emp.id)} title="Save changes">
                                        <Check size={16} />
                                      </button>
                                      <button className="edit-btn-circle cancel" onClick={cancelEdit} title="Cancel editing">
                                        <XIcon size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td style={{ padding: '12px 15px' }}>
                                    <span style={{ fontSize: '13.5px', fontWeight: '600', color: '#1e293b' }}>{emp.name}</span>
                                  </td>
                                  <td style={{ padding: '12px 15px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>{emp.designation || emp.department || 'Staff'}</span>
                                  </td>
                                  <td style={{ padding: '12px 15px' }}>
                                    <span style={{ fontSize: '13px', color: '#f97316', fontWeight: '600' }}>{emp.birthday || emp.date_of_birth}</span>
                                  </td>
                                  <td style={{ padding: '12px 15px' }}>
                                    <span style={{ fontSize: '11px', color: '#64748b', fontStyle: emp.image ? 'normal' : 'italic' }}>
                                      {emp.image ? emp.image.split('/').pop() : 'No Image'}
                                    </span>
                                  </td>
                                  <td className="actions-cell">
                                    <button
                                      className="dot-menu-btn"
                                      onClick={() => setActiveMenuId(activeMenuId === emp.id ? null : emp.id)}
                                    >
                                      <MoreVertical size={18} />
                                    </button>
                                    {activeMenuId === emp.id && (
                                      <div className="dropdown-menu-wrap">
                                        <button className="dropdown-item" onClick={() => startEdit(emp)}>
                                          <Edit size={14} /> Edit Record
                                        </button>
                                        <button className="dropdown-item" onClick={() => document.getElementById('birthday-photo-upload').click()}>
                                          <Camera size={14} /> Upload Photo
                                        </button>
                                        <button className="dropdown-item delete" onClick={() => handleIndividualDelete(emp.id)}>
                                          <Trash2 size={14} /> Delete
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '13px' }}>No birthdays found. Sync via Excel first.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageDashboard;
