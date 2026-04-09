import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { HiMiniSquares2X2, HiMiniPresentationChartBar, HiMiniIdentification, HiMiniCalendarDays, HiMiniCalendar, HiMiniUsers, HiMiniShieldCheck } from "react-icons/hi2";
import logo from "../img/Capture.PNG";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useContext(AuthContext);

  const menuItems = [
    { icon: <HiMiniSquares2X2 size={18} className="mr-3" />, label: "Dashboard", path: "/" },
    { icon: <HiMiniPresentationChartBar size={18} className="mr-3" />, label: "Training Materials", path: "/training-materials" },
    { icon: <HiMiniIdentification size={18} className="mr-3" />, label: "Telephone Directory", path: "/telephone-directory" },
    { icon: <HiMiniCalendarDays size={18} className="mr-3" />, label: "Holiday List", path: "/holiday-list" },
    { icon: <HiMiniCalendar size={18} className="mr-3" />, label: "Upcoming Events", path: "/upcoming-events" },
    { icon: <HiMiniUsers size={18} className="mr-3" />, label: "People", path: "/people" },
  ];

  if (user && user.role === 'admin') {
    menuItems.push({ icon: <HiMiniShieldCheck size={18} className="mr-3" />, label: "Admin Pannel", path: "/admin" });
  }

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
          <div className="animated-logo-wrapper">
            <img src={logo} alt="KIMS Logo" className="w-full h-auto object-contain animated-logo" />
          </div>
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