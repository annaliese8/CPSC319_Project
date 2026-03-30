import React, { useState, useCallback, useEffect } from "react";
import "./EditSlot.css";
import { supabase } from "../../../../backend/src/lib/supabase";

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (const min of ["00", "15", "30", "45"]) {
      slots.push(`${hour}:${min}`);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

const getDaysInRange = (startDate, endDate) => {
  const days = [];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const current = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  while (current <= end) {
    days.push({
      date: current.toISOString().slice(0, 10),
      dayLabel: dayNames[current.getDay()],
    });
    current.setDate(current.getDate() + 1);
  }
  return days;
};

const dbTimeToGrid = (dbTime) => {
  const [h, m] = dbTime.split(":");
  return `${parseInt(h, 10)}:${m}`;
};

const gridTimeToDb = (gridTime) => {
  const [h, m] = gridTime.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}:00`;
};

function ConflictModal({ conflicts, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-icon">⚠️</div>
        <h2 className="modal-title">Cancel Existing Appointments?</h2>
        <p className="modal-body">
          Your changes will cancel <strong>{conflicts.length}</strong> existing
          appointment{conflicts.length > 1 ? "s" : ""}:
        </p>
        <ul className="modal-conflict-list">
          {conflicts.map((appt, i) => (
            <li key={i}>
              <strong>{appt.name}</strong> — {appt.appointment_date} at{" "}
              {dbTimeToGrid(appt.appointment_time)}
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

/**
 * Props:
 *   startDate {string} – "YYYY-MM-DD"
 *   endDate   {string} – "YYYY-MM-DD"
 */
function EditSlot({ startDate, endDate }) {
  const days = getDaysInRange(startDate, endDate);

  // Each entry: { appointment_id, date, time }   (time in grid format "H:MM")
  const [savedBlocked, setSavedBlocked] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);

  // Each entry: { appointment_id, date, time, name }
  const [bookedSlots, setBookedSlots] = useState([]);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isUnblocking, setIsUnblocking] = useState(false);
  const [pendingConflicts, setPendingConflicts] = useState(null);
  const [error, setError] = useState(null);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from("appointments")
        .select(`
          appointment_id,
          response_id,
          appointment_date,
          appointment_time,
          appointment_status,
          registrationformresponse (
            first_name,
            last_name
          )
        `)
        .gte("appointment_date", startDate)
        .lte("appointment_date", endDate);

      if (dbError) throw dbError;

      const blocked = [];
      const booked = [];

      for (const row of data) {
        const gridTime = dbTimeToGrid(row.appointment_time);
        if (row.appointment_status === "blocked") {
          blocked.push({
            appointment_id: row.appointment_id,
            date: row.appointment_date,
            time: gridTime,
          });
        } else {
          const name = row.registrationformresponse
            ? `${row.registrationformresponse.first_name} ${row.registrationformresponse.last_name}`
            : "Unknown";
          booked.push({
            appointment_id: row.appointment_id,
            date: row.appointment_date,
            time: gridTime,
            name,
          });
        }
      }

      setSavedBlocked(blocked);
      setBlockedSlots(blocked);
      setBookedSlots(booked);
    } catch (err) {
      setError("Failed to load appointments: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const isBlocked = useCallback(
    (date, time) => {
      const source = editing ? blockedSlots : savedBlocked;
      return source.some((s) => s.date === date && s.time === time);
    },
    [editing, blockedSlots, savedBlocked]
  );

  const isBooked = useCallback(
    (date, time) => bookedSlots.some((s) => s.date === date && s.time === time),
    [bookedSlots]
  );

  const addBlockedSlot = (date, time) => {
    if (!blockedSlots.some((s) => s.date === date && s.time === time)) {
      setBlockedSlots((prev) => [...prev, { appointment_id: null, date, time }]);
    }
  };

  const removeBlockedSlot = (date, time) => {
    setBlockedSlots((prev) =>
      prev.filter((s) => !(s.date === date && s.time === time))
    );
  };

  const clearMouseTrackers = () => {
    setIsBlocking(false);
    setIsUnblocking(false);
  };

  const handleSave = () => {
    // Slots newly added (not in savedBlocked)
    const newlyBlocked = blockedSlots.filter(
      (s) => !savedBlocked.some((b) => b.date === s.date && b.time === s.time)
    );

    // Find booked appointments that fall on a newly blocked slot
    const conflicts = bookedSlots.filter((appt) =>
      newlyBlocked.some((s) => s.date === appt.date && s.time === appt.time)
    );

    if (conflicts.length > 0) {
      setPendingConflicts(conflicts);
    } else {
      commitSave([]);
    }
  };

  const commitSave = async (cancelledAppts = []) => {
    setError(null);
    try {
      const removedBlocked = savedBlocked.filter(
        (b) => !blockedSlots.some((s) => s.date === b.date && s.time === b.time)
      );
      if (removedBlocked.length > 0) {
        const idsToDelete = removedBlocked
          .map((b) => b.appointment_id)
          .filter(Boolean);
        if (idsToDelete.length > 0) {
          const { error: delError } = await supabase
            .from("appointments")
            .delete()
            .in("appointment_id", idsToDelete);
          if (delError) throw delError;
        }
      }

      const newlyBlocked = blockedSlots.filter(
        (s) => !savedBlocked.some((b) => b.date === s.date && b.time === s.time)
      );
      if (newlyBlocked.length > 0) {
        const rows = newlyBlocked.map((s) => ({
          response_id: null,
          appointment_date: s.date,
          appointment_time: gridTimeToDb(s.time),
          duration: "00:15:00",
          appointment_status: "blocked",
        }));
        const { error: insError } = await supabase
          .from("appointments")
          .insert(rows);
        if (insError) throw insError;
      }

      if (cancelledAppts.length > 0) {
        const idsToCancel = cancelledAppts
          .map((a) => a.appointment_id)
          .filter(Boolean);
        if (idsToCancel.length > 0) {
          const { error: cancelError } = await supabase
            .from("appointments")
            .update({ appointment_status: "cancelled" })
            .in("appointment_id", idsToCancel);
          if (cancelError) throw cancelError;
        }
      }

      await loadAppointments();
      setEditing(false);
      clearMouseTrackers();
    } catch (err) {
      setError("Failed to save changes: " + err.message);
    }
  };

  const handleModalConfirm = async () => {
    const cancelled = [...pendingConflicts];
    setPendingConflicts(null);
    await commitSave(cancelled);
  };

  const handleModalCancel = () => {
    setPendingConflicts(null);
  };

  const handleCancel = () => {
    setBlockedSlots(savedBlocked);
    setEditing(false);
    clearMouseTrackers();
  };

  const handleEditMode = async () => {
    await loadAppointments();
    setEditing(true);
  };

  if (loading) return <div className="booking-container">Loading...</div>;

  return (
    <div className="booking-container">
      <title>Manage Availability | Surrey Food Bank</title>

      {error && <div className="error-banner">{error}</div>}

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
          {days.map(({ date, dayLabel }) => (
            <div key={date} className="day-header">
              {dayLabel}
              <br />
              <span className="day-date">{date}</span>
            </div>
          ))}
        </div>

        {timeSlots.map((time) => (
          <div key={time} className="calendar-row">
            <div className="time-label">{time}</div>
            {days.map(({ date }) => {
              const blocked = isBlocked(date, time);
              const booked = isBooked(date, time);

              if (editing) {
                return (
                  <div
                    key={date + time}
                    className={`slot ${
                      blocked
                        ? "unavailable-vis"
                        : booked
                        ? "booked"
                        : "available"
                    }`}
                    onMouseDown={() => {
                      if (!blocked) setIsBlocking(true);
                      else setIsUnblocking(true);
                    }}
                    onMouseUp={clearMouseTrackers}
                    onMouseOver={() => {
                      if (isBlocking && !blocked) addBlockedSlot(date, time);
                      if (isUnblocking && blocked) removeBlockedSlot(date, time);
                    }}
                    onClick={() => {
                      if (!blocked) addBlockedSlot(date, time);
                      else removeBlockedSlot(date, time);
                    }}
                  />
                );
              } else {
                return (
                  <div
                    key={date + time}
                    className={`slot ${
                      blocked
                        ? "unavailable-invis"
                        : booked
                        ? "booked"
                        : "available"
                    }`}
                  />
                );
              }
            })}
          </div>
        ))}
      </div>

      {/* Side Panel */}
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
