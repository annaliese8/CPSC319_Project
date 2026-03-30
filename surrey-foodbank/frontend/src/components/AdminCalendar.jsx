import React, { useState } from "react";
import "./AdminCalendar.css";
import AppointmentInfoDialog from "./AppointmentInfoDialog.jsx";
import StaffBookingPanel from "./StaffBookingPanel.jsx";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const generateTimeSlots = (startHour, endHour) => {
  const slots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour}:00`);
    slots.push(`${hour}:15`);
    slots.push(`${hour}:30`);
    slots.push(`${hour}:45`);
  }
  return slots;
};

const generateDayTimeSlots = () => {
  const tDSlots = [];
  days.forEach((day) => {
    for (let hour = 0; hour < 24; hour++) {
      tDSlots.push([day, `${hour}:00`]);
      tDSlots.push([day, `${hour}:15`]);
      tDSlots.push([day, `${hour}:30`]);
      tDSlots.push([day, `${hour}:45`]);
    }
  });
  return tDSlots;
};

const generateInitBlockedSlots = () => {
  const blockedSlots = [];
  days.forEach((day) => {
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

const fullTimeSlots = generateTimeSlots(0, 24);
const dayTimeSlots = generateDayTimeSlots();

// Load all booked appointments from localStorage
const loadAppointmentsFromStorage = () => {
  const loaded = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key.startsWith("applicant_")) continue;
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (data?.day && data?.startTime && data?.duration) {
        loaded.push({ email: key.replace("applicant_", ""), ...data });
      }
    } catch (e) {
      console.error("Error loading appointment:", e);
    }
  }
  return loaded;
};

// Cancel an appointment in localStorage by clearing scheduling fields
const cancelAppointmentInStorage = (email) => {
  const key = `applicant_${email}`;
  const stored = localStorage.getItem(key);
  if (!stored) return;
  const data = JSON.parse(stored);
  delete data.day;
  delete data.date;
  delete data.startTime;
  delete data.endTime;
  delete data.duration;
  delete data.dateLabel;
  delete data.timeLabel;
  delete data.appointmentStatus;
  localStorage.setItem(key, JSON.stringify(data));
};

const findConflicts = (newlyBlockedSlots, appointments) => {
  const conflicts = [];
  appointments.forEach((apt) => {
    const [aptHour, aptMinute] = apt.startTime.split(":").map(Number);
    const aptStartMins = aptHour * 60 + aptMinute;
    for (let offset = 0; offset < apt.duration; offset += 15) {
      const slotMins = aptStartMins + offset;
      const slotHour = Math.floor(slotMins / 60);
      const slotMin = slotMins % 60;
      const slotTime = `${slotHour}:${slotMin === 0 ? "00" : slotMin}`;
      if (newlyBlockedSlots.some(([d, t]) => d === apt.day && t === slotTime)) {
        if (!conflicts.find((c) => c.email === apt.email)) {
          conflicts.push(apt);
        }
        break;
      }
    }
  });
  return conflicts;
};

function ConflictModal({ conflicts, onConfirm, onCancel }) {
  return (
    <Dialog open={true} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "warning.main",
          fontWeight: 800,
        }}
      >
        <WarningAmberIcon /> Cancel Existing Appointments?
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Your changes will cancel <strong>{conflicts.length}</strong> existing
          appointment
          {conflicts.length > 1 ? "s" : ""}:
        </Typography>
        <List dense>
          {conflicts.map((appt, i) => (
            <ListItem key={i} disableGutters>
              <ListItemText
                primary={appt.name}
                secondary={`${appt.day} at ${appt.timeLabel ?? appt.startTime}`}
              />
            </ListItem>
          ))}
        </List>
        <Typography variant="caption" color="text.secondary">
          Affected clients will need to be notified manually.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
        <Button variant="outlined" onClick={onCancel}>
          Go Back
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={onConfirm}
          sx={{ fontWeight: 800, color: "common.white" }}
        >
          Confirm &amp; Cancel Appointments
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AdminCalendar({
    isEditing,
    saveChanges,
    discardChanges,
    weekStart,
    isBookingPanel,
    changeBookingAppointment, // appointment being rebooked (from ApplicantInfoPage)
    isNewBooking
}) {
  const [appointmentData, setAppointmentData] = React.useState(null);
  const [appointments, setAppointments] = React.useState(() =>
    loadAppointmentsFromStorage(),
  );
  const [selectedSlot, setSelectedSlot] = React.useState(null);
  const [highlightedSlot, setHighlightedSlot] = React.useState(null);
  const [showBookingPanel, setShowBookingPanel] = React.useState(false);
  const [rebookingAppointment, setRebookingAppointment] = React.useState(null);

  const [savedBlockedSlots, setSavedBlockedSlots] = useState(() => {
    const stored = localStorage.getItem("staffBlockedSlots");
    return stored ? JSON.parse(stored) : generateInitBlockedSlots();
  });
  const [blockedSlots, setBlockedSlots] = useState(() => {
    const stored = localStorage.getItem("staffBlockedSlots");
    return stored ? JSON.parse(stored) : generateInitBlockedSlots();
  });
  const [isBlocking, setIsBlocking] = useState(false);
  const [isUnblocking, setIsUnblocking] = useState(false);
  const [pendingConflicts, setPendingConflicts] = useState(null);
  const [openInfoDialog, setOpenInfoDialog] = React.useState(false);

  // When arriving from "Change Booking", immediately open the booking panel
  // in rebooking mode with the existing appointment pre-filled
  React.useEffect(() => {
    if (changeBookingAppointment) {
      setRebookingAppointment(changeBookingAppointment);
      // When changing an appointment, the time slot fills with the applicant's existing appointment
      setSelectedSlot({
        day: changeBookingAppointment.day || days[0],
        time: changeBookingAppointment.startTime || null,
        weekStart,
        date: changeBookingAppointment.date
          ? new Date(changeBookingAppointment.date)
          : new Date(weekStart),
      });
      setShowBookingPanel(true);
    }
  }, [changeBookingAppointment]);
    // When arriving from "Change Booking", immediately open the booking panel
    // in rebooking mode with the existing appointment pre-filled
   React.useEffect(() => {
    if (changeBookingAppointment) {
        setRebookingAppointment(isNewBooking ? null : changeBookingAppointment);
        const slotDay = changeBookingAppointment.day || days[0];
        const slotTime = changeBookingAppointment.startTime || "9:00";
        setSelectedSlot({
            day: slotDay,
            time: slotTime,
            weekStart,
            date: changeBookingAppointment.date
                ? new Date(changeBookingAppointment.date)
                : new Date(weekStart)
        });
        setHighlightedSlot({ day: slotDay, time: slotTime });
        setShowBookingPanel(true);
    }
}, [changeBookingAppointment]);

  const addBlockedSlot = (slot) => setBlockedSlots((prev) => [...prev, slot]);
  const removeBlockedSlot = (slot) =>
    setBlockedSlots((prev) =>
      prev.filter((s) => s[0] !== slot[0] || s[1] !== slot[1]),
    );

  const getAvailableSlots = () =>
    dayTimeSlots.filter(
      (item) =>
        !savedBlockedSlots.some((slot) =>
          slot.every((val, i) => val === item[i]),
        ),
    );

  const getEarliestAvailHour = () => {
    let timeMin = 1000;
    getAvailableSlots().forEach((slot) => {
      const h = parseInt(slot[1].slice(0, slot[1].indexOf(":")));
      if (h < timeMin) timeMin = h;
    });
    return timeMin;
  };

  const getLatestAvailHour = () => {
    let timeMax = 0;
    getAvailableSlots().forEach((slot) => {
      const h = parseInt(slot[1].slice(0, slot[1].indexOf(":")));
      if (h > timeMax) timeMax = h;
    });
    return timeMax + 1;
  };

  const isDisplayTime = (time) =>
    time.slice(-2) === "00" || time.slice(-2) === "30";
  const visibleTimeSlots = generateTimeSlots(
    getEarliestAvailHour(),
    getLatestAvailHour(),
  );

  const clearMouseTrackers = () => {
    setIsBlocking(false);
    setIsUnblocking(false);
  };

  const isBlocked = (day, time) => {
    const slots = isEditing ? blockedSlots : savedBlockedSlots;
    return slots.some(([d, t]) => d === day && t === time);
  };

  const handleSave = () => {
    const newlyBlocked = blockedSlots.filter(
      ([day, time]) =>
        !savedBlockedSlots.some(([d, t]) => d === day && t === time),
    );
    const conflicts = findConflicts(newlyBlocked, appointments);
    if (conflicts.length > 0) {
      setPendingConflicts(conflicts);
    } else {
      commitSave([]);
    }
  };

  const commitSave = (cancelledAppointments = []) => {
    setSavedBlockedSlots(blockedSlots);
    localStorage.setItem("staffBlockedSlots", JSON.stringify(blockedSlots));
    if (cancelledAppointments.length > 0) {
      setAppointments((prev) =>
        prev.filter(
          (a) => !cancelledAppointments.some((c) => c.email === a.email),
        ),
      );
    }
    clearMouseTrackers();
  };

  const handleStatusChange = (newStatus) => {
    const email = appointmentData?.email;
    if (email) {
      const existing = JSON.parse(localStorage.getItem(`applicant_${email}`) || "{}");
      const updated = { ...existing, appointmentStatus: newStatus };
      localStorage.setItem(`applicant_${email}`, JSON.stringify(updated));
      setAppointmentData(updated);
      setAppointments((prev) =>
        prev.map((a) => a.email === email ? { ...a, appointmentStatus: newStatus } : a)
      );
    }
  };

  const handleModalConfirm = () => {
    pendingConflicts.forEach((apt) => cancelAppointmentInStorage(apt.email));
    const cancelled = [...pendingConflicts];
    setPendingConflicts(null);
    commitSave(cancelled);
  };

  const handleModalCancel = () => setPendingConflicts(null);

  const handleDiscard = () => {
    setBlockedSlots(savedBlockedSlots);
    clearMouseTrackers();
  };

  const handleBookingPanel = (day, time) => {
    const dayIndex = days.indexOf(day);
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + dayIndex);
    setSelectedSlot({ day, time: time.padStart(5, "0"), weekStart, date });
    setHighlightedSlot({ day, time });
    setRebookingAppointment(null); // normal booking, not a rebook
    setShowBookingPanel(true);
  };

  const isSlotBooked = (day, time) => {
    return appointments.some((apt) => {
      if (apt.day !== day) return false;
      if (!apt.date) return false;
      const bookedDate = new Date(apt.date).toDateString();
      const weekDates = days.map((_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d.toDateString();
      });
      if (!weekDates.includes(bookedDate)) return false;
      const [aptHour, aptMinute] = apt.startTime.split(":").map(Number);
      const [slotHour, slotMinute] = time.split(":").map(Number);
      const aptStartMinutes = aptHour * 60 + aptMinute;
      const slotMinutes = slotHour * 60 + slotMinute;
      return (
        slotMinutes >= aptStartMinutes &&
        slotMinutes < aptStartMinutes + apt.duration
      );
    });
  };

  const handleSlotClick = (day, time) => {
    // While rebooking panel is open, any available (non-blocked) slot click updates the panel
    if (showBookingPanel && rebookingAppointment && !isBlocked(day, time)) {
      const dayIndex = days.indexOf(day);
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + dayIndex);
      setSelectedSlot({ day, time: time.padStart(5, "0"), weekStart, date });
      setHighlightedSlot({ day, time });
      return;
    }
    if (!isEditing && !isBlocked(day, time) && !isSlotBooked(day, time)) {
      handleBookingPanel(day, time);
    } else if (!isEditing && isSlotBooked(day, time)) {
      const weekDates = days.map((_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d.toDateString();
      });
      const appointment = appointments.find((apt) => {
        if (apt.day !== day || !apt.date) return false;
        if (!weekDates.includes(new Date(apt.date).toDateString()))
          return false;
        const [aptHour, aptMinute] = apt.startTime.split(":").map(Number);
        const [slotHour, slotMinute] = time.split(":").map(Number);
        const aptStart = aptHour * 60 + aptMinute;
        const slotMins = slotHour * 60 + slotMinute;
        return slotMins >= aptStart && slotMins < aptStart + apt.duration;
      });
      if (appointment) {
        setAppointmentData(appointment);
        setOpenInfoDialog(true);
      }
    }
  };

  // Normal new booking confirm; sets appointment status
  const handleConfirmBooking = (newAppointmentData) => {
    const updated = {
      ...newAppointmentData,
      appointmentStatus: "Booked",
    };
    const key = `applicant_${updated.email}`;
    localStorage.setItem(key, JSON.stringify(updated));
    setAppointments((prev) => [...prev, updated]);
    setShowBookingPanel(false);
    setSelectedSlot(null);
    setRebookingAppointment(null);
    setHighlightedSlot(null);
  };

  // Rebook confirm: cancel old slot and save new slot
  const handleConfirmRebooking = (newAppointmentData) => {
    const email =
      rebookingAppointment?.email || rebookingAppointment?.applicantEmail;

    // 1. Merge new scheduling data with the full existing applicant record
    const existingRaw = localStorage.getItem(`applicant_${email}`);
    const existingData = existingRaw ? JSON.parse(existingRaw) : {};
    const mergedData = {
      ...existingData,
      ...newAppointmentData,
      email,
      applicantEmail: email,
    };

    // 2. Save merged data back to localStorage (preserves registration form fields)
    localStorage.setItem(`applicant_${email}`, JSON.stringify(mergedData));

    // 3. Update in-memory appointments list: remove old, add new
    setAppointments((prev) => [
      ...prev.filter((a) => a.email !== email),
      mergedData,
    ]);

    setShowBookingPanel(false);
    setSelectedSlot(null);
    setRebookingAppointment(null);
    setHighlightedSlot(null);
  };

  React.useEffect(() => {
    if (saveChanges) handleSave();
  }, [saveChanges]);

  React.useEffect(() => {
    if (discardChanges) handleDiscard();
  }, [discardChanges]);

  React.useEffect(() => {
    if (isBookingPanel > 0) handleBookingPanel(days[0], fullTimeSlots[0]);
  }, [isBookingPanel]);

  return (
    <div className="calendar-area">
      {pendingConflicts && pendingConflicts.length > 0 && (
        <ConflictModal
          conflicts={pendingConflicts}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
      )}

      <div className="calendar-header-wrapper">
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
                {day}
                <div className="day-header-2">{formatted}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="calendar">
        {(isEditing ? fullTimeSlots : visibleTimeSlots).map((time) => (
          <div key={time} className="admin-calendar-row">
            <div className="admin-time-label">
              {isDisplayTime(time) ? time : ""}
            </div>
            {days.map((day) => {
              const slotBooked = isSlotBooked(day, time);
              if (isEditing) {
                return (
                  <div
                    key={day + time}
                    className={`slot ${isBlocked(day, time) ? "unavailable-vis" : slotBooked ? "admin-booked" : "admin-available"}`}
                    onMouseDown={() => {
                      if (!isBlocked(day, time)) setIsBlocking(true);
                      else setIsUnblocking(true);
                    }}
                    onMouseUp={clearMouseTrackers}
                    onMouseOver={() => {
                      if (isBlocking && !isBlocked(day, time))
                        addBlockedSlot([day, time]);
                      if (isUnblocking && isBlocked(day, time))
                        removeBlockedSlot([day, time]);
                    }}
                    onClick={() =>
                      !isBlocked(day, time)
                        ? addBlockedSlot([day, time])
                        : removeBlockedSlot([day, time])
                    }
                  />
                );
              } else {
                const isHighlighted =
                  highlightedSlot?.day === day &&
                  highlightedSlot?.time === time;
                return (
                  <div
                    key={day + time}
                    className={`slot ${isBlocked(day, time) ? "unavailable-invis" : isHighlighted ? "admin-selected" : slotBooked ? "admin-booked" : "admin-available"}`}
                    onClick={() => handleSlotClick(day, time)}
                    // Makes the calendar accessible with keyboard controls
                    tabIndex={0}
                    role="button"
                    aria-label={`${isBlocked(day, time) ? "Unavailable" : slotBooked ? "Booked" : "Available"} slot: ${day} at ${time}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSlotClick(day, time);
                      }
                    }}
                  />
                );
              }
            })}
          </div>
        ))}
      </div>

      {/* The dialogue that pops up when you click an appointment slot in the calendar */}
      <AppointmentInfoDialog
        open={openInfoDialog}
        onClose={() => setOpenInfoDialog(false)}
        appointment={appointmentData}
        onDelete={(apt) => {
          const email = apt?.email || apt?.applicantEmail;
          if (email) {
            cancelAppointmentInStorage(email);
            setAppointments((prev) => prev.filter((a) => a.email !== email));
          }
          setOpenInfoDialog(false);
        }}
        onStatusChange={handleStatusChange}
      />

      {showBookingPanel && (
        <StaffBookingPanel
          selectedSlot={selectedSlot}
          onClose={() => {
            setShowBookingPanel(false);
            setSelectedSlot(null);
            setRebookingAppointment(null);
            setHighlightedSlot(null);
          }}
          onConfirmBooking={
            rebookingAppointment ? handleConfirmRebooking : handleConfirmBooking
          }
          existingAppointments={
            rebookingAppointment
              ? appointments.filter(
                (a) =>
                  a.email !==
                  (rebookingAppointment.email ||
                    rebookingAppointment.applicantEmail),
              )
              : appointments
          }
          rebookingAppointment={rebookingAppointment}
        />
      )}
    </div>
  );
}

export default AdminCalendar;
