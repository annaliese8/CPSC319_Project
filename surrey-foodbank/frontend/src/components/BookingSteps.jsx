import { useState, useEffect, useMemo } from "react";
export const STEPS = ["Personal Info", "Choose Time", "Review", "Thank You"];
import logo from "../styles/full-logo.png";
import { Box, Button, Stack, Typography } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import RegistrationFields from "./RegistrationFields";
import HouseholdMemberInfo, { AGE_GROUPS } from "./HouseholdMemberInfo";
import { addMinutesToTime } from "../utils/TimeUtils";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const DAYS_FULL = [
  "Monday","Tuesday","Wednesday","Thursday","Friday",
];
export const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const generateAllSlots = () => {
  const slots = [];
  for (let h = 0; h < 24; h++)
    for (let m = 0; m < 60; m += 15)
      slots.push(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
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

export const formatDateShort = (date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

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
    addMinutesToTime(slot.time, interval)
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
 * Fetch blocked + booked slots from the DB for a given week and build an
 * availability map keyed by "DayName-HH:MM".
 * Returns { availability, loading, error }
 */
export function useAvailability(weekStart) {
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    const weekDates = getWeekDates(weekStart);
    // We only show Mon-Fri, but fetch Sun-Sat to pick up any weekend unblocking
    const startStr = new Date(weekStart).toISOString().slice(0, 10);
    const endDate = new Date(weekStart);
    endDate.setDate(weekStart.getDate() + 6);
    const endStr = endDate.toISOString().slice(0, 10);

    fetch(`${BASE_URL}/api/appointments?start=${startStr}&end=${endStr}`)
      .then((r) => r.json())
      .then((result) => {
        if (cancelled) return;
        const rows = Array.isArray(result) ? result : result.data ?? [];

        // Start with everything available for Mon-Fri
        const map = {};
        DAYS_FULL.forEach((day) =>
          ALL_SLOTS_FULL.forEach((time) => {
            map[`${day}-${time}`] = true;
          })
        );

        // Track weekend dates that have at least one blocked slot (staff-managed weekends)
        // dateStr → Set of blocked normTimes
        const managedWeekendDates = new Map();
        const weekendBookedKeys = new Set();

        for (const row of rows) {
          if (!row.appointment_date || !row.appointment_time) continue;
          const dayName = new Date(
            `${row.appointment_date}T12:00:00`
          ).toLocaleDateString("en-US", { weekday: "long" });

          // Normalize DB time "09:00:00" → "09:00"
          const timeParts = row.appointment_time.split(":");
          const gridTime = `${timeParts[0]}:${timeParts[1]}`;
          const normTime = normalizeTime(gridTime);

          const isWeekend = dayName === "Saturday" || dayName === "Sunday";

          if (row.appointment_status === "blocked") {
            // Expand duration-based blocked rows (e.g. single 4-hour weekend block)
            const durStr = row.duration || "00:15:00";
            const [dh, dm] = durStr.split(":").map(Number);
            const durationMins = dh * 60 + dm;
            const startMins = parseInt(timeParts[0], 10) * 60 + parseInt(timeParts[1], 10);
            if (!isWeekend) {
              for (let offset = 0; offset < durationMins; offset += 15) {
                const slotMins = startMins + offset;
                const sh = Math.floor(slotMins / 60);
                const sm = slotMins % 60;
                const slotStr = `${sh.toString().padStart(2, "0")}:${sm.toString().padStart(2, "0")}`;
                const normSlot = normalizeTime(slotStr);
                if (map[`${dayName}-${normSlot}`] !== undefined) {
                  map[`${dayName}-${normSlot}`] = false;
                }
              }
            } else {
              if (!managedWeekendDates.has(row.appointment_date)) {
                managedWeekendDates.set(row.appointment_date, new Set());
              }
              for (let offset = 0; offset < durationMins; offset += 15) {
                const slotMins = startMins + offset;
                const sh = Math.floor(slotMins / 60);
                const sm = slotMins % 60;
                const slotStr = `${sh.toString().padStart(2, "0")}:${sm.toString().padStart(2, "0")}`;
                managedWeekendDates.get(row.appointment_date).add(normalizeTime(slotStr));
              }
            }
          } else if (
            row.appointment_status === "Booked" ||
            row.appointment_status === "booked"
          ) {
            if (!isWeekend) {
              if (map[`${dayName}-${normTime}`] !== undefined) {
                map[`${dayName}-${normTime}`] = false;
              }
            } else {
              weekendBookedKeys.add(`${dayName}-${normTime}`);
            }
          }
        }

        // For staff-managed weekend dates, any slot NOT blocked and NOT booked
        // in the 9am–1pm visible range is available for applicants to book.
        managedWeekendDates.forEach((blockedTimes, dateStr) => {
          const dayName = new Date(`${dateStr}T12:00:00`).toLocaleDateString(
            "en-US",
            { weekday: "long" }
          );
          for (let h = 9; h < 13; h++) {
            for (const m of ["00", "15", "30", "45"]) {
              const time = `${h.toString().padStart(2, "0")}:${m}`;
              const key = `${dayName}-${time}`;
              if (!blockedTimes.has(time) && !weekendBookedKeys.has(key)) {
                map[key] = true;
              }
            }
          }
        });

        setAvailability(map);
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

  return { availability, loading, error: fetchError };
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

export function StepChooseTime({
  form,
  selectedSlot,
  onSelectSlot,
  onClearSlot,
  onBack,
  onNext,
}) {
  const todayStart = getWeekStart(new Date());
  const [weekStart, setWeekStart] = useState(todayStart);
  const weekDates = getWeekDates(weekStart);

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
  // Keep old name as alias so all call sites work without change
  const isDayBeyondCutoff = isDayRestricted;

  // ← DB-driven availability instead of localStorage
  const { availability, loading: availLoading } = useAvailability(weekStart);

  const householdSize = form.household_size;
  const isLargeHousehold = householdSize >= 5;
  const bookingInterval = isLargeHousehold ? 30 : 15;
  const tinyBundles = form.applyingToTinyBundles === "yes" || form.tiny_bundles_program === true;
  // Tiny Bundles users: only Wednesday; non-TB users: all days except Wednesday
  const isDimmed = (day) => tinyBundles ? day !== "Wednesday" : day === "Wednesday";

  // Saturday date (weekStart is Monday, so +5 = Saturday)
  const saturdayDate = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + 5);
    return d;
  }, [weekStart]);

  // Show Saturday column only when staff has opened at least one slot on it
  const hasSaturday = useMemo(
    () => ALL_SLOTS_FULL.some((t) => availability[`Saturday-${t}`] === true),
    [availability]
  );

  // Show only 9am–1pm slots that are available on at least one displayed day
  const visibleSlots = useMemo(() => {
    return ALL_SLOTS_FULL.filter((t) => {
      const [h] = t.split(":").map(Number);
      if (h < 9 || h >= 13) return false;
      return (
        DAYS_FULL.some((day) => availability[`${day}-${t}`] === true) ||
        (hasSaturday && availability[`Saturday-${t}`] === true)
      );
    });
  }, [availability, hasSaturday]);

  const isCurrentWeek = weekStart.getTime() === todayStart.getTime();

  const shiftWeek = (delta) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta);
    setWeekStart(d);
  };

  const handleSlotClick = (day, time) => {
    if (isDimmed(day)) return;
    const d = new Date(weekStart);
    const dayOffset = day === "Saturday" ? 5 : DAYS_FULL.indexOf(day);
    d.setDate(weekStart.getDate() + dayOffset);
    if (isDayBeyondCutoff(d)) return;
    if (isLargeHousehold) {
      if (
        !availability[`${day}-${time}`] ||
        !availability[`${day}-${addMinutesToTime(time, 15)}`]
      )
        return;
    } else {
      if (!availability[`${day}-${time}`]) return;
    }
    const [hh, mm] = time.split(":").map(Number);
    d.setHours(hh, mm, 0, 0);
    onSelectSlot({ day, time, date: d, interval: bookingInterval });
  };

  const isHighlighted = (day, time) => {
    if (!selectedSlot || selectedSlot.day !== day) return false;
    if (isLargeHousehold)
      return (
        time === selectedSlot.time ||
        time === addMinutesToTime(selectedSlot.time, 15)
      );
    return time === selectedSlot.time;
  };

  if (availLoading) {
    return (
      <div className="ba-body" style={{ textAlign: "center", padding: 40 }}>
        Loading availability…
      </div>
    );
  }

  return (
    <>
      <div className="ba-body">
        <h2>Select a Date and Time for your appointment</h2>
        {tinyBundles && (
          <p
            style={{
              textAlign: "center",
              fontSize: 13,
              color: "var(--teal)",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Showing Wednesday appointments only (Tiny Bundles program)
          </p>
        )}
        {isLargeHousehold && (
          <p
            style={{
              textAlign: "center",
              fontSize: 13,
              color: "var(--teal)",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Your household size requires a 30-minute appointment.
          </p>
        )}
        <div className="ba-cal-header">
          <div style={{ display: "flex", gap: 8, minWidth: 170 }}>
            {!isCurrentWeek && (
              <button className="ba-cal-btn" onClick={() => shiftWeek(-7)}>
                ← Prev Week
              </button>
            )}
            {!isCurrentWeek && (
              <button
                className="ba-cal-btn today"
                onClick={() => setWeekStart(todayStart)}
              >
                Today
              </button>
            )}
          </div>
          <div className="ba-cal-range">
            {formatDateShort(weekDates[0])} – {formatDateShort(weekDates[4])}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              minWidth: 170,
            }}
          >
            {!isAtMaxWeek && (
              <button className="ba-cal-btn" onClick={() => shiftWeek(7)}>
                Next Week →
              </button>
            )}
          </div>
        </div>
        <div className="ba-cal-legend">
          <span>
            <div className="ba-legend-dot avail" /> Available
          </span>
          <span>
            <div className="ba-legend-dot booked" /> Unavailable
          </span>
        </div>
        <div className="ba-cal-grid">
          <table className="ba-cal-table" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: 54 }} />
              {DAYS_FULL.map((d) => (
                <col key={d} style={{ width: "calc((100% - 54px) / 5)" }} />
              ))}
              {hasSaturday && (
                <col key="Saturday" style={{ width: "calc((100% - 54px) / 5)" }} />
              )}
            </colgroup>
            <thead>
              <tr>
                <th className="ba-cal-th" />
                {DAYS_FULL.map((day, i) => {
                  const isPast = isDayBeyondCutoff(weekDates[i]);
                  return (
                    <th
                      key={day}
                      className="ba-cal-th"
                      style={{ opacity: isDimmed(day) || isPast ? 0.25 : 1 }}
                    >
                      {DAYS_SHORT[i]}
                      <br />
                      <span style={{ fontWeight: 400, color: "var(--gray-500)" }}>
                        {formatDateShort(weekDates[i])}
                      </span>
                    </th>
                  );
                })}
                {hasSaturday && (() => {
                  const isPast = isDayBeyondCutoff(saturdayDate);
                  return (
                    <th key="Saturday" className="ba-cal-th" style={{ opacity: isPast ? 0.25 : 1 }}>
                      Sat
                      <br />
                      <span style={{ fontWeight: 400, color: "var(--gray-500)" }}>
                        {formatDateShort(saturdayDate)}
                      </span>
                    </th>
                  );
                })()}
              </tr>
            </thead>
            <tbody>
              {visibleSlots.map((time, rowIdx) => (
                <tr key={time}>
                  <td className="ba-cal-td time-col">
                    {rowIdx % 2 === 0 ? formatTime(time) : ""}
                  </td>
                  {DAYS_FULL.map((day, i) => {
                    const dimmed = isDimmed(day) || isDayBeyondCutoff(weekDates[i]);
                    const avail = !!availability[`${day}-${time}`];
                    const selected = isHighlighted(day, time);
                    return (
                      <td
                        key={day}
                        className="ba-cal-td"
                        style={{
                          opacity: dimmed ? 0.15 : 1,
                          pointerEvents: dimmed ? "none" : "auto",
                        }}
                      >
                        <div
                          className={`ba-slot ${
                            selected
                              ? "selected"
                              : avail
                              ? "avail"
                              : "unavail"
                          }`}
                          onClick={() => handleSlotClick(day, time)}
                          tabIndex={0}
                          role="button"
                          aria-label={`${
                            selected
                              ? "Appointment selected"
                              : avail
                              ? "Available"
                              : "Unavailable"
                          } slot: ${day} at ${time}`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleSlotClick(day, time);
                            }
                          }}
                        />
                      </td>
                    );
                  })}
                  {hasSaturday && (() => {
                    const day = "Saturday";
                    const satPast = isDayBeyondCutoff(saturdayDate);
                    const avail = !!availability[`${day}-${time}`];
                    const selected = isHighlighted(day, time);
                    return (
                      <td key="Saturday" className="ba-cal-td"
                        style={{ opacity: satPast ? 0.15 : 1, pointerEvents: satPast ? "none" : "auto" }}>
                        <div
                          className={`ba-slot ${selected ? "selected" : avail ? "avail" : "unavail"}`}
                          onClick={() => handleSlotClick(day, time)}
                          tabIndex={0}
                          role="button"
                          aria-label={`${selected ? "Appointment selected" : avail ? "Available" : "Unavailable"} slot: Saturday at ${time}`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleSlotClick(day, time);
                            }
                          }}
                        />
                      </td>
                    );
                  })()}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                    addMinutesToTime(selectedSlot.time, bookingInterval)
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
      <div className="ba-footer">
        <button className="ba-btn ba-btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button
          className="ba-btn ba-btn-primary"
          onClick={onNext}
          disabled={!selectedSlot}
        >
          Next →
        </button>
      </div>
    </>
  );
}

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Please confirm that the following fields are correct</h2>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setIsEditing((v) => !v)}
            sx={{ ml: 2, textTransform: "none", fontWeight: 600, flexShrink: 0 }}
          >
            {isEditing ? "Done Editing" : "Edit Info"}
          </Button>
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

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
          Additional Household Members{" "}
          <span style={{ fontWeight: 400, color: "#66747F" }}>
            ({(form.householdMembers ?? []).length})
          </span>
        </Typography>
        {(form.householdMembers ?? []).length === 0 ? (
          <Typography variant="body2" sx={{ color: "#66747F", fontStyle: "italic", mb: 1 }}>
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
                  borderBottom: i < (form.householdMembers ?? []).length - 1 ? "1px solid var(--gray-200)" : "none",
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
                    {ageGroupConfig ? `${ageGroupConfig.label} (${ageGroupConfig.range})` : "—"}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div className="ba-review-grid" style={{ marginTop: 8 }}>
          <div className="ba-review-row">
            <div className="ba-review-label">Appointment</div>
            <div className="ba-review-val">{formatApptString(selectedSlot)}</div>
          </div>
        </div>
      </div>
      <TimerBar secondsLeft={secondsLeft} />
      <div
        className="ba-footer"
        style={{ justifyContent: "center", gap: 16, marginTop: 12 }}
      >
        <button className="ba-btn ba-btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button className="ba-btn ba-btn-confirm" onClick={onConfirm} disabled={isConfirming}>
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
  return (
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
          onClick={onNext}
          sx={{ fontWeight: "bold", textTransform: "none" }}
          endIcon={<NavigateNextIcon />}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}

export function StepSignupReview({ form, householdMembers, onBack, onConfirm }) {
  const fullName = [form.first_name, form.last_name]
    .filter(Boolean)
    .join(" ");
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