import { Search, UserCircle, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    const hiddenPaths = ["/training-materials", "/telephone-directory", "/holiday-list", "/upcoming-events", "/people", "/admin"];
    const isHidden = hiddenPaths.includes(location.pathname);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="top-header">
            {!isHidden && (
                <div className="flex items-center gap-[38px] w-full justify-end">
                    {/* Search Box - Size matched with Login button */}
                    <div className="flex items-center bg-[#F8FFF9] px-4 h-[42px] rounded-full border border-gray-100 w-[130px] shadow-sm hover:shadow-md transition-all">
                        <input
                            type="text"
                            placeholder=""
                            className="bg-transparent border-none outline-none text-gray-700 text-[16px] w-full"
                        />
                        <Search size={28} className="text-[#A0AEC0] ml-1" />
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
                        <button onClick={() => navigate('/login')} className="login-btn hover-scale">
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