import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import NoticeBoard from "../components/NoticeBoard";
import EventsCard from "../components/EventsCard";
import BirthdayCard from "../components/BirthdayCard";
import calendarIcon from "../img/calendar_premium.png";
import cakeIcon from "../img/cake_icon.png";
import "../styles/dashboard.css";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`dashboard-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="main-content">
        <Header toggleSidebar={toggleSidebar} />

        <div className="dashboard-container">
          <div className="dashboard-flex">
            {/* Notice Board Column (Green Side) */}
            <div className="notice-section">
              <div className="section-header-row">
                <div className="section-title-wrap">
                  <h1 className="page-title">Notice Board</h1>
                  <p className="page-subtitle">Stay updated with the latest announcements and important updates</p>
                </div>
              </div>
              <NoticeBoard />
            </div>

            {/* Events & Birthdays Column (Blue Side) */}
            <div className="info-section">
              {/* Action Pills aligned with the first header row for structural balance */}
              <div className="section-header-row action-row">
                <div className="action-pills">
                  <a href="#" className="action-pill hover-scale">Hinai</a>
                  <a href="#" className="action-pill hover-scale">SAP</a>
                  <a href="#" className="action-pill hover-scale">Email</a>
                </div>
              </div>

              <div className="right-panel-group">
                {/* Upcoming Events Section */}
                <div className="event-group">
                  <div className="section-title-wrap flex items-center gap-3">
                    <img src={calendarIcon} alt="Calendar" className="w-[54px] h-[54px] object-contain drop-shadow-sm" />
                    <div>
                      <h2 className="page-title">Upcoming Events</h2>
                      <p className="page-subtitle">Be ready for every important moment</p>
                    </div>
                  </div>
                  <EventsCard />
                </div>

                {/* Birthdays Section */}
                <div className="birthday-group">
                  <div className="section-title-wrap flex items-center gap-3">
                    <img src={cakeIcon} alt="Cake" className="w-[54px] h-[54px] object-contain drop-shadow-sm" />
                    <div>
                      <h2 className="page-title">Birthdays</h2>
                      <p className="page-subtitle">Celebrating our team members on their special day</p>
                    </div>
                  </div>
                  <BirthdayCard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;