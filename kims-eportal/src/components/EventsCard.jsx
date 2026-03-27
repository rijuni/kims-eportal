import React, { useEffect, useState } from "react";
import API from "../services/api";
import { CalendarDays, MapPin } from "lucide-react";

const mockEvents = [
  { id: 1, event_name: "World Cancer Day", event_date: "4th February, 2026", location: "KIMS Cancer Centre" },
  { id: 2, event_name: "International Women's Day", event_date: "8th March, 2026", location: "KIMS Lobby" },
  { id: 3, event_name: "World Kidney Day", event_date: "13th March, 2026", location: "KIMS Super speciality & Cancer Centre" },
];

const EventsCard = () => {
    const [events, setEvents] = useState(mockEvents);

    useEffect(() => {
        API.get("/events/upcoming")
            .then((res) => { if (res.data?.length > 0) setEvents(res.data) })
            .catch((err) => console.error(err));
    }, []);

    return (
        <div className="card hover-lift">
            {events.map((e) => (
                <div className="event-item hover-scale" key={e.id}>
                    <div className="item-info">
                        <h4>{e.event_name}</h4>
                        <div className="meta">
                            <span className="flex items-center gap-2">
                                <CalendarDays size={14} /> {e.event_date}
                            </span>
                            <span className="flex items-center gap-2">
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