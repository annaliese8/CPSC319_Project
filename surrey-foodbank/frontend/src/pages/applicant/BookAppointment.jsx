import React, { useState, useEffect } from "react";
import "./BookAppointment.css";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// generate 15-minute time slots from 9am – 5pm
const generateTimeSlots = () => {
  const slots = [];

  for (let hour = 9; hour < 17; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const mm = minute.toString().padStart(2, "0");
      slots.push(`${hour}:${mm}`);
    }
  }
  return slots;
};

const generateRowLabels = () => {
  const labels = [];
  for (let hour = 9; hour < 17; hour++) {
    labels.push(`${hour}:00`);
    labels.push(`${hour}:30`);
  }
  return labels;
};

const getInterval = (size) => Number(size) >= 5 ? 30 : 15;

const getTimeSlots = (size) =>
  generateTimeSlots().filter((_, i) => getInterval(size) === 15 || i % 2 === 0);

const formatDate = (date) => {
  return date.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Los_Angeles",
    timeZoneName: "short",
  });
};

const generateAvailability = (existing = {}) => {
  const map = {};
  days.forEach((day) => {
    generateTimeSlots().forEach((time) => {
      const key = `${day}-${time}`;
      map[key] = existing[key] ?? Math.random() > 0.4;
    });
  });
  return map;
};

const isSlotAvailable = (availability, day, time, interval) => {
  if (!availability[`${day}-${time}`]) return false;
  if (interval === 30) {
    const [h, m] = time.split(":").map(Number);
    const nextTime = `${h}:${(m + 15).toString().padStart(2, "0")}`;
    if (!availability[`${day}-${nextTime}`]) return false;
  }
  return true;
};

function BookAppointment() {
  const [householdSize, setHouseholdSize] = useState("");
  const [sizeError, setSizeError] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [availability, setAvailability] = useState({});

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const [weekStart, setWeekStart] = useState(startOfWeek);

  const sizeEntered = householdSize && Number(householdSize) >= 1;
  const interval = sizeEntered ? getInterval(householdSize) : 15;
  const timeSlots = sizeEntered ? getTimeSlots(householdSize) : [];
  const isCurrentWeek = weekStart.toDateString() === startOfWeek.toDateString();

  useEffect(() => {
    if (!sizeEntered) return;
    setAvailability((prev) => generateAvailability(prev));
  }, [householdSize]);

  const handleSlotClick = (day, time) => {
    if (!isSlotAvailable(availability, day, time, interval)) return;
    const dayIndex = days.indexOf(day);
    const slotDate = new Date(weekStart);
    slotDate.setDate(weekStart.getDate() + dayIndex);
    const [hour, minute] = time.split(":");
    slotDate.setHours(parseInt(hour), parseInt(minute), 0, 0);
    setSelectedSlot({ day, time, date: slotDate });
    setModalOpen(true);
  };

  const handleBook = () => {
    if (!sizeEntered) { setSizeError(true); return; }
    setConfirmed(true);
    setModalOpen(false);
  };

  const handleSizeChange = (e) => {
    setHouseholdSize(e.target.value);
    setSizeError(false);
    setSelectedSlot(null);
    setModalOpen(false);
  };

  const goToNextWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(next);
  };
    
  const goToPrevWeek = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(prev);
  };

  const goToToday = () => setWeekStart(startOfWeek);

  const rowLabels = generateRowLabels();

  // once confirmed user cannot book another
  if (confirmed) {
    return (
      <div className="confirmation-page">
        <h2>Appointment Confirmed!</h2>
        <p>
          Your appointment for{" "}
          <strong>{formatDate(selectedSlot.date)}</strong>{" "}
          has been successfully booked. See you then!
          <br /><br />
            Please remember to bring valid government-issued ID for each adult in your household containing proof of address (e.g. driver’s license, BCID, etc.) for your appointment.
          <br /><br />
            If you need to reschedule or cancel, you can do so through your online account or by calling us at (604) 581-5443.
        </p>
      </div>
    );
  }

  return (
    <div className="booking-container">
      <div className="calendar-area">

        {/* Household size bar */}
      <div className="household-bar">
        <label className="household-label">
          Household Size (required):
          <input
            type="number"
            min="1"
            value={householdSize}
            onChange={handleSizeChange}
            required
          />
        </label>
        {sizeError && <p className="error-text">Please enter a valid household size (1 or more).</p>}
        {!sizeEntered && <p className="hint-text">Enter your household size to see available time slots.</p>}
      </div>

        {/* Calendar header */}
        <div className="calendar-header-wrapper">
          <button className="week-nav-button week-prev" onClick={goToPrevWeek}>
                ← Previous Week
            </button>
            
            {!isCurrentWeek && (
              <button className="today-button" onClick={goToToday}>
                Today
              </button>
            )}

        <div className="calendar-header">
          <div className="time-column" />
          {days.map((day, index) => {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + index);
            return (
              <div key={day} className="day-header">
                {day} {date.toLocaleDateString("en-US",
                  { month: "short",
                  day: "numeric" })}
              </div>
            );
          })}
        </div>

        <button className="week-nav-button week-next" onClick={goToNextWeek}>
          Next Week →
        </button>
      </div>

      {/* Calendar */}
      <div className="calendar">
        {rowLabels.map((rowTime) => {
          const [rowHour, rowMinute] = rowTime.split(":").map(Number);
          const slotsInRow = interval === 15
              ? [
                  `${rowHour}:${rowMinute.toString().padStart(2, "0")}`,
                  `${rowHour}:${(rowMinute + 15).toString().padStart(2, "0")}`,
                  ].filter((t) => generateTimeSlots().includes(t))
              : [rowTime];
            const activeSlots = slotsInRow.filter((s) => timeSlots.includes(s));

            return (
              <div key={rowTime} className="calendar-row">
                <div className="time-label">{rowTime}</div>
                {days.map((day) => (
                  <div key={day} className="slot-cell">
                    {sizeEntered ? (
                      activeSlots.map((time) => {
                        const available = isSlotAvailable(availability, day, time, interval);
                        return (
                          <div
                            key={time}
                            className={`slot slot-${interval}min ${
                              available ? "available" : "unavailable"
                            } ${
                              selectedSlot?.day === day && selectedSlot?.time === time ? "selected" : ""
                            }`}
                            onClick={() => handleSlotClick(day, time)}
                          />
                        );
                      })
                    ) : (
                      <div className="slot slot-30min unactivated" />
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal popup */}
      {modalOpen && selectedSlot && (
        <>
          <div className="modal-overlay" onClick={() => setModalOpen(false)} />
          <div className="modal">
            <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            <h3>Appointment Details</h3>
            <p>{formatDate(selectedSlot.date)}</p>
            <button onClick={handleBook}>Book Appointment</button>
          </div>
        </>
      )}

    </div>
  );
}

export default BookAppointment;

// Claude.AI was used in page formatting and debugging