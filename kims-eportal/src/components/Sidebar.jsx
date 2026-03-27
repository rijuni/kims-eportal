import React from "react";
import { LayoutDashboard, BookOpen, BookUser, Calendar, CalendarDays, Users } from "lucide-react";
import logo from "../img/Capture.PNG";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay open"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <img src={logo} alt="KIMS Logo" className="w-full h-auto object-contain" />
        </div>
        <ul className="sidebar-menu">
          <li className="active">
            <LayoutDashboard size={18} className="mr-3" /> Dashboard
          </li>
          <li>
            <BookOpen size={18} className="mr-3" /> Training Materials
          </li>
          <li>
            <BookUser size={18} className="mr-3" /> Telephone Directory
          </li>
          <li>
            <Calendar size={18} className="mr-3" /> Holiday List
          </li>
          <li>
            <CalendarDays size={18} className="mr-3" /> Upcoming Events
          </li>
          <li>
            <Users size={18} className="mr-3" /> People
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;