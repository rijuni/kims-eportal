import { NavLink } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { HiMiniSquares2X2, HiMiniPresentationChartBar, HiMiniIdentification, HiMiniCalendarDays, HiMiniCalendar, HiMiniUsers, HiMiniShieldCheck } from "react-icons/hi2";
import logo from "../img/Capture.PNG";
import API from "../services/api";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useContext(AuthContext);
  const [isHolidayToday, setIsHolidayToday] = useState(false);

  useEffect(() => {
    const checkTodayHoliday = async () => {
      try {
        const res = await API.get("/holidays");
        if (res.data) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const hasHoliday = res.data.some(h => {
            if (!h.date) return false;
            let hDate;
            // Handle formats like 15/01/2026, 15-01-2026, 15.01.2026 or 15.01.26
            const dmyMatch = h.date.trim().match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
            if (dmyMatch) {
              let year = parseInt(dmyMatch[3]);
              if (year < 100) year += 2000;
              hDate = new Date(year, dmyMatch[2] - 1, dmyMatch[1]);
            } else {
              const cleaned = h.date.replace(/(\d+)(st|nd|rd|th)/gi, '$1').trim();
              hDate = new Date(cleaned);
            }
            if (isNaN(hDate.getTime())) return false;
            hDate.setHours(0, 0, 0, 0);
            return hDate.getTime() === today.getTime();
          });
          setIsHolidayToday(hasHoliday);
        }
      } catch (err) {
        console.error("Sidebar holiday check failed:", err);
      }
    };
    checkTodayHoliday();
  }, []);

  const menuItems = [
    { icon: <HiMiniSquares2X2 size={18} className="mr-3" />, label: "Dashboard", path: "/" },
    { icon: <HiMiniPresentationChartBar size={18} className="mr-3" />, label: "Training Materials", path: "/training-materials" },
    { icon: <HiMiniIdentification size={18} className="mr-3" />, label: "Telephone Directory", path: "/telephone-directory" },
    { icon: <HiMiniCalendarDays size={18} className="mr-3" />, label: "Holiday List", path: "/holiday-list" },
    { icon: <HiMiniCalendar size={18} className="mr-3" />, label: "Upcoming Events", path: "/upcoming-events" },
    { icon: <HiMiniUsers size={18} className="mr-3" />, label: "People", path: "/people" },
  ];

  if (user && user.role === 'admin') {
    if (!menuItems.some(item => item.path === "/admin")) {
      menuItems.push({ icon: <HiMiniShieldCheck size={18} className="mr-3" />, label: "Admin Pannel", path: "/admin" });
    }
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
                className={({ isActive }) => isActive ? "active-link flex items-center" : "flex items-center"}
              >
                {item.icon} 
                <span className="flex-1">{item.label}</span>
                {item.label === "Holiday List" && isHolidayToday && (
                  <div className="sidebar-holiday-indicator" title="Holiday Today"></div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;