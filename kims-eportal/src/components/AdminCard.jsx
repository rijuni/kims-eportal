import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminCard = ({ title, icon, description, theme, link }) => {
    const navigate = useNavigate();

    const handleAccess = () => {
        if (link) {
            navigate(link);
        } else {
            console.log(`Access clicked for ${title} - No link provided`);
        }
    };

    return (
        <div className={`admin-card theme-${theme}`}>
            {/* Top Color Line */}
            <div className="top-line"></div>
            {/* Icon */}
            <div className="icon">{icon}</div>
            {/* Title */}
            <h3>{title}</h3>
            {/* Description */}
            <p>{description}</p>
            {/* Button */}
            <button className="access-btn" onClick={handleAccess}>Access</button>
        </div>
    );
};

export default AdminCard;
