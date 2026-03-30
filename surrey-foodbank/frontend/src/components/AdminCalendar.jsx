import React, { useState, useEffect, useCallback } from "react";
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
import {
  getAppointmentsByDateRange,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  createBlockedSlots,
  deleteBlockedSlots,
} from "../api/appointmentsAPI";
import { getApplicant, getApplicantByEmail, createApplicant } from "../api/applicantsAPI";

const days = [
  "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday",
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

const fullTimeSlots = generateTimeSlots(0, 24);

const dbTimeToGrid = (dbTime) => {
  const [h, m] = dbTime.split(":");
  return `${parseInt(h, 10)}:${m}`;
};

const gridTimeToDb = (gridTime) => {
  const [h, m] = gridTime.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}:00`;
};

const toDateStr = (date) => {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${mo}-${d}`;
};

const normaliseAppointment = (a) => ({
  appointment_id: a.appointment_id,
  response_id: a.response_id,
  // name and email are NOT fetched with the calendar query (no JOIN).
  // They are lazy-loaded when the AppointmentInfoDialog opens.
  email: "",
  name: "",
  day: a.appointment_date
    ? new Date(`${a.appointment_date}T12:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
      })
    : "",
  date: a.appointment_date ?? null,
  startTime: a.appointment_time ? dbTimeToGrid(a.appointment_time) : "",
  duration: (() => {
    if (!a.duration) return 15;
    const parts = String(a.duration).split(":");
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  })(),
  appointmentStatus: a.appointment_status ?? "Booked",
});

function ConflictModal({ conflicts, onConfirm, onCancel }) {
  return (
    <Dialog open maxWidth="xs" fullWidth>
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
          appointment{conflicts.length > 1 ? "s" : ""}:
        </Typography>
        <List dense>
          {conflicts.map((appt, i) => (
            <ListItem key={i} disableGutters>
              <ListItemText
                primary={appt.name}
                secondary={`${appt.date} at ${appt.startTime}`}
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

const VISIBLE_START_HOUR = 9;
const VISIBLE_END_HOUR = 13;

function AdminCalendar({
  isEditing,
  saveChanges,
  discardChanges,
  weekStart,
  isBookingPanel,
  changeBookingAppointment,
  isNewBooking,
}) {
  const weekStartStr = toDateStr(weekStart);
  const weekEndDate = new Date(weekStart);
  weekEndDate.setDate(weekStart.getDate() + 6);
  const weekEndStr = toDateStr(weekEndDate);

  const weekCache = React.useRef({});

  const [appointments, setAppointments] = useState([]);
  const [savedBlocked, setSavedBlocked] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);

  const [appointmentData, setAppointmentData] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [highlightedSlot, setHighlightedSlot] = useState(null);
  const [showBookingPanel, setShowBookingPanel] = useState(false);
  const [rebookingAppointment, setRebookingAppointment] = useState(null);
  const [openInfoDialog, setOpenInfoDialog] = useState(false);
  const [pendingConflicts, setPendingConflicts] = useState(null);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isUnblocking, setIsUnblocking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Build visible weekend slots for the displayed week and ensure they exist
  // as blocked rows in the DB so the applicant calendar can read them.
  const ensureWeekendsBlocked = useCallback(
    async (existingBlocked) => {
      // One blocked row per weekend day covering the full visible window (4 h).
      // Using a single row instead of 16 × 15-min rows keeps the DB lean and
      // speeds up the date-range fetch.
      const weekendIndices = [0, 6]; // Sunday and Saturday relative to weekStart
      const daysToBlock = [];
      for (const idx of weekendIndices) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + idx);
        const dateStr = toDateStr(date);
        const alreadyBlocked = existingBlocked.some((b) => b.date === dateStr);
        if (!alreadyBlocked) daysToBlock.push(dateStr);
      }
      if (daysToBlock.length === 0) return;
      const rows = daysToBlock.map((dateStr) => ({
        appointment_date: dateStr,
        appointment_time: "09:00:00",
        duration: "04:00:00",
      }));
      try {
        await createBlockedSlots(rows);
      } catch (err) {
        console.warn("Could not auto-block weekends:", err.message);
      }
    },
    [weekStart]
  );

  const loadWeekData = useCallback(async () => {
    // Serve from cache when available (navigation between already-loaded weeks)
    if (weekCache.current[weekStartStr]) {
      const { blocked, booked } = weekCache.current[weekStartStr];
      setSavedBlocked(blocked);
      setBlockedSlots(blocked);
      setAppointments(booked);
      setLoading(false);
      // Weekends were already blocked when this week was first loaded — no need
      // to re-check from the cache path.
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getAppointmentsByDateRange(weekStartStr, weekEndStr);
      const blocked = [];
      const booked = [];
      for (const row of data) {
        if (row.appointment_status === "blocked") {
          // Expand duration-based blocked rows into individual 15-min display slots
          const [th, tm] = row.appointment_time.split(":").map(Number);
          const startMins = th * 60 + tm;
          const durStr = row.duration || "00:15:00";
          const [dh, dm] = durStr.split(":").map(Number);
          const durationMins = dh * 60 + dm;
          for (let offset = 0; offset < durationMins; offset += 15) {
            const slotMins = startMins + offset;
            const h = Math.floor(slotMins / 60);
            const m = slotMins % 60;
            blocked.push({
              appointment_id: row.appointment_id,
              date: row.appointment_date,
              time: `${h}:${m.toString().padStart(2, "0")}`,
            });
          }
        } else if (row.appointment_status !== "cancelled") {
          booked.push(normaliseAppointment(row));
        }
      }
      weekCache.current[weekStartStr] = { blocked, booked };
      setSavedBlocked(blocked);
      setBlockedSlots(blocked);
      setAppointments(booked);

      // Fire-and-forget: block weekends in the background without delaying render
      ensureWeekendsBlocked(blocked);
    } catch (err) {
      setError("Failed to load appointments: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [weekStartStr, weekEndStr, ensureWeekendsBlocked]);

  useEffect(() => {
    loadWeekData();
  }, [loadWeekData]);

  // Open rebooking panel when arriving from ApplicantInfoPage
  useEffect(() => {
    if (changeBookingAppointment) {
      setRebookingAppointment(changeBookingAppointment);
      const slotDay = changeBookingAppointment.day || days[1]; // default Monday
      const slotTime = changeBookingAppointment.startTime || "9:00";
      setSelectedSlot({
        day: slotDay,
        time: slotTime,
        weekStart,
        date: changeBookingAppointment.date
          ? new Date(changeBookingAppointment.date)
          : new Date(weekStart),
      });
      setHighlightedSlot({ day: slotDay, time: slotTime });
      setShowBookingPanel(true);
    }
  }, [changeBookingAppointment]);

  const isBlocked = (day, time) => {
    const source = isEditing ? blockedSlots : savedBlocked;
    return source.some((s) => {
      const slotDay = new Date(`${s.date}T12:00:00`).toLocaleDateString(
        "en-US",
        { weekday: "long" }
      );
      return slotDay === day && s.time === time;
    });
  };

  const isSlotBooked = (day, time) =>
    appointments.some((apt) => {
      if (apt.day !== day || !apt.date) return false;
      if (apt.date < weekStartStr || apt.date > weekEndStr) return false;
      const [aptH, aptM] = apt.startTime.split(":").map(Number);
      const [slotH, slotM] = time.split(":").map(Number);
      const aptStart = aptH * 60 + aptM;
      const slotMins = slotH * 60 + slotM;
      return slotMins >= aptStart && slotMins < aptStart + apt.duration;
    });

  const addBlockedSlot = (day, time) => {
    const dayIndex = days.indexOf(day);
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + dayIndex);
    const dateStr = toDateStr(date);
    if (!blockedSlots.some((s) => s.date === dateStr && s.time === time)) {
      setBlockedSlots((prev) => [
        ...prev,
        { appointment_id: null, date: dateStr, time },
      ]);
    }
  };

  const removeBlockedSlot = (day, time) => {
    const dayIndex = days.indexOf(day);
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + dayIndex);
    const dateStr = toDateStr(date);
    setBlockedSlots((prev) =>
      prev.filter((s) => !(s.date === dateStr && s.time === time))
    );
  };

  const clearMouseTrackers = () => {
    setIsBlocking(false);
    setIsUnblocking(false);
  };

  const visibleTimeSlots = generateTimeSlots(VISIBLE_START_HOUR, VISIBLE_END_HOUR);

  const isDisplayTime = (time) =>
    time.slice(-2) === "00" || time.slice(-2) === "30";

  const handleSave = async () => {
    const newlyBlocked = blockedSlots.filter(
      (s) => !savedBlocked.some((b) => b.date === s.date && b.time === s.time)
    );
    const conflicts = appointments.filter((apt) =>
      newlyBlocked.some((s) => s.date === apt.date && s.time === apt.startTime)
    );
    if (conflicts.length > 0) {
      setPendingConflicts(conflicts);
    } else {
      await commitSave([]);
    }
  };

  const commitSave = async (cancelledAppts = []) => {
    setError(null);
    try {
      const removed = savedBlocked.filter(
        (b) =>
          !blockedSlots.some((s) => s.date === b.date && s.time === b.time)
      );
      if (removed.length > 0) {
        const ids = removed.map((b) => b.appointment_id).filter(Boolean);
        if (ids.length > 0) await deleteBlockedSlots(ids);
      }

      const added = blockedSlots.filter(
        (s) =>
          !savedBlocked.some((b) => b.date === s.date && b.time === s.time)
      );
      if (added.length > 0) {
        const rows = added.map((s) => ({
          appointment_date: s.date,
          appointment_time: gridTimeToDb(s.time),
          duration: "00:15:00",
        }));
        await createBlockedSlots(rows);
      }

      await Promise.all(
        cancelledAppts.map((apt) =>
          updateAppointment(apt.appointment_id, {
            appointment_status: "cancelled",
          })
        )
      );

      delete weekCache.current[weekStartStr];
      await loadWeekData();
      clearMouseTrackers();
    } catch (err) {
      setError("Failed to save: " + err.message);
    }
  };

  const handleModalConfirm = async () => {
    const cancelled = [...pendingConflicts];
    setPendingConflicts(null);
    await commitSave(cancelled);
  };

  const handleModalCancel = () => setPendingConflicts(null);

  const handleDiscard = () => {
    setBlockedSlots(savedBlocked);
    clearMouseTrackers();
  };

  const handleStatusChange = async (newStatus) => {
    if (!appointmentData?.appointment_id) return;
    try {
      await updateAppointment(appointmentData.appointment_id, {
        appointment_status: newStatus,
      });
      setAppointmentData((prev) => ({ ...prev, appointmentStatus: newStatus }));
      setAppointments((prev) =>
        prev.map((a) =>
          a.appointment_id === appointmentData.appointment_id
            ? { ...a, appointmentStatus: newStatus }
            : a
        )
      );
    } catch (err) {
      setError("Failed to update status: " + err.message);
    }
  };

  const handleBookingPanel = (day, time) => {
    const dayIndex = days.indexOf(day);
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + dayIndex);
    setSelectedSlot({ day, time: time.padStart(5, "0"), weekStart, date });
    setHighlightedSlot({ day, time });
    setRebookingAppointment(null);
    setShowBookingPanel(true);
  };

  const handleSlotClick = (day, time) => {
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
      const appt = appointments.find((apt) => {
        if (apt.day !== day || !apt.date) return false;
        if (apt.date < weekStartStr || apt.date > weekEndStr) return false;
        const [aptH, aptM] = apt.startTime.split(":").map(Number);
        const [slotH, slotM] = time.split(":").map(Number);
        const aptStart = aptH * 60 + aptM;
        const slotMins = slotH * 60 + slotM;
        return slotMins >= aptStart && slotMins < aptStart + apt.duration;
      });
      if (appt) {
        setAppointmentData(appt);
        setOpenInfoDialog(true);
        // Lazy-load applicant name/email — the calendar query has no JOIN
        if (appt.response_id) {
          getApplicant(appt.response_id)
            .then((reg) => {
              if (!reg) return;
              setAppointmentData((prev) => ({
                ...prev,
                name: `${reg.first_name || ""} ${reg.last_name || ""}`.trim(),
                email: reg.email_address || "",
              }));
            })
            .catch(() => {});
        }
      }
    }
  };

  // When confirming a brand-new booking from the staff panel, look up the
  // applicant by email to get their response_id, then insert the appointment.
  const handleConfirmBooking = async (newData) => {
    try {
      // 1. Resolve response_id: prefer what's already on newData, else look up by email
      let responseId = newData.response_id ?? null;
      if (!responseId && newData.email) {
        try {
          const applicant = await getApplicantByEmail(newData.email);
          responseId = applicant?.response_id ?? null;
        } catch {
          // Non-fatal
        }
      }

      // 2. If still no match, create a new registration entry from the form data
      if (!responseId && newData.email) {
        try {
          const newApplicant = await createApplicant({
            first_name: newData.first_name || newData.firstName || "",
            last_name: newData.last_name || newData.lastName || "",
            email_address: newData.email,
            phone: newData.phone || null,
            street_addr: newData.street_addr || newData.streetAddress || null,
            city: newData.city || null,
            postal_code: newData.postal_code || newData.postalCode || null,
            status_in_canada: newData.status_in_canada || newData.statusInCanada || null,
            tiny_bundles_program: newData.tiny_bundles_program ?? (newData.applyingToTinyBundles === "yes"),
          });
          responseId = newApplicant?.response_id ?? null;
        } catch (err) {
          console.warn("Could not create registration:", err.message);
        }
      }

      await createAppointment({
        response_id: responseId,
        appointment_date: newData.date,
        appointment_time: gridTimeToDb(newData.startTime),
        duration: newData.duration === 30 ? "00:30:00" : "00:15:00",
        appointment_status: "Booked",
      });
      delete weekCache.current[weekStartStr];
      await loadWeekData();
    } catch (err) {
      setError("Failed to book appointment: " + err.message);
    } finally {
      setShowBookingPanel(false);
      setSelectedSlot(null);
      setRebookingAppointment(null);
      setHighlightedSlot(null);
    }
  };

  const handleConfirmRebooking = async (newData) => {
    try {
      const oldId = rebookingAppointment?.appointment_id;

      if (oldId) {
        await updateAppointment(oldId, { appointment_status: "cancelled" });
      }
      await createAppointment({
        response_id:
          newData.response_id ?? rebookingAppointment?.response_id ?? null,
        appointment_date: newData.date,
        appointment_time: gridTimeToDb(newData.startTime),
        duration: newData.duration === 30 ? "00:30:00" : "00:15:00",
        appointment_status: "Booked",
      });
      delete weekCache.current[weekStartStr];
      await loadWeekData();
    } catch (err) {
      setError("Failed to rebook appointment: " + err.message);
    } finally {
      setShowBookingPanel(false);
      setSelectedSlot(null);
      setRebookingAppointment(null);
      setHighlightedSlot(null);
    }
  };

  const handleDeleteAppointment = async (apt) => {
    try {
      await deleteAppointment(apt.appointment_id);
      setAppointments((prev) =>
        prev.filter((a) => a.appointment_id !== apt.appointment_id)
      );
    } catch (err) {
      setError("Failed to delete appointment: " + err.message);
    } finally {
      setOpenInfoDialog(false);
    }
  };

  useEffect(() => {
    if (saveChanges) handleSave();
  }, [saveChanges]);

  useEffect(() => {
    if (discardChanges) handleDiscard();
  }, [discardChanges]);

  useEffect(() => {
    if (isBookingPanel > 0) handleBookingPanel(days[1], "9:00"); // default to Monday 9am
  }, [isBookingPanel]);

  if (loading) return <div className="calendar-area">Loading...</div>;

  return (
    <div className="calendar-area">
      {error && <div className="error-banner">{error}</div>}

      {pendingConflicts && pendingConflicts.length > 0 && (
        <ConflictModal
          conflicts={pendingConflicts}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
      )}

      {/* Calendar header */}
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

      {/* Calendar grid */}
      <div className="calendar">
        {visibleTimeSlots.map((time) => (
          <div key={time} className="admin-calendar-row">
            <div className="admin-time-label">
              {isDisplayTime(time) ? time : ""}
            </div>
            {days.map((day) => {
              const blocked = isBlocked(day, time);
              const booked = isSlotBooked(day, time);
              const isHighlighted =
                highlightedSlot?.day === day && highlightedSlot?.time === time;

              if (isEditing) {
                return (
                  <div
                    key={day + time}
                    className={`slot ${
                      blocked
                        ? "unavailable-vis"
                        : booked
                        ? "admin-booked"
                        : "admin-available"
                    }`}
                    onMouseDown={() => {
                      if (!blocked) setIsBlocking(true);
                      else setIsUnblocking(true);
                    }}
                    onMouseUp={clearMouseTrackers}
                    onMouseOver={() => {
                      if (isBlocking && !blocked) addBlockedSlot(day, time);
                      if (isUnblocking && blocked)
                        removeBlockedSlot(day, time);
                    }}
                    onClick={() =>
                      !blocked
                        ? addBlockedSlot(day, time)
                        : removeBlockedSlot(day, time)
                    }
                  />
                );
              } else {
                return (
                  <div
                    key={day + time}
                    className={`slot ${
                      blocked
                        ? "unavailable-invis"
                        : isHighlighted
                        ? "admin-selected"
                        : booked
                        ? "admin-booked"
                        : "admin-available"
                    }`}
                    onClick={() => handleSlotClick(day, time)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${
                      blocked
                        ? "Unavailable"
                        : booked
                        ? "Booked"
                        : "Available"
                    } slot: ${day} at ${time}`}
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

      <AppointmentInfoDialog
        open={openInfoDialog}
        onClose={() => setOpenInfoDialog(false)}
        appointment={appointmentData}
        onDelete={handleDeleteAppointment}
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
            rebookingAppointment && !isNewBooking
              ? handleConfirmRebooking
              : handleConfirmBooking
          }
          existingAppointments={
            rebookingAppointment && !isNewBooking
              ? appointments.filter(
                  (a) => a.response_id !== rebookingAppointment.response_id
                )
              : appointments
          }
          rebookingAppointment={rebookingAppointment}
          isNewBooking={isNewBooking}
        />
      )}
    </div>
  );
}

export default AdminCalendar;