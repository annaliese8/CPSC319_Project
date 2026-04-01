import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { STATUS_OPTIONS } from "./AppointmentStatus.jsx";

const days = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

const VISIBLE_START_HOUR = 9;
const VISIBLE_END_HOUR = 13;

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

const visibleTimeSlots = generateTimeSlots(VISIBLE_START_HOUR, VISIBLE_END_HOUR);

// Map MUI color names → actual hex values to render dots without MUI theme overhead
export const STATUS_DOT_COLORS = {
  info:    "#4cc5dc", // Booked
  primary: "#1981cb", // Checked In
  success: "#2fb036", // Complete
  error:   "#d32f2f", // No Show
  default: "#9e9e9e",
};

// Normalize DB status strings to match STATUS_OPTIONS labels
const normalizeStatus = (status) => {
  if (!status) return "";
  switch (status.trim().toLowerCase()) {
    case "booked":       return "Booked";
    case "checked in":
    case "checked-in":   return "Checked In";
    case "complete":     return "Complete";
    case "no show":      return "No Show";
    default:             return status.trim();
  }
};

function StatusDot({ status }) {
  const option = STATUS_OPTIONS.find((o) => o.label === normalizeStatus(status));
  const color = STATUS_DOT_COLORS[option?.color ?? "default"];
  return (
    <span
      style={{
        position: "absolute",
        top: 3,
        right: 3,
        width: 7,
        height: 7,
        borderRadius: "50%",
        backgroundColor: color,
        pointerEvents: "none",
        flexShrink: 0,
      }}
    />
  );
}

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

const isDisplayTime = (time) =>
  time.slice(-2) === "00" || time.slice(-2) === "30";

/**
 * Expand a single DB blocked row (which may span multiple hours via duration)
 * into individual 15-min grid slots.
 */
const expandBlockedRow = (row) => {
  const [th, tm] = row.appointment_time.split(":").map(Number);
  const startMins = th * 60 + tm;
  const [dh, dm] = (row.duration || "00:15:00").split(":").map(Number);
  const durationMins = dh * 60 + dm;
  const slots = [];
  for (let offset = 0; offset < durationMins; offset += 15) {
    const slotMins = startMins + offset;
    const h = Math.floor(slotMins / 60);
    const m = slotMins % 60;
    slots.push({
      appointment_id: row.appointment_id,
      date: row.appointment_date,
      time: `${h}:${m.toString().padStart(2, "0")}`,
    });
  }
  return slots;
};

const normaliseAppointment = (a) => {
  const reg = a.registrationformresponse;
  const duration = (() => {
    if (!a.duration) return 15;
    const parts = String(a.duration).split(":");
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  })();
  // householdinformation(count) returns [{count: "N"}]; +1 for the primary applicant
  const hhRows = reg?.householdinformation;
  const householdSize = hhRows != null
    ? parseInt(Array.isArray(hhRows) ? (hhRows[0]?.count ?? "0") : "0", 10) + 1
    : null;
  return {
    appointment_id: a.appointment_id,
    response_id: a.response_id,
    email: "",
    name: reg ? `${reg.first_name || ""} ${reg.last_name || ""}`.trim() : "",
    phone: "",
    householdSize,
    day: a.appointment_date
      ? new Date(`${a.appointment_date}T12:00:00`).toLocaleDateString("en-US", { weekday: "long" })
      : "",
    date: a.appointment_date ?? null,
    startTime: a.appointment_time ? dbTimeToGrid(a.appointment_time) : "",
    duration,
    appointmentStatus: a.appointment_status ?? "Booked",
  };
};

