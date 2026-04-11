import React from 'react';

const AdminCard = ({ title, icon, description, theme }) => {
    return (
        <div className={`admin-card-mockup admin-theme-${theme}`}>
            <div className="card-dash"></div>
            <div className="admin-icon">
                {icon}
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
            <button className="access-btn">Access</button>
        </div>
    );
};

export default AdminCard;
