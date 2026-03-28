import React, { useState, useCallback } from "react";
import "./EditSlot.css";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push(`${hour}:00`);
    slots.push(`${hour}:15`);
    slots.push(`${hour}:30`);
    slots.push(`${hour}:45`);
  }
  return slots;
};

const weekendDays = ["Sunday", "Saturday"];

const generateInitBlockedSlots = () => {
  const blockedSlots = [];
  days.forEach((day) => {
    // Block all 24 hours for weekend days
    if (weekendDays.includes(day)) {
      for (let hour = 0; hour < 24; hour++) {
        blockedSlots.push([day, `${hour}:00`]);
        blockedSlots.push([day, `${hour}:15`]);
        blockedSlots.push([day, `${hour}:30`]);
        blockedSlots.push([day, `${hour}:45`]);
      }
      return;
    }
    // Weekdays: block before 9am and after 3pm
    for (let hour = 0; hour < 9; hour++) {
      blockedSlots.push([day, `${hour}:00`]);
      blockedSlots.push([day, `${hour}:15`]);
      blockedSlots.push([day, `${hour}:30`]);
      blockedSlots.push([day, `${hour}:45`]);
    }
    for (let hour = 15; hour < 24; hour++) {
      blockedSlots.push([day, `${hour}:00`]);
      blockedSlots.push([day, `${hour}:15`]);
      blockedSlots.push([day, `${hour}:30`]);
      blockedSlots.push([day, `${hour}:45`]);
    }
  });
  return blockedSlots;
};

const timeSlots = generateTimeSlots();

// BUG FIX 1: getBookedSlots now returns both `time` (raw startTime) and
// `timeLabel` for display. We match on startTime which is what's stored.
const getBookedSlots = () => {
  const booked = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key.startsWith("applicant_")) continue;
    try {
      const data = JSON.parse(localStorage.getItem(key));
      // Only include entries that actually have an appointment booked
      if (data?.day && data?.startTime) {
        booked.push({
          day: data.day,
          time: data.startTime, // e.g. "9:00" — must match grid time format
          name: data.name,
          email: data.email,
          timeLabel: data.timeLabel,
          key,
        });
      }
    } catch {
      // malformed entry, skip
    }
  }
  return booked;
};

// BUG FIX 2: cancelAppointment now fully removes appointment scheduling fields
// AND triggers a storage event so the grid re-renders.
const cancelAppointment = (email) => {
  const key = `applicant_${email}`;
  try {
    const existing = JSON.parse(localStorage.getItem(key) || "{}");
    // Remove all appointment-related fields, keep registration data
    const { day, date, startTime, endTime, duration, dateLabel, timeLabel, ...registrationData } = existing;
    localStorage.setItem(key, JSON.stringify(registrationData));
  } catch {
    // malformed entry, skip
  }
};

function ConflictModal({ conflicts, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-icon">⚠️</div>
        <h2 className="modal-title">Cancel Existing Appointments?</h2>
        <p className="modal-body">
          Your changes will cancel{" "}
          <strong>{conflicts.length}</strong> existing appointment
          {conflicts.length > 1 ? "s" : ""}:
        </p>
        <ul className="modal-conflict-list">
          {conflicts.map((appt, i) => (
            <li key={i}>
              <strong>{appt.name}</strong> — {appt.day} at {appt.timeLabel ?? appt.time}
            </li>
          ))}
        </ul>
        <p className="modal-warning">
          Affected clients will need to be notified manually.
        </p>
        <div className="modal-actions">
          <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
            Go Back
          </button>
          <button className="modal-btn modal-btn-confirm" onClick={onConfirm}>
            Confirm &amp; Cancel Appointments
          </button>
        </div>
      </div>
    </div>
  );
}

