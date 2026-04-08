import { Search, UserCircle } from "lucide-react";
import { useLocation } from "react-router-dom";

const Header = () => {
    const location = useLocation();
    const hiddenPaths = ["/training-materials", "/telephone-directory", "/holiday-list", "/upcoming-events", "/people"];
    const isHidden = hiddenPaths.includes(location.pathname);

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

                    {/* Login Pill */}
                    <button className="login-btn hover-scale">
                        <UserCircle size={22} className="fill-white/20" />
                        <span>Login</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Header;