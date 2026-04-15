import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Bell, User, CalendarDays, Download } from "lucide-react";

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    API.get("/notices?public=true")
      .then((res) => { if (res.data) setNotices(res.data) })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="card scrollable">
      {notices.map((n) => (
        <div className="notice-item hover-scale" key={n.id}>
          <div className="item-left">
            <div className="icon-box">
              <Bell size={17} />
            </div>
            <div className="item-info">
              <h4>{n.title}</h4>
              <div className="meta">
                <span className="flex items-center gap-2">
                  <User size={13} className="text-gray-500" />
                  <span className="meta-label">Issued By: </span>
                  <span className="meta-value">{n.issued_by}</span>
                </span>
                <span className="flex items-center gap-2 date-text">
                  <CalendarDays size={12} className="text-gray-400" /> {n.date}
                </span>
              </div>
            </div>
          </div>
          {n.document_url ? (
            <a
              href={`http://${window.location.hostname}:5000${n.document_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="download-btn hover-scale flex items-center justify-center gap-1"
            >
              <Download size={12} /> Download
            </a>
          ) : (
            <button className="download-btn opacity-50 cursor-not-allowed flex items-center justify-center gap-1" disabled title="No PDF document attached">
              <Download size={12} /> N/A
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default NoticeBoard;