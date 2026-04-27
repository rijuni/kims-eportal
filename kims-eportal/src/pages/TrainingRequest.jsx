import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { ArrowLeft, Send, Trash2, Download, Calendar, Plus, X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import API from "../services/api";
import "../styles/trainingrequest.css";

const TrainingRequest = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [requestedDate, setRequestedDate] = useState(new Date());
    const [formData, setFormData] = useState({
        dept: "",
        module: "",
        name: "",
        email: "",
        contact: ""
    });
    const [file, setFile] = useState(null);
    const [accountUsers, setAccountUsers] = useState([]);
    const [nominees, setNominees] = useState([]);
    const [currentEmpId, setCurrentEmpId] = useState("");
    const [currentTraineeBranch, setCurrentTraineeBranch] = useState("");
    const [tempEmployee, setTempEmployee] = useState(null);
    const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await API.get("/users");
                if (Array.isArray(res.data)) {
                    setAccountUsers(res.data);
                } else if (res.data && Array.isArray(res.data.users)) {
                    setAccountUsers(res.data.users);
                }
            } catch (err) {
                console.error("Failed to fetch users:", err);
            }
        };
        fetchUsers();
    }, []);

    const handleEmployeeIdBlur = async () => {
        if (!currentEmpId) return;
        setIsSearching(true);
        try {
            const res = await API.get(`/employees/${currentEmpId}`);
            if (res.data.success) {
                setTempEmployee(res.data.employee);
            } else {
                setTempEmployee(null);
            }
        } catch (err) {
            console.error("Error fetching employee:", err);
            setTempEmployee(null);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddNominee = () => {
        if (!tempEmployee) {
            alert("Please enter a valid Employee ID first");
            return;
        }
        if (!currentTraineeBranch) {
            alert("Please select a Branch for the trainee");
            return;
        }

        const newNominee = {
            ...tempEmployee,
            branch: currentTraineeBranch,
            id: Date.now() // Unique ID for the list
        };
        setNominees(prev => [...prev, newNominee]);
        setCurrentEmpId("");
        setCurrentTraineeBranch("");
        setTempEmployee(null);
    };

    const handleRemoveNominee = (id) => {
        setNominees(prev => prev.filter(n => n.id !== id));
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === "name") {
            const selectedUser = accountUsers.find(u => u.username === value);
            if (selectedUser) {
                setFormData(prev => ({
                    ...prev,
                    name: value,
                    email: selectedUser.email || "",
                    contact: selectedUser.contact || ""
                }));
                return;
            }
        }
        
        if (name === "dept") {
            // Reset name, email, contact when department changes
            setFormData(prev => ({
                ...prev,
                dept: value,
                name: "",
                email: "",
                contact: ""
            }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleClear = () => {
        setFormData({
            dept: "",
            module: "",
            name: "",
            email: "",
            contact: ""
        });
        setRequestedDate(new Date());
        setFile(null);
        setNominees([]);
        setCurrentEmpId("");
        setCurrentTraineeBranch("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSubmit = new FormData();
            formDataToSubmit.append("dept", formData.dept);
            formDataToSubmit.append("module", formData.module);
            formDataToSubmit.append("name", formData.name);
            formDataToSubmit.append("email", formData.email);
            formDataToSubmit.append("contact", formData.contact);
            formDataToSubmit.append("branch", formData.branch);
            formDataToSubmit.append("requestedDate", requestedDate.toISOString());
            // Currently ignoring the file upload for the basic DB but will submit formData.

            const payload = {
                ...formData,
                branch: nominees.length > 0 ? nominees[0].branch : "N/A",
                requestedDate,
                nominees
            };

            const res = await API.post("/training-requests", payload);
            if (res.data.success) {
                alert("Training Request Submitted Successfully!");
                navigate("/training-materials");
            }
        } catch (error) {
            console.error("Failed to submit training request", error);
            alert("Failed to submit. Please try again.");
        }
    };

    return (
        <div className={`dashboard-wrapper training-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="main-content">
                <Header toggleSidebar={toggleSidebar} />
                <div className="dashboard-container">
                    <div className="request-page-card animate-fade-in">
                        <div className="request-header-premium">
                            <button className="back-circle-btn" onClick={() => navigate("/training-materials")}>
                                <ArrowLeft size={18} />
                            </button>
                            <h1 className="request-main-title">New Training Request</h1>
                        </div>

                        <form className="request-form-premium" onSubmit={handleSubmit}>
                            <div className="request-table-layout">
                                {/* Row 1 */}
                                <div className="request-table-cell label-cell">Requestor Department :</div>
                                <div className="request-table-cell input-cell">
                                    <select name="dept" value={formData.dept} onChange={handleInputChange} required>
                                        <option value="">Select Your Department</option>
                                        <option value="IT">Information Technology</option>
                                        <option value="HR">Human Resources</option>
                                        <option value="Nursing">Nursing</option>
                                        <option value="Admin">Administration</option>
                                    </select>
                                </div>
                                <div className="request-table-cell label-cell">Module Training :</div>
                                <div className="request-table-cell input-cell">
                                    <select name="module" value={formData.module} onChange={handleInputChange} required>
                                        <option value="">Select Module For Training</option>
                                        <option value="HIS">HIS Management</option>
                                        <option value="EMR">EMR Fundamentals</option>
                                        <option value="Safety">Safety Protocol</option>
                                    </select>
                                </div>

                                {/* Row 2 */}
                                <div className="request-table-cell label-cell">Requestor Name :</div>
                                <div className="request-table-cell input-cell">
                                    <select 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleInputChange} 
                                        required
                                    >
                                        <option value="">Select Your Name</option>
                                        {formData.dept ? (
                                            accountUsers
                                                .filter(u => u.department === formData.dept)
                                                .map(user => (
                                                    <option key={user.id} value={user.username}>
                                                        {user.username}
                                                    </option>
                                                ))
                                        ) : (
                                            <option disabled>Please Select Department First</option>
                                        )}
                                    </select>
                                </div>
                                <div className="request-table-cell label-cell">Requested Date :</div>
                                <div className="request-table-cell input-cell">
                                    <div className="flex items-center w-full">
                                        <DatePicker
                                            selected={requestedDate}
                                            onChange={(date) => setRequestedDate(date)}
                                            dateFormat="dd/MM/yyyy"
                                            className="date-picker-input-res"
                                            placeholderText="Select Date"
                                            portalId="root"
                                            required
                                        />
                                        <Calendar size={14} className="text-slate-400 ml-[-25px] pointer-events-none" />
                                    </div>
                                </div>

                                {/* Row 3 */}
                                <div className="request-table-cell label-cell">Requestor Email Address :</div>
                                <div className="request-table-cell input-cell">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter Your KIMS Mail ID"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="request-table-cell label-cell">Requestor Contact No :</div>
                                <div className="request-table-cell input-cell">
                                    <input
                                        type="text"
                                        name="contact"
                                        placeholder="Enter Mobile Number"
                                        value={formData.contact}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="request-table-cell label-cell">User Entry <span style={{ color: 'red', marginLeft: '4px' }}>*</span> :</div>
                                <div className="request-table-cell input-cell" colSpan="2" style={{ overflow: 'visible', zIndex: 100 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', padding: '5px 0', position: 'relative' }}>
                                        <div style={{ position: 'relative', width: '100%' }}>
                                            <input
                                                type="text"
                                                placeholder="Enter Employee ID *"
                                                value={currentEmpId}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setCurrentEmpId(val);
                                                    if (tempEmployee) setTempEmployee(null);
                                                    // Show dropdown if typing
                                                    setShowEmployeeDropdown(val.length > 0);
                                                }}
                                                onBlur={() => {
                                                    // Small delay to allow clicking the dropdown items
                                                    setTimeout(() => {
                                                        setShowEmployeeDropdown(false);
                                                        handleEmployeeIdBlur();
                                                    }, 200);
                                                }}
                                                onFocus={() => {
                                                    if (currentEmpId.length > 0) setShowEmployeeDropdown(true);
                                                }}
                                                style={{ width: '100%' }}
                                            />
                                            
                                            {showEmployeeDropdown && (
                                                <div className="employee-search-dropdown">
                                                    {accountUsers
                                                        .filter(u => 
                                                            u.username.toLowerCase().includes(currentEmpId.toLowerCase()) || 
                                                            (u.hinai_id && u.hinai_id.toLowerCase().includes(currentEmpId.toLowerCase()))
                                                        )
                                                        .slice(0, 10)
                                                        .map(user => (
                                                            <div 
                                                                key={user.id} 
                                                                className="employee-dropdown-item"
                                                                onMouseDown={() => {
                                                                    setCurrentEmpId(user.username);
                                                                    setTempEmployee(user);
                                                                    setShowEmployeeDropdown(false);
                                                                }}
                                                            >
                                                                <div className="emp-drop-name">{user.username}</div>
                                                                <div className="emp-drop-id">{user.hinai_id || `ID: ${user.id}`}</div>
                                                            </div>
                                                        ))
                                                    }
                                                    {accountUsers.filter(u => u.username.toLowerCase().includes(currentEmpId.toLowerCase())).length === 0 && (
                                                        <div className="employee-dropdown-item empty">No staff found</div>
                                                    )}
                                                </div>
                                            )}

                                            {isSearching && !showEmployeeDropdown && (
                                                <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: '#64748b' }}>
                                                    Verifying...
                                                </div>
                                            )}
                                            {tempEmployee && !showEmployeeDropdown && (
                                                <div style={{ fontSize: '10px', color: '#16a34a', marginTop: '2px', fontWeight: '600' }}>
                                                    ✓ {tempEmployee.name} ({tempEmployee.designation})
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <select
                                                value={currentTraineeBranch}
                                                onChange={(e) => setCurrentTraineeBranch(e.target.value)}
                                                style={{ flex: 1 }}
                                            >
                                                <option value="">Select Branch *</option>
                                                <option value="PBMH">PBMH</option>
                                                <option value="KSS">KSS</option>
                                                <option value="KCC">KCC</option>
                                                <option value="KISS">KISS</option>
                                                <option value="KSSCC">KSSCC</option>
                                                <option value="PBMH & KSSCC">PBMH & KSSCC</option>
                                            </select>
                                            <button
                                                type="button"
                                                className="add-nominee-btn"
                                                onClick={handleAddNominee}
                                                disabled={!tempEmployee || !currentTraineeBranch}
                                                style={{ height: '32px', whiteSpace: 'nowrap' }}
                                            >
                                                <Plus size={14} /> ADD
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="request-table-cell action-cell">
                                    <div className="request-btn-group" style={{ flexDirection: 'column', gap: '5px', width: '100%' }}>
                                        <button type="submit" className="request-submit-btn" style={{ width: '100%', padding: '5px' }}>
                                            <Send size={12} /> Submit Request
                                        </button>
                                        <button type="button" className="request-clear-btn" style={{ width: '100%', padding: '5px' }} onClick={handleClear}>
                                            <Trash2 size={12} /> Clear Form
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Nominees List Container */}
                        {nominees.length > 0 && (
                            <div className="nominees-list-container animate-fade-in" style={{ marginTop: '30px' }}>
                                <h3 className="section-title-compact">User Entry Details</h3>
                                <div className="nominees-table-wrapper">
                                    <table className="nominees-table">
                                        <thead>
                                            <tr>
                                                <th>HINAI ID</th>
                                                <th>Title</th>
                                                <th>Name</th>
                                                <th>Designation</th>
                                                <th>Department</th>
                                                <th>Contact No.</th>
                                                <th>Branch</th>
                                                <th>Email ID</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {nominees.map((n) => (
                                                <tr key={n.id}>
                                                    <td>{n.hinai_id}</td>
                                                    <td>{n.title}</td>
                                                    <td className="font-bold">{n.name}</td>
                                                    <td>{n.designation}</td>
                                                    <td>{n.department}</td>
                                                    <td>{n.contact}</td>
                                                    <td className="text-indigo-600 font-semibold">{n.branch}</td>
                                                    <td>{n.email}</td>
                                                    <td className="text-center">
                                                        <button
                                                            className="remove-nominee-btn"
                                                            onClick={() => handleRemoveNominee(n.id)}
                                                            title="Remove Trainee"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainingRequest;
