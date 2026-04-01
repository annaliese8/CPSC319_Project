/**
 * Adds minutes to a time string in "H:MM" format.
 * Returns the resulting time string, or "" if the input is invalid.
 */

/**
 * Formats "YYYY-MM-DD" → "Monday, March 31, 2026".
 * Safe against UTC timezone shift (uses T12:00:00).
 */
export const formatDateFull = (d) => {
  if (!d) return "";
  const raw = String(d);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(raw + "T12:00:00").toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
  }
  // Handle full ISO datetime strings (e.g. "2026-03-31T09:00:00.000Z")
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
  }
  return raw; // already formatted
};

/** Formats a 24-h time string ("9:00", "09:00", "09:00:00") → "9:00am" */
export const formatTime12h = (t) => {
  if (!t) return "";
  const [h, m] = String(t).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return t;
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")}${h >= 12 ? "pm" : "am"}`;
};

/**
 * Parses duration to minutes.
 * Accepts "HH:MM:SS" (DB format), "HH:MM", or a plain number.
 */
export const parseDurationMins = (dur) => {
  if (typeof dur === "number") return dur;
  if (!dur) return 15;
  const [h, m] = String(dur).split(":").map(Number);
  return (Number.isNaN(h) ? 0 : h) * 60 + (Number.isNaN(m) ? 0 : m);
};

/**
 * Builds a "9:00am – 9:15am" range string.
 * @param {string} startTime  "HH:MM" or "HH:MM:SS"
 * @param {string|number} duration  DB duration string or minutes
 */
export const formatTimeRange = (startTime, duration) => {
  if (!startTime) return "";
  const [h, m] = String(startTime).split(":").map(Number);
  if (Number.isNaN(h)) return "";
  const durMins = parseDurationMins(duration);
  const endTotal = h * 60 + m + durMins;
  return `${formatTime12h(startTime)} – ${formatTime12h(`${Math.floor(endTotal / 60)}:${endTotal % 60}`)}`;
};

/**
 * Formats a phone number string for display.
 * 10 digits → "604-555-1234"
 * 11 digits starting with 1 → "1-604-555-1234"
 * Anything else → returned as-is.
 */
export const formatPhone = (raw) => {
  if (!raw) return "";
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === "1") {
    return `1-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return raw; // non-NA format — show as entered
};

export const addMinutesToTime = (time, minutesToAdd) => {
    if (!time || !time.includes(":")) return "";
    const [hour, minute] = time.split(":").map(Number);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return "";
    const totalMinutes = (hour * 60 + minute + minutesToAdd) % (24 * 60);
    const newHour = Math.floor(totalMinutes / 60);
    const newMinute = totalMinutes % 60;
    return `${newHour.toString().padStart(2, "0")}:${newMinute.toString().padStart(2, "0")}`;
};