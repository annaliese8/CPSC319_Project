import React from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  Stack,
  Alert,
  Chip,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import RegistrationFields from "../components/RegistrationFields";
import { addMinutesToTime } from "../utils/TimeUtils";
import { getApplicantByEmail, getApplicant, getHouseholdMembers } from "../api/applicantsAPI";

// Validate using the same snake_case keys that RegistrationFields uses
function validateForm(form) {
  const errors = {};
  const isValidPhone = (v) => {
    if (!/^\+?[\d\s\-(). ]+$/.test(v)) return false;
    return v.replace(/\D/g, "").length >= 10;
  };
  const isValidPostalCode = (v) => /^[a-z]\d[a-z] ?\d[a-z]\d$/i.test(v);

  if (!form.first_name?.trim()) errors.first_name = "Required";
  if (!form.last_name?.trim()) errors.last_name = "Required";
  if (!form.street_addr?.trim()) errors.street_addr = "Required";
  if (!form.city?.trim()) errors.city = "Required";
  if (!form.province?.trim()) errors.province = "Required";
  if (!form.postal_code?.trim()) errors.postal_code = "Required (e.g. A1A 1A1)";
  else if (!isValidPostalCode(form.postal_code))
    errors.postal_code = "Please enter a valid postal code (e.g. A1A 1A1)";
  if (!form.phone?.trim()) errors.phone = "Required (at least 10 digits)";
  else if (!isValidPhone(form.phone))
    errors.phone = "Please enter a valid phone number (at least 10 digits)";
  if (!form.status_in_canada?.trim()) errors.status_in_canada = "Required";
  if (!form.language?.trim()) errors.language = "Required";
  return errors;
}

export default function StaffBookingPanel({
  selectedSlot,
  onClose,
  onConfirmBooking,
  existingAppointments = [],
  blockedSlots = [],           // savedBlocked from AdminCalendar: [{date, time}]
  rebookingAppointment = null, // pre-fills the form with applicant data
  isNewBooking = false,        // true = new booking from profile (pre-fill but don't cancel old)
}) {
  // isRebooking locks personal fields and shows "Change Booking" UI.
  // For new bookings from a profile page (isNewBooking), fields remain editable.
  const isRebooking = !!rebookingAppointment && !isNewBooking;

  // Form state uses snake_case keys to match RegistrationFields exactly
  const [form, setForm] = React.useState({
    first_name: rebookingAppointment?.first_name || rebookingAppointment?.firstName || "",
    last_name: rebookingAppointment?.last_name || rebookingAppointment?.lastName || "",
    phone: rebookingAppointment?.phone || "",
    street_addr: rebookingAppointment?.street_addr || rebookingAppointment?.streetAddress || "",
    city: rebookingAppointment?.city || "",
    province: rebookingAppointment?.province || "British Columbia",
    postal_code: rebookingAppointment?.postal_code || rebookingAppointment?.postalCode || "",
    status_in_canada: rebookingAppointment?.status_in_canada || rebookingAppointment?.statusInCanada || "",
    tiny_bundles_program: rebookingAppointment?.tiny_bundles_program ?? false,
    language: rebookingAppointment?.language || "English",
    email:
      rebookingAppointment?.email ||
      rebookingAppointment?.email_address ||
      rebookingAppointment?.applicantEmail ||
      "",
    householdMembers: rebookingAppointment?.householdMembers || [],
  });

  const [error, setError] = React.useState("");
  const [formErrors, setFormErrors] = React.useState({});
  const [editableDate, setEditableDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [lookupStatus, setLookupStatus] = React.useState(null); // null | 'loading' | 'found' | 'not-found'

  React.useEffect(() => {
    if (selectedSlot) {
      const date = selectedSlot.date
        ? new Date(selectedSlot.date)
        : (() => {
            const dayIndex = [
              "Sunday", "Monday", "Tuesday", "Wednesday",
              "Thursday", "Friday", "Saturday",
            ].indexOf(selectedSlot.day);
            const d = new Date(selectedSlot.weekStart);
            d.setDate(d.getDate() + dayIndex);
            return d;
          })();
      const y = date.getFullYear();
      const mo = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      setEditableDate(`${y}-${mo}-${d}`);
      setStartTime(selectedSlot.time);
      setEndTime(addMinutesToTime(selectedSlot.time, 15));
    }
  }, [selectedSlot]);

  React.useEffect(() => {
    if (isRebooking) return;
    const email = form.email;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLookupStatus(null);
      return;
    }
    setLookupStatus("loading");
    const timer = setTimeout(async () => {
      try {
        const result = await getApplicantByEmail(email.trim());
        if (result?.response_id) {
          const [reg, membersResult] = await Promise.all([
            getApplicant(result.response_id),
            getHouseholdMembers(result.response_id),
          ]);
          if (reg) {
            setForm((prev) => ({
              ...prev,
              first_name: reg.first_name || prev.first_name,
              last_name: reg.last_name || prev.last_name,
              phone: reg.phone || prev.phone,
              street_addr: reg.street_addr || prev.street_addr,
              city: reg.city || prev.city,
              province: reg.province || prev.province,
              postal_code: reg.postal_code || prev.postal_code,
              status_in_canada: reg.status_in_canada || prev.status_in_canada,
              tiny_bundles_program: reg.tiny_bundles_program ?? prev.tiny_bundles_program,
              language: reg.language || prev.language,
              householdMembers: membersResult?.data ?? membersResult ?? [],
              _response_id: result.response_id,
            }));
          }
          setLookupStatus("found");
        } else {
          setLookupStatus("not-found");
        }
      } catch {
        setLookupStatus("not-found");
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [form.email, isRebooking]);

  const onChange = (key) => (e) => {
    if (isRebooking) return;
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setFormErrors((prev) => ({ ...prev, [key]: undefined }));
    setError("");
  };

  const getDuration = () => {
    const size = (form.householdMembers?.length ?? 0) + 1;
    return size >= 5 ? 30 : 15;
  };

  // Respect manually-entered end time; fall back to household-derived duration
  const getEffectiveDuration = () => {
    if (startTime && endTime) {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff > 0 && diff % 15 === 0) return diff;
    }
    return getDuration();
  };

  React.useEffect(() => {
    if (startTime) setEndTime(addMinutesToTime(startTime, getDuration()));
  }, [form.householdMembers, startTime]);

  const isSlotBooked = (day, time, excludeResponseId = null) => {
    const [slotH, slotM] = time.split(":").map(Number);
    const slotMins = slotH * 60 + slotM;
    return existingAppointments.some((apt) => {
      if (excludeResponseId && apt.response_id === excludeResponseId) return false;
      if (apt.day !== day) return false;
      const [aptH, aptM] = apt.startTime.split(":").map(Number);
      const aptStart = aptH * 60 + aptM;
      return slotMins >= aptStart && slotMins < aptStart + (apt.duration || 15);
    });
  };

  const checkSlotAvailability = (day, time, duration, excludeResponseId = null) => {
    if (!isSlotBooked(day, time, excludeResponseId)) {
      if (duration === 15) return true;
      const [h, m] = time.split(":").map(Number);
      const nextMins = h * 60 + m + 15;
      const nextTime = `${Math.floor(nextMins / 60)}:${String(nextMins % 60).padStart(2, "0")}`;
      return !isSlotBooked(day, nextTime, excludeResponseId);
    }
    return false;
  };

  const formatTimeLabel = (time, duration) => {
    const [hour, minute] = time.split(":").map(Number);
    const fmt = (h, m) => {
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${h12}:${String(m).padStart(2, "0")}${h >= 12 ? "pm" : "am"}`;
    };
    const endMins = hour * 60 + minute + duration;
    return `${fmt(hour, minute)} – ${fmt(Math.floor(endMins / 60), endMins % 60)}`;
  };

  const formatDateLabel = (day, date) => {
    const d = new Date(date + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
  };

  const handleConfirm = () => {
    // Validate all fields using snake_case keys (matching RegistrationFields)
    const errors = validateForm(form);
    if (!form.email?.trim()) errors.email = "Please enter the applicant's email";
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      setError("Please fill in all required fields.");
      return;
    }
    if (!editableDate) { setError("Please select a date"); return; }
    if (!startTime)    { setError("Please enter a start time"); return; }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(editableDate + "T00:00:00") < today) {
      setError("Cannot book an appointment in the past.");
      return;
    }

    const dateObj = new Date(editableDate + "T00:00:00");
    const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const dayName = dayNames[dateObj.getDay()];

    if (dayName === "Saturday" || dayName === "Sunday") {
      setError("Cannot book appointments on weekends.");
      return;
    }

    const duration = getEffectiveDuration();
    const excludeId = isRebooking ? rebookingAppointment?.response_id ?? null : null;

    // Check each 15-min slot within the duration range for blocked or booked conflicts
    const normTime = (t) => {
      const [h, m] = t.split(":").map(Number);
      return `${h}:${m.toString().padStart(2, "0")}`;
    };
    const [sh, sm] = startTime.split(":").map(Number);
    const startMins = sh * 60 + sm;
    const endMins = startMins + duration;

    // End time must not go past 1:00 PM
    if (endMins > 13 * 60) {
      setError("Appointment end time cannot go past 1:00 PM.");
      return;
    }

    for (let offset = 0; offset < duration; offset += 15) {
      const slotMins = startMins + offset;
      const slotTime = normTime(`${Math.floor(slotMins / 60)}:${slotMins % 60}`);
      if (blockedSlots.some((s) => s.date === editableDate && s.time === slotTime)) {
        setError("Part of the selected time range overlaps with a blocked slot.");
        return;
      }
    }

    if (!checkSlotAvailability(dayName, startTime, duration, excludeId)) {
      setError("The selected time slot is not available. Please choose another time.");
      return;
    }

    const appointmentData = {
      response_id: rebookingAppointment?.response_id ?? rebookingAppointment?.id ?? form._response_id ?? null,
      first_name: form.first_name,
      last_name: form.last_name,
      street_addr: form.street_addr,
      postal_code: form.postal_code,
      status_in_canada: form.status_in_canada,
      tiny_bundles_program: form.tiny_bundles_program,
      // camelCase aliases kept for any downstream callers
      firstName: form.first_name,
      lastName: form.last_name,
      name: `${form.first_name} ${form.last_name}`.trim(),
      email: form.email,
      phone: form.phone,
      streetAddress: form.street_addr,
      city: form.city,
      province: form.province,
      postalCode: form.postal_code,
      statusInCanada: form.status_in_canada,
      applyingToTinyBundles: form.tiny_bundles_program ? "yes" : "no",
      language: form.language,
      householdMembers: form.householdMembers || [],
      day: dayName,
      startTime: startTime.padStart(5, "0"),
      duration,
      date: editableDate,
      dateLabel: formatDateLabel(dayName, editableDate),
      timeLabel: formatTimeLabel(startTime, duration),
    };

    setSaving(true);
    Promise.resolve(onConfirmBooking(appointmentData)).finally(() => setSaving(false));
  };

  if (!selectedSlot) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        top: 80,
        bottom: 0,
        width: "400px",
        bgcolor: "background.paper",
        boxShadow: 3,
        p: 2.5,
        overflowY: "auto",
        zIndex: 1000,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>
            {isRebooking ? "CHANGE BOOKING" : "BOOK APPOINTMENT"}
          </Typography>
          {isRebooking && (
            <Chip
              icon={<LockIcon sx={{ fontSize: 14 }} />}
              label="Applicant info locked — only date/time can be changed"
              size="small"
              variant="outlined"
              color="warning"
              sx={{ mt: 0.5, fontSize: "0.7rem", height: 22 }}
            />
          )}
        </Box>
        <Button
          onClick={onClose}
          aria-label="Close appointment booking panel and discard changes"
          sx={{ minWidth: "auto", p: 0.5, fontSize: "1.5rem" }}
        >
          ✕
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={1.5}>
        <TextField
          label="Date*"
          type="date"
          value={editableDate}
          onChange={(e) => setEditableDate(e.target.value)}
          fullWidth
          size="small"
          InputLabelProps={{ shrink: true }}
        />

        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            label="Start Time*"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            fullWidth
            size="small"
            placeholder="9:15"
            helperText="Format: HH:MM"
          />
          <Typography sx={{ alignSelf: "center", px: 0.5 }}>to</Typography>
          <TextField
            label="End Time*"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            fullWidth
            size="small"
            placeholder="9:30"
            helperText="Format: HH:MM"
          />
        </Box>

        <TextField
          label="Email*"
          type="email"
          value={form.email}
          onChange={onChange("email")}
          error={!!formErrors.email}
          helperText={formErrors.email || ""}
          fullWidth
          size="small"
          disabled={isRebooking}
          InputProps={
            isRebooking
              ? {
                endAdornment: (
                  <LockIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                ),
              }
              : {}
          }
        />
        {!isRebooking && lookupStatus === "loading" && (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Looking up account…
          </Typography>
        )}
        {!isRebooking && lookupStatus === "found" && (
          <Typography variant="caption" sx={{ color: "success.main" }}>
            Account found — details auto-filled
          </Typography>
        )}
        {!isRebooking && lookupStatus === "not-found" && (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            No existing account — a new one will be created
          </Typography>
        )}

        <RegistrationFields
          form={form}
          onChange={onChange}
          errors={formErrors}
          isDisabled={isRebooking}
          isStaffPage={true}
        />

        <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={onClose} fullWidth sx={{ fontWeight: 600 }}>
            Discard
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirm}
            disabled={saving}
            fullWidth
            sx={{ fontWeight: 600, color: "common.white" }}
          >
            {saving ? "Saving…" : isRebooking ? "Confirm Change" : "Confirm"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

// Copilot was used to format the code and help with bug fixes. The code has been reviewed
