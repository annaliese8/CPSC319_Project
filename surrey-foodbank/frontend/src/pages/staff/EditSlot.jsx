import React, { useState } from "react";
import "./EditSlot.css";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// generate time slots from 9am – 5pm (30 min slots for now)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push(`${hour}:00`);
    slots.push(`${hour}:15`);
  }
  return slots;
};

const generateInitBlockedSlots = () => {
    const blockedSlots = [];
    days.forEach((day) => {
        for (let hour = 0; hour < 9; hour++) {
            blockedSlots.push([day,`${hour}:00`]);
            blockedSlots.push([day,`${hour}:15`]);
        }
        for (let hour = 15; hour < 24; hour++) {
            blockedSlots.push([day,`${hour}:00`]);
            blockedSlots.push([day,`${hour}:15`]);
        }
    })
    return blockedSlots;
};

const timeSlots = generateTimeSlots();

function EditSlot() {
    const [savedBlockedSlots, setsavedBlockedSlots] = useState(() => {
  const stored = localStorage.getItem("staffBlockedSlots");
  return stored ? JSON.parse(stored) : generateInitBlockedSlots();
});
const [blockedSlots, setBlockedSlots] = useState(() => {
  const stored = localStorage.getItem("staffBlockedSlots");
  return stored ? JSON.parse(stored) : generateInitBlockedSlots();
});
    const addBlockedSlot = (slot) => {
        setBlockedSlots((prevSlots) => [...prevSlots, slot]);
    }

    const removeBlockedSlot = (slot) => {
        setBlockedSlots((prevSlots) => prevSlots.filter(s => s[0] !== slot[0] || s[1] !== slot[1]));
    }


  const [editing, setEditing] = useState(false);
    const [isBlocking, setIsBlocking] = useState(false);
    const [isUnblocking, setIsUnblocking] = useState(false);

  const handleSave = () => {
  console.log("saving:", blockedSlots);
  setsavedBlockedSlots(blockedSlots);
  localStorage.setItem("staffBlockedSlots", JSON.stringify(blockedSlots));
  console.log("saved to localStorage:", localStorage.getItem("staffBlockedSlots"));
  setEditing(false);
  clearMouseTrackers();
};
  const handleCancel = () => {
      setBlockedSlots(savedBlockedSlots);
      setEditing(false);
      clearMouseTrackers();
  };

  const clearMouseTrackers = () => {
      setIsBlocking(false);
      setIsUnblocking(false);
  }

  const handleEditMode = () => {
      setEditing(true);
  };

    const isBlocked = (day, time) => {
  const slots = editing ? blockedSlots : savedBlockedSlots;
  return slots.some(([d, t]) => d === day && t === time);
};

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
                      if(editing) {
                          return (
                              <div
                                  key={day + time}
                                  className={`slot ${isBlocked(day,time)? "unavailable-vis" : isAvailable? "available": "booked"}`}
                                  onMouseDown={() => {
                                      if (!isBlocked(day,time)) setIsBlocking(true)
                                      else setIsUnblocking(true)
                                    }
                                  }
                                  onMouseUp={() => {
                                      clearMouseTrackers()
                                    }
                                  }
                                  onMouseOver={() => {
                                      if (isBlocking && !isBlocked(day,time)) addBlockedSlot([day,time])
                                      if (isUnblocking && isBlocked(day,time)) removeBlockedSlot([day,time])
                                    }
                                  }
                                  onClick={() =>
                                      !isBlocked(day,time)? addBlockedSlot([day,time]) : removeBlockedSlot([day,time])
                                  }
                              ></div>
                          );
                      } else {
                          return (
                              <div
                                  key={day + time}
                                  className={`slot ${isBlocked(day,time)? "unavailable-invis" : isAvailable? "available": "booked"}`}
                              >
                              </div>
                          );
                      }
                  })}
              </div>
          ))}

      </div>

      {/* Booking Panel */}
      <div className="side-panel">
        <h3>Appointment Listing</h3>
        {editing ? (
          <>
            <button onClick={handleSave}>Confirm Changes</button>
            <button className="cancel-button" onClick={handleCancel}>Cancel Changes</button>
          </>


        ) : (
            <button onClick={handleEditMode}>Edit Slots</button>
        )}
      </div>
    </div>
  );
}

export default EditSlot;