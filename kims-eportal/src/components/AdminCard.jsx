import React from 'react';

const AdminCard = ({ title, icon, description, theme }) => {
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
            <button className="access-btn">Access</button>
        </div>
    );
};

export default AdminCard;
