import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Search } from "lucide-react";
import "../styles/telephone-directory.css";

const TelephoneDirectory = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchParams, setSearchParams] = useState({
        organisation: "",
        department: "",
        name: "",
        ipNo: ""
    });

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const directoryData = [
        {
            org: "KIMS",
            location: "Ground Floor,Academic Building",
            name: "Office of the Academic Cell",
            department: "Academic Cell",
            phone: "2112 / 6747105341"
        },
        {
            org: "KIMS",
            location: "1F_, 33KV Building",
            name: "Mr. Manoj Kumar Patro",
            department: "Accounts",
            phone: "47817"
        },
        {
            org: "KIMS",
            location: "GF_, Academic Building",
            name: "Mr. Pritibasu Lenka",
            department: "Accounts",
            phone: "2013"
        },
        {
            org: "KIMS",
            location: "Ground Floor,Academic Building",
            name: "Office of the Academic Cell",
            department: "Academic Cell",
            phone: "2112 / 6747105341"
        },
        {
            org: "KIMS",
            location: "Ground Floor,Academic Building",
            name: "Office of the Academic Cell",
            department: "Academic Cell",
            phone: "2112 / 6747105341"
        },
        {
            org: "KIMS",
            location: "Ground Floor,Academic Building",
            name: "Office of the Academic Cell",
            department: "Academic Cell",
            phone: "2112 / 6747105341"
        },
        {
            org: "KIMS",
            location: "Ground Floor,Academic Building",
            name: "Office of the Academic Cell",
            department: "Academic Cell",
            phone: "2112 / 6747105341"
        }
    ];

    return (
        <div className={`telephone-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="main-content">
                <Header toggleSidebar={toggleSidebar} />

                <div className="directory-container">
                    <div className="directory-header">
                        <h1 className="directory-title">Find employee contact details quickly and easily</h1>

                        <div className="search-bar-row">
                            <input
                                type="text"
                                name="organisation"
                                placeholder="Organisation"
                                className="pill-input"
                                value={searchParams.organisation}
                                onChange={handleInputChange}
                            />
                            <input
                                type="text"
                                name="department"
                                placeholder="Department"
                                className="pill-input"
                                value={searchParams.department}
                                onChange={handleInputChange}
                            />
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
                                placeholder="IP No"
                                className="pill-input"
                                value={searchParams.ipNo}
                                onChange={handleInputChange}
                            />
                            <button className="search-btn">
                                <span>Search</span>
                                <div className="search-icon-bg">
                                    <Search size={14} />
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="directory-card scrollable">
                        {directoryData.map((item, index) => (
                            <div className="directory-item" key={index}>
                                <div className="col-org">
                                    <h3 className="org-name">{item.org}</h3>
                                    <p className="org-location">{item.location}</p>
                                </div>
                                <div className="col-info">
                                    <div className="info-row">
                                        <span className="info-label">Name</span>
                                        <span className="info-value">: {item.name}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Department</span>
                                        <span className="info-value">: {item.department}</span>
                                    </div>
                                </div>
                                <div className="col-phone">
                                    {item.phone}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TelephoneDirectory;