function EditSlot() {
  const [savedBlockedSlots, setSavedBlockedSlots] = useState(() => {
    const stored = localStorage.getItem("staffBlockedSlots");
    return stored ? JSON.parse(stored) : generateInitBlockedSlots();
  });

  const [blockedSlots, setBlockedSlots] = useState(() => {
    const stored = localStorage.getItem("staffBlockedSlots");
    return stored ? JSON.parse(stored) : generateInitBlockedSlots();
  });

  // BUG FIX 3: bookedSlots is stored in state so the grid re-renders after
  // cancellations. Previously isBooked called getBookedSlots() inside a
  // useCallback with no deps, so it never reflected cancellations.
  const [bookedSlots, setBookedSlots] = useState(() => getBookedSlots());

  const [editing, setEditing] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isUnblocking, setIsUnblocking] = useState(false);
  const [pendingConflicts, setPendingConflicts] = useState(null);

  const isBlocked = useCallback(
    (day, time) => {
      const slots = editing ? blockedSlots : savedBlockedSlots;
      return slots.some(([d, t]) => d === day && t === time);
    },
    [editing, blockedSlots, savedBlockedSlots]
  );

  // BUG FIX 4: isBooked now reads from state, not live localStorage,
  // so it correctly updates after cancellations without stale closures.
  const isBooked = useCallback(
    (day, time) => {
      return bookedSlots.some((appt) => appt.day === day && appt.time === time);
    },
    [bookedSlots]
  );

  const addBlockedSlot = (slot) => {
    setBlockedSlots((prev) => [...prev, slot]);
  };

  const removeBlockedSlot = (slot) => {
    setBlockedSlots((prev) =>
      prev.filter((s) => s[0] !== slot[0] || s[1] !== slot[1])
    );
  };

  const clearMouseTrackers = () => {
    setIsBlocking(false);
    setIsUnblocking(false);
  };

  const handleSave = () => {
    const allBooked = getBookedSlots();

    // Find slots that are newly blocked (weren't blocked before)
    const newlyBlocked = blockedSlots.filter(
      ([day, time]) => !savedBlockedSlots.some(([d, t]) => d === day && t === time)
    );

    // Find booked appointments that fall in newly blocked slots
    const conflicts = allBooked.filter((appt) =>
      newlyBlocked.some(([day, time]) => appt.day === day && appt.time === time)
    );

    if (conflicts.length > 0) {
      setPendingConflicts(conflicts);
    } else {
      commitSave([]);
    }
  };

  // BUG FIX 5: commitSave accepts the list of cancelled appointments so it can
  // update bookedSlots state, causing the grid to re-render without the
  // cancelled slots still showing as booked.
  const commitSave = (cancelledAppts = []) => {
    setSavedBlockedSlots(blockedSlots);
    localStorage.setItem("staffBlockedSlots", JSON.stringify(blockedSlots));

    // Remove cancelled appointments from bookedSlots state
    if (cancelledAppts.length > 0) {
      setBookedSlots((prev) =>
        prev.filter(
          (appt) =>
            !cancelledAppts.some((cancelled) => cancelled.email === appt.email)
        )
      );
    }

    setEditing(false);
    clearMouseTrackers();
  };

  const handleModalConfirm = () => {
    // Cancel each conflicting appointment in localStorage
    pendingConflicts.forEach((appt) => cancelAppointment(appt.email));
    const cancelled = [...pendingConflicts];
    setPendingConflicts(null);
    // Pass cancelled list so state updates correctly
    commitSave(cancelled);
  };

  const handleModalCancel = () => {
    setPendingConflicts(null);
  };

  const handleCancel = () => {
    setBlockedSlots(savedBlockedSlots);
    setEditing(false);
    clearMouseTrackers();
  };

  const handleEditMode = () => {
    // Refresh booked slots from localStorage when entering edit mode
    setBookedSlots(getBookedSlots());
    setEditing(true);
  };

  return (
    <div className="booking-container">
      <title>Manage Availability | Surrey Food Bank</title>
      {pendingConflicts && pendingConflicts.length > 0 && (
        <ConflictModal
          conflicts={pendingConflicts}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
      )}

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
              const blocked = isBlocked(day, time);
              const booked = isBooked(day, time);

              if (editing) {
                return (
                  <div
                    key={day + time}
                    className={`slot ${blocked ? "unavailable-vis" : booked ? "booked" : "available"}`}
                    onMouseDown={() => {
                      if (!isBlocked(day, time)) setIsBlocking(true);
                      else setIsUnblocking(true);
                    }}
                    onMouseUp={clearMouseTrackers}
                    onMouseOver={() => {
                      if (isBlocking && !blocked) addBlockedSlot([day, time]);
                      if (isUnblocking && blocked) removeBlockedSlot([day, time]);
                    }}
                    onClick={() => {
                      if (!blocked) addBlockedSlot([day, time]);
                      else removeBlockedSlot([day, time]);
                    }}
                  />
                );
              } else {
                return (
                  <div
                    key={day + time}
                    className={`slot ${blocked ? "unavailable-invis" : booked ? "booked" : "available"}`}
                  />
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
            <button className="cancel-button" onClick={handleCancel}>
              Cancel Changes
            </button>
          </>
        ) : (
          <button onClick={handleEditMode}>Edit Slots</button>
        )}
      </div>
    </div>
  );
}

export default EditSlot;