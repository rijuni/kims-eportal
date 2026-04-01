import { NavLink } from "react-router-dom";
import { LayoutDashboard, BookOpen, BookUser, Calendar, CalendarDays, Users } from "lucide-react";
import logo from "../img/Capture.PNG";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { icon: <LayoutDashboard size={18} className="mr-3" />, label: "Dashboard", path: "/" },
    { icon: <BookOpen size={18} className="mr-3" />, label: "Training Materials", path: "/training-materials" },
    { icon: <BookUser size={18} className="mr-3" />, label: "Telephone Directory", path: "/telephone-directory" },
    { icon: <Calendar size={18} className="mr-3" />, label: "Holiday List", path: "/holiday-list" },
    { icon: <CalendarDays size={18} className="mr-3" />, label: "Upcoming Events", path: "/upcoming-sidebar" },
    { icon: <Users size={18} className="mr-3" />, label: "People", path: "/people" },
  ];

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
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? "active-link" : ""}
              >
                {item.icon} {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;