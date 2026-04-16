import { NavLink, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { 
  HiMiniSquares2X2, HiMiniPresentationChartBar, HiMiniIdentification, 
  HiMiniCalendarDays, HiMiniCalendar, HiMiniUsers, HiMiniShieldCheck,
  HiMiniSquaresPlus, HiMiniChevronDown, HiMiniChevronUp 
} from "react-icons/hi2";
import logo from "../img/Capture.PNG";
import API from "../services/api";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [isHolidayToday, setIsHolidayToday] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const dashboardItem = { icon: <HiMiniSquares2X2 size={18} className="mr-3" />, label: "Dashboard", path: "/" };

  const dropdownItems = [
    { icon: <HiMiniPresentationChartBar size={18} className="mr-3" />, label: "Training Materials", path: "/training-materials" },
    { icon: <HiMiniIdentification size={18} className="mr-3" />, label: "Telephone Directory", path: "/telephone-directory" },
    { icon: <HiMiniCalendarDays size={18} className="mr-3" />, label: "Holiday List", path: "/holiday-list" },
    { icon: <HiMiniCalendar size={18} className="mr-3" />, label: "Upcoming Events", path: "/upcoming-events" },
    { icon: <HiMiniUsers size={18} className="mr-3" />, label: "People", path: "/people" },
  ];

  if (user && user.role === 'admin') {
    if (!dropdownItems.some(item => item.path === "/admin")) {
      dropdownItems.push({ icon: <HiMiniShieldCheck size={18} className="mr-3" />, label: "Admin Panel", path: "/admin" });
    }
  }

  // Auto-open dropdown if we are on a route that is inside the dropdown
  useEffect(() => {
    if (location.pathname !== "/") {
      setIsDropdownOpen(true);
    }
  }, [location.pathname]);

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
          <li>
            <NavLink 
              to={dashboardItem.path} 
              className={({ isActive }) => isActive ? "active-link flex items-center" : "flex items-center"}
              end
            >
              {dashboardItem.icon} 
              <span className="flex-1">{dashboardItem.label}</span>
            </NavLink>
          </li>
          
          <li className="mt-2">
            <a 
              className={`flex items-center cursor-pointer justify-between w-full transition-all duration-300 ${isDropdownOpen ? 'text-[#1FA463] font-semibold bg-gradient-to-r from-[rgba(31,164,99,0.1)] to-[rgba(31,164,99,0)]' : 'text-[#475569] hover:text-[#1FA463] hover:bg-gradient-to-r hover:from-[rgba(31,164,99,0.1)] hover:to-[rgba(31,164,99,0)]'} px-[40px] py-[12px]`}
              style={{ marginLeft: isDropdownOpen ? '0' : '0' }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="flex items-center">
                <HiMiniSquares2X2 size={18} className="mr-3 text-[#64748b]" style={{ color: isDropdownOpen ? '#1fa463' : '#64748b' }} />
                <span className="flex-1" style={{ fontSize: '13.5px' }}>Explore More</span>
              </div>
              <div className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-[#1FA463]' : 'text-[#64748b]'}`}>
                <HiMiniChevronDown size={14} />
              </div>
            </a>
          </li>

          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out`}
            style={{ 
              maxHeight: isDropdownOpen ? '500px' : '0px',
              opacity: isDropdownOpen ? 1 : 0,
              marginTop: isDropdownOpen ? '4px' : '0px'
            }}
          >
            {dropdownItems.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => `flex items-center ${isActive ? 'active-link' : ''}`}
                  style={{ paddingLeft: '55px', paddingTop: '8px', paddingBottom: '8px', fontSize: '13.5px', marginTop: '0px', marginBottom: '0px' }}
                >
                  <span className="mr-3 opacity-80 scale-100">{item.icon}</span> 
                  <span className="flex-1">{item.label}</span>
                  {item.label === "Holiday List" && isHolidayToday && (
                    <div className="sidebar-holiday-indicator scale-75" title="Holiday Today"></div>
                  )}
                </NavLink>
              </li>
            ))}
          </div>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;