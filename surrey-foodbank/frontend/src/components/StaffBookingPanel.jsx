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
import { validateRegistrationForm } from "../utils/ValidateRegistrationForm";
import { addMinutesToTime } from "../utils/TimeUtils";

export default function StaffBookingPanel({
  selectedSlot,
  onClose,
  onConfirmBooking,
  existingAppointments = [],
  rebookingAppointment = null, // if set, we're changing an existing booking
}) {
  const isRebooking = !!rebookingAppointment;

  const [form, setForm] = React.useState({
    firstName: rebookingAppointment?.firstName || "",
    lastName: rebookingAppointment?.lastName || "",
    phone: rebookingAppointment?.phone || "",
    streetAddress: rebookingAppointment?.streetAddress || "",
    city: rebookingAppointment?.city || "",
    province: rebookingAppointment?.province || "British Columbia",
    postalCode: rebookingAppointment?.postalCode || "",
    statusInCanada: rebookingAppointment?.statusInCanada || "",
    applyingToTinyBundles: rebookingAppointment?.applyingToTinyBundles || "no",
    language: rebookingAppointment?.language || "English",
    email:
      rebookingAppointment?.email || rebookingAppointment?.applicantEmail || "",
    householdMembers: rebookingAppointment?.householdMembers || [],
  });

  const [error, setError] = React.useState("");
  const [formErrors, setFormErrors] = React.useState({});
  const [editableDate, setEditableDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");

  React.useEffect(() => {
    if (selectedSlot) {
      const date = selectedSlot.date
        ? new Date(selectedSlot.date)
        : (() => {
            const dayIndex = [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ].indexOf(selectedSlot.day);
            const d = new Date(selectedSlot.weekStart);
            d.setDate(d.getDate() + dayIndex);
            return d;
          })();
      setEditableDate(date.toISOString().split("T")[0]);
      setStartTime(selectedSlot.time);
      setEndTime(addMinutesToTime(selectedSlot.time, 15));
    }
  }, [selectedSlot]);

  const onChange = (key) => (e) => {
    if (isRebooking) return; // lock personal fields during rebook
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setError("");
  };

  const getDuration = () => {
    const size = (form.householdMembers?.length ?? 0) + 1;
    return size >= 5 ? 30 : 15;
  };

  React.useEffect(() => {
    const duration = getDuration();
    if (startTime) {
      setEndTime(addMinutesToTime(startTime, duration));
    }
  }, [form.householdMembers, startTime]);

  const checkSlotAvailability = (day, time, duration, excludeEmail = null) => {
    if (duration === 15) return !isSlotBooked(day, time, excludeEmail);
    const nextTime = getNextTimeSlot(time);
    if (!nextTime) return false;
    return (
      !isSlotBooked(day, time, excludeEmail) &&
      !isSlotBooked(day, nextTime, excludeEmail)
    );
  };

  const isSlotBooked = (day, time, excludeEmail = null) => {
    return existingAppointments.some((apt) => {
      if (excludeEmail && apt.email === excludeEmail) return false; // ignore self
      return apt.day === day && apt.startTime === time;
    });
  };

  const getNextTimeSlot = (time) => {
    const [hour, minute] = time.split(":").map(Number);
    if (minute === 0) return `${hour}:15`;
    if (minute === 15) return `${hour}:30`;
    if (minute === 30) return `${hour}:45`;
    if (minute === 45) return `${hour + 1}:00`;
    return null;
  };

  const formatTimeLabel = (time, duration) => {
    const [hour, minute] = time.split(":").map(Number);
    const startHour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const startPeriod = hour >= 12 ? "pm" : "am";
    const startFormatted = `${startHour12}:${minute.toString().padStart(2, "0")}${startPeriod}`;
    let endMinute = minute + duration;
    let endHour = hour;
    if (endMinute >= 60) {
      endMinute -= 60;
      endHour += 1;
    }
    const endHour12 =
      endHour === 0 ? 12 : endHour > 12 ? endHour - 12 : endHour;
    const endPeriod = endHour >= 12 ? "pm" : "am";
    const endFormatted = `${endHour12}:${endMinute.toString().padStart(2, "0")}${endPeriod}`;
    return `${startFormatted} – ${endFormatted}`;
  };

  const formatDateLabel = (day, date) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const d = new Date(date + "T00:00:00");
    return `${day} ${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const handleConfirm = () => {
    const errors = validateRegistrationForm(form);
    if (!form.email.trim()) errors.email = "Please enter the applicant's email";
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }
    if (!editableDate) {
      setError("Please select a date");
      return;
    }
    if (!startTime) {
      setError("Please enter a start time");
      return;
    }
    if (!endTime) {
      setError("Please enter an end time");
      return;
    }

    // For new bookings, check the email isn't already booked
    // For rebookings, skip this check since they already have a booking
    if (!isRebooking) {
      const existingAppointment = existingAppointments.find(
        (apt) => apt.email === form.email.trim(),
      );
      if (existingAppointment) {
        setError(
          "This applicant already has an appointment. Please cancel the existing one first.",
        );
        return;
      }
    }

    const dateObj = new Date(editableDate + "T00:00:00");
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = dayNames[dateObj.getDay()];
    const duration = getDuration();

    // When rebooking, exclude the applicant's own current slot from conflict check
    const excludeEmail = isRebooking
      ? rebookingAppointment?.email || rebookingAppointment?.applicantEmail
      : null;

    if (!checkSlotAvailability(dayName, startTime, duration, excludeEmail)) {
      setError(
        "The selected time slot is not available. Please choose another time.",
      );
      return;
    }

    const appointmentData = {
      firstName: form.firstName,
      lastName: form.lastName,
      name: `${form.firstName} ${form.lastName}`,
      email: form.email,
      phone: form.phone,
      streetAddress: form.streetAddress,
      city: form.city,
      province: form.province,
      postalCode: form.postalCode,
      address: `${form.streetAddress}, ${form.city}, ${form.province}, ${form.postalCode}`,
      householdMembers: form.householdMembers || [],
      statusInCanada: form.statusInCanada,
      applyingToTinyBundles: form.applyingToTinyBundles,
      language: form.language,
      day: dayName,
      startTime: startTime.padStart(5, "0"),
      duration: duration,
      date: dateObj.toISOString(),
      dateLabel: formatDateLabel(dayName, editableDate),
      timeLabel: formatTimeLabel(startTime, duration),
    };

    onConfirmBooking(appointmentData);
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: "primary.main" }}
          >
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

        <RegistrationFields
          form={form}
          onChange={(key) => (e) => {
            if (isRebooking) return;
            setForm((prev) => ({ ...prev, [key]: e.target.value }));
            setError("");
          }}
          errors={formErrors}
          isDisabled={isRebooking}
        />

        <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            fullWidth
            sx={{ fontWeight: 600 }}
          >
            Discard
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirm}
            fullWidth
            sx={{ fontWeight: 600, color: "common.white" }}
          >
            {isRebooking ? "Confirm Change" : "Confirm"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

// Copilot was used to format the code and help with bug fixes. The code has been reviewed
