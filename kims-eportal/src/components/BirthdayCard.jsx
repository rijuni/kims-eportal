import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Mail, CalendarDays } from "lucide-react";

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
    <div className="card hover-lift">
      {birthdays.map((b) => (
        <div className="birthday-item hover-scale" key={b.id || Math.random()}>
          <div className="item-info">
            <h4>{b.name}</h4>
            <div className="meta">
              <span>Department: <strong>{b.department}</strong></span>
              <span className="flex items-center gap-1.5 mt-1">
                <CalendarDays size={12} /> {b.date_of_birth}
              </span>
            </div>
          </div>
          <div className="mail-btn">
            <Mail size={18} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default BirthdayCard;