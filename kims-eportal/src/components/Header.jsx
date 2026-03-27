import React from "react";
import { Search, UserCircle, Menu } from "lucide-react";

const Header = ({ toggleSidebar }) => {
    return (
        <div className="top-header">
            <button 
                className="mobile-menu-btn text-white md:hidden" 
                onClick={toggleSidebar}
            >
                <Menu size={24} />
            </button>

            <div className="flex items-center gap-4">
                {/* Search Pill */}
                <div className="hidden md:flex items-center bg-white px-4 py-2 rounded-full border border-gray-200 w-[320px] shadow-sm">
                    <input 
                        type="text" 
                        placeholder="Search here..." 
                        className="bg-transparent border-none outline-none text-gray-700 text-[14px] w-full"
                    />
                    <Search size={20} className="text-gray-400" />
                </div>

                {/* Login Pill */}
                <button className="login-btn hover-scale">
                    <UserCircle size={22} className="fill-white/20" />
                    <span>Login</span>
                </button>
            </div>
        </div>
    );
};

export default Header;