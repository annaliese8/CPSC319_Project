import React from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  Stack,
  Alert,
} from "@mui/material";

export default function StaffBookingPanel({ 
  selectedSlot,
  onClose, 
  onConfirmBooking,
  existingAppointments = []
}) {
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    householdMembers: "",
  });

  const [error, setError] = React.useState("");
  const [editableDate, setEditableDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");

  const addMinutesToTime = (time, minutesToAdd) => {
    if (!time || !time.includes(":")) return "";
    const [hour, minute] = time.split(":").map(Number);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return "";

    const totalMinutes = hour * 60 + minute + minutesToAdd;
    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;
    return `${endHour}:${endMinute.toString().padStart(2, "0")}`;
  };

  // Initialize editable date/time when slot changes
  React.useEffect(() => {
    if (selectedSlot) {
      const dayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(selectedSlot.day);
      const date = new Date(selectedSlot.weekStart);
      date.setDate(date.getDate() + dayIndex);
      setEditableDate(date.toISOString().split('T')[0]);
      setStartTime(selectedSlot.time);
      setEndTime(addMinutesToTime(selectedSlot.time, 15));
    }
  }, [selectedSlot]);

  const onChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setError(""); // Clear error when user makes changes
  };

  const householdSizeInvalid =
    form.householdMembers !== "" && Number(form.householdMembers) < 1;

  // Phone validation: must be 10+ digits
  const validatePhone = (phone) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10;
  };

  const phoneInvalid = form.phone !== "" && !validatePhone(form.phone);

  // Calculate duration based on household size
  const getDuration = () => {
    const size = Number(form.householdMembers);
    return size >= 5 ? 30 : 15;
  };

  React.useEffect(() => {
    const duration = getDuration();
    if (startTime) {
      setEndTime(addMinutesToTime(startTime, duration));
    }
  }, [form.householdMembers, startTime]);

  // Check if the required time slots are available
  const checkSlotAvailability = (day, time, duration) => {
    // For 15 min appointments, just check the time slot
    if (duration === 15) {
      return !isSlotBooked(day, time);
    }
    
    // For 30 min appointments, check both current and next slot
    const nextTime = getNextTimeSlot(time);
    if (!nextTime) {
      return false; // Can't book 30 min if there's no next slot
    }
    
    return !isSlotBooked(day, time) && !isSlotBooked(day, nextTime);
  };

  const isSlotBooked = (day, time) => {
    return existingAppointments.some(apt => 
      apt.day === day && apt.startTime === time
    );
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
    
    // Format start time in am/pm
    const startHour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const startPeriod = hour >= 12 ? "pm" : "am";
    const startFormatted = `${startHour12}:${minute.toString().padStart(2, "0")}${startPeriod}`;
    
    // Calculate end time with duration
    let endMinute = minute + duration;
    let endHour = hour;
    if (endMinute >= 60) {
      endMinute -= 60;
      endHour += 1;
    }
     
    //format end time in am/pm
    const endHour12 = endHour === 0 ? 12 : endHour > 12 ? endHour - 12 : endHour;
    const endPeriod = endHour >= 12 ? "pm" : "am";
    const endFormatted = `${endHour12}:${endMinute.toString().padStart(2, "0")}${endPeriod}`;
    
    return `${startFormatted} – ${endFormatted}`;
  };

  const formatDateLabel = (day, weekStart) => {
    const dayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day);
    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayIndex);
    
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    
    return `${day} ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const handleConfirm = () => {
    // Validation
    if (!form.name.trim()) {
      setError("Please enter the applicant's name");
      return;
    }
    
    if (!form.email.trim()) {
      setError("Please enter the applicant's email");
      return;
    }
    
    if (!form.phone.trim()) {
      setError("Please enter the applicant's phone number");
      return;
    }
    
    if (!validatePhone(form.phone)) {
      setError("Please enter a valid phone number (at least 10 digits)");
      return;
    }
    
    if (!form.householdMembers || Number(form.householdMembers) < 1) {
      setError("Please enter a valid household size (1 or more)");
      return;
    }

    // Validate date and time are set
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

    // Check if this email already has an appointment
    const existingAppointment = existingAppointments.find(apt => 
      apt.email === form.email.trim()
    );
    
    if (existingAppointment) {
      setError("This applicant already has an appointment. Please cancel the existing one first.");
      return;
    }

    // Get day name from edited date for availability check
    const dateObj = new Date(editableDate + 'T00:00:00');
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = dayNames[dateObj.getDay()];
    const duration = getDuration();

    // Check slot availability for the edited date/time
    if (!checkSlotAvailability(dayName, startTime, duration)) {
      setError("The selected time slot is not available for the requested duration. Please choose another time.");
      return;
    }
    
    const appointmentData = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      householdMembers: form.householdMembers,
      address: null,
      statusInCanada: null,
      applyingToTinyBundles: null,
      day: dayName,
      startTime: startTime,
      duration: duration,
      dateLabel: formatDateLabel(dayName, selectedSlot.weekStart),
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>
          BOOK APPOINTMENT
        </Typography>
        <Button
          onClick={onClose}
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
          label="Applicant Name*"
          value={form.name}
          onChange={onChange("name")}
          fullWidth
          size="small"
        />

        <TextField
          label="Email*"
          type="email"
          value={form.email}
          onChange={onChange("email")}
          fullWidth
          size="small"
        />

        <TextField
          label="Phone Number*"
          type="tel"
          value={form.phone}
          onChange={onChange("phone")}
          fullWidth
          size="small"
          placeholder="(123) 456-7890"
          error={phoneInvalid}
          helperText={phoneInvalid ? "Must be at least 10 digits" : ""}
        />

        <TextField
          label="Household Members*"
          type="number"
          value={form.householdMembers}
          onChange={onChange("householdMembers")}
          fullWidth
          size="small"
          inputProps={{ min: "1", step: "1" }}
          error={householdSizeInvalid}
          helperText={
            householdSizeInvalid
              ? "Must be 1 or more"
              : form.householdMembers >= 5
              ? "30 min appointment"
              : form.householdMembers >= 1
              ? "15 min appointment"
              : ""
          }
        />

        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            fullWidth
            size="small"
            sx={{ fontWeight: 600 }}
          >
            Discard
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleConfirm}
            fullWidth
            size="small"
            sx={{ fontWeight: 600, color: "common.white" }}
          >
            Confirm
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

// Copilot was used to format the code and help with bug fixes. The code has been reviewed
