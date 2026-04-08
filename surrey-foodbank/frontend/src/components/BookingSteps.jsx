import { useState, useEffect, useMemo, useRef } from "react";
export const STEPS = ["Personal Info", "Choose Time", "Review", "Thank You"];
import logo from "../styles/full-logo.png";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import RegistrationFields from "./RegistrationFields";
import HouseholdMemberInfo, { AGE_GROUPS } from "./HouseholdMemberInfo";
import { addMinutesToTime } from "../utils/TimeUtils";

const BASE_URL = (
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

export const DAYS_FULL = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];
export const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// Map day name → offset from Monday (weekStart in StepChooseTime)
const DAY_OFFSET_FROM_MON = {
  Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5, Sunday: 6,
};

const WEEK_DAY_ORDER = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];

const DEFAULT_SCHEDULE = WEEK_DAY_ORDER.map((d) => ({
  day_of_week: d,
  open_time: "09:00",
  close_time: "13:00",
  is_active: d !== "Saturday" && d !== "Sunday",
}));

const generateAllSlots = () => {
  const slots = [];
  for (let h = 0; h < 24; h++)
    for (let m = 0; m < 60; m += 15)
      slots.push(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
      );
  return slots;
};

const ALL_SLOTS_FULL = generateAllSlots();

const normalizeTime = (t) => {
  const [h, m] = t.split(":").map(Number);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

export const ALL_SLOTS = ALL_SLOTS_FULL;
export const ROW_TIMES = ALL_SLOTS.filter((_, i) => i % 2 === 0);

export const formatTime = (time) => {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")}${ampm}`;
};

export const formatDateShort = (date) => {
  const month = date.toLocaleDateString("en-US", { month: "short" }) + ".";
  const day = date.getDate();
  return `${month} ${day}`;
};

export const formatApptString = (slot) => {
  if (!slot) return "";
  const interval = slot.interval ?? 15;
  const dateStr = slot.date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return `${dateStr} · ${formatTime(slot.time)} – ${formatTime(
    addMinutesToTime(slot.time, interval),
  )}`;
};

export const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getWeekDates = (weekStart) =>
  DAYS_FULL.map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

/**
 * Fetch schedule config + blocked/booked slots and build an availability map
 * keyed by "DayName-HH:MM". Active days and their open hours come from
 * schedule_config; inactive days are not added to the map at all.
 * Returns { availability, scheduleConfig, loading, error }
 */
export function useAvailability(weekStart) {
  const [availability, setAvailability] = useState({});
  const [scheduleConfig, setScheduleConfig] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    const startStr = new Date(weekStart).toISOString().slice(0, 10);
    const endDate = new Date(weekStart);
    endDate.setDate(weekStart.getDate() + 6);
    const endStr = endDate.toISOString().slice(0, 10);

    Promise.all([
      fetch(`${BASE_URL}/api/appointments/schedule-config`)
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch(`${BASE_URL}/api/appointments?start=${startStr}&end=${endStr}`)
        .then((r) => r.json()),
    ])
      .then(([configData, apptData]) => {
        if (cancelled) return;

        const configRows = Array.isArray(configData) && configData.length > 0
          ? configData
          : DEFAULT_SCHEDULE;
        const rows = Array.isArray(apptData) ? apptData : apptData.data ?? [];

        // Build day → config map
        const schedMap = {};
        configRows.forEach((c) => { schedMap[c.day_of_week] = c; });

        // Initialize availability map: only slots within each active day's open hours
        const map = {};
        for (let i = 0; i < 7; i++) {
          const d = new Date(weekStart);
          d.setDate(weekStart.getDate() + i);
          const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
          const cfg = schedMap[dayName];
          if (!cfg || !cfg.is_active) continue;

          const [oh, om] = cfg.open_time.split(":").map(Number);
          const [ch, cm] = cfg.close_time.split(":").map(Number);
          const openMins = oh * 60 + om;
          const closeMins = ch * 60 + cm;

          for (let mins = openMins; mins < closeMins; mins += 15) {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            const time = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
            map[`${dayName}-${time}`] = true;
          }
        }

        // Mark blocked / booked / held slots as unavailable
        for (const row of rows) {
          if (!row.appointment_date || !row.appointment_time) continue;
          const dayName = new Date(
            `${row.appointment_date}T12:00:00`,
          ).toLocaleDateString("en-US", { weekday: "long" });

          const timeParts = row.appointment_time.split(":");
          const status = (row.appointment_status || "").toLowerCase();
          const isBlockedOrBooked =
            status === "blocked" ||
            status === "booked" ||
            status === "held" ||
            status === "checked in" ||
            status === "no show";

          if (!isBlockedOrBooked) continue;

          const durStr = row.duration || "00:15:00";
          const [dh, dm] = durStr.split(":").map(Number);
          const durationMins = dh * 60 + dm;
          const startMins =
            parseInt(timeParts[0], 10) * 60 + parseInt(timeParts[1], 10);

          for (let offset = 0; offset < durationMins; offset += 15) {
            const slotMins = startMins + offset;
            const sh = Math.floor(slotMins / 60);
            const sm = slotMins % 60;
            const slotStr = `${sh.toString().padStart(2, "0")}:${sm.toString().padStart(2, "0")}`;
            const normSlot = normalizeTime(slotStr);
            const key = `${dayName}-${normSlot}`;
            if (map[key] !== undefined) map[key] = false;
          }
        }


        setAvailability(map);
        setScheduleConfig(configRows);
        setLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setFetchError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [weekStart]);

  return { availability, scheduleConfig, loading, error: fetchError };
}

// Keep generateAvailability exported for any legacy callers but make it a
// no-op stub — callers should migrate to useAvailability.
export const generateAvailability = () => ({});

export function TopNav({ onLogout }) {
  return (
    <nav className="ba-topnav">
      <Stack direction="row" spacing={1.25} alignItems="center">
        <a href="https://surreyfoodbank.org/">
          <img src={logo} alt="Surrey Food Bank Logo" style={{ height: 40 }} />
        </a>
        <Typography variant="h6" sx={{ ml: 2 }}>
          Book an Appointment
        </Typography>
      </Stack>
      <Button
        onClick={onLogout}
        color="secondary"
        variant="text"
        sx={{ fontSize: 14, fontWeight: 800, textTransform: "none" }}
      >
        Log Out
      </Button>
    </nav>
  );
}

export const isSlotAvailable = (availability, day, time, interval = 15) =>
  interval === 30
    ? !!availability[`${day}-${time}`] &&
    !!availability[`${day}-${addMinutesToTime(time, 15)}`] &&
    !!availability[`${day}-${addMinutesToTime(time, 30)}`] &&
    !!availability[`${day}-${addMinutesToTime(time, 45)}`]
    : !!availability[`${day}-${time}`] &&
    !!availability[`${day}-${addMinutesToTime(time, 15)}`];

export function Stepper({ currentStep, steps = STEPS }) {
  return (
    <div className="ba-stepper">
      {steps.map((label, i) => {
        const status =
          i < currentStep ? "done" : i === currentStep ? "active" : "pending";
        return (
          <div key={label} className={`ba-step ${status}`}>
            <div className="ba-step-circle">
              {status === "done" ? "✓" : i + 1}
            </div>
            <div className="ba-step-label">{label}</div>
          </div>
        );
      })}
    </div>
  );
}

export function StepPersonalInfo({
  form,
  onChange,
  onNext,
  errors,
  isSubmitting = false,
}) {
  return (
    <Box className="ba-body">
      <Typography variant="h2">
        Please fill out the following questions
      </Typography>
      <RegistrationFields
        form={form}
        onChange={onChange}
        errors={errors}
        isDisabled={isSubmitting}
        isStaffPage={false}
        isBookingSteps={true}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onNext}
          disabled={isSubmitting}
          sx={{ fontWeight: "bold" }}
          endIcon={<NavigateNextIcon />}
        >
          {isSubmitting ? "Saving..." : "Next"}
        </Button>
      </Box>
    </Box>
  );
}

const TIMER_SECONDS = 5 * 60;

function TimerBar({ secondsLeft }) {
  const timerPct = Math.max(0, (secondsLeft / TIMER_SECONDS) * 100);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  return (
    <div className="ba-timer-wrap" style={{ marginTop: 16 }}>
      <div
        className="ba-timer-label"
        style={{ color: secondsLeft < 60 ? "var(--red)" : "var(--gray-700)" }}
      >
        Time remaining to confirm: {mm}:{ss}
      </div>
      <div className="ba-timer-bar-bg">
        <div
          className="ba-timer-bar-fill"
          style={{
            width: `${timerPct}%`,
            background: secondsLeft < 60 ? "var(--red)" : "var(--teal)",
            transition: "width 1s linear, background 0.3s",
          }}
        />
      </div>
    </div>
  );
}

/**
 * An interactive calendar showing appointment slots for the next two weeks
 * that is displayed when an applicant tries to book an appointment.
 */
export function StepChooseTime({
  form,
  selectedSlot,
  onSelectSlot,
  onClearSlot,
  onBack,
  onNext,
  existingSlot = null,
}) {
  const todayStart = getWeekStart(new Date());
  const [weekStart, setWeekStart] = useState(todayStart);

  // All 7 dates starting from Monday of this week
  const allWeekDates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
      }),
    [weekStart]
  );
  // Keep weekDates (Mon-Fri) for legacy references; use allWeekDates[6] for Sun end of range
  const weekDates = allWeekDates.slice(0, 5);

  // Applicants can only book up to 14 days in advance
  const cutoffDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 14);
    return d;
  }, []);
  const isAtMaxWeek = useMemo(() => {
    const nextWeek = new Date(weekStart);
    nextWeek.setDate(weekStart.getDate() + 7);
    return nextWeek > cutoffDate;
  }, [weekStart, cutoffDate]);
  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  // Restrict days that are in the past OR beyond the 2-week cutoff
  const isDayRestricted = (date) => date < todayDate || date > cutoffDate;
  const isDayBeyondCutoff = isDayRestricted;

  // DB-driven availability + schedule config
  const { availability, scheduleConfig, loading: availLoading } = useAvailability(weekStart);

  // Active day configs sorted Mon → Sun
  const activeDayConfigs = useMemo(() => {
    const base = scheduleConfig.length > 0 ? scheduleConfig : DEFAULT_SCHEDULE;
    return base
      .filter((c) => c.is_active)
      .sort(
        (a, b) =>
          (DAY_OFFSET_FROM_MON[a.day_of_week] ?? 7) -
          (DAY_OFFSET_FROM_MON[b.day_of_week] ?? 7)
      );
  }, [scheduleConfig]);

  // Track whether the user manually navigated (Today / Prev / Next).
  // Auto-advance is suppressed after manual navigation so Today actually shows today.
  const userNavigatedRef = useRef(false);

  // Auto-advance to first week that has bookable slots (initial load only)
  useEffect(() => {
    if (availLoading) return;
    if (userNavigatedRef.current) return;
    const hasBookable = activeDayConfigs.some((cfg) => {
      const offset = DAY_OFFSET_FROM_MON[cfg.day_of_week] ?? 0;
      const date = allWeekDates[offset];
      if (!date || isDayRestricted(date)) return false;
      return ALL_SLOTS_FULL.some((t) => availability[`${cfg.day_of_week}-${t}`] === true);
    });
    if (!hasBookable && !isAtMaxWeek) {
      setWeekStart((prev) => {
        const next = new Date(prev);
        next.setDate(prev.getDate() + 7);
        return next;
      });
    }
  }, [availLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const householdSize = form.household_size;
  const isLargeHousehold = householdSize >= 5;
  const bookingInterval = isLargeHousehold ? 30 : 15;
  const tinyBundles = form.applyingToTinyBundles === "yes" || form.tiny_bundles_program === true;
  const isDimmed = (day) => (tinyBundles ? day !== "Wednesday" : day === "Wednesday");

  // Show only slots available on at least one active day
  const visibleSlots = useMemo(
    () =>
      ALL_SLOTS_FULL.filter((t) =>
        activeDayConfigs.some((cfg) => availability[`${cfg.day_of_week}-${t}`] === true)
      ),
    [activeDayConfigs, availability]
  );

  const isCurrentWeek = weekStart.getTime() === todayStart.getTime();

  const shiftWeek = (delta) => {
    userNavigatedRef.current = true;
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta);
    setWeekStart(d);
  };

  const toDateStr = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const handleSlotClick = (day, time) => {
    if (isDimmed(day)) return;
    const offset = DAY_OFFSET_FROM_MON[day] ?? 0;
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + offset);
    if (isDayBeyondCutoff(d)) return;
    const slotOk = (t) => !!availability[`${day}-${t}`] || isExistingAppt(day, t, d);
    if (isLargeHousehold) {
      if (!slotOk(time) || !slotOk(addMinutesToTime(time, 15))) return;
    } else {
      if (!slotOk(time)) return;
    }
    const [hh, mm] = time.split(":").map(Number);
    d.setHours(hh, mm, 0, 0);
    onSelectSlot({ day, time, date: d, interval: bookingInterval });
  };

  const isHighlighted = (day, time, weekDate) => {
    if (!selectedSlot || selectedSlot.day !== day) return false;
    if (toDateStr(weekDate) !== toDateStr(selectedSlot.date)) return false;
    if (isLargeHousehold)
      return time === selectedSlot.time || time === addMinutesToTime(selectedSlot.time, 15);
    return time === selectedSlot.time;
  };

  const isExistingAppt = (day, time, weekDate) => {
    if (!existingSlot) return false;
    if (toDateStr(weekDate) !== existingSlot.dateStr) return false;
    if (existingSlot.duration > 15)
      return (
        time === existingSlot.time ||
        time === addMinutesToTime(existingSlot.time, 15)
      );
    return time === existingSlot.time;
  };

  return (
    <>
      <div className="ba-body">
        <h2>Select a Date and Time for Your Appointment</h2>
        {tinyBundles && (
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--teal)", fontWeight: 600 }}>
            We offer Tiny Bundles appointments on Wednesdays.
          </p>
        )}
        {!tinyBundles && (
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--teal)", fontWeight: 600 }}>
            Wednesday slots are reserved for the Tiny Bundles program and are not available for general booking.
          </p>
        )}
        {isLargeHousehold && (
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--teal)", fontWeight: 600 }}>
            Your household size requires a 30-minute appointment.
          </p>
        )}
        <div className="ba-cal-range">
          {formatDateShort(weekDates[0])} – {formatDateShort(weekDates[4])}
        </div>
        {/* Buttons for navigating between weeks */}
        <div className="ba-cal-header">
          <div className="ba-cal-nav">
            <button
              className="ba-cal-btn"
              onClick={() => { userNavigatedRef.current = true; shiftWeek(-7); }}
              style={{ visibility: isCurrentWeek ? "hidden" : "visible" }}
            >
              Prev Week
            </button>
            <button
              className="ba-cal-btn today"
              onClick={() => { userNavigatedRef.current = true; setWeekStart(todayStart); }}
              style={{ visibility: isCurrentWeek ? "hidden" : "visible" }}
            >
              Today
            </button>

            <button
              className="ba-cal-btn"
              onClick={() => { userNavigatedRef.current = true; shiftWeek(7); }}
              style={{ visibility: isAtMaxWeek ? "hidden" : "visible" }}
            >
              Next Week
            </button>
          </div>
        </div>
        {/* Legend for colours on the calendar */}
        <div className="ba-cal-legend">
          <span><div className="ba-legend-dot avail" /> Available</span>
          <span><div className="ba-legend-dot booked" /> Unavailable</span>
          {existingSlot && (
            <span>
              <div
                className="ba-legend-dot"
                style={{
                  background: "#f24c62",
                }}
              />{" "}
              Old Appointment
            </span>
          )}
        </div>
        {/* The calendar! */}
        <div className="ba-cal-grid">
          <table className="ba-cal-table" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: 54 }} />
              {WEEK_DAY_ORDER.map((day) => (
                <col key={day} style={{ width: `calc((100% - 54px) / 7)` }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th className="ba-cal-th" />
                {WEEK_DAY_ORDER.map((day) => {
                  const isActive = activeDayConfigs.some((c) => c.day_of_week === day);
                  const offset = DAY_OFFSET_FROM_MON[day] ?? 0;
                  const date = allWeekDates[offset];
                  const isPast = isDayBeyondCutoff(date);
                  const shortName = day.slice(0, 3);
                  return (
                    <th
                      key={day}
                      className="ba-cal-th"
                    >
                      {shortName}
                      <br />
                      <span style={{ fontWeight: 400, }}>
                        {formatDateShort(date)}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {visibleSlots.map((time, rowIdx) => (
                <tr key={time}>
                  <td className="ba-cal-td time-col">
                    {rowIdx % 2 === 0 ? formatTime(time) : "\u00A0"}
                  </td>
                  {WEEK_DAY_ORDER.map((day) => {
                    const isActive = activeDayConfigs.some((c) => c.day_of_week === day);
                    const offset = DAY_OFFSET_FROM_MON[day] ?? 0;
                    const date = allWeekDates[offset];
                    const restricted = !isActive || isDimmed(day) || isDayBeyondCutoff(date);
                    const avail = !!availability[`${day}-${time}`];
                    const selected = isHighlighted(day, time, date);
                    const existing = !selected && isExistingAppt(day, time, date);
                    const showSlot = !restricted && (selected || existing || avail);
                    return (
                      <td
                        key={day}
                        className="ba-cal-td"
                        style={{ pointerEvents: showSlot ? "auto" : "none" }}
                      >
                        {showSlot ? (
                          <div
                            className={`ba-slot ${selected ? "selected" : existing ? "existing" : "avail"
                              }`}
                            style={{
                              visibility: availLoading ? "hidden" : "visible",
                              opacity: availLoading ? 0 : 1,
                              transition: "opacity 3s",
                            }}
                            onClick={() => handleSlotClick(day, time)}
                            tabIndex={0}
                            role="button"
                            aria-label={`${selected ? "Appointment selected" : existing ? "Current appointment" : "Available"
                              } slot: ${day} at ${time}`}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleSlotClick(day, time);
                              }
                            }}
                          />
                        ) : (
                          "\u00A0"
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Information about the selected slot that is shows underneath the calendar */}
        {selectedSlot ? (
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 14 }}
          >
            <div className="ba-selected-pill">
              <div>
                <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>
                  Selected:
                </div>
                <div className="ba-pill-time">
                  {formatTime(selectedSlot.time)} –{" "}
                  {formatTime(
                    addMinutesToTime(selectedSlot.time, bookingInterval),
                  )}
                  &nbsp;·&nbsp;
                  {selectedSlot.date.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
              <button
                className="ba-pill-clear"
                aria-label="Deselect appointment slot"
                onClick={onClearSlot}
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <p
            style={{
              textAlign: "center",
              marginTop: 10,
              fontSize: 13,
              color: "#6B7785",
            }}
          >
            Click an available slot to select your appointment time.
          </p>
        )}
      </div>
      {/* Buttons for navigating between steps */}
      <div className="ba-footer">
        <button className="ba-btn ba-btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button
          className="ba-btn ba-btn-primary"
          onClick={onNext}
          disabled={!selectedSlot || !onNext}
        >
          Next →
        </button>
      </div>
    </>
  );
}

/**
 * Component displayed when an applicant completes the steps of booking an appointment
 * and is reviewing their information before confirming
 */
export function StepReview({
  form,
  selectedSlot,
  onBack,
  onConfirm,
  onTimerExpired,
  onChange,
  errors,
  isConfirming = false,
}) {
  const [isEditing, setIsEditing] = useState(false);

  // Auto-open edit mode when field errors arrive so the user sees them highlighted
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      setIsEditing(true);
    }
  }, [errors]);

  const full_name = [form.first_name, form.last_name]
    .filter(Boolean)
    .join(" ");
  const full_address = [
    form.street_addr,
    form.city,
    "British Columbia",
    form.postal_code,
  ]
    .filter(Boolean)
    .join(", ");
  const infoRows = [
    { label: "Name", value: full_name },
    { label: "Address", value: full_address },
    { label: "Phone", value: form.phone },
    { label: "Status in Canada", value: form.status_in_canada },
    {
      label: "Tiny Bundles?",
      value: form.tiny_bundles_program === "yes" ? "Yes" : "No",
    },
    { label: "Preferred Language", value: form.language },
  ];
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimerExpired();
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);
  return (
    <>
      <div className="ba-body">
        <div
          style={{
            marginBottom: 8,
          }}
        >
          <h2>Please confirm that the following information is correct</h2>
          {/* Review appointment section*/}
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Appointment Details
          </Typography>
          <div className="ba-review-grid" style={{ marginTop: 8 }}>
            <div className="ba-review-row">
              <div className="ba-review-label">Appointment</div>
              <div className="ba-review-val">
                {formatApptString(selectedSlot)}
              </div>
            </div>
          </div>
          {/* Review registration form section*/}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Registration Form Responses
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setIsEditing((v) => !v)}
              sx={{
                ml: 2,
                textTransform: "none",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {isEditing ? "Done Editing" : "Edit Info"}
            </Button>
          </div>
        </div>
        {isEditing ? (
          <RegistrationFields
            form={form}
            onChange={onChange}
            errors={errors || {}}
            isDisabled={false}
            isStaffPage={false}
          />
        ) : (
          <div className="ba-review-grid">
            {infoRows.map(({ label, value }) => (
              <div key={label} className="ba-review-row">
                <div className="ba-review-label">{label}</div>
                <div className="ba-review-val">{value}</div>
              </div>
            ))}
          </div>
        )}
        {/* Review additional household members section*/}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
          Additional Household Members{" "}
          <span style={{ fontWeight: 400, color: "#66747F" }}>
            ({(form.householdMembers ?? []).length})
          </span>
        </Typography>
        {(form.householdMembers ?? []).length === 0 ? (
          <Typography
            variant="body2"
            sx={{ color: "#66747F", fontStyle: "italic", mb: 1 }}
          >
            No additional household members added.
          </Typography>
        ) : (
          (form.householdMembers ?? []).map((m, i) => {
            const ageGroupConfig = AGE_GROUPS.find((g) => g.key === m.ageGroup);
            return (
              <div
                key={m.id ?? i}
                className="ba-review-grid"
                style={{
                  marginBottom: 10,
                  borderBottom:
                    i < (form.householdMembers ?? []).length - 1
                      ? "1px solid var(--gray-200)"
                      : "none",
                }}
              >
                <div className="ba-review-row">
                  <div className="ba-review-label">Name</div>
                  <div className="ba-review-val">
                    {[m.firstName, m.lastName].filter(Boolean).join(" ")}
                  </div>
                </div>
                <div className="ba-review-row">
                  <div className="ba-review-label">Age Group</div>
                  <div className="ba-review-val">
                    {ageGroupConfig
                      ? `${ageGroupConfig.label} (${ageGroupConfig.range})`
                      : "—"}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* Timer */}
      <TimerBar secondsLeft={secondsLeft} />
      {/* Buttons to go back or proceed */}
      <div
        className="ba-footer"
        style={{ justifyContent: "center", gap: 16, marginTop: 12 }}
      >
        <button className="ba-btn ba-btn-secondary" onClick={onBack} disabled={!onBack}>
          ← Back
        </button>
        <button
          className="ba-btn ba-btn-confirm"
          onClick={onConfirm}
          disabled={isConfirming}
        >
          {isConfirming ? "Saving..." : "Confirm Booking"}
        </button>
      </div>
    </>
  );
}

export function StepThankYou({ selectedSlot, onDone }) {
  const interval = selectedSlot?.interval ?? 15;
  return (
    <>
      <div className="ba-body">
        <div className="ba-thankyou">
          <div className="ba-thankyou-icon">✓</div>
          <h2>Thank you!</h2>
          <p>Your appointment has been successfully booked for:</p>
          <p className="appt-time" style={{ textAlign: "center" }}>
            {formatApptString(selectedSlot, interval)}
          </p>
          <p style={{ marginTop: 20, fontSize: 13 }}>
            Please remember to bring valid government-issued ID for each adult
            in your household containing proof of address (e.g. driver's
            license, BCID) for your appointment.
          </p>
          <p style={{ marginTop: 8, fontSize: 13 }}>
            If you need to reschedule or cancel, you can do so through your
            online account or by calling us at <strong>(604) 581-5443</strong>.
          </p>
        </div>
      </div>
      <div className="ba-footer" style={{ justifyContent: "flex-end" }}>
        <button className="ba-btn ba-btn-done" onClick={onDone}>
          Done
        </button>
      </div>
    </>
  );
}

export const SIGNUP_STEPS = ["Personal Info", "Household Members", "Review"];
export const BOOKING_STEPS = ["Choose Time", "Review", "Thank You"];

export function StepHouseholdMembers({
  householdMembers,
  onChange,
  onBack,
  onNext,
  errors,
}) {
  const [showInfantPrompt, setShowInfantPrompt] = useState(false);
  const [promptAcknowledged, setPromptAcknowledged] = useState(false);

  const membersSignature = useMemo(
    () => JSON.stringify(householdMembers || []),
    [householdMembers],
  );

  const hasInfantMember = useMemo(
    () =>
      (householdMembers || []).some((member) => member?.ageGroup === "infant"),
    [householdMembers],
  );

  useEffect(() => {
    setPromptAcknowledged(false);
  }, [membersSignature]);

  const handleNext = () => {
    if (hasInfantMember && !promptAcknowledged) {
      setShowInfantPrompt(true);
      return;
    }
    onNext();
  };

  const handleContinueAfterPrompt = () => {
    setPromptAcknowledged(true);
    setShowInfantPrompt(false);
    onNext();
  };

  return (
    <>
      <Box className="ba-body">
        <Typography variant="h2">Additional Household Members</Typography>
        <HouseholdMemberInfo
          householdMembers={householdMembers}
          onChange={onChange}
          errors={errors}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Button
            variant="outlined"
            onClick={onBack}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            ← Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            sx={{ fontWeight: "bold", textTransform: "none" }}
            endIcon={<NavigateNextIcon />}
          >
            Next
          </Button>
        </Box>
      </Box>
      <Dialog
        open={showInfantPrompt}
        onClose={() => setShowInfantPrompt(false)}
        aria-labelledby="tiny-bundles-info-title"
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: "2px solid #63C5DA",
            bgcolor: "#F4FCFF",
          },
        }}
      >
        <DialogTitle id="tiny-bundles-info-title">
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0B5F7A" }}>
            Tiny Bundles Program Information
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            We noticed you added an infant (0-12 months) to your household.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            If your household has someone currently pregnant or a child under 12
            months, you may be eligible for our Tiny Bundles program.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You can update your Tiny Bundles selection in the registration
            details if needed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button
            variant="contained"
            onClick={handleContinueAfterPrompt}
            sx={{ bgcolor: "#0B5F7A", "&:hover": { bgcolor: "#084B60" } }}
          >
            Okay
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function StepSignupReview({
  form,
  householdMembers,
  onBack,
  onConfirm,
}) {
  const fullName = [form.first_name, form.last_name].filter(Boolean).join(" ");
  const fullAddress = [
    form.street_addr,
    form.city,
    form.province,
    form.postal_code,
  ]
    .filter(Boolean)
    .join(", ");

  const personalRows = [
    { label: "Name", value: fullName },
    { label: "Address", value: fullAddress },
    { label: "Phone", value: form.phone },
    { label: "Status in Canada", value: form.status_in_canada },
    {
      label: "Tiny Bundles?",
      value:
        form.tiny_bundles_program === true
          ? "Yes"
          : form.tiny_bundles_program === false
            ? "No"
            : "",
    },
    { label: "Preferred Language", value: form.language },
  ];

  return (
    <>
      <div className="ba-body">
        <h2>Please confirm your information</h2>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Personal Information
        </Typography>
        <div className="ba-review-grid">
          {personalRows.map(({ label, value }) => (
            <div key={label} className="ba-review-row">
              <div className="ba-review-label">{label}</div>
              <div className="ba-review-val">{value}</div>
            </div>
          ))}
        </div>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>
          Additional Household Members{" "}
          <span style={{ fontWeight: 400, color: "#66747F" }}>
            ({householdMembers.length})
          </span>
        </Typography>

        {householdMembers.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ color: "#66747F", fontStyle: "italic" }}
          >
            No additional household members added.
          </Typography>
        ) : (
          householdMembers.map((m, i) => {
            const ageGroupConfig = AGE_GROUPS.find((g) => g.key === m.ageGroup);
            return (
              <div
                key={m.id}
                className="ba-review-grid"
                style={{
                  marginBottom: 10,
                  borderBottom:
                    i < householdMembers.length
                      ? "1px solid var(--gray-200)"
                      : "none",
                }}
              >
                <div className="ba-review-row">
                  <div className="ba-review-label">Name</div>
                  <div className="ba-review-val">
                    {[m.firstName, m.lastName].filter(Boolean).join(" ")}
                  </div>
                </div>
                <div className="ba-review-row">
                  <div className="ba-review-label">Age Group</div>
                  <div className="ba-review-val">
                    {ageGroupConfig
                      ? `${ageGroupConfig.label} (${ageGroupConfig.range})`
                      : "—"}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div
        className="ba-footer"
        style={{ justifyContent: "center", gap: 16, marginTop: 12 }}
      >
        <button className="ba-btn ba-btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button className="ba-btn ba-btn-confirm" onClick={onConfirm}>
          Confirm Registration
        </button>
      </div>
    </>
  );
}
