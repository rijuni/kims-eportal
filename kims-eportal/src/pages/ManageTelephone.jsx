import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import API from "../services/api";
import { Contact, UploadCloud, Trash2, Eye, EyeOff, ArrowLeft, Pencil, X, MapPin } from "lucide-react";
import "../styles/managedashboard.css";

const ManageTelephone = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUploadedFile, setLastUploadedFile] = useState("");
  const [showFileInfoDetail, setShowFileInfoDetail] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  // Edit Form State
  const [editingContact, setEditingContact] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFields, setEditFields] = useState({
    organisation: "",
    department: "",
    location: "",
    name: "",
    ip_no: "",
    mobile_no: ""
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fetchContacts = async () => {
    try {
      const res = await API.get("/telephone");
      if (res.data) setContacts(res.data);

      const settingsRes = await API.get("/settings/last_telephone_sync_file");
      if (settingsRes.data && settingsRes.data.value) {
        setLastUploadedFile(settingsRes.data.value);
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

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
      const res = await API.post("/telephone/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setSuccessMsg("Contacts successfully synced from Excel!");
        setTimeout(() => setSuccessMsg(""), 5000);
        if (res.data.filename) setLastUploadedFile(res.data.filename);
        setExcelFile(null);
        if (document.getElementById("telephone-upload-input")) {
          document.getElementById("telephone-upload-input").value = "";
        }
        fetchContacts();
      }
    } catch (err) {
      setSyncError(err.response?.data?.message || "Failed to sync contacts. Check file format.");
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
      const res = await API.delete("/telephone");
      if (res.data.success) {
        setContacts([]);
        setLastUploadedFile("");
        setSuccessMsg("Directory cleared successfully.");
        setTimeout(() => setSuccessMsg(""), 5000);
        resetDeleteState();
      }
    } catch (err) {
      setSyncError("Failed to clear directory.");
    } finally {
      setLoading(false);
    }
  };

  const handleSingleDelete = async (id) => {
    if (window.confirm("Remove this contact?")) {
      try {
        await API.delete(`/telephone/${id}`);
        fetchContacts();
      } catch (err) {
        setSyncError("Error deleting contact.");
      }
    }
  };

  const handleEditClick = (contact) => {
    setEditingContact(contact);
    setEditFields({
      organisation: contact.organisation || "",
      department: contact.department || "",
      location: contact.location || "",
      name: contact.name || "",
      ip_no: contact.ip_no || "",
      mobile_no: contact.mobile_no || ""
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditFields({
      ...editFields,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSyncError("");
    setSuccessMsg("");

    try {
      const res = await API.put(`/telephone/${editingContact.id}`, editFields);
      if (res.data.success) {
        setSuccessMsg("Contact updated successfully!");
        setTimeout(() => setSuccessMsg(""), 5000);
        setIsEditModalOpen(false);
        setEditingContact(null);
        fetchContacts();
      }
    } catch (err) {
      setSyncError("Failed to update contact.");
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
            <h1 className="manage-page-title">Manage Telephone Directory</h1>
          </div>
          <p className="manage-page-sub">Sync phonebook via Excel sheet or update details individually.</p>

          <div className="manage-grid">

            {/* Left Column: Upload */}
            <div className="manage-box box-orange">
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
                <p className="upload-hint">Upload Excel with headers: Organisation, Department, Location, Name, IP No, Mobile No.</p>
                <div className="file-info-bar">
                  <div className="info-text"><strong>Synced:</strong> {lastUploadedFile || "None"}</div>
                  {lastUploadedFile && !isDeleting && (
                    <button
                      className="trash-btn"
                      onClick={handleTrashClick}
                      title="Clear Directory"
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
                  <input id="telephone-upload-input" type="file" accept=".xlsx, .xls" onChange={e => setExcelFile(e.target.files[0])} />
                </div>

                <button onClick={handleFileUpload} className="action-btn-orange" disabled={loading}>
                  {loading ? "Processing..." : "Sync Directory via Excel"}
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

            {/* Right Column: Existing Contacts */}
            <div className="manage-box box-teal">
              <div className="box-header">
                <Contact size={24} /> <h2>Existing Directory ({contacts.length})</h2>
              </div>
              <div className="table-responsive" style={{ marginTop: '10px' }}>
                <table className="upcoming-table">
                  <thead>
                    <tr>
                      <th style={{ padding: '12px 15px' }}>Name</th>
                      <th style={{ padding: '12px 15px' }}>Org/Dept</th>
                      <th style={{ padding: '12px 15px' }}>Extension / IP</th>
                      <th style={{ padding: '12px 15px' }}>Mobile</th>
                      <th style={{ padding: '12px 15px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.length > 0 ? (
                      contacts.map(c => (
                        <tr key={c.id} className="upcoming-row">
                          <td style={{ padding: '12px 15px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{c.name}</span>
                          </td>
                          <td style={{ padding: '12px 15px' }}>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              <strong>{c.organisation}</strong><br/>
                              {c.department && <span>{c.department}</span>}
                              {c.location && <><br/><span><MapPin size={10} style={{display:'inline', marginBottom:'-2px'}}/> {c.location}</span></>}
                            </div>
                          </td>
                          <td style={{ padding: '12px 15px' }}>
                            <span style={{ fontSize: '12px', color: '#0d9488', fontWeight: '600' }}>{c.ip_no || '-'}</span>
                          </td>
                          <td style={{ padding: '12px 15px' }}>
                            <span style={{ fontSize: '12px', color: '#475569' }}>{c.mobile_no || '-'}</span>
                          </td>
                          <td style={{ padding: '12px 15px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button onClick={() => handleEditClick(c)} className="edit-btn" title="Edit Contact"><Pencil size={14} /></button>
                              <button onClick={() => handleSingleDelete(c.id)} className="del-btn" title="Delete Contact"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '13px' }}>No contacts found. Upload an Excel file.</td>
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
                <Pencil size={20} /> <h2>Edit Contact Details</h2>
              </div>
              <button className="close-modal-btn" onClick={() => setIsEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="modal-form-content">
              <div className="form-group">
                <label>Name</label>
                <input required className="light-input" type="text" name="name" value={editFields.name} onChange={handleEditChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Organisation</label>
                  <input className="light-input" type="text" name="organisation" value={editFields.organisation} onChange={handleEditChange} />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input className="light-input" type="text" name="department" value={editFields.department} onChange={handleEditChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input className="light-input" type="text" name="location" value={editFields.location} onChange={handleEditChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>IP No / Extension</label>
                  <input className="light-input" type="text" name="ip_no" value={editFields.ip_no} onChange={handleEditChange} />
                </div>
                <div className="form-group">
                  <label>Mobile No</label>
                  <input className="light-input" type="text" name="mobile_no" value={editFields.mobile_no} onChange={handleEditChange} />
                </div>
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

export default ManageTelephone;
