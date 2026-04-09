import { Search, UserCircle, LogOut, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

    const hiddenPaths = ["/training-materials", "/telephone-directory", "/holiday-list", "/upcoming-events", "/people", "/admin"];
    const isHidden = hiddenPaths.includes(location.pathname);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="top-header">
            {!isHidden && (
                <div className="flex items-center gap-[18px] w-full justify-end pr-4">
                    {/* Search - Balanced Twin Button (Option A) */}
                    <div
                        className={`flex items-center h-[33px] rounded-full transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(31,184,120,0.6)] bg-[#] text-white hover:scale-105 ${isSearchExpanded ? "w-[170px] px-3" : "w-[90px] px-4 justify-center"
                            }`}
                        onClick={() => !isSearchExpanded && setIsSearchExpanded(true)}
                    >
                        <Search size={18} className={`${isSearchExpanded ? "mr-2" : ""}`} />

                        {!isSearchExpanded ? (
                            <span className="text-[14px] font-medium ml-1">Search</span>
                        ) : (
                            <div className="flex items-center w-full">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search..."
                                    className="bg-transparent border-none outline-none text-white text-[13px] w-full placeholder:text-white/60"
                                    onBlur={() => setIsSearchExpanded(false)}
                                />
                                <X
                                    size={16}
                                    className="cursor-pointer hover:rotate-90 transition-transform"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsSearchExpanded(false);
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Auth Status Pill */}
                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-white font-medium text-[14px]">Hi, {user.username}</span>
                            <button onClick={handleLogout} className="login-btn hover-scale flex items-center justify-center !bg-[#e53e3e]">
                                <LogOut size={20} className="mr-1" />
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => navigate('/login')} className="login-btn hover-scale !min-w-[90px]">
                            <UserCircle size={22} className="fill-white/20" />
                            <span>Login</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Header;