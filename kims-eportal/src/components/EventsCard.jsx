import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { MapPin, CalendarDays, ChevronRight, Clock } from "lucide-react";

const EventsCard = () => {
    const [events, setEvents] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        API.get("/events/upcoming")
            .then((res) => { if (res.data) setEvents(res.data) })
            .catch((err) => console.error(err));
    }, []);

    const topEvents = events.slice(0, 3);

    useEffect(() => {
        if (topEvents.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % topEvents.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [topEvents.length]);

    if (topEvents.length === 0) {
        return (
            <div className="card events-card" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                No upcoming events.
            </div>
        )
    }

    const typeThemes = [
        { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', badgeBg: 'rgba(16, 185, 129, 0.15)', text: '#059669' },
        { bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', badgeBg: 'rgba(59, 130, 246, 0.15)', text: '#2563eb' },
        { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', badgeBg: 'rgba(245, 158, 11, 0.15)', text: '#d97706' },
    ];

    // Determine backend base URL for images
    const getBackendUrl = () => {
        // Normally API baseurl handles it, but since API serves `/api`, we want root
        return `http://${window.location.hostname}:5000`;
    };

    return (
        <div className="card events-card premium-slider-card">
            <div className="slider-wrapper">
                {topEvents.map((e, idx) => {
                    const theme = typeThemes[idx % typeThemes.length];

                    // Style variables
                    const hasImage = !!e.image_url;
                    const containerStyle = hasImage ? {
                        background: `linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%), url(${getBackendUrl()}${e.image_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    } : {};

                    return (
                        <div
                            key={e.id}
                            className={`event-slide ${idx === currentIndex ? 'active-slide' : ''}`}
                            onClick={() => navigate("/upcoming-events")}
                        >
                            <div className={`featured-event ${hasImage ? 'has-bg-image' : ''}`} style={!hasImage ? { borderLeft: `5px solid ${theme.text}` } : containerStyle}>

                                <div className="event-details" style={{ paddingLeft: !hasImage ? '14px' : '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                                        <h4 className="event-name" style={{ margin: 0, ...(hasImage ? { color: '#ffffff' } : {}) }}>{e.event_name}</h4>
                                        <span className={`event-badge ${hasImage ? 'badge-light' : ''}`} style={{ marginTop: '2px', flexShrink: 0, ...(!hasImage ? { background: theme.badgeBg, color: theme.text } : {}) }}>
                                            {e.event_type || 'Event'}
                                        </span>
                                    </div>

                                    <div className="event-meta-row" style={{ flexDirection: 'column', gap: '5px', marginTop: '4px' }}>
                                        <div className={`meta-item ${hasImage ? 'meta-light' : ''}`} style={{ fontSize: '12px' }}>
                                            <Clock size={14} strokeWidth={2.5} style={!hasImage ? { color: theme.text } : { color: '#e2e8f0' }} />
                                            <span>{e.event_date}</span>
                                        </div>
                                        <div className={`meta-item ${hasImage ? 'meta-light' : ''}`} style={{ fontSize: '12px' }}>
                                            <MapPin size={14} strokeWidth={2.5} style={!hasImage ? { color: theme.text } : { color: '#e2e8f0' }} />
                                            <span>{e.location || 'TBD'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={`action-arrow ${hasImage ? 'arrow-light' : ''}`} style={!hasImage ? { background: theme.badgeBg, color: theme.text } : {}}>
                                    <ChevronRight size={16} strokeWidth={3} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {topEvents.length > 1 && (
                <div className="slider-dots">
                    {topEvents.map((_, i) => (
                        <div
                            key={i}
                            className={`dot ${i === currentIndex ? 'active-dot' : ''}`}
                            style={{ background: i === currentIndex ? typeThemes[i % typeThemes.length].text : '#e2e8f0' }}
                        />
                    ))}
                </div>
            )}

            <style>{`
                .premium-slider-card {
                    overflow: hidden;
                    padding: 0;
                    background: #ffffff;
                    border-radius: 16px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.03);
                    position: relative;
                    min-height: 120px;
                }
                
                .slider-wrapper {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    width: 100%;
                    height: 100%;
                }

                .event-slide {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateX(20px);
                    transition: all 0.5s cubic-bezier(0.25, 1.05, 0.5, 1);
                }

                .active-slide {
                    opacity: 1;
                    visibility: visible;
                    transform: translateX(0);
                    position: relative;
                }

                .featured-event {
                    display: flex;
                    align-items: center;
                    padding: 16px;
                    gap: 16px;
                    height: 100%;
                    cursor: pointer;
                    transition: background 0.3s ease;
                }
                
                .featured-event:hover {
                    background: transparent;
                }

                .has-bg-image {
                    background-position: center !important;
                    background-size: cover !important;
                    transition: all 0.4s ease;
                }

                .active-slide:hover .has-bg-image {
                    background-size: 110% !important; /* Slight zoom effect for images */
                }

                .event-icon-block {
                    width: 56px;
                    height: 56px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                
                .shadow-elevate {
                    box-shadow: 0 8px 18px rgba(0,0,0,0.14);
                }
                
                .featured-event:hover .event-icon-block {
                    transform: scale(1.05) translateY(-2px);
                }

                .event-details {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    min-width: 0;
                }

                .event-header {
                    margin-bottom: 5px;
                }

                .event-badge {
                    font-size: 8px;
                    padding: 0px 6px;
                    border-radius: 20px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    height: 14px;
                    line-height: 1;
                    vertical-align: middle;
                    padding-bottom: 1px; /* Nudges text up slightly */
                }

                .badge-light {
                    background: rgba(255, 255, 255, 0.2);
                    color: #ffffff;
                    backdrop-filter: blur(4px);
                    border: 1px solid rgba(255,255,255,0.3);
                }

                .event-name {
                    margin: 0 0 6px 0;
                    font-size: 17px;
                    font-weight: 800;
                    color: #0f172a;
                    line-height: 1.35;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .event-meta-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 11.5px;
                    color: #475569;
                    font-weight: 600;
                }

                .meta-light {
                    color: #f1f5f9 !important;
                }

                .action-arrow {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .arrow-light {
                    background: rgba(255, 255, 255, 0.15);
                    color: #ffffff;
                    backdrop-filter: blur(4px);
                }
                
                .featured-event:hover .action-arrow {
                    transform: translateX(4px);
                }

                .slider-dots {
                    position: absolute;
                    bottom: 0; left: 0;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    gap: 6px;
                    padding: 10px 0;
                    background: transparent;
                    z-index: 10;
                }

                .dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                }

                .active-dot {
                    width: 18px;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default EventsCard;