import React, { useState } from 'react';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import '../styles/holiday-list.css';

const HolidayList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const holidays = [
    { sl: 1, date: "23-01-2026", days: "Friday", noOfDays: 1, event: "Saraswati Puja" },
    { sl: 2, date: "26-01-2026", days: "Monday", noOfDays: 1, event: "Republic Day" },
    { sl: 3, date: "04-03-2026", days: "Wednesday", noOfDays: 1, event: "Holi" },
    { sl: 4, date: "21-03-2026", days: "Saturday", noOfDays: 1, event: "ID-UL-FITRE" },
    { sl: 5, date: "27-03-2026", days: "Friday", noOfDays: 1, event: "Shree Ram Navami" },
    { sl: 6, date: "14-04-2026", days: "Tuesday", noOfDays: 1, event: "Maha Vishuba Sankranti" },
    { sl: 7, date: "15-06-2026", days: "Monday", noOfDays: 1, event: "Raja Sankranti" },
    { sl: 8, date: "16-07-2026", days: "Thursday", noOfDays: 1, event: "Ratha Yatra" },
    { sl: 9, date: "15-08-2026", days: "Saturday", noOfDays: 1, event: "Independence Day" },
    { sl: 10, date: "04-09-2026", days: "Friday", noOfDays: 1, event: "Janmashtami" },
    { sl: 11, date: "14-09-2026", days: "Monday", noOfDays: 1, event: "Ganesh Puja" },
    { sl: 12, date: "02-10-2026", days: "Friday", noOfDays: 1, event: "Gandhi Jayanti" },
    { sl: 13, date: "19-10-2026", days: "Monday", noOfDays: 1, event: "Durga Puja (Maha Navami)" },
    { sl: 14, date: "20-10-2026", days: "Tuesday", noOfDays: 1, event: "Durga Puja (Vijaya Dasami)" },
    { sl: 15, date: "25-12-2026", days: "Friday", noOfDays: 1, event: "Christmas" },
  ];

  return (
    <div className={`holiday-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="main-content">
        <Header toggleSidebar={toggleSidebar} />

        <div className="holiday-container">
          <div className="holiday-header-row">
            <h1 className="holiday-title">Holiday List For The Year - 2026</h1>
          </div>
          
          <div className="holiday-card scrollable">
            <table className="holiday-table">
              <thead>
                <tr>
                  <th className="col-sl">Sl no</th>
                  <th className="col-date">Date</th>
                  <th className="col-days">Days</th>
                  <th className="col-nod text-center">No of Days</th>
                  <th className="col-event">Event</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((holiday) => (
                  <tr key={holiday.sl}>
                    <td className="col-sl">{holiday.sl}</td>
                    <td className="col-date">{holiday.date}</td>
                    <td className="col-days">{holiday.days}</td>
                    <td className="col-nod text-center">{holiday.noOfDays}</td>
                    <td className="col-event">{holiday.event}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HolidayList;
