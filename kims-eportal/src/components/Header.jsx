import { Search, UserCircle, LogOut, X, Megaphone, ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Ticker State
    const [tickerItems, setTickerItems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        // Fetch all ticker data
        Promise.allSettled([
            API.get("/employees/birthdays"),
            API.get("/events/upcoming"),
            API.get("/notices?public=true")
        ]).then((results) => {
            const items = [];

            // Handle Birthdays (TODAY ONLY)
            if (results[0].status === 'fulfilled') {
                const today = new Date();
                const d = today.getDate();
                const dStr = d < 10 ? `0${d}` : String(d);
                const mNumeric = today.getMonth() + 1;
                const mStr = mNumeric < 10 ? `0${mNumeric}` : String(mNumeric);
                const mLong = today.toLocaleString('default', { month: 'long' }).toLowerCase();
                const mShort = today.toLocaleString('default', { month: 'short' }).toLowerCase();

                const todayBirthdays = results[0].value.data.filter(b => {
                    const dob = String(b.date_of_birth || '').toLowerCase();
                    const nameMatch = dob.includes(String(d)) && (dob.includes(mLong) || dob.includes(mShort));
                    const numericMatch = dob.includes(dStr) && dob.includes(mStr);
                    const exactHyphen = dob.includes(`${dStr}-${mStr}`);
                    return nameMatch || numericMatch || exactHyphen;
                });

                if (todayBirthdays.length > 0) {
                    todayBirthdays.forEach(b => {
                        items.push({
                            type: 'birthday',
                            text: `Happy Birthday ${b.name}!`,
                            image: b.image
                        });
                    });
                }
            }

            // Handle Events
            if (results[1].status === 'fulfilled' && results[1].value.data?.length > 0) {
                const event = results[1].value.data[0];
                items.push({
                    type: 'event',
                    text: `🎉 Upcoming Event: ${event.event_name} on ${event.event_date}`
                });
            }

            // Handle Notices
            if (results[2].status === 'fulfilled' && results[2].value.data?.length > 0) {
                const notice = results[2].value.data[0];
                items.push({
                    type: 'notice',
                    text: `📢 Notice: ${notice.title}`
                });
            }

            if (items.length === 0) {
                items.push({
                    type: 'default',
                    text: "💡 Welcome to KIMS E-Portal! Have a great day."
                });
            }

            setTickerItems(items);
        });
    }, []);

    // Cycle items one by one
    useEffect(() => {
        if (tickerItems.length <= 1) return;
        
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % tickerItems.length);
        }, 5000); // 5 seconds per item
        
        return () => clearInterval(timer);
    }, [tickerItems]);

    const isHidden = location.pathname !== "/";

    if (isHidden) {
        return <div style={{ height: '50px' }} />;
    }

    return (
        <div className="top-header !px-0" style={{ marginRight: '35px', paddingRight: '0', paddingLeft: '0', borderTopLeftRadius: '19px', borderBottomLeftRadius: '19px' }}>
            <div className="flex items-center w-full gap-[50px]">

                {/* Left Column */}
                <div className="flex-[1.5] flex items-center">
                    <div className="flex-1 flex items-center overflow-hidden rounded-full h-[34px] px-2">
                        <div className="flex items-center justify-center w-[34px] h-[34px] rounded-full bg-[#e53e3e] blink-shadow-red mr-[10px] flex-shrink-0">
                            <Megaphone size={13} className="text-white fill-white/20" strokeWidth={2.5} />
                        </div>
                        <div className="w-full overflow-hidden">
                            {tickerItems[currentIndex] && (
                                <div key={currentIndex} className="notice-ticker-item text-white text-[13.5px] font-medium tracking-wide flex items-center gap-3">
                                    {tickerItems[currentIndex].type === 'birthday' && (
                                        <div className="flex items-center gap-[12px]">
                                            <span className="flex items-center gap-1">
                                                <span>🎂</span>
                                                {tickerItems[currentIndex].text}
                                            </span>
                                            {tickerItems[currentIndex].image ? (
                                                <img 
                                                  src={`http://${window.location.hostname}:5000${tickerItems[currentIndex].image}`} 
                                                  className="w-[26px] h-[26px] rounded-full object-cover border-2 border-white/40 shadow-sm"
                                                  alt="" 
                                                />
                                            ) : (
                                                <span className="text-[16px]">🎂</span>
                                            )}
                                        </div>
                                    )}
                                    {tickerItems[currentIndex].type !== 'birthday' && (
                                        <span>{tickerItems[currentIndex].text}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column (Visually aligns above Events/Birthdays - flex 1) */}
                <div className="flex-1 flex items-center justify-end gap-[15px]">

                    {/* Expandable Frosted Search Button/Bar */}
                    <div
                        className={`flex items-center h-[34px] box-border rounded-full border border-white/30 bg-white/10 text-white transition-all duration-300 cursor-pointer hover:border-white/50 focus-within:border-white/60 focus-within:bg-white/15 flex-shrink-0 ${isSearchExpanded ? "w-[170px] px-3" : "w-[95px] justify-center shadow-sm"}`}
                        onClick={() => !isSearchExpanded && setIsSearchExpanded(true)}
                    >
                        <Search size={16} className={`text-white opacity-90 ${isSearchExpanded ? "mr-2" : ""}`} strokeWidth={2} />

                        {!isSearchExpanded ? (
                            <span className="text-[13px] font-medium ml-1">Search</span>
                        ) : (
                            <div className="flex items-center w-full">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search..."
                                    className="bg-transparent border-none outline-none text-white text-[13px] w-full placeholder:text-white/70 flex-1 font-medium"
                                    onBlur={(e) => {
                                        if (!e.relatedTarget) {
                                            setTimeout(() => setIsSearchExpanded(false), 200);
                                        }
                                    }}
                                />
                                <X
                                    size={16}
                                    className="text-white/80 hover:text-white ml-1 cursor-pointer transition-transform hover:rotate-90"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsSearchExpanded(false);
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Auth Status Dropdown */}
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="user-pill-btn flex items-center gap-2 h-[34px] px-4 transition-all"
                            >
                                <div className="w-[20px] h-[20px] rounded-full bg-white/20 flex items-center justify-center">
                                    <UserCircle size={14} className="text-white" />
                                </div>
                                <span>{user.username || "User"}</span>
                                <ChevronDown size={14} className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="dropdown-menu animate-dropdown">
                                    <div className="dropdown-user-info">
                                        <span className="dropdown-user-name">{user.username || "Authorized User"}</span>
                                        <span className="dropdown-user-role">KIMS Administrator</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsDropdownOpen(false);
                                        }}
                                        className="dropdown-logout-btn"
                                    >
                                        <LogOut size={16} strokeWidth={2.5} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="flex items-center justify-center gap-[6px] h-[34px] box-border px-[18px] bg-[#1fa463] text-white rounded-full font-semibold text-[13px] hover-scale shadow-[0_4px_12px_rgba(31,164,99,0.3)] flex-shrink-0"
                        >
                            <UserCircle size={17} className="text-white opacity-90" strokeWidth={2} />
                            <span>Login</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;