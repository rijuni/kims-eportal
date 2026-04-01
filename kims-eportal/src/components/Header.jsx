import { Search, UserCircle } from "lucide-react";
import { useLocation } from "react-router-dom";

const Header = () => {
    const location = useLocation();
    const isTrainingPage = location.pathname === "/training-materials";

    return (
        <div className="top-header">
            {!isTrainingPage && (
                <div className="flex items-center gap-4 w-full justify-between">
                    {/* Search Pill - Replaces the hamburger menu on the left */}
                    <div className="flex items-center bg-white px-4 py-2 rounded-full border border-gray-200 w-[200px] sm:w-[280px] md:w-[320px] shadow-sm">
                        <input 
                            type="text" 
                            placeholder="Search here..." 
                            className="bg-transparent border-none outline-none text-gray-700 text-[14px] w-full"
                        />
                        <Search size={20} className="text-gray-400" />
                    </div>

                    {/* Login Pill - Pushed to the right */}
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