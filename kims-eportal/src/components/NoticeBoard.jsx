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
    <div className="glass-card notice-board-card">
      <div className="glass-header">
        <h3 className="glass-title">Notice Board</h3>
      </div>
      
      <div className="inner-white-container scrollable">
        {(() => {
          const todayStr = new Date().toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });

          return notices.length > 0 ? (
            notices
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((n, index) => {
                const isToday = n.date === todayStr;
              return (
                <div className={`notice-item hover-scale ${isToday ? 'latest-notice' : ''}`} key={n.id}>
                  <div className="item-left">
                    <div className={`icon-box ${isToday ? 'has-ringing-bell' : ''}`}>
                      <Bell size={17} className={isToday ? 'ringing-bell' : ''} />
                    </div>
                <div className="item-info" style={{ paddingLeft: '4px' }}>
                  <h4 style={{ 
                    fontWeight: '700', 
                    color: '#1e293b', 
                    fontSize: '14.5px', 
                    marginBottom: '8px',
                    letterSpacing: '-0.3px',
                    textTransform: 'capitalize' 
                  }}>
                    {n.title.toLowerCase()}
                  </h4>
                  <div className="meta" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', opacity: '0.85' }}>
                      <User size={14} style={{ color: '#475569', marginRight: '10px' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11.5px', color: '#1e293b', fontWeight: '700' }}>Issued By:</span>
                        <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '500' }}>{n.issued_by}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', opacity: '0.85' }}>
                      <CalendarDays size={13} style={{ color: '#475569', marginRight: '10px' }} />
                      <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '600' }}>{n.date}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1 ml-auto items-end">
                {n.pdfs && n.pdfs.length > 0 ? (
                  n.pdfs.map((p, pIdx) => (
                    <a
                      key={p.id || pIdx}
                      href={`http://${window.location.hostname}:5000${p.pdf_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-btn hover-scale"
                      title={p.pdf_name}
                    >
                      <Download size={10} /> {n.pdfs.length > 1 ? (p.pdf_name.length > 10 ? p.pdf_name.substring(0, 10) + '...' : p.pdf_name) : "Download"}
                    </a>
                  ))
                ) : (
                  <button className="download-btn opacity-50 cursor-not-allowed flex items-center justify-center gap-1" disabled title="No PDF document attached">
                    <Download size={12} /> N/A
                  </button>
                )}
              </div>
            </div>
              );
            })
          ) : (
            <div className="empty-notices">No notices available</div>
          );
        })()}
      </div>
    </div>
  );
};

export default NoticeBoard;