import { useState, useEffect } from "react";
export const STEPS = ["Personal Info", "Choose Time", "Review", "Thank You"];
import logo from "../styles/full-logo.png";
import {
  Autocomplete,
  Box,
  Button,
  Collapse,
  Stack,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import EscalatorWarningIcon from "@mui/icons-material/EscalatorWarning";
import PersonIcon from "@mui/icons-material/Person";
import RegistrationFields from "./RegistrationFields";
import { addMinutesToTime } from "../utils/TimeUtils";

// claude ai was used to write, debug and validate code for this entire page

export const DAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri"];

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
    weekday: "long", month: "long", day: "numeric", year: "numeric",
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
  DAYS_FULL.forEach((day) => ALL_SLOTS.forEach((time) => { map[`${day}-${time}`] = true; }));
  try {
    const staffBlocked = JSON.parse(localStorage.getItem("staffBlockedSlots") || "[]");
    staffBlocked.forEach(([day, time]) => {
      if (map[`${day}-${time}`] !== undefined) map[`${day}-${time}`] = false;
    });
  } catch { /* skip */ }
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith("applicant_")) continue;
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (!data?.day || !data?.startTime || !data?.duration) continue;
      if (data.date) {
        const bookedDateStr = new Date(data.date).toDateString();
        if (!weekDates.some((d) => d.toDateString() === bookedDateStr)) continue;
      }
      const numSlots = data.duration / 15;
      for (let s = 0; s < numSlots; s++) {
        map[`${data.day}-${addMinutesToTime(data.startTime, s * 15)}`] = false;
      }
    } catch { /* skip */ }
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
        <Typography variant="h6" sx={{ ml: 2 }}>Book an Appointment</Typography>
      </Stack>
      <Button onClick={onLogout} color="secondary" variant="text" sx={{ fontSize: 14, fontWeight: 800, textTransform: "none" }}>
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

// defaults to STEPS so existing callers don't break
export function Stepper({ currentStep, steps = STEPS }) {
  return (
    <div className="ba-stepper">
      {steps.map((label, i) => {
        const status = i < currentStep ? "done" : i === currentStep ? "active" : "pending";
        return (
          <div key={label} className={`ba-step ${status}`}>
            <div className="ba-step-circle">{status === "done" ? "✓" : i + 1}</div>
            <div className="ba-step-label">{label}</div>
          </div>
        );
      })}
    </div>
  );
}

export function StepPersonalInfo({ form, onChange, onNext, errors }) {
  return (
    <Box className="ba-body">
      <Typography variant="h2">Please fill out the following questions</Typography>
      <RegistrationFields form={form} onChange={onChange} errors={errors} isDisabled={false} />
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button variant="contained" color="primary" onClick={onNext} sx={{ fontWeight: "bold" }} endIcon={<NavigateNextIcon />}>
          Next
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
      <div className="ba-timer-label" style={{ color: secondsLeft < 60 ? "var(--red)" : "var(--gray-700)" }}>
        Time remaining to confirm: {mm}:{ss}
      </div>
      <div className="ba-timer-bar-bg">
        <div className="ba-timer-bar-fill" style={{
          width: `${timerPct}%`,
          background: secondsLeft < 60 ? "var(--red)" : "var(--teal)",
          transition: "width 1s linear, background 0.3s",
        }} />
      </div>
    </div>
  );
}

export function StepChooseTime({ form, selectedSlot, onSelectSlot, onClearSlot, onBack, onNext }) {
  const todayStart = getWeekStart(new Date());
  const [weekStart, setWeekStart] = useState(todayStart);
  const weekDates = getWeekDates(weekStart);
  const [weekAvailability, setWeekAvailability] = useState(() => generateAvailability(getWeekDates(weekStart)));
  useEffect(() => { setWeekAvailability(generateAvailability(getWeekDates(weekStart))); }, [weekStart]);

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
      if (!availability[`${day}-${time}`] || !availability[`${day}-${addMinutesToTime(time, 15)}`]) return;
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
      return time === selectedSlot.time || time === addMinutesToTime(selectedSlot.time, 15);
    return time === selectedSlot.time;
  };

  return (
    <>
      <div className="ba-body">
        <h2>Select a Date and Time for your appointment</h2>
        {tinyBundles && <p style={{ textAlign: "center", fontSize: 13, color: "var(--teal)", marginBottom: 12, fontWeight: 600 }}>Showing Wednesday appointments only (Tiny Bundles program)</p>}
        {isLargeHousehold && <p style={{ textAlign: "center", fontSize: 13, color: "var(--teal)", marginBottom: 12, fontWeight: 600 }}>Your household size requires a 30-minute appointment. Selecting any slot will reserve that slot and the following 15 minutes.</p>}
        <div className="ba-cal-header">
          <div style={{ display: "flex", gap: 8, minWidth: 170 }}>
            <button className="ba-cal-btn" onClick={() => shiftWeek(-7)}>← Prev Week</button>
            {!isCurrentWeek && <button className="ba-cal-btn today" onClick={() => setWeekStart(todayStart)}>Today</button>}
          </div>
          <div className="ba-cal-range">{formatDateShort(weekDates[0])} – {formatDateShort(weekDates[4])}</div>
          <div style={{ display: "flex", justifyContent: "flex-end", minWidth: 170 }}>
            <button className="ba-cal-btn" onClick={() => shiftWeek(7)}>Next Week →</button>
          </div>
        </div>
        <div className="ba-cal-legend">
          <span><div className="ba-legend-dot avail" /> Available</span>
          <span><div className="ba-legend-dot booked" /> Unavailable</span>
        </div>
        <div className="ba-cal-grid">
          <table className="ba-cal-table" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: 54 }} />
              {DAYS_FULL.map((d) => <col key={d} style={{ width: "calc((100% - 54px) / 5)" }} />)}
            </colgroup>
            <thead>
              <tr>
                <th className="ba-cal-th" />
                {DAYS_FULL.map((day, i) => (
                  <th key={day} className="ba-cal-th" style={{ opacity: isDimmed(day) ? 0.25 : 1 }}>
                    {DAYS_SHORT[i]}<br />
                    <span style={{ fontWeight: 400, color: "var(--gray-500)" }}>{formatDateShort(weekDates[i])}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_SLOTS.map((time, rowIdx) => (
                <tr key={time}>
                  <td className="ba-cal-td time-col">{rowIdx % 2 === 0 ? formatTime(time) : ""}</td>
                  {DAYS_FULL.map((day) => {
                    const dimmed = isDimmed(day);
                    const avail = !!availability[`${day}-${time}`];
                    const selected = isHighlighted(day, time);
                    return (
                      <td key={day} className="ba-cal-td" style={{ opacity: dimmed ? 0.15 : 1, pointerEvents: dimmed ? "none" : "auto" }}>
                        <div
                          className={`ba-slot ${selected ? "selected" : avail ? "avail" : "unavail"}`}
                          onClick={() => handleSlotClick(day, time)}
                          tabIndex={0} role="button"
                          aria-label={`${selected ? "Appointment selected" : avail ? "Available" : "Unavailable"} slot: ${day} at ${time}`}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSlotClick(day, time); } }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedSlot ? (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
            <div className="ba-selected-pill">
              <div>
                <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>Selected:</div>
                <div className="ba-pill-time">
                  {formatTime(selectedSlot.time)} – {formatTime(addMinutesToTime(selectedSlot.time, bookingInterval))}
                  &nbsp;·&nbsp;
                  {selectedSlot.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </div>
              </div>
              <button className="ba-pill-clear" aria-label="Deselect appointment slot" onClick={onClearSlot}>✕</button>
            </div>
          </div>
        ) : (
          <p style={{ textAlign: "center", marginTop: 10, fontSize: 13, color: "var(--gray-500)" }}>
            Click an available slot to select your appointment time.
          </p>
        )}
      </div>
      <div className="ba-footer">
        <button className="ba-btn ba-btn-secondary" onClick={onBack}>← Back</button>
        <button className="ba-btn ba-btn-primary" onClick={onNext} style={{ opacity: selectedSlot ? 1 : 0.5, cursor: selectedSlot ? "pointer" : "not-allowed" }}>
          Next →
        </button>
      </div>
    </>
  );
}

export function StepReview({ form, selectedSlot, onBack, onConfirm, onTimerExpired }) {
  const fullName = form.firstName || form.lastName
    ? [form.firstName, form.lastName].filter(Boolean).join(" ") : form.name || "";
  const fullAddress = form.streetAddress
    ? [form.streetAddress, form.city, form.province, form.postalCode].filter(Boolean).join(", ")
    : form.address || "";
  const rows = [
    { label: "Name", value: fullName },
    { label: "Address", value: fullAddress },
    { label: "Phone", value: form.phone },
    { label: "Status in Canada", value: form.statusInCanada },
    { label: "Household Size", value: form.householdMembers },
    { label: "Tiny Bundles?", value: form.applyingToTinyBundles === "yes" ? "Yes" : "No" },
    { label: "Preferred Language", value: form.language },
    { label: "Appointment", value: formatApptString(selectedSlot) },
  ];
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  useEffect(() => {
    if (secondsLeft <= 0) { onTimerExpired(); return; }
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
      <TimerBar secondsLeft={secondsLeft} />
      <div className="ba-footer" style={{ justifyContent: "center", gap: 16, marginTop: 12 }}>
        <button className="ba-btn ba-btn-secondary" onClick={onBack}>← Back</button>
        <button className="ba-btn ba-btn-confirm" onClick={onConfirm}>Confirm</button>
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
          <p className="appt-time" style={{ textAlign: "center" }}>{formatApptString(selectedSlot, interval)}</p>
          <p style={{ marginTop: 20, fontSize: 13 }}>Please remember to bring valid government-issued ID for each adult in your household containing proof of address (e.g. driver's license, BCID) for your appointment.</p>
          <p style={{ marginTop: 8, fontSize: 13 }}>If you need to reschedule or cancel, you can do so through your online account or by calling us at <strong>(604) 581-5443</strong>.</p>
        </div>
      </div>
      <div className="ba-footer" style={{ justifyContent: "flex-end" }}>
        <button className="ba-btn ba-btn-done" onClick={onDone}>Done</button>
      </div>
    </>
  );
}

export const SIGNUP_STEPS = ["Personal Info", "Family Members", "Review"];
export const BOOKING_STEPS = ["Choose Time", "Review", "Thank You"];

const SIGNUP_DRAFT_KEY = "signupDraft";

export const saveSignupDraft = (step, form, familyMembers) => {
  try { localStorage.setItem(SIGNUP_DRAFT_KEY, JSON.stringify({ step, form, familyMembers })); }
  catch { /* skip */ }
};

export const loadSignupDraft = () => {
  try {
    const raw = localStorage.getItem(SIGNUP_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export const clearSignupDraft = () => {
  try { localStorage.removeItem(SIGNUP_DRAFT_KEY); } catch { /* skip */ }
};

const emptyMember = () => ({
  id: crypto.randomUUID(),
  firstName: "",
  lastName: "",
  ageGroup: "",   // "infant" | "child" | "adult"
  dob: "",        // optional exact DOB
});

// Age group config 
const AGE_GROUPS = [
  {
    key: "infant",
    label: "Infant",
    range: "0 – 12 months",
    Icon: ChildCareIcon,
    color: "#e05c7a",
    bg: "#fff0f3",
    selectedBg: "#ffd6df",
    selectedBorder: "#e05c7a",
  },
  {
    key: "child",
    label: "Child",
    range: "1 – 17 years",
    Icon: EscalatorWarningIcon,
    color: "#f5a623",
    bg: "#fff8e1",
    selectedBg: "#ffe9a0",
    selectedBorder: "#f5a623",
  },
  {
    key: "adult",
    label: "Adult",
    range: "18+ years",
    Icon: PersonIcon,
    color: "#1a6abf",
    bg: "#f0f7ff",
    selectedBg: "#c8dff8",
    selectedBorder: "#1a6abf",
  },
];

// Deterministic avatar colour from member id
const AVATAR_PALETTE = ["#4f8ef7","#e05c7a","#3dbfa0","#f5a623","#9b59b6","#27ae60","#e67e22","#2980b9"];
const getAvatarColor = (id) =>
  AVATAR_PALETTE[id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_PALETTE.length];

const getInitials = (firstName, lastName) =>
  `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";

/**
 * AgeGroupPicker
 * Three large clickable tiles for Infant / Child / Adult.
 * Below them: an optional "Enter exact date of birth" toggle.
 */
function AgeGroupPicker({ ageGroup, dob, onAgeGroup, onDob, ageGroupError, dobError }) {
  const [showDob, setShowDob] = useState(!!dob);

  return (
    <Box>
      {/* Tiles */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 1 }}>
        {AGE_GROUPS.map(({ key, label, range, Icon, color, bg, selectedBg, selectedBorder }) => {
          const selected = ageGroup === key;
          return (
            <Box
              key={key}
              onClick={() => onAgeGroup(key)}
              role="button"
              tabIndex={0}
              aria-pressed={selected}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onAgeGroup(key); }}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
                py: 1.8,
                px: 1,
                borderRadius: "12px",
                border: selected ? `2px solid ${selectedBorder}` : "2px solid #e8e8e8",
                background: selected ? selectedBg : bg,
                cursor: "pointer",
                transition: "all 0.15s",
                userSelect: "none",
                "&:hover": {
                  border: `2px solid ${selectedBorder}`,
                  background: selectedBg,
                  transform: "translateY(-1px)",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                },
              }}
            >
              <Icon sx={{ fontSize: 28, color: selected ? color : "#bbb", transition: "color 0.15s" }} />
              <Typography sx={{ fontWeight: 700, fontSize: 13, color: selected ? color : "#555", lineHeight: 1.2 }}>
                {label}
              </Typography>
              <Typography sx={{ fontSize: 10, color: selected ? color : "#aaa", fontWeight: 500 }}>
                {range}
              </Typography>
            </Box>
          );
        })}
      </Stack>

      {ageGroupError && (
        <Typography sx={{ fontSize: 11, color: "var(--red, #d32f2f)", mb: 1, ml: 0.5 }}>
          {ageGroupError}
        </Typography>
      )}

      {/* Optional DOB toggle */}
      <Box
        component="button"
        type="button"
        onClick={() => setShowDob((v) => !v)}
        sx={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          color: "var(--teal, #009688)",
          fontSize: 12,
          fontWeight: 600,
          p: 0,
          mb: showDob ? 1.5 : 0,
          "&:hover": { textDecoration: "underline" },
        }}
      >
        {showDob ? "▾" : "▸"} {showDob ? "Hide exact date of birth" : "Enter exact date of birth (optional)"}
      </Box>

      <Collapse in={showDob}>
        <TextField
          label="Date of Birth"
          type="date"
          value={dob}
          onChange={(e) => onDob(e.target.value)}
          error={!!dobError}
          helperText={dobError}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ background: "#fff", borderRadius: 1, width: "100%", maxWidth: 240 }}
        />
      </Collapse>
    </Box>
  );
}

/**
 * MemberCard
 * Collapsed row: avatar + name + age group badge.
 * Expand inline to edit name + age group + optional DOB.
 */
function MemberCard({ member, idx, onField, onRemove, errors }) {
  const [expanded, setExpanded] = useState(!member.firstName && !member.lastName);
  const hasErrors = errors && Object.keys(errors).length > 0;
  const avatarColor = getAvatarColor(member.id);
  const displayName = [member.firstName, member.lastName].filter(Boolean).join(" ") || "New Member";
  const ageGroupConfig = AGE_GROUPS.find((g) => g.key === member.ageGroup);

  const dobFormatted = member.dob
    ? new Date(member.dob + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <Box sx={{
      borderRadius: "12px",
      overflow: "hidden",
      border: hasErrors ? "1.5px solid var(--red, #d32f2f)" : "1.5px solid #e8e8e8",
      mb: 1.5,
      background: "#fff",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      transition: "box-shadow 0.2s",
      "&:hover": { boxShadow: "0 3px 10px rgba(0,0,0,0.1)" },
    }}>

      {/* Collapsed header */}
      <Stack
        direction="row" alignItems="center" spacing={1.5}
        sx={{
          px: 2, py: 1.5, cursor: "pointer", userSelect: "none",
          background: expanded ? "#fafafa" : "#fff",
          borderBottom: expanded ? "1px solid #f0f0f0" : "none",
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Avatar */}
        <Box sx={{
          width: 38, height: 38, borderRadius: "50%", background: avatarColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, fontWeight: 700, fontSize: 14, color: "#fff", letterSpacing: 0.5,
        }}>
          {getInitials(member.firstName, member.lastName)}
        </Box>

        {/* Name + badges */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 15, color: "#1a1a1a", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {displayName}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.3 }}>
            {ageGroupConfig && (
              <Box sx={{
                display: "inline-flex", alignItems: "center", gap: 0.4,
                px: 1, py: "1px", borderRadius: "20px", fontSize: 11, fontWeight: 600,
                background: ageGroupConfig.bg, color: ageGroupConfig.color,
              }}>
                <ageGroupConfig.Icon sx={{ fontSize: 12 }} />
                {ageGroupConfig.label}
              </Box>
            )}
            {dobFormatted && (
              <Typography sx={{ fontSize: 11, color: "#aaa" }}>{dobFormatted}</Typography>
            )}
            {hasErrors && (
              <Typography sx={{ fontSize: 11, color: "var(--red, #d32f2f)", fontWeight: 600 }}>· Incomplete</Typography>
            )}
          </Stack>
        </Box>

        {/* Edit / Delete */}
        <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
          <IconButton size="small" onClick={() => setExpanded((v) => !v)} aria-label={expanded ? "Collapse" : "Edit member"}
            sx={{ color: "#bbb", "&:hover": { color: "var(--teal, #009688)" } }}>
            {expanded ? <KeyboardArrowUpIcon fontSize="small" /> : <EditIcon fontSize="small" />}
          </IconButton>
          <IconButton size="small" onClick={onRemove} aria-label={`Remove ${displayName}`}
            sx={{ color: "#bbb", "&:hover": { color: "var(--red, #d32f2f)" } }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      {/* Expanded edit form */}
      <Collapse in={expanded}>
        <Box sx={{ px: 2, pt: 2, pb: 2.5, background: "#fafafa" }}>
          {/* Name row */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
            <TextField
              label="First Name" value={member.firstName}
              onChange={(e) => onField("firstName", e.target.value)}
              error={!!errors?.firstName} helperText={errors?.firstName}
              fullWidth required size="small" sx={{ background: "#fff", borderRadius: 1 }}
            />
            <TextField
              label="Last Name" value={member.lastName}
              onChange={(e) => onField("lastName", e.target.value)}
              error={!!errors?.lastName} helperText={errors?.lastName}
              fullWidth required size="small" sx={{ background: "#fff", borderRadius: 1 }}
            />
          </Stack>

          {/* Age group tiles + optional DOB */}
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#555", mb: 1 }}>
            Age Group <span style={{ color: "var(--red, #d32f2f)" }}>*</span>
          </Typography>
          <AgeGroupPicker
            ageGroup={member.ageGroup}
            dob={member.dob}
            onAgeGroup={(val) => onField("ageGroup", val)}
            onDob={(val) => onField("dob", val)}
            ageGroupError={errors?.ageGroup}
            dobError={errors?.dob}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button size="small" variant="contained" onClick={() => setExpanded(false)}
              sx={{ textTransform: "none", fontWeight: 600, fontSize: 13, borderRadius: "8px", px: 2.5 }}>
              Done
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}

/**
 * StepFamilyMembers
 */
export function StepFamilyMembers({ familyMembers, onChange, onBack, onNext, errors }) {
  const handleAdd = () => onChange([...familyMembers, emptyMember()]);
  const handleRemove = (id) => onChange(familyMembers.filter((m) => m.id !== id));
  const handleField = (id, field, value) =>
    onChange(familyMembers.map((m) => (m.id === id ? { ...m, [field]: value } : m)));

  return (
    <Box className="ba-body">
      <Typography variant="h2">Household Members</Typography>
      <Typography variant="body2" sx={{ mb: 3, color: "var(--gray-500)" }}>
        Add everyone who is part of your family. This helps us prepare the right amount of food for your family.
      </Typography>

      {familyMembers.length === 0 ? (
        <Box sx={{
          textAlign: "center", py: 4, px: 3, mb: 2,
          borderRadius: "12px", border: "2px dashed #e0e0e0",
          color: "#bbb", fontSize: 14,
        }}>
          No members added yet.<br />
          <span style={{ fontSize: 12 }}>Click "Add Member" below to get started.</span>
        </Box>
      ) : (
        <Box sx={{ mb: 1 }}>
          {familyMembers.map((member, idx) => (
            <MemberCard
              key={member.id}
              member={member}
              idx={idx}
              onField={(field, value) => handleField(member.id, field, value)}
              onRemove={() => handleRemove(member.id)}
              errors={errors?.[member.id]}
            />
          ))}
        </Box>
      )}

      <Button
        startIcon={<AddIcon />}
        onClick={handleAdd}
        variant="contained"
        disableElevation
        sx={{
          mb: 3, fontWeight: 700, textTransform: "none", fontSize: 14,
          borderRadius: "10px", px: 3, py: 1.1,
          background: "var(--teal, #009688)",
          "&:hover": { background: "var(--teal-dark, #00796b)" },
        }}
      >
        Add Member
      </Button>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
        <Button variant="outlined" onClick={onBack} sx={{ textTransform: "none", fontWeight: 600 }}>← Back</Button>
        <Button variant="contained" color="primary" onClick={onNext} sx={{ fontWeight: "bold", textTransform: "none" }} endIcon={<NavigateNextIcon />}>
          Next
        </Button>
      </Box>
    </Box>
  );
}

/**
 * StepSignupReview
 */
export function StepSignupReview({ form, familyMembers, onBack, onConfirm }) {
  const fullName = form.firstName || form.lastName
    ? [form.firstName, form.lastName].filter(Boolean).join(" ") : form.name || "";
  const fullAddress = form.streetAddress
    ? [form.streetAddress, form.city, form.province, form.postalCode].filter(Boolean).join(", ")
    : form.address || "";
  const personalRows = [
    { label: "Name", value: fullName },
    { label: "Address", value: fullAddress },
    { label: "Phone", value: form.phone },
    { label: "Status in Canada", value: form.statusInCanada },
    { label: "Household Size", value: form.householdMembers },
    { label: "Tiny Bundles?", value: form.applyingToTinyBundles === "yes" ? "Yes" : "No" },
    { label: "Preferred Language", value: form.language },
  ];

  return (
    <>
      <div className="ba-body">
        <h2>Please confirm your information</h2>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Personal Information</Typography>
        <div className="ba-review-grid">
          {personalRows.map(({ label, value }) => (
            <div key={label} className="ba-review-row">
              <div className="ba-review-label">{label}</div>
              <div className="ba-review-val">{value}</div>
            </div>
          ))}
        </div>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>
          Household Members{" "}
          <span style={{ fontWeight: 400, color: "var(--gray-500)" }}>({familyMembers.length})</span>
        </Typography>

        {familyMembers.length === 0 ? (
          <Typography variant="body2" sx={{ color: "var(--gray-500)", fontStyle: "italic" }}>
            No additional household members added.
          </Typography>
        ) : (
          familyMembers.map((m, i) => {
            const ageGroupConfig = AGE_GROUPS.find((g) => g.key === m.ageGroup);
            return (
              <div key={m.id} className="ba-review-grid" style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < familyMembers.length - 1 ? "1px solid var(--gray-200)" : "none" }}>
                <div className="ba-review-row">
                  <div className="ba-review-label">Name</div>
                  <div className="ba-review-val">{[m.firstName, m.lastName].filter(Boolean).join(" ")}</div>
                </div>
                <div className="ba-review-row">
                  <div className="ba-review-label">Age Group</div>
                  <div className="ba-review-val">
                    {ageGroupConfig ? (
                      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.2, py: "2px", borderRadius: "20px", fontSize: 12, fontWeight: 600, background: ageGroupConfig.bg, color: ageGroupConfig.color }}>
                        <ageGroupConfig.Icon sx={{ fontSize: 13 }} />
                        {ageGroupConfig.label} · {ageGroupConfig.range}
                      </Box>
                    ) : "—"}
                  </div>
                </div>
                {m.dob && (
                  <div className="ba-review-row">
                    <div className="ba-review-label">Date of Birth</div>
                    <div className="ba-review-val">
                      {new Date(m.dob + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <div className="ba-footer" style={{ justifyContent: "center", gap: 16, marginTop: 12 }}>
        <button className="ba-btn ba-btn-secondary" onClick={onBack}>← Back</button>
        <button className="ba-btn ba-btn-confirm" onClick={onConfirm}>Create Account</button>
      </div>
    </>
  );
}