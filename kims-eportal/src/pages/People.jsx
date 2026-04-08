import React, { useState } from 'react';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Search, Mail, ChevronLeft, ChevronRight, User } from "lucide-react";
import '../styles/people.css';

const People = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchParams, setSearchParams] = useState({
        name: "",
        department: "",
        phone: "",
        ipNo: ""
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    };

    const employees = [
        { id: 1, name: "Amit Ranjan Sahoo", role: "Project Manager", dept: "Human Resources", phone: "98765 43210", ext: "482917" },
        { id: 2, name: "Sunita Panda", role: "Senior Graphic Designer", dept: "Finance & Accounts", phone: "91234 56789", ext: "739205" },
        { id: 3, name: "Debasish Mohanty", role: "Assistant Professor", dept: "Marketing", phone: "87654 32109", ext: "164830" },
        { id: 4, name: "Pritam Kumar Nayak", role: "Marketing Executive", dept: "Sales", phone: "99887 66554", ext: "905472" },
        { id: 5, name: "Laxmi Priyadarshini Das", role: "Operations Manager", dept: "Information Technology (IT)", phone: "78901 23456", ext: "618294" },
        { id: 6, name: "Sanjay Kumar Rout", role: "Software Engineer", dept: "Administration", phone: "93456 78120", ext: "257981" },
        { id: 7, name: "Ananya Mishra", role: "Accounts Officer", dept: "Research & Development", phone: "96543 21098", ext: "846320" },
        { id: 8, name: "Rakesh Chandra Patra", role: "Human Resources Manager", dept: "Operations", phone: "70123 45678", ext: "593704" },
        { id: 9, name: "Sasmita Behera", role: "Business Development Executive", dept: "Customer Support", phone: "88990 11223", ext: "710648" },
        { id: 10, name: "Pradeep Kumar Jena", role: "Administrative Officer", dept: "Procurement & Supply Chain", phone: "95678 34012", ext: "369852" },
        { id: 11, name: "Monalisa Acharya", role: "Sales Coordinator", dept: "Quality Assurance", phone: "82345 67091", ext: "924671" },
        { id: 12, name: "Bijay Kumar Swain", role: "Research Associate", dept: "Production / Manufacturing", phone: "99001 23456", ext: "508193" },
        { id: 13, name: "Rituparna Samal", role: "Creative Director", dept: "Legal & Compliance", phone: "76890 12345", ext: "781056" },
        { id: 14, name: "Ashutosh Hota", role: "Quality Control Supervisor", dept: "Corporate Communications", phone: "91456 78230", ext: "632489" },
        { id: 15, name: "Kavita Barik", role: "Procurement Officer", dept: "Training & Development", phone: "88234 56901", ext: "495720" },
    ];

    return (
        <div className={`people-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="main-content">
                <Header toggleSidebar={toggleSidebar} />

                <div className="people-container">
                    {/* Header with Title */}
                    <div className="people-header">
                        <h1 className="people-title">Find employee contact details quickly and easily</h1>

                        {/* Search Bar */}
                        <div className="people-search-bar">
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
                                name="department"
                                placeholder="Department"
                                className="pill-input"
                                value={searchParams.department}
                                onChange={handleInputChange}
                            />
                            <input
                                type="text"
                                name="phone"
                                placeholder="Phone"
                                className="pill-input"
                                value={searchParams.phone}
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
                            <button className="people-search-btn">
                                <span>Search</span>
                                <div className="search-icon-bg-circle">
                                    <Search size={14} />
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Employee Card */}
                    <div className="people-card">
                        <div className="table-responsive">
                            <table className="people-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Department</th>
                                        <th>Phone</th>
                                        <th>Extension</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((emp) => (
                                        <tr key={emp.id} className="people-row">
                                            <td className="name-cell">
                                                <div className="avatar-circle">
                                                   <User className="avatar-icon" />
                                                </div>
                                                <div className="name-info">
                                                    <span className="emp-name">{emp.name}</span>
                                                    <span className="emp-role">{emp.role}</span>
                                                </div>
                                            </td>
                                            <td><span className="dept-text">{emp.dept}</span></td>
                                            <td><span className="phone-text">{emp.phone}</span></td>
                                            <td><span className="ext-text">{emp.ext}</span></td>
                                            <td className="email-cell">
                                                <Mail size={16} className="cursor-pointer hover:text-blue-500" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Row */}
                        <div className="pagination-row">
                            <div className="page-controls">
                                <div 
                                    className={`page-arrow ${currentPage === 1 ? 'disabled' : ''}`}
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                >
                                    <ChevronLeft size={16} />
                                </div>
                                
                                {[...Array(Math.ceil(employees.length / itemsPerPage))].map((_, idx) => (
                                    <div 
                                        key={idx + 1}
                                        className={`page-btn ${currentPage === idx + 1 ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(idx + 1)}
                                    >
                                        {idx + 1}
                                    </div>
                                ))}

                                <div 
                                    className={`page-arrow ${currentPage === Math.ceil(employees.length / itemsPerPage) ? 'disabled' : ''}`}
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(employees.length / itemsPerPage)))}
                                >
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default People;
