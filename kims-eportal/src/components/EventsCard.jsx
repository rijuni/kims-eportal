import React, { useEffect, useState } from "react";
import API from "../services/api";
import { CalendarDays, MapPin } from "lucide-react";

const EventsCard = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        API.get("/events/upcoming")
            .then((res) => { if (res.data) setEvents(res.data) })
            .catch((err) => console.error(err));
    }, []);

    return (
        <div className="card events-card">
            {events.map((e) => (
                <div className="event-item hover-scale" key={e.id}>
                    <div className="item-info">
                        <h4>{e.event_name}</h4>
                        <div className="meta">
                            <span className="flex items-center gap-2">
                                <CalendarDays size={14} /> {e.event_date}
                            </span>
                            <span className="flex items-center gap-2 mt-1">
                                <MapPin size={14} /> {e.location}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EventsCard;