import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Search, Filter, User, Hash, Globe, Building2, UserCircle, Contact2 } from "lucide-react";
import API from "../services/api";
import "../styles/telephone-directory.css";

const TelephoneDirectory = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [directoryData, setDirectoryData] = useState([]);
    const [departments, setDepartments] = useState([]);
    
    const [searchParams, setSearchParams] = useState({
        organisation: "",
        department: "",
        name: "",
        ipNo: ""
    });

    const organisations = ["KIMS", "KSS", "KCC", "KIDS", "KINS", "KALARABANK"];

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const fetchData = async () => {
        try {
            const [phoneRes, deptRes] = await Promise.all([
                API.get("/telephone"),
                API.get("/telephone/departments")
            ]);
            
            if (phoneRes.data) setDirectoryData(phoneRes.data);
            if (deptRes.data) setDepartments(deptRes.data);
        } catch (err) {
            console.error("Error fetching telephone data:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClearSearch = () => {
        setSearchParams({
            organisation: "",
            department: "",
            name: "",
            ipNo: ""
        });
    };

    const filteredDirectory = useMemo(() => {
        // ... (sorting/filtering remains the same)
        return directoryData.filter(item => {
            const matchOrg = item.organisation?.toLowerCase().includes(searchParams.organisation.toLowerCase()) ?? false;
            const matchDept = item.department?.toLowerCase().includes(searchParams.department.toLowerCase()) ?? false;
            const matchName = item.name?.toLowerCase().includes(searchParams.name.toLowerCase()) ?? false;
            
            const searchIpMobile = searchParams.ipNo.toLowerCase();
            const ipStr = String(item.ip_no || "").toLowerCase();
            const mobStr = String(item.mobile_no || "").toLowerCase();
            const matchIp = ipStr.includes(searchIpMobile) || mobStr.includes(searchIpMobile);

            if (searchParams.organisation && !matchOrg) return false;
            if (searchParams.department && !matchDept) return false;
            if (searchParams.name && !matchName) return false;
            if (searchParams.ipNo && !matchIp) return false;
            
            return true;
        });
    }, [directoryData, searchParams]);

    return (
        <div className={`telephone-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="main-content">
                <Header toggleSidebar={toggleSidebar} />

                <div className="directory-container">
                    <div className="directory-header">
                        <h1 className="directory-title">Find employee contact details quickly and easily</h1>

                        <div className="search-bar-row">
                            <select 
                                name="organisation" 
                                className="pill-input" 
                                value={searchParams.organisation} 
                                onChange={handleInputChange}
                            >
                                <option value="">Select Organisation</option>
                                {organisations.map(org => (
                                    <option key={org} value={org}>{org}</option>
                                ))}
                            </select>

                            <select 
                                name="department" 
                                className="pill-input" 
                                value={searchParams.department} 
                                onChange={handleInputChange}
                            >
                                <option value="">Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>

                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                className="pill-input"
                                value={searchParams.name}
                                onChange={handleInputChange}
                            />
                            <input
                                type="text"
                                name="ipNo"
                                placeholder="IP No / Mobile"
                                className="pill-input"
                                value={searchParams.ipNo}
                                onChange={handleInputChange}
                            />
                            <button className="search-btn">
                                <span>Search</span>
                                <div className="search-icon-bg">
                                    <Search size={12} />
                                </div>
                            </button>

                            <button className="clear-btn" onClick={handleClearSearch}>
                                Clear All
                            </button>
                        </div>
                    </div>

                    <div className="directory-card scrollable">
                        <div className="directory-table-header">
                            <div className="header-col col-org">
                                <Building2 size={15} />
                                <span>Organisation</span>
                            </div>
                            <div className="header-col col-info">
                                <UserCircle size={15} />
                                <span>Employee Info</span>
                            </div>
                            <div className="header-col col-phone" style={{ justifyContent: 'flex-end' }}>
                                <Contact2 size={15} />
                                <span>Contact</span>
                            </div>
                        </div>

                        {filteredDirectory.length > 0 ? (
                            filteredDirectory.map((item, index) => (
                                <div className="directory-item" key={index}>
                                    <div className="col-org">
                                        <h3 className="org-name">{item.organisation || "N/A"}</h3>
                                        <p className="org-location">{item.location || ""}</p>
                                    </div>
                                    <div className="col-info">
                                        <div className="info-row">
                                            <span className="info-label">Name</span>
                                            <span className="info-value">: {item.name || "N/A"}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Department</span>
                                            <span className="info-value">: {item.department || "N/A"}</span>
                                        </div>
                                    </div>
                                    <div className="col-phone">
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', height: '100%' }}>
                                            {item.ip_no && <span style={{ fontWeight: 600 }}>{item.ip_no}</span>}
                                            {item.mobile_no && <span style={{ fontSize: '13px', color: '#64748b' }}>{item.mobile_no}</span>}
                                            {!item.ip_no && !item.mobile_no && <span style={{ color: '#94a3b8' }}>-</span>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px', width: '100%' }}>
                                No contacts found matching your search.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TelephoneDirectory;