function ConflictModal({ conflicts, onConfirm, onCancel }) {
  return (
    <Dialog open maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", gap: 1, color: "warning.main", fontWeight: 800 }}
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
                primary={appt.name || `Response #${appt.response_id}`}
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
        <Button variant="outlined" onClick={onCancel}>Go Back</Button>
        <Button variant="contained" color="warning" onClick={onConfirm}
          sx={{ fontWeight: 800, color: "common.white" }}>
          Confirm &amp; Cancel Appointments
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AdminCalendar({
  isEditing,
  saveChanges,
  setSaveState,
  discardChanges,
  weekStart,
  isBookingPanel,
  changeBookingAppointment,
  isNewBooking,
  saveConfirmed,
}) {
  const weekStartStr = toDateStr(weekStart);
  const weekEndDate = new Date(weekStart);
  weekEndDate.setDate(weekStart.getDate() + 6);
  const weekEndStr = toDateStr(weekEndDate);

  // Persistent cache across week navigations — avoids re-fetching visited weeks
  const weekCache = useRef({});

  const [appointments, setAppointments] = useState([]);
  const [savedBlocked, setSavedBlocked] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);

  // O(1) lookup sets — rebuilt only when their source arrays change
  const savedBlockedSet = React.useMemo(
    () => new Set(savedBlocked.map((s) => `${s.date}|${s.time}`)),
    [savedBlocked]
  );
  const blockedSlotsSet = React.useMemo(
    () => new Set(blockedSlots.map((s) => `${s.date}|${s.time}`)),
    [blockedSlots]
  );
  const bookedSet = React.useMemo(() => {
    const set = new Set();
    appointments.forEach((apt) => {
      if (!apt.date || apt.date < weekStartStr || apt.date > weekEndStr) return;
      const [aptH, aptM] = apt.startTime.split(":").map(Number);
      const aptStart = aptH * 60 + aptM;
      for (let offset = 0; offset < apt.duration; offset += 15) {
        const slotMins = aptStart + offset;
        const h = Math.floor(slotMins / 60);
        const m = slotMins % 60;
        set.add(`${apt.date}|${h}:${m.toString().padStart(2, "0")}`);
      }
    });
    return set;
  }, [appointments, weekStartStr, weekEndStr]);

  // Map "YYYY-MM-DD|H:MM" → appointment object for O(1) status dot lookup
  const slotAppointmentMap = React.useMemo(() => {
    const map = new Map();
    appointments.forEach((apt) => {
      if (!apt.date || apt.date < weekStartStr || apt.date > weekEndStr) return;
      const [aptH, aptM] = apt.startTime.split(":").map(Number);
      const aptStart = aptH * 60 + aptM;
      for (let offset = 0; offset < apt.duration; offset += 15) {
        const slotMins = aptStart + offset;
        const h = Math.floor(slotMins / 60);
        const m = slotMins % 60;
        map.set(`${apt.date}|${h}:${m.toString().padStart(2, "0")}`, apt);
      }
    });
    return map;
  }, [appointments, weekStartStr, weekEndStr]);
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

  // Drag state for move/resize
  const dragStateRef = React.useRef(null);
  const [dragState, setDragState] = React.useState(null);
  const dragDidMove = React.useRef(false);
  const commitDragFn = React.useRef(null);

  const loadWeekData = useCallback(async ({ forceRefresh = false } = {}) => {
    if (!forceRefresh && weekCache.current[weekStartStr]) {
      const { blocked, booked } = weekCache.current[weekStartStr];
      setSavedBlocked(blocked);
      setBlockedSlots(blocked);
      setAppointments(booked);
      setLoading(false);
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
          blocked.push(...expandBlockedRow(row));
        } else if (row.appointment_status !== "cancelled") {
          booked.push(normaliseAppointment(row));
        }
      }
      weekCache.current[weekStartStr] = { blocked, booked };
      setSavedBlocked(blocked);
      setBlockedSlots(blocked);
      setAppointments(booked);
    } catch (err) {
      setError("Failed to load appointments: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [weekStartStr, weekEndStr]);

  useEffect(() => {
    loadWeekData();
  }, [loadWeekData]);

  useEffect(() => {
    if (changeBookingAppointment) {
      setRebookingAppointment(changeBookingAppointment);
      const slotDay = changeBookingAppointment.day || days[1];
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

  // Pre-compute day→date map once per week (avoids Date construction in render loop)
  const dayDateMap = React.useMemo(() => {
    const map = {};
    days.forEach((day, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      map[day] = toDateStr(d);
    });
    return map;
  }, [weekStart]);

  const dateForDay = (day) => dayDateMap[day];

  const isBlocked = (day, time) => {
    if (day === "Saturday" || day === "Sunday") return true;
    const date = dateForDay(day);
    const set = isEditing ? blockedSlotsSet : savedBlockedSet;
    return set.has(`${date}|${time}`);
  };

  const isSlotBooked = (day, time) => {
    const date = dateForDay(day);
    return bookedSet.has(`${date}|${time}`);
  };

  const addBlockedSlot = (day, time) => {
    const dateStr = dateForDay(day);
    if (!blockedSlotsSet.has(`${dateStr}|${time}`)) {
      setBlockedSlots((prev) => [...prev, { appointment_id: null, date: dateStr, time }]);
    }
  };

  const removeBlockedSlot = (day, time) => {
    const dateStr = dateForDay(day);
    setBlockedSlots((prev) =>
      prev.filter((s) => !(s.date === dateStr && s.time === time))
    );
  };

  const clearMouseTrackers = () => {
    setIsBlocking(false);
    setIsUnblocking(false);
  };

  const handleSave = async () => {
    const newlyBlocked = blockedSlots.filter(
      (s) => !savedBlocked.some((b) => b.date === s.date && b.time === s.time)
    );
    const conflicts = appointments.filter((apt) =>
      newlyBlocked.some((s) => s.date === apt.date && timeIsConflicting(s.time, apt.startTime, apt.duration))
    );
    if (conflicts.length > 0) {
      setPendingConflicts(conflicts);
    } else {
      await commitSave([]);
      saveConfirmed();
    }
  };

  // ClaudeAI was used to help with the following function
  const timeIsConflicting = (blockedTime, aptTime, aptLength) => {
    const conflictingTimes = [];

    // Parse the start time
    const [hours, minutes] = aptTime.split(':').map(Number);
    let currentMinutes = hours * 60 + minutes;

    // Calculate end time in minutes
    const endMinutes = currentMinutes + aptLength;

    // Generate times at 15-minute intervals
    while (currentMinutes < endMinutes) {
      const h = Math.floor(currentMinutes / 60);
      const m = currentMinutes % 60;
      conflictingTimes.push(`${h}:${m.toString().padStart(2, '0')}`);
      currentMinutes += 15;
    }

    return conflictingTimes.some((t) => t === blockedTime);
  }

  const commitSave = async (cancelledAppts = []) => {
    setError(null);

    const removed = savedBlocked.filter(
      (b) => !blockedSlots.some((s) => s.date === b.date && s.time === b.time)
    );
    const added = blockedSlots.filter(
      (s) => !savedBlocked.some((b) => b.date === s.date && b.time === s.time)
    );

    // Apply to local state immediately so UI is instant
    const newSavedBlocked = blockedSlots.map((s) => ({ ...s }));
    const newBooked = cancelledAppts.length > 0
      ? appointments.filter(
          (a) => !cancelledAppts.some((c) => c.appointment_id === a.appointment_id)
        )
      : appointments;
    setSavedBlocked(newSavedBlocked);
    if (cancelledAppts.length > 0) setAppointments(newBooked);
    weekCache.current[weekStartStr] = { blocked: newSavedBlocked, booked: newBooked };
    clearMouseTrackers();

    // Persist all changes in parallel
    try {
      const ops = [];
      if (removed.length > 0) {
        const ids = [...new Set(removed.map((b) => b.appointment_id).filter(Boolean))];
        if (ids.length > 0) ops.push(deleteBlockedSlots(ids));
      }
      if (added.length > 0) {
        const rows = added.map((s) => ({
          appointment_date: s.date,
          appointment_time: gridTimeToDb(s.time),
          duration: "00:15:00",
        }));
        ops.push(createBlockedSlots(rows));
      }
      cancelledAppts.forEach((apt) =>
        ops.push(updateAppointment(apt.appointment_id, { appointment_status: "cancelled" }))
      );
      await Promise.all(ops);
    } catch (err) {
      delete weekCache.current[weekStartStr];
      setError("Save failed — please refresh: " + err.message);
    }
  };

  const handleModalConfirm = async () => {
    const cancelled = [...pendingConflicts];
    setPendingConflicts(null);
    await commitSave(cancelled);
    saveConfirmed();
  };

  const handleModalCancel = () => {
    setPendingConflicts(null)
    setSaveState(false);


  };
  const handleDiscard = () => {
    setBlockedSlots(savedBlocked);
    clearMouseTrackers();
  };

  const handleStatusChange = async (newStatus) => {
    if (!appointmentData?.appointment_id) return;
    const id = appointmentData.appointment_id;
    setAppointmentData((prev) => ({ ...prev, appointmentStatus: newStatus }));
    setAppointments((prev) =>
      prev.map((a) => a.appointment_id === id ? { ...a, appointmentStatus: newStatus } : a)
    );
    try {
      await updateAppointment(id, { appointment_status: newStatus });
      if (weekCache.current[weekStartStr]) {
        weekCache.current[weekStartStr].booked = weekCache.current[weekStartStr].booked.map(
          (a) => a.appointment_id === id ? { ...a, appointmentStatus: newStatus } : a
        );
      }
    } catch (err) {
      setError("Failed to update status: " + err.message);
      delete weekCache.current[weekStartStr];
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
    if (dragDidMove.current) { dragDidMove.current = false; return; }
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
      const date = dateForDay(day);
      const key = `${date}|${time}`;
      const appt = appointments.find((apt) => bookedSet.has(key) && apt.date === date &&
        (() => {
          const [aptH, aptM] = apt.startTime.split(":").map(Number);
          const [slotH, slotM] = time.split(":").map(Number);
          const aptStart = aptH * 60 + aptM;
          const slotMins = slotH * 60 + slotM;
          return slotMins >= aptStart && slotMins < aptStart + apt.duration;
        })()
      );
      if (appt) {
        setAppointmentData(appt);
        setOpenInfoDialog(true);
        // Lazy-load email + phone (name comes from JOIN already)
        if (appt.response_id && (!appt.email || !appt.phone)) {
          getApplicant(appt.response_id)
            .then((reg) => {
              if (!reg) return;
              const email = reg.email_address || "";
              const phone = reg.phone || "";
              setAppointments((prev) =>
                prev.map((a) =>
                  a.appointment_id === appt.appointment_id ? { ...a, email, phone } : a
                )
              );
              setAppointmentData((prev) => ({ ...prev, email, phone }));
            })
            .catch(() => {});
        }
      }
    }
  };

  const handleConfirmBooking = async (newData) => {
    const dayIndex = days.indexOf(newData.day);
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + dayIndex);
    const dateStr = toDateStr(date);

    let responseId = newData.response_id ?? null;
    if (!responseId && newData.email) {
      try {
        const applicant = await getApplicantByEmail(newData.email);
        responseId = applicant?.response_id ?? null;
      } catch { /* non-fatal */ }
    }
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

    const optimisticAppt = {
      appointment_id: null,
      response_id: responseId,
      email: newData.email || "",
      phone: newData.phone || "",
      name: `${newData.first_name || newData.firstName || ""} ${newData.last_name || newData.lastName || ""}`.trim(),
      householdSize: (newData.householdMembers?.length ?? 0) + 1,
      day: newData.day,
      date: dateStr,
      startTime: newData.startTime,
      duration: newData.duration || 15,
      appointmentStatus: "Booked",
    };
    setAppointments((prev) => [...prev, optimisticAppt]);
    delete weekCache.current[weekStartStr];

    setShowBookingPanel(false);
    setSelectedSlot(null);
    setRebookingAppointment(null);
    setHighlightedSlot(null);

    try {
      await createAppointment({
        response_id: responseId,
        appointment_date: dateStr,
        appointment_time: gridTimeToDb(newData.startTime),
        duration: (() => { const m = newData.duration || 15; return `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}:00`; })(),
        appointment_status: "Booked",
      });
    } catch (err) {
      setError("Failed to book appointment: " + err.message);
      setAppointments((prev) => prev.filter((a) => a !== optimisticAppt));
    }
  };

  const handleConfirmRebooking = async (newData) => {
    const oldId = rebookingAppointment?.appointment_id;
    const dayIndex = days.indexOf(newData.day);
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + dayIndex);
    const dateStr = toDateStr(date);

    setAppointments((prev) => [
      ...prev.filter((a) => a.appointment_id !== oldId),
      {
        appointment_id: null,
        response_id: newData.response_id ?? rebookingAppointment?.response_id ?? null,
        email: rebookingAppointment?.email || "",
        phone: rebookingAppointment?.phone || "",
        name: rebookingAppointment?.name || "",
        householdSize: rebookingAppointment?.householdSize ?? null,
        day: newData.day,
        date: dateStr,
        startTime: newData.startTime,
        duration: newData.duration || 15,
        appointmentStatus: "Booked",
      },
    ]);
    delete weekCache.current[weekStartStr];

    setShowBookingPanel(false);
    setSelectedSlot(null);
    setRebookingAppointment(null);
    setHighlightedSlot(null);

    try {
      await Promise.all([
        oldId ? updateAppointment(oldId, { appointment_status: "cancelled" }) : Promise.resolve(),
        createAppointment({
          response_id: newData.response_id ?? rebookingAppointment?.response_id ?? null,
          appointment_date: dateStr,
          appointment_time: gridTimeToDb(newData.startTime),
          duration: (() => { const m = newData.duration || 15; return `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}:00`; })(),
          appointment_status: "Booked",
        }),
      ]);
    } catch (err) {
      setError("Failed to rebook: " + err.message);
      delete weekCache.current[weekStartStr];
    }
  };

  const handleDeleteAppointment = async (apt) => {
    setAppointments((prev) =>
      prev.filter((a) => a.appointment_id !== apt.appointment_id)
    );
    if (weekCache.current[weekStartStr]) {
      weekCache.current[weekStartStr].booked =
        weekCache.current[weekStartStr].booked.filter(
          (a) => a.appointment_id !== apt.appointment_id
        );
    }
    setOpenInfoDialog(false);
    try {
      await deleteAppointment(apt.appointment_id);
    } catch (err) {
      setError("Failed to delete: " + err.message);
      delete weekCache.current[weekStartStr];
    }
  };

  // ─── Drag helpers (commented out — feature temporarily disabled) ───────────────────────────────────────────────
  // const startMoveDrag = (e, apt) => {
  //   if (isEditing || !apt.appointment_id) return;
  //   e.preventDefault();
  //   e.stopPropagation();
  //   dragDidMove.current = false;
  //   const ds = { type: "move", apt, targetDay: apt.day, targetDate: apt.date, targetTime: apt.startTime };
  //   dragStateRef.current = ds;
  //   setDragState(ds);
  // };

  // const startResizeDrag = (e, apt) => {
  //   if (isEditing || !apt.appointment_id) return;
  //   e.preventDefault();
  //   e.stopPropagation();
  //   dragDidMove.current = false;
  //   const lastMins = (() => { const [h, m] = apt.startTime.split(":").map(Number); return h * 60 + m + apt.duration - 15; })();
  //   const lastTime = `${Math.floor(lastMins / 60)}:${String(lastMins % 60).padStart(2, "0")}`;
  //   const ds = { type: "resize", apt, targetDay: apt.day, targetTime: lastTime };
  //   dragStateRef.current = ds;
  //   setDragState(ds);
  // };

  const handleSlotMouseEnter = (day, time) => {
    const ds = dragStateRef.current;
    if (!ds) return;
    if (ds.targetDay === day && ds.targetTime === time) return;
    dragDidMove.current = true;
    const updated = { ...ds, targetDay: day, targetTime: time, targetDate: dayDateMap[day] };
    dragStateRef.current = updated;
    setDragState({ ...updated });
  };

  useEffect(() => { if (saveChanges) handleSave(); }, [saveChanges]);
  useEffect(() => { if (discardChanges) handleDiscard(); }, [discardChanges]);
  useEffect(() => { if (isBookingPanel > 0) handleBookingPanel(days[1], "9:00"); }, [isBookingPanel]);

  // // Global mouseup to commit drag (commented out — drag feature temporarily disabled)
  // React.useEffect(() => {
  //   const handler = () => commitDragFn.current?.();
  //   document.addEventListener("mouseup", handler);
  //   return () => document.removeEventListener("mouseup", handler);
  // }, []);

  // // Always-fresh commit function (captures latest closure values)
  // commitDragFn.current = async () => {
  //   const ds = dragStateRef.current;
  //   dragStateRef.current = null;
  //   setDragState(null);
  //   if (!ds || !dragDidMove.current) return;
  //   if (ds.type === "move") {
  //     const { apt, targetDay, targetDate, targetTime } = ds;
  //     if (!targetDate || !dayDateMap[targetDay]) return;
  //     if (isBlocked(targetDay, targetTime)) return;
  //     const [sh, sm] = targetTime.split(":").map(Number);
  //     const startMins = sh * 60 + sm;
  //     for (let off = 0; off < apt.duration; off += 15) {
  //       const slotMins = startMins + off;
  //       const h = Math.floor(slotMins / 60);
  //       const m = slotMins % 60;
  //       const key = `${targetDate}|${h}:${m.toString().padStart(2, "0")}`;
  //       const occupant = slotAppointmentMap.get(key);
  //       if (occupant && occupant.appointment_id !== apt.appointment_id) return;
  //     }
  //     const prevAppts = appointments;
  //     setAppointments(prev => prev.map(a =>
  //       a.appointment_id === apt.appointment_id
  //         ? { ...a, day: targetDay, date: targetDate, startTime: targetTime }
  //         : a
  //     ));
  //     delete weekCache.current[weekStartStr];
  //     try {
  //       await updateAppointment(apt.appointment_id, {
  //         appointment_date: targetDate,
  //         appointment_time: gridTimeToDb(targetTime),
  //       });
  //     } catch (err) {
  //       setError("Failed to move appointment: " + err.message);
  //       setAppointments(prevAppts);
  //     }
  //   } else if (ds.type === "resize") {
  //     const { apt, targetDay, targetTime } = ds;
  //     if (targetDay !== apt.day) return;
  //     const [ah, am] = apt.startTime.split(":").map(Number);
  //     const [th, tm] = targetTime.split(":").map(Number);
  //     const newDuration = (th * 60 + tm + 15) - (ah * 60 + am);
  //     if (newDuration < 15) return;
  //     const startMins = ah * 60 + am;
  //     for (let off = apt.duration; off < newDuration; off += 15) {
  //       const slotMins = startMins + off;
  //       const h = Math.floor(slotMins / 60);
  //       const m = slotMins % 60;
  //       const key = `${apt.date}|${h}:${m.toString().padStart(2, "0")}`;
  //       if (savedBlockedSet.has(key)) return;
  //       const occupant = slotAppointmentMap.get(key);
  //       if (occupant && occupant.appointment_id !== apt.appointment_id) return;
  //     }
  //     const prevAppts = appointments;
  //     setAppointments(prev => prev.map(a =>
  //       a.appointment_id === apt.appointment_id ? { ...a, duration: newDuration } : a
  //     ));
  //     delete weekCache.current[weekStartStr];
  //     const mins = newDuration;
  //     const durStr = `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}:00`;
  //     try {
  //       await updateAppointment(apt.appointment_id, { duration: durStr });
  //     } catch (err) {
  //       setError("Failed to resize appointment: " + err.message);
  //       setAppointments(prevAppts);
  //     }
  //   }
  // };

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

      <div className="calendar-header-wrapper">
        <div className="calendar-header">
          <div className="time-column"></div>
          {days.map((day, index) => {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + index);
            const formatted = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
        {visibleTimeSlots.map((time) => (
          <div key={time} className="admin-calendar-row">
            <div className="admin-time-label">
              {isDisplayTime(time) ? time : ""}
            </div>
            {days.map((day) => {
              const blocked = isBlocked(day, time);
              const booked = isSlotBooked(day, time);
              const isHighlighted = highlightedSlot?.day === day && highlightedSlot?.time === time;

              if (isEditing) {
                return (
                  <div
                    key={day + time}
                    className={`slot ${blocked ? "unavailable-vis" : booked ? "admin-booked" : "admin-available"}`}
                    onMouseDown={() => { if (!blocked) setIsBlocking(true); else setIsUnblocking(true); }}
                    onMouseUp={clearMouseTrackers}
                    onMouseOver={() => {
                      if (isBlocking && !blocked) addBlockedSlot(day, time);
                      if (isUnblocking && blocked) removeBlockedSlot(day, time);
                    }}
                    onClick={() => !blocked ? addBlockedSlot(day, time) : removeBlockedSlot(day, time)}
                  />
                );
              } else {
                const slotKey = `${dateForDay(day)}|${time}`;
                const slotAppt = booked ? slotAppointmentMap.get(slotKey) : null;
                const isFirstSlot = slotAppt && (() => {
                  const [aptH, aptM] = slotAppt.startTime.split(":").map(Number);
                  const [slotHr, slotMn] = time.split(":").map(Number);
                  return slotHr * 60 + slotMn === aptH * 60 + aptM;
                })();
                const isCont = booked && !!slotAppt && !isFirstSlot && !isHighlighted;
                if (isCont) {
                  return (
                    <div
                      key={day + time}
                      className="slot"
                      style={{ background: "transparent", pointerEvents: dragState ? "auto" : "none", cursor: "default" }}
                      onMouseEnter={() => handleSlotMouseEnter(day, time)}
                      aria-hidden="true"
                    />
                  );
                }

                const isMultiStart = isFirstSlot && slotAppt.duration > 15;
                const isDragSource = dragState?.type === "move" && dragState.apt?.appointment_id === slotAppt?.appointment_id && isFirstSlot;
                const isDragTarget = !!dragState && !blocked && dragState.targetDay === day && dragState.targetTime === time && !(booked && slotAppointmentMap.get(slotKey)?.appointment_id !== dragState.apt?.appointment_id);
                const isResizePreview = dragState?.type === "resize" && dragState.apt?.appointment_id === slotAppt?.appointment_id && isFirstSlot;

                let displayNumSlots = isMultiStart ? Math.ceil(slotAppt.duration / 15) : 1;
                if (isResizePreview) {
                  const [ah, am] = slotAppt.startTime.split(":").map(Number);
                  const [th, tm] = dragState.targetTime.split(":").map(Number);
                  const previewDur = (th * 60 + tm + 15) - (ah * 60 + am);
                  displayNumSlots = Math.max(1, Math.ceil(previewDur / 15));
                }

                const slotClass = blocked ? "unavailable-invis"
                  : isDragTarget && dragState?.type === "move" ? "admin-drop-target"
                  : isHighlighted ? "admin-selected"
                  : isDragSource ? "admin-booked admin-booked-ghost"
                  : isMultiStart || isResizePreview ? "admin-booked-start"
                  : booked ? "admin-booked"
                  : "admin-available";

                const displayName = slotAppt?.name || "";
                const hhSize = slotAppt?.householdSize;
                return (
                  <div
                    key={day + time}
                    className={`slot ${slotClass}`}
                    style={{
                      position: "relative",
                      ...(displayNumSlots > 1 && { height: `${displayNumSlots * 28}px`, zIndex: 2 }),
                    }}
                    onClick={() => handleSlotClick(day, time)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${blocked ? "Unavailable" : booked ? "Booked" : "Available"} slot: ${day} at ${time}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSlotClick(day, time); }
                    }}
                  >
                    {isFirstSlot && displayName && (
                      <span className="slot-appt-label">
                        {displayName}{hhSize != null ? ` · ${hhSize}` : ""}
                      </span>
                    )}
                    {slotAppt && <StatusDot status={slotAppt.appointmentStatus} />}
                    {/* apt-resize-handle commented out — drag feature temporarily disabled */}
                  </div>
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
        onChangeBooking={(apt) => {
          setOpenInfoDialog(false);
          setRebookingAppointment(apt);
          setHighlightedSlot({ day: apt.day, time: apt.startTime });
          setSelectedSlot({
            day: apt.day,
            time: apt.startTime,
            weekStart,
            date: apt.date ? new Date(apt.date) : new Date(weekStart),
          });
          setShowBookingPanel(true);
        }}
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
              ? appointments.filter((a) => a.response_id !== rebookingAppointment.response_id)
              : appointments
          }
          blockedSlots={savedBlocked}
          rebookingAppointment={rebookingAppointment}
          isNewBooking={isNewBooking}
        />
      )}
    </div>
  );
}

export default AdminCalendar;
// Claude.ai was used to assist with formatting and runtime errors