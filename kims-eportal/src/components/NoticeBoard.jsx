import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Bell, User, CalendarDays, Download } from "lucide-react";

const mockNotices = [
  ...Array(6).fill({
    id: Math.random(),
    title: "Counter Wise Allotment of Schools/Department/Units",
    issued_by: "Principal KIMS",
    date: "1st January, 2026",
    document_url: "#"
  })
];

const NoticeBoard = () => {
  const [notices, setNotices] = useState(mockNotices);

  useEffect(() => {
    API.get("/notices")
      .then((res) => { if (res.data?.length > 0) setNotices(res.data) })
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
          <a href={n.document_url} target="_blank" className="download-btn hover-scale flex items-center justify-center gap-1">
            <Download size={12} /> Download
          </a>
        </div>
      ))}
    </div>
  );
};

export default NoticeBoard;