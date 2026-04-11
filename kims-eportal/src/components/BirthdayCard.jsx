import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Mail, CalendarDays, User } from "lucide-react";

const mockBirthdays = [
  ...Array(3).fill({
    id: Math.random(),
    name: "Mr. Debi Prasad Panda",
    department: "ICT CELL",
    date_of_birth: "18th March, 2026"
  })
];

const BirthdayCard = () => {
  const [birthdays, setBirthdays] = useState(mockBirthdays);

  useEffect(() => {
    API.get("/employees/birthdays")
      .then((res) => { if (res.data?.length > 0) setBirthdays(res.data) })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="card birthdays-card">
      {/* Cracker Animation elements */}
      <div className="cracker-wrapper">
        <div className="cracker" style={{ left: '20%', top: '40%', animationDelay: '0s' }}></div>
        <div className="cracker" style={{ left: '75%', top: '30%', animationDelay: '0.8s' }}></div>
        <div className="cracker" style={{ left: '45%', top: '70%', animationDelay: '1.6s' }}></div>
      </div>
      
      {birthdays.map((b) => (
        <div className="birthday-item hover-scale" key={b.id || Math.random()}>
          <div className="item-info">
            <h4>{b.name}</h4>
            <div className="meta">
              <span className="flex items-center gap-2">
                <User size={14} /> {b.department}
              </span>
              <span className="flex items-center gap-2 mt-1">
                <CalendarDays size={14} /> {b.date_of_birth}
              </span>
            </div>
          </div>
          <div className="mail-btn" title="Send Mail">
            <Mail size={18} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default BirthdayCard;