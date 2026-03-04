import { useState, useEffect } from "react";
export const STEPS = ["Personal Info", "Choose Time", "Review", "Thank You"];
import logo from "../styles/full-logo.png";
import { Stack, Typography, Button } from "@mui/material";

// claude ai was used to write, debug and validate code for this entire page
export const STATUS_OPTIONS = [
  "Canadian Citizen",
  "Permanent Resident",
  "Temporary Resident (6 months+)",
  "Refugee",
];

export const LANGUAGES = [
  "English", "French", "Spanish", "Swahili",
  "Rohingya", "Tigrinya", "Farsi", "Punjabi", "Arabic",
];

export const DAYS_FULL  = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const generateAllSlots = () => {
  const slots = [];
  for (let h = 9; h < 17; h++)
    for (let m = 0; m < 60; m += 15)
      slots.push(`${h}:${m.toString().padStart(2, "0")}`);
  return slots;
};

export const ALL_SLOTS  = generateAllSlots();
export const ROW_TIMES  = ALL_SLOTS.filter((_, i) => i % 2 === 0); // one row per 30 min

export const addMinutes = (time, mins) => {
  const [h, m] = time.split(":").map(Number);
  const total  = h * 60 + m + mins;
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}`;
};

export const formatTime = (time) => {
  const [h, m] = time.split(":").map(Number);
  const ampm   = h >= 12 ? "pm" : "am";
  const h12    = h > 12 ? h - 12 : h === 0 ? 12 : h;
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
  return `${dateStr} · ${formatTime(slot.time)} – ${formatTime(addMinutes(slot.time, interval))}`;
};

export const getWeekStart = (date) => {
  const d   = new Date(date);
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

export const generateAvailability = () => {
  const map = {};
  DAYS_FULL.forEach((day) =>
    ALL_SLOTS.forEach((time) => { map[`${day}-${time}`] = Math.random() > 0.45; })
  );
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
      <Button onClick={onLogout} color="secondary" variant="text" sx={{ fontSize: 14, fontWeight: 800, textTransform: 'none' }}>
          Log Out
        </Button>
    </nav>
  );
}

export const isSlotAvailable = (availability, day, time, interval = 15) =>
  interval === 30
    ? !!availability[`${day}-${time}`] && !!availability[`${day}-${addMinutes(time, 15)}`] && !!availability[`${day}-${addMinutes(time, 30)}`] && !!availability[`${day}-${addMinutes(time, 45)}`]
    : !!availability[`${day}-${time}`] && !!availability[`${day}-${addMinutes(time, 15)}`];

export function Stepper({ currentStep }) {
  return (
    <div className="ba-stepper">
      {STEPS.map((label, i) => {
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

export function StepPersonalInfo({ form, errors, onChange, onNext }) {
  return (
    <>
      <div className="ba-body">
        <h2>Please fill out the following questions</h2>
        <div className="ba-form-grid">

          <div className="ba-field full">
            <label className="ba-label">Name<span className="req">*</span></label>
            <input className="ba-input" value={form.name} placeholder="Full name"
              onChange={(e) => onChange("name", e.target.value)} />
            {errors.name && <p className="ba-error">{errors.name}</p>}
          </div>

          <div className="ba-field full">
            <label className="ba-label">Address<span className="req">*</span></label>
            <input className="ba-input" value={form.address} placeholder="Street address"
              onChange={(e) => onChange("address", e.target.value)} />
            {errors.address && <p className="ba-error">{errors.address}</p>}
          </div>

          <div className="ba-field full">
            <label className="ba-label">Phone Number<span className="req">*</span></label>
            <input className="ba-input" type="tel" value={form.phone} placeholder="(123) 456-7890"
              onChange={(e) => onChange("phone", e.target.value)} />
            {errors.phone && <p className="ba-error">{errors.phone}</p>}
          </div>

          <div className="ba-field full">
            <label className="ba-label">Status in Canada<span className="req">*</span></label>
            <select className="ba-select" value={form.statusInCanada}
              onChange={(e) => onChange("statusInCanada", e.target.value)}>
              <option value="">Select status…</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.statusInCanada && <p className="ba-error">{errors.statusInCanada}</p>}
          </div>

          <div className="ba-field full">
            <label className="ba-label">Household Size<span className="req">*</span></label>
            <input
              className="ba-input"
              type="number"
              min="1"
              max="20"
              value={form.householdMembers}
              placeholder="Number of people"
              onChange={(e) => onChange("householdMembers", e.target.value)}
              style={{ maxWidth: 180 }}
            />
            {errors.householdMembers && <p className="ba-error">{errors.householdMembers}</p>}
            {Number(form.householdMembers) >= 5 && (
              <p style={{ fontSize: 12, color: "var(--teal)", marginTop: 4 }}>
                Households of 5 or more are booked in 30-minute slots.
              </p>
            )}
          </div>

          <div className="ba-field full" style={{ marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label className="ba-label">Applying to the Tiny Bundles Program?</label>
              <div className="ba-info-tooltip">
                i
                <div className="ba-tooltip-text">
                  Please select Yes if your household has a pregnant mom or children under 12 months old.
                  Tiny Bundles families receive food every week instead of every two weeks. They are also
                  supplied with fresh eggs and milk while pregnant or nursing. Additional fresh vegetables
                  and other nutritional items are supplied when available.
                </div>
              </div>
            </div>
            <div className="ba-tiny-radio">
              {["no", "yes"].map((val) => (
                <label key={val} className="ba-radio-label">
                  <input type="radio" name="applyingToTinyBundles" value={val}
                    checked={form.applyingToTinyBundles === val}
                    onChange={() => onChange("applyingToTinyBundles", val)} />
                  {val === "no" ? "No" : "Yes"}
                </label>
              ))}
            </div>
            {form.applyingToTinyBundles === "yes" && (
              <p style={{ fontSize: 12, color: "var(--teal)", marginTop: 4 }}>
                Tiny Bundles appointments are available on Wednesdays only.
              </p>
            )}
          </div>

          <div className="ba-field full">
            <label className="ba-label">Preferred Language</label>
            <select className="ba-select" value={form.language}
              onChange={(e) => onChange("language", e.target.value)}>
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

        </div>
      </div>
      <div className="ba-footer">
        <div />
        <button className="ba-btn ba-btn-primary" onClick={onNext}>Next →</button>
      </div>
    </>
  );
}

const TIMER_SECONDS = 5 * 60;

export function StepChooseTime({ form, selectedSlot, onSelectSlot, onClearSlot, onBack, onNext }) {
  const todayStart                = getWeekStart(new Date());
  const [weekStart, setWeekStart] = useState(todayStart);
  const [weekAvailability, setWeekAvailability] = useState({});

// Regenerate when week changes
useEffect(() => {
  const map = {};
  DAYS_FULL.forEach((day) =>
    ALL_SLOTS.forEach((time) => {
      map[`${day}-${time}`] = Math.random() > 0.45;
    })
  );
  setWeekAvailability(map);
}, [weekStart]);

const availability = weekAvailability;

  // 5-minute timer: when expired, clear the slot and go back
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const timerExpired = secondsLeft <= 0;

  useEffect(() => {
    if (timerExpired) {
      onClearSlot();
      onBack();
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, timerExpired]);

  const timerMM  = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const timerSS  = String(secondsLeft % 60).padStart(2, "0");
  const timerPct = Math.max(0, (secondsLeft / TIMER_SECONDS) * 100);

  const weekDates     = getWeekDates(weekStart);
  const isCurrentWeek = weekStart.getTime() === todayStart.getTime();

  const householdSize = Number(form.householdMembers) || 1;
  const interval      = householdSize >= 5 ? 30 : 15;
  const tinyBundles   = form.applyingToTinyBundles === "yes";

  // For tiny bundles: dim all columns except Wednesday
  const isDimmed = (day) => tinyBundles && day !== "Wednesday";

  const shiftWeek = (delta) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta);
    setWeekStart(d);
  };

  const handleSlotClick = (day, rowTime) => {
    if (isDimmed(day)) return;
    if (!isSlotAvailable(availability, day, rowTime, interval)) return;
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + DAYS_FULL.indexOf(day));
    const [hh, mm] = rowTime.split(":").map(Number);
    d.setHours(hh, mm, 0, 0);
    onSelectSlot({ day, time: rowTime, date: d, interval });
  };

  // 30-min interval = 2 visual sub-rows per block; 15-min = 1
  const subSlotsFor = (rowTime) =>
    interval === 30 ? [rowTime, addMinutes(rowTime, 15)] : [rowTime];

  return (
    <>
      <div className="ba-body">
        <h2>Select a Date and Time for your appointment</h2>

        {tinyBundles && (
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--teal)", marginBottom: 12, fontWeight: 600 }}>
            Showing Wednesday appointments only (Tiny Bundles program)
          </p>
        )}

        {/* Week nav — fixed-width nav areas so range never shifts */}
        <div className="ba-cal-header">
          <div style={{ display: "flex", gap: 8, minWidth: 170 }}>
            <button className="ba-cal-btn" onClick={() => shiftWeek(-7)}>← Prev Week</button>
            {!isCurrentWeek && (
              <button className="ba-cal-btn today" onClick={() => setWeekStart(todayStart)}>Today</button>
            )}
          </div>
          <div className="ba-cal-range">
            {formatDateShort(weekDates[0])} – {formatDateShort(weekDates[6])}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", minWidth: 170 }}>
            <button className="ba-cal-btn" onClick={() => shiftWeek(7)}>Next Week →</button>
          </div>
        </div>

        {/* Legend */}
        <div className="ba-cal-legend">
          <span><div className="ba-legend-dot avail" /> Available</span>
          <span><div className="ba-legend-dot booked" /> Unavailable</span>
        </div>

        {/* Grid — all 7 columns always present for stable layout */}
        <div className="ba-cal-grid">
          <table className="ba-cal-table" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: 54 }} />
              {DAYS_FULL.map((d) => <col key={d} style={{ width: "calc((100% - 54px) / 7)" }} />)}
            </colgroup>
            <thead>
              <tr>
                <th className="ba-cal-th" />
                {DAYS_FULL.map((day, i) => (
                  <th key={day} className="ba-cal-th"
                    style={{ opacity: isDimmed(day) ? 0.25 : 1 }}>
                    {DAYS_SHORT[i]}<br />
                    <span style={{ fontWeight: 400, color: "var(--gray-500)" }}>
                      {formatDateShort(weekDates[i])}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROW_TIMES.map((rowTime) => (
                <tr key={rowTime}>
                  <td className="ba-cal-td time-col">{formatTime(rowTime)}</td>
                  {DAYS_FULL.map((day) => {
                    const dimmed = isDimmed(day);
                    return (
                      <td key={day} className="ba-cal-td"
                        style={{ opacity: dimmed ? 0.15 : 1, pointerEvents: dimmed ? "none" : "auto" }}>
                        {subSlotsFor(rowTime).map((time) => {
                          const avail = isSlotAvailable(availability, day, time, interval);
                          const isSel = selectedSlot?.day === day && selectedSlot?.time === rowTime;
                          return (
                            <div key={time}
                              className={`ba-slot ${isSel ? "selected" : avail ? "avail" : "unavail"}`}
                              onClick={() => handleSlotClick(day, rowTime)} />
                          );
                        })}
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
          <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
            <div className="ba-selected-pill">
              <div>
                <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>Selected:</div>
                <div className="ba-pill-time">
                  {formatTime(selectedSlot.time)} – {formatTime(addMinutes(selectedSlot.time, interval))}
                  &nbsp;·&nbsp;
                  {selectedSlot.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </div>
              </div>
              <button className="ba-pill-clear" onClick={onClearSlot}>✕</button>
            </div>
          </div>
        ) : (
          <p style={{ textAlign: "center", marginTop: 10, fontSize: 13, color: "var(--gray-500)" }}>
            Click an available slot to select your appointment time.
          </p>
        )}
      </div>

      {/* Timer bar */}
      <div className="ba-timer-wrap" style={{ marginTop: 16 }}>
        <div className="ba-timer-label"
          style={{ color: secondsLeft < 60 ? "var(--red)" : "var(--gray-700)" }}>
          Time remaining to select a slot: {timerMM}:{timerSS}
        </div>
        <div className="ba-timer-bar-bg">
          <div className="ba-timer-bar-fill"
            style={{
              width: `${timerPct}%`,
              background: secondsLeft < 60 ? "var(--red)" : "var(--teal)",
              transition: "width 1s linear, background 0.3s",
            }}
          />
        </div>
      </div>

      <div className="ba-footer">
        <button className="ba-btn ba-btn-secondary" onClick={onBack}>← Back</button>
        <button className="ba-btn ba-btn-primary" onClick={onNext}
          style={{ opacity: selectedSlot ? 1 : 0.5, cursor: selectedSlot ? "pointer" : "not-allowed" }}>
          Next →
        </button>
      </div>
    </>
  );
}


export function StepReview({ form, selectedSlot, onBack, onConfirm }) {
  const householdSize = Number(form.householdMembers) || 1;
  const interval      = householdSize >= 5 ? 30 : 15;

  const rows = [
    { label: "Name",             value: form.name },
    { label: "Address",          value: form.address },
    { label: "Status in Canada", value: form.statusInCanada },
    { label: "Household Size",   value: form.householdMembers },
    { label: "Tiny Bundles?",    value: form.applyingToTinyBundles === "yes" ? "Yes" : "No" },
    { label: "Appointment",      value: formatApptString(selectedSlot, interval) },
  ];

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
      <div className="ba-footer" style={{ justifyContent: "center", gap: 16 }}>
        <button className="ba-btn ba-btn-secondary" onClick={onBack}>← Back</button>
        <button className="ba-btn ba-btn-confirm" onClick={onConfirm}>Confirm</button>
      </div>
    </>
  );
}

export function StepThankYou({ selectedSlot, onDone }) {
  const interval = selectedSlot?.interval ?? 30;

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
            Please remember to bring valid government-issued ID for each adult in your household
            containing proof of address (e.g. driver's license, BCID) for your appointment.
          </p>
          <p style={{ marginTop: 8, fontSize: 13 }}>
            If you need to reschedule or cancel, you can do so through your online account or by
            calling us at <strong>(604) 581-5443</strong>.
          </p>
        </div>
      </div>
      <div className="ba-footer" style={{ justifyContent: "flex-end" }}>
        <button className="ba-btn ba-btn-done" onClick={onDone}>Done</button>
      </div>
    </>
  );
}