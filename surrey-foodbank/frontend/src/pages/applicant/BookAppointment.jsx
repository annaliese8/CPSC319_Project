import React, { useState } from "react";
import "./BookAppointment.css";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// generate time slots from 9am – 5pm (30 min slots for now)
const generateTimeSlots = (size) => {
  const slots = [];
  const interval = size >= 5 ? 30 : 15;

  for (let hour = 9; hour < 17; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      slots.push(
        `${hour}:${minute === 0 ? "00" : minute}`
      );
    }
  }
  return slots;
};

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

function BookAppointment() {
  const [householdSize, setHouseholdSize] = useState("");
  const [sizeError, setSizeError] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const timeSlots =
    householdSize && householdSize > 0
      ? generateTimeSlots(Number(householdSize))
      : [];

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const [weekStart, setWeekStart] = useState(startOfWeek);

  const handleBook = () => {
    if (!householdSize || householdSize < 1) {
      setSizeError(true);
      return;
    }
    setConfirmed(true);
  };

  const goToNextWeek = () => { const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(next);
  };
    
  const goToPrevWeek = () => {
    const prev = new Date(weekStart); prev.setDate(prev.getDate() - 7);
    setWeekStart(prev);
  };
    
  const goToToday = () => { setWeekStart(startOfWeek); };
    
  const isCurrentWeek = weekStart.toDateString() === startOfWeek.toDateString();

  // once confirmed user cannot book another
  if (confirmed) {
    return (
      <div className="confirmation-page">
        <h2>Appointment Confirmed!</h2>
        <p>
          Your appointment for{" "}
          <strong>{formatDate(selectedSlot.date)}</strong>{" "}
          has been successfully booked. See you then!
          <br />
          <br />
            Please remember to bring valid government-issued ID for each adult in your household containing proof of address (e.g. driver’s license, BCID, etc.) for your appointment.
          <br />
          <br />
            If you need to reschedule or cancel, you can do so through your online account or by calling us at (604) 581-5443.
        </p>
      </div>
    );
  }

  return (
    <div className="booking-container">
      <div className="household-input">
      <label>
        Household Size (required):
      <input
        type="number"
        min="1"
        value={householdSize}
        onChange={(e) => {
          setHouseholdSize(e.target.value);
          setSizeError(false);
        }}
        required
      />
      </label>

      {sizeError && (
        <p className="error-text">
          Please enter a valid household size (1 or more).
        </p>
      )}
    </div>

      {householdSize && householdSize > 0 ? (
    <>
      <div className="calendar-area">
        <div className="calendar-header-wrapper">
          <button className="week-nav-button week-prev" onClick={goToPrevWeek}>
                ← Previous
            </button>
            
            {!isCurrentWeek && (
              <button className="today-button" onClick={goToToday}>
                Today
              </button>
            )}

        <div className="calendar-header">
          <div className="time-column"></div>
          {days.map((day, index) => {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + index);

            const formatted = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            return (
              <div key={day} className="day-header">
                {day} {formatted}
              </div>
            );
          })}
        </div>

        <button className="week-nav-button week-next" onClick={goToNextWeek}>
          Next →
        </button>
      </div>

      {/* Calendar */}
      <div className="calendar">
        {timeSlots.map((time) => (
          <div key={time} className="calendar-row">
            <div className="time-label">{time}</div>
            {days.map((day) => {
              const isAvailable = Math.random() > 0.4; // random availability

              return (
                <div
                  key={day + time}
                  className={`slot ${isAvailable ? "available" : "unavailable"} ${
                    selectedSlot?.day === day &&
                    selectedSlot?.time === time
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => {
                    if (!isAvailable) return;
                    
                    const dayIndex = days.indexOf(day);
                    const slotDate = new Date(weekStart);
                    slotDate.setDate(weekStart.getDate() + dayIndex);

                    const [hour, minute] = time.split(":");
                    slotDate.setHours(parseInt(hour), parseInt(minute), 0, 0);

                    setSelectedSlot({
                      day,
                      time,
                      date: slotDate,
                    });
                  }}
                ></div>
              );
            })}
          </div>
        ))}
        </div>
      </div>

      {/* Booking Panel */}
      <div className="side-panel">
        <h3>Appointment Details</h3>
        {selectedSlot ? (
          <>
            <p>{formatDate(selectedSlot.date)}</p>
            <button onClick={handleBook}>Book Appointment</button>
          </>
        ) : (
          <p>Select an available time slot.</p>
        )}
      </div>
    </>
    ) : (
        <p>Please enter your household size to view available appointments.</p>
      )}
    </div>
  );
}

export default BookAppointment;

// Claude.AI was used in page formatting and debugging