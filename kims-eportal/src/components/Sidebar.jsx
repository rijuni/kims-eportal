import { NavLink, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  HiMiniSquares2X2, HiMiniPresentationChartBar, HiMiniIdentification,
  HiMiniCalendarDays, HiMiniCalendar, HiMiniUsers, HiMiniShieldCheck,
  HiMiniSquaresPlus, HiMiniChevronDown, HiMiniChevronUp, HiMiniUserCircle
} from "react-icons/hi2";
import logo from "../img/Capture.PNG";
import API from "../services/api";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, isHolidayToday } = useContext(AuthContext);
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);


  const dashboardItem = { icon: <HiMiniSquares2X2 size={18} className="mr-3" />, label: "Dashboard", path: "/" };

  const dropdownItems = [
    { icon: <HiMiniPresentationChartBar size={18} className="mr-3" />, label: "Training Materials", path: "/training-materials" },
    { icon: <HiMiniIdentification size={18} className="mr-3" />, label: "Telephone Directory", path: "/telephone-directory" },
    { icon: <HiMiniCalendarDays size={18} className="mr-3" />, label: "Holiday List", path: "/holiday-list" },
    { icon: <HiMiniCalendar size={18} className="mr-3" />, label: "Upcoming Events", path: "/upcoming-events" },
    { icon: <HiMiniUsers size={18} className="mr-3" />, label: "People", path: "/people" },
  ];


  // Auto-open dropdown ONLY if we are on a route that is actually inside the dropdown
  useEffect(() => {
    const isDropdownPath = dropdownItems.some(item => item.path === location.pathname);
    if (isDropdownPath) {
      setIsDropdownOpen(true);
    }
    
    // Auto-open Admin Hub if on admin, management, or account-center paths
    const isAdminPath = location.pathname.startsWith('/admin') || 
                        location.pathname.startsWith('/manage') || 
                        location.pathname.startsWith('/account-center');
    if (isAdminPath) {
      setIsAdminDropdownOpen(true);
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
          
          {user && user.role === 'admin' && (
            <>
              <li className="mt-2">
                <a
                  className={`flex items-center cursor-pointer justify-between w-full transition-all duration-300 ${isAdminDropdownOpen ? 'text-[#1FA463] font-semibold bg-gradient-to-r from-[rgba(31,164,99,0.1)] to-[rgba(31,164,99,0)]' : 'text-[#475569] hover:text-[#1FA463] hover:bg-gradient-to-r hover:from-[rgba(31,164,99,0.1)] hover:to-[rgba(31,164,99,0)]'} px-[40px] py-[12px]`}
                  onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                >
                  <div className="flex items-center gap-[5px]">
                    <HiMiniShieldCheck size={18} className="mr-3 text-[#64748b]" style={{ color: isAdminDropdownOpen ? '#1fa463' : '#64748b' }} />
                    <span className="flex-1" style={{ fontSize: '13.5px' }}>Admin Hub</span>
                  </div>
                  <div className={`transition-transform duration-300 ${isAdminDropdownOpen ? 'rotate-180 text-[#1FA463]' : 'text-[#64748b]'}`}>
                    <HiMiniChevronDown size={14} />
                  </div>
                </a>
              </li>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out`}
                style={{
                  maxHeight: isAdminDropdownOpen ? '200px' : '0px',
                  opacity: isAdminDropdownOpen ? 1 : 0,
                  marginTop: isAdminDropdownOpen ? '4px' : '0px'
                }}
              >
                <li>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) => `flex items-center ${isActive ? 'active-link' : ''}`}
                    style={{ paddingLeft: '55px', paddingTop: '10px', paddingBottom: '10px', fontSize: '13.5px' }}
                  >
                    <div className="flex items-center opacity-85">
                      <HiMiniSquaresPlus size={18} className="mr-3" />
                    </div>
                    <span className="flex-1 leading-none">Admin Panel</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/account-center"
                    className={({ isActive }) => `flex items-center ${isActive ? 'active-link' : ''}`}
                    style={{ paddingLeft: '55px', paddingTop: '10px', paddingBottom: '10px', fontSize: '13.5px' }}
                  >
                    <div className="flex items-center opacity-85">
                      <HiMiniUserCircle size={18} className="mr-3" />
                    </div>
                    <span className="flex-1 leading-none">Account Center</span>
                  </NavLink>
                </li>
              </div>
            </>
          )}

          <li className="mt-2">
            <a
              className={`flex items-center cursor-pointer justify-between w-full transition-all duration-300 ${isDropdownOpen ? 'text-[#1FA463] font-semibold bg-gradient-to-r from-[rgba(31,164,99,0.1)] to-[rgba(31,164,99,0)]' : 'text-[#475569] hover:text-[#1FA463] hover:bg-gradient-to-r hover:from-[rgba(31,164,99,0.1)] hover:to-[rgba(31,164,99,0)]'} px-[40px] py-[12px]`}
              style={{ marginLeft: isDropdownOpen ? '0' : '0' }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="flex items-center gap-[5px]">
                <HiMiniSquaresPlus size={18} className="mr-3 text-[#64748b]" style={{ color: isDropdownOpen ? '#1fa463' : '#64748b' }} />
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
                  style={{ paddingLeft: '55px', paddingTop: '10px', paddingBottom: '10px', fontSize: '13.5px' }}
                >
                  <div className="flex items-center opacity-85">
                    {item.icon}
                  </div>
                  <span className="flex-1 leading-none">{item.label}</span>
                  
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