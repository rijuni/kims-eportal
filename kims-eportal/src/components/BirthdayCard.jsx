import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Mail, CalendarDays, User, Star } from "lucide-react";

const BirthdayCard = () => {
  const [birthdays, setBirthdays] = useState([]);

  useEffect(() => {
    API.get("/employees/birthdays")
      .then((res) => { if (Array.isArray(res.data)) setBirthdays(res.data) })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="card birthdays-card">

      {birthdays.map((b) => {
        // Today Detection Logic
        const today = new Date();
        const dStr = today.getDate() < 10 ? `0${today.getDate()}` : String(today.getDate());
        const mNumeric = today.getMonth() + 1;
        const mStr = mNumeric < 10 ? `0${mNumeric}` : String(mNumeric);
        const mLong = today.toLocaleString('default', { month: 'long' }).toLowerCase();
        const mShort = today.toLocaleString('default', { month: 'short' }).toLowerCase();

        const dob = String(b.date_of_birth || '').toLowerCase();
        const parts = dob.split(/[- /.]/);
        let isToday = false;
        if (parts.length >= 2) {
          const dayPart = parseInt(parts[0]);
          const monthPart = parts[1];
          const isDayMatch = (dayPart === today.getDate());
          const isMonthMatch = (monthPart === mStr || parseInt(monthPart) === mNumeric || monthPart === mLong || monthPart === mShort);
          if (isDayMatch && isMonthMatch) isToday = true;
        }

        if (!isToday) {
          const hasDay = new RegExp(`(^|[^0-9])${today.getDate()}([^0-9]|$)`).test(dob) || new RegExp(`(^|[^0-9])${dStr}([^0-9]|$)`).test(dob);
          const hasMonth = dob.includes(mLong) || dob.includes(mShort);
          isToday = hasDay && hasMonth;
        }

        return (
          <div className={`birthday-item hover-scale ${isToday ? 'is-today-highlight' : ''}`} key={b.id || Math.random()}>
            {isToday && (
              <div className="cracker-wrapper">
                <div className="cracker" style={{ left: '15%', top: '25%', animationDelay: '0s' }}></div>
                <div className="cracker" style={{ left: '80%', top: '15%', animationDelay: '1s' }}></div>
                <div className="cracker" style={{ left: '40%', top: '75%', animationDelay: '2s' }}></div>
                <div className="cracker" style={{ left: '60%', top: '45%', animationDelay: '0.5s' }}></div>
              </div>
            )}
            <div className="birthday-profile-section">
              <div className="birthday-avatar-wrap">
                {b.image ? (
                  <img
                    src={`http://${window.location.hostname}:5000${b.image}`}
                    alt={b.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={18} className="text-white opacity-80" />
                )}
              </div>
            </div>
            <div className="item-info">
              <h4>{b.name}</h4>
              <div className="birthday-meta-row mt-1">
                <span className="designation-pod">{b.department}</span>
                <span className={`dob-pill ${isToday ? 'highlight-today-dob' : ''}`}>
                  <CalendarDays size={12} className={isToday ? "text-[#e11d48]" : "text-[#718096]"} strokeWidth={2.5} /> {b.date_of_birth}
                </span>
              </div>
            </div>
            {isToday && <div className="today-badge-floating">TODAY</div>}
            {isToday && (
              <div className="birthday-stars-cluster">
                <div className="hanging-star-item s1">
                  <div className="star-thread"></div>
                  <span className="star-icon-wrap"><Star size={8} fill="#f59e0b" strokeWidth={0} /></span>
                </div>
                <div className="hanging-star-item s2">
                  <div className="star-thread"></div>
                  <span className="star-icon-wrap"><Star size={12} fill="#f59e0b" strokeWidth={0} /></span>
                </div>
                <div className="hanging-star-item s3">
                  <div className="star-thread"></div>
                  <span className="star-icon-wrap"><Star size={9} fill="#f59e0b" strokeWidth={0} /></span>
                </div>
              </div>
            )}
            <div className="mail-btn" title="Send Mail">
              <Mail size={16} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BirthdayCard;