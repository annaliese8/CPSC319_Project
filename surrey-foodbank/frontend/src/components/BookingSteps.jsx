import { useState, useEffect } from "react";
export const STEPS = ["Personal Info", "Choose Time", "Review", "Thank You"];
import logo from "../styles/full-logo.png";
import {
  Autocomplete,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import RegistrationFields from "./RegistrationFields";
import { addMinutesToTime } from "../utils/TimeUtils";

// claude ai was used to write, debug and validate code for this entire page

export const DAYS_FULL = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];
export const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// Slots run 9:00 am – 3:00 pm in 15-minute increments
const generateAllSlots = () => {
  const slots = [];
  for (let h = 9; h < 15; h++)
    for (let m = 0; m < 60; m += 15)
      slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
  return slots;
};

export const ALL_SLOTS = generateAllSlots();
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
  return `${dateStr} · ${formatTime(slot.time)} – ${formatTime(addMinutesToTime(slot.time, interval))}`;
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
export const generateAvailability = (weekDates = []) => {
  const map = {};

  // Start with all slots available
  DAYS_FULL.forEach((day) =>
    ALL_SLOTS.forEach((time) => {
      map[`${day}-${time}`] = true;
    }),
  );

  // Block slots marked unavailable by staff
  try {
    const staffBlocked = JSON.parse(
      localStorage.getItem("staffBlockedSlots") || "[]",
    );
    staffBlocked.forEach(([day, time]) => {
      if (map[`${day}-${time}`] !== undefined) map[`${day}-${time}`] = false;
    });
  } catch {
    /* skip */
  }

  // Block slots already booked by applicants
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith("applicant_")) continue;
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (!data?.day || !data?.startTime || !data?.duration) continue;

      // If date is present, only block for the matching week
      if (data.date) {
        const bookedDateStr = new Date(data.date).toDateString();
        if (!weekDates.some((d) => d.toDateString() === bookedDateStr))
          continue;
      }

      const numSlots = data.duration / 15;
      for (let s = 0; s < numSlots; s++) {
        const blockedTime = addMinutesToTime(data.startTime, s * 15);
        map[`${data.day}-${blockedTime}`] = false;
      }
    } catch {
      /* skip */
    }
  }

  return map;
};

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

export function Stepper({ currentStep }) {
  return (
    <div className="ba-stepper">
      {STEPS.map((label, i) => {
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

// StepPersonalInfo

export function StepPersonalInfo({ form, onChange, onNext, errors }) {
  return (
    <Box className="ba-body">
      <Typography variant="h2">
        Please fill out the following questions
      </Typography>
      <RegistrationFields
        form={form}
        onChange={onChange}
        errors={errors}
        isDisabled={false}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button variant="contained" color="primary" onClick={onNext} sx={{ fontWeight: "bold" }} endIcon={<NavigateNextIcon />}>
          Next
        </Button>
      </Box>
    </Box>
  );
}

// Timer
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

// StepChooseTime
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

  const [weekAvailability, setWeekAvailability] = useState(() =>
    generateAvailability(getWeekDates(weekStart)),
  );
  useEffect(() => {
    setWeekAvailability(generateAvailability(getWeekDates(weekStart)));
  }, [weekStart]);

  const availability = weekAvailability;

  const isCurrentWeek = weekStart.getTime() === todayStart.getTime();

  const householdSize = Number(form.householdMembers) || 1;
  const isLargeHousehold = householdSize >= 5;
  const bookingInterval = isLargeHousehold ? 30 : 15;
  const tinyBundles = form.applyingToTinyBundles === "yes";
  const isDimmed = (day) => tinyBundles && day !== "Wednesday";

  const shiftWeek = (delta) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta);
    setWeekStart(d);
  };

  const handleSlotClick = (day, time) => {
    if (isDimmed(day)) return;
    if (isLargeHousehold) {
      if (
        !availability[`${day}-${time}`] ||
        !availability[`${day}-${addMinutesToTime(time, 15)}`]
      )
        return;
    } else {
      if (!availability[`${day}-${time}`]) return;
    }
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + DAYS_FULL.indexOf(day));
    const [hh, mm] = time.split(":").map(Number);
    d.setHours(hh, mm, 0, 0);
    onSelectSlot({ day, time, date: d, interval: bookingInterval });
  };

  const isHighlighted = (day, time) => {
    if (!selectedSlot || selectedSlot.day !== day) return false;
    if (isLargeHousehold)
      return (
        time === selectedSlot.time || time === addMinutesToTime(selectedSlot.time, 15)
      );
    return time === selectedSlot.time;
  };

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
            Your household size requires a 30-minute appointment. Selecting any
            slot will reserve that slot and the following 15 minutes.
          </p>
        )}

        {/* Week nav */}
        <div className="ba-cal-header">
          <div style={{ display: "flex", gap: 8, minWidth: 170 }}>
            <button className="ba-cal-btn" onClick={() => shiftWeek(-7)}>
              ← Prev Week
            </button>
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
            <button className="ba-cal-btn" onClick={() => shiftWeek(7)}>
              Next Week →
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="ba-cal-legend">
          <span>
            <div className="ba-legend-dot avail" /> Available
          </span>
          <span>
            <div className="ba-legend-dot booked" /> Unavailable
          </span>
        </div>

        {/* Grid */}
        <div className="ba-cal-grid">
          <table className="ba-cal-table" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: 54 }} />
              {DAYS_FULL.map((d) => (
                <col key={d} style={{ width: "calc((100% - 54px) / 5)" }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th className="ba-cal-th" />
                {DAYS_FULL.map((day, i) => (
                  <th
                    key={day}
                    className="ba-cal-th"
                    style={{ opacity: isDimmed(day) ? 0.25 : 1 }}
                  >
                    {DAYS_SHORT[i]}
                    <br />
                    <span style={{ fontWeight: 400, color: "var(--gray-500)" }}>
                      {formatDateShort(weekDates[i])}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_SLOTS.map((time, rowIdx) => (
                <tr key={time}>
                  <td className="ba-cal-td time-col">
                    {rowIdx % 2 === 0 ? formatTime(time) : ""}
                  </td>
                  {DAYS_FULL.map((day) => {
                    const dimmed = isDimmed(day);
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
                          className={`ba-slot ${selected ? "selected" : avail ? "avail" : "unavail"}`}
                          onClick={() => handleSlotClick(day, time)}
                          // Makes the calendar accessible with keyboard controls
                          tabIndex={0}
                          role="button"
                          aria-label={`${selected ? "Appointment selected" : avail ? "Available" : "Unavailable"} slot: ${day} at ${time}`}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selected pill / hint */}
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
                  {formatTime(addMinutesToTime(selectedSlot.time, bookingInterval))}
                  &nbsp;·&nbsp;
                  {selectedSlot.date.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
              <button className="ba-pill-clear" aria-label="Deselect appointment slot" onClick={onClearSlot}>
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
              color: "var(--gray-500)",
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
          style={{
            opacity: selectedSlot ? 1 : 0.5,
            cursor: selectedSlot ? "pointer" : "not-allowed",
          }}
        >
          Next →
        </button>
      </div>
    </>
  );
}

// StepReview
export function StepReview({
  form,
  selectedSlot,
  onBack,
  onConfirm,
  onTimerExpired,
}) {
  const householdSize = Number(form.householdMembers) || 1;
  const interval = householdSize >= 5 ? 30 : 15;

  const fullName =
    form.firstName || form.lastName
      ? [form.firstName, form.lastName].filter(Boolean).join(" ")
      : form.name || "";

  const fullAddress = form.streetAddress
    ? [form.streetAddress, form.city, form.province, form.postalCode]
      .filter(Boolean)
      .join(", ")
    : form.address || "";

  const rows = [
    { label: "Name", value: fullName },
    { label: "Address", value: fullAddress },
    { label: "Phone", value: form.phone },
    { label: "Status in Canada", value: form.statusInCanada },
    { label: "Household Size", value: form.householdMembers },
    {
      label: "Tiny Bundles?",
      value: form.applyingToTinyBundles === "yes" ? "Yes" : "No",
    },
    {
      label: "Preferred Language",
      value: form.language,
    },
    { label: "Appointment", value: formatApptString(selectedSlot) },
  ];

  // Timer
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimerExpired(); // parent clears slot and navigates back to calendar
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  return (
    <>
      <div className="ba-body">
        <h2>Please confirm that the following fields are correct</h2>
        <div className="ba-review-grid">
          {rows.map(({ label, value }) => (
            <div key={label} className="ba-review-row">
              <div className="ba-review-label">{label}</div>
              <div className="ba-review-val">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Timer shown on review so user knows how long they have to confirm */}
      <TimerBar secondsLeft={secondsLeft} />

      <div
        className="ba-footer"
        style={{ justifyContent: "center", gap: 16, marginTop: 12 }}
      >
        <button className="ba-btn ba-btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button className="ba-btn ba-btn-confirm" onClick={onConfirm}>
          Confirm
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