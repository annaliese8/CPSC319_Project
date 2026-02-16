import React, { useState } from "react";
import "./BookAppointment.css";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// generate time slots from 9am – 5pm (30 min slots for now)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour < 17; hour++) {
    slots.push(`${hour}:00`);
    slots.push(`${hour}:30`);
  }
  return slots;
};

const timeSlots = generateTimeSlots();

function BookAppointment() {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleBook = () => {
    setConfirmed(true);
  };

  // once confirmed user cannot book another
  if (confirmed) {
    return (
      <div className="confirmation-page">
        <h2>Appointment Confirmed!</h2>
        <p>
          Your appointment for <strong>{selectedSlot.day}</strong> at{" "}
          <strong>{selectedSlot.time}</strong> has been successfully booked. See you then!
        </p>
      </div>
    );
  }

  return (
    <div className="booking-container">
      {/* Calendar */}
      <div className="calendar">
        <div className="calendar-header">
          <div className="time-column"></div>
          {days.map((day) => (
            <div key={day} className="day-header">
              {day}
            </div>
          ))}
        </div>

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
                  onClick={() =>
                    isAvailable && setSelectedSlot({ day, time })
                  }
                ></div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Booking Panel */}
      <div className="side-panel">
        <h3>Appointment Details</h3>
        {selectedSlot ? (
          <>
            <p>
              <strong>{selectedSlot.day}</strong>
            </p>
            <p>{selectedSlot.time}</p>
            <button onClick={handleBook}>Book Appointment</button>
          </>
        ) : (
          <p>Select an available time slot.</p>
        )}
      </div>
    </div>
  );
}

export default BookAppointment;