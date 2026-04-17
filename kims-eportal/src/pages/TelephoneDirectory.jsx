import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Search, Filter, User, Hash, Globe, Building2, UserCircle, Contact2, Network, MapPin, Smartphone, Phone } from "lucide-react";
import { HiMiniArrowDownTray } from "react-icons/hi2";
import API from "../services/api";
import "../styles/telephone-directory.css";
import * as XLSX from "xlsx";

const TelephoneDirectory = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
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
            setLoading(true);
            const [phoneRes, deptRes] = await Promise.all([
                API.get("/telephone"),
                API.get("/telephone/departments")
            ]);
            
            if (phoneRes.data) setDirectoryData(phoneRes.data);
            if (deptRes.data) setDepartments(deptRes.data);
        } catch (err) {
            console.error("Error fetching telephone data:", err);
        } finally {
            setLoading(false);
        }
    };


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
        }).sort((a, b) => {
            const orgA = (a.organisation || "").toUpperCase();
            const orgB = (b.organisation || "").toUpperCase();
            
            // Prioritize KIMS
            if (orgA === "KIMS" && orgB !== "KIMS") return -1;
            if (orgA !== "KIMS" && orgB === "KIMS") return 1;
            
            // Secondary sort by name
            const nameA = (a.name || "").toUpperCase();
            const nameB = (b.name || "").toUpperCase();
            return nameA.localeCompare(nameB);
        });
    }, [directoryData, searchParams]);

    const filteredDirectoryRef = React.useRef(filteredDirectory);

    useEffect(() => {
        filteredDirectoryRef.current = filteredDirectory;
    }, [filteredDirectory]);

    useEffect(() => {
        fetchData();
    }, []); // Only run once on mount

    const handleExportExcel = () => {
        // Use the ref to get the latest data without causing a dependency loop
        const dataToExport = filteredDirectoryRef.current;
        if (!dataToExport || dataToExport.length === 0) {
            alert("No data available to export.");
            return;
        }

        // Prepare data for XLSX
        const wsData = dataToExport.map(item => ({
            "Organisation": item.organisation || "",
            "Department": item.department || "",
            "Location": item.location || "",
            "Name": item.name || "",
            "IP No / Ext": item.ip_no || "",
            "Mobile No": item.mobile_no || ""
        }));

        // Create Worksheet
        const ws = XLSX.utils.json_to_sheet(wsData);

        // Set column widths for better readability
        const wscols = [
            { wch: 15 }, // Organisation
            { wch: 25 }, // Department
            { wch: 20 }, // Location
            { wch: 30 }, // Name
            { wch: 15 }, // IP No
            { wch: 20 }  // Mobile
        ];
        ws['!cols'] = wscols;

        // Create Workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Telephone Directory");

        // Download file
        XLSX.writeFile(wb, `Telephone_Directory_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
    };

    const [visibleCount, setVisibleCount] = useState(100);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 100);
    };

    // Reset pagination when search params change
    useEffect(() => {
        setVisibleCount(100);
    }, [searchParams]);

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
                                <option value="">Select Site</option>
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

                            <button className="export-btn" onClick={handleExportExcel} title="Export to Excel">
                                <span>Export</span>
                                <div className="export-icon-bg">
                                    <HiMiniArrowDownTray size={12} className="text-white" />
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
                                <span>Site</span>
                            </div>
                            <div className="header-col col-dept">
                                <Network size={15} />
                                <span>Department</span>
                            </div>
                            <div className="header-col col-loc">
                                <MapPin size={15} />
                                <span>Location</span>
                            </div>
                            <div className="header-col col-name">
                                <User size={15} />
                                <span>Name</span>
                            </div>
                            <div className="header-col col-ip">
                                <Phone size={15} />
                                <span>Ext / IP</span>
                            </div>
                            <div className="header-col col-mob">
                                <Smartphone size={15} />
                                <span>Mobile</span>
                            </div>
                        </div>

                        {loading ? (
                            <div style={{ padding: '60px', textAlign: 'center', color: '#1fa463', fontWeight: 'bold' }}>
                                <div className="mb-4 flex justify-center">
                                    <div className="w-8 h-8 border-4 border-[#1fa463] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                                Fetching contacts...
                            </div>
                        ) : filteredDirectory.length > 0 ? (
                            <>
                                {filteredDirectory.slice(0, visibleCount).map((item, index) => (
                                    <div className="directory-item" key={index}>
                                        <div className="col-org">
                                            <h3 className="org-name">{item.organisation || "N/A"}</h3>
                                        </div>
                                        <div className="col-dept">
                                            <span className="info-value">{item.department || "N/A"}</span>
                                        </div>
                                        <div className="col-loc">
                                            <span className="info-value">{item.location || "N/A"}</span>
                                        </div>
                                        <div className="col-name">
                                            <span className="info-value">{item.name || "N/A"}</span>
                                        </div>
                                        <div className="col-ip">
                                            <span className="info-value" style={{ color: '#0d9488', fontWeight: '600' }}>{item.ip_no || "-"}</span>
                                        </div>
                                        <div className="col-mob">
                                            <span className="info-value">{item.mobile_no || "-"}</span>
                                        </div>
                                    </div>
                                ))}
                                
                                {visibleCount < filteredDirectory.length && (
                                    <div className="p-6 flex justify-center">
                                        <button 
                                            onClick={handleLoadMore}
                                            className="px-8 py-2.5 bg-slate-100 text-[#1fa463] rounded-full text-xs font-black uppercase tracking-wider hover:bg-[#1fa463] hover:text-white transition-all shadow-sm"
                                        >
                                            Load More Contacts ({filteredDirectory.length - visibleCount} remaining)
                                        </button>
                                    </div>
                                )}
                            </>
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
