// import React from "react";
// import {
//   Typography,
//   Box,
//   TextField,
//   Button,
//   Stack,
//   Alert,
// } from "@mui/material";

// export default function StaffBookingPanel({ 
//   selectedSlot,
//   onClose, 
//   onConfirmBooking,
//   existingAppointments = []
// }) {
//   const [form, setForm] = React.useState({
//     name: "",
//     email: "",
//     phone: "",
//     address: "",
//     householdMembers: "",
//   });

//   const [error, setError] = React.useState("");
//   const [editableDate, setEditableDate] = React.useState("");
//   const [startTime, setStartTime] = React.useState("");
//   const [endTime, setEndTime] = React.useState("");

//   const addMinutesToTime = (time, minutesToAdd) => {
//     if (!time || !time.includes(":")) return "";
//     const [hour, minute] = time.split(":").map(Number);
//     if (Number.isNaN(hour) || Number.isNaN(minute)) return "";

//     const totalMinutes = hour * 60 + minute + minutesToAdd;
//     const endHour = Math.floor(totalMinutes / 60);
//     const endMinute = totalMinutes % 60;
//     return `${endHour}:${endMinute.toString().padStart(2, "0")}`;
//   };

//   // Initialize editable date/time when slot changes
//   React.useEffect(() => {
//     if (selectedSlot) {
//         // Use selectedSlot.date directly if available, otherwise derive from weekStart
//         const date = selectedSlot.date
//             ? new Date(selectedSlot.date)
//             : (() => {
//                 const dayIndex = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].indexOf(selectedSlot.day);
//                 const d = new Date(selectedSlot.weekStart);
//                 d.setDate(d.getDate() + dayIndex);
//                 return d;
//             })();
//         setEditableDate(date.toISOString().split('T')[0]);  // yields "2026-03-09" ✓
//         setStartTime(selectedSlot.time);
//         setEndTime(addMinutesToTime(selectedSlot.time, 15));
//     }
// }, [selectedSlot]);

//   const onChange = (key) => (e) => {
//     setForm((prev) => ({ ...prev, [key]: e.target.value }));
//     setError(""); // Clear error when user makes changes
//   };

//   const householdSizeInvalid =
//     form.householdMembers !== "" && Number(form.householdMembers) < 1;

//   // Phone validation: must be 10+ digits
//   const validatePhone = (phone) => {
//     const digits = phone.replace(/\D/g, "");
//     return digits.length >= 10;
//   };

//   const phoneInvalid = form.phone !== "" && !validatePhone(form.phone);

//   // Calculate duration based on household size
//   const getDuration = () => {
//     const size = Number(form.householdMembers);
//     return size >= 5 ? 30 : 15;
//   };

//   React.useEffect(() => {
//     const duration = getDuration();
//     if (startTime) {
//       setEndTime(addMinutesToTime(startTime, duration));
//     }
//   }, [form.householdMembers, startTime]);

//   // Check if the required time slots are available
//   const checkSlotAvailability = (day, time, duration) => {
//     // For 15 min appointments, just check the time slot
//     if (duration === 15) {
//       return !isSlotBooked(day, time);
//     }

//     // For 30 min appointments, check both current and next slot
//     const nextTime = getNextTimeSlot(time);
//     if (!nextTime) {
//       return false; // Can't book 30 min if there's no next slot
//     }

//     return !isSlotBooked(day, time) && !isSlotBooked(day, nextTime);
//   };

//   const isSlotBooked = (day, time) => {
//     return existingAppointments.some(apt => 
//       apt.day === day && apt.startTime === time
//     );
//   };

//   const getNextTimeSlot = (time) => {
//     const [hour, minute] = time.split(":").map(Number);
//     if (minute === 0) return `${hour}:15`;
//     if (minute === 15) return `${hour}:30`;
//     if (minute === 30) return `${hour}:45`;
//     if (minute === 45) return `${hour + 1}:00`;
//     return null;
//   };

//   const formatTimeLabel = (time, duration) => {
//     const [hour, minute] = time.split(":").map(Number);

//     // Format start time in am/pm
//     const startHour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
//     const startPeriod = hour >= 12 ? "pm" : "am";
//     const startFormatted = `${startHour12}:${minute.toString().padStart(2, "0")}${startPeriod}`;

//     // Calculate end time with duration
//     let endMinute = minute + duration;
//     let endHour = hour;
//     if (endMinute >= 60) {
//       endMinute -= 60;
//       endHour += 1;
//     }

//     //format end time in am/pm
//     const endHour12 = endHour === 0 ? 12 : endHour > 12 ? endHour - 12 : endHour;
//     const endPeriod = endHour >= 12 ? "pm" : "am";
//     const endFormatted = `${endHour12}:${endMinute.toString().padStart(2, "0")}${endPeriod}`;

//     return `${startFormatted} – ${endFormatted}`;
//   };

//   const formatDateLabel = (day, date) => {
//     const monthNames = ["January", "February", "March", "April", "May", "June",
//         "July", "August", "September", "October", "November", "December"];
//     const d = new Date(date + 'T00:00:00');
//     return `${day} ${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
// };

//   const handleConfirm = () => {
//     // Validation
//     if (!form.name.trim()) {
//       setError("Please enter the applicant's name");
//       return;
//     }

//     if (!form.email.trim()) {
//       setError("Please enter the applicant's email");
//       return;
//     }

//     if (!form.phone.trim()) {
//       setError("Please enter the applicant's phone number");
//       return;
//     }

//     if (!validatePhone(form.phone)) {
//       setError("Please enter a valid phone number (at least 10 digits)");
//       return;
//     }

//     if (!form.address.trim()) {
//     setError("Please enter the applicant's address");
//     return;
// }

//     if (!form.householdMembers || Number(form.householdMembers) < 1) {
//       setError("Please enter a valid household size (1 or more)");
//       return;
//     }

//     // Validate date and time are set
//     if (!editableDate) {
//       setError("Please select a date");
//       return;
//     }

//     if (!startTime) {
//       setError("Please enter a start time");
//       return;
//     }

//     if (!endTime) {
//       setError("Please enter an end time");
//       return;
//     }

//     // Check if this email already has an appointment
//     const existingAppointment = existingAppointments.find(apt => 
//       apt.email === form.email.trim()
//     );

//     if (existingAppointment) {
//       setError("This applicant already has an appointment. Please cancel the existing one first.");
//       return;
//     }

//     const dateObj = new Date(editableDate + 'T00:00:00');
//     const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
//     const dayName = dayNames[dateObj.getDay()];
//     const duration = getDuration();

//     if (!checkSlotAvailability(dayName, startTime, duration)) {
//         setError("The selected time slot is not available. Please choose another time.");
//         return;
//     }

//     const appointmentData = {
//       name: form.name,
//       email: form.email,
//       phone: form.phone,
//       address: form.address,        
//       householdMembers: form.householdMembers,
//       statusInCanada: null,
//       applyingToTinyBundles: null,
//       day: dayName,
//       startTime: startTime,
//       duration: duration,
//       date: dateObj.toISOString(),          
//       dateLabel: formatDateLabel(dayName, editableDate),
//       timeLabel: formatTimeLabel(startTime, duration),
//     };

//     onConfirmBooking(appointmentData);
//   };

//   if (!selectedSlot) return null;

//   return (
//     <Box
//       sx={{
//         position: "fixed",
//         left: 0,
//         top: 80,
//         bottom: 0,
//         width: "400px",
//         bgcolor: "background.paper",
//         boxShadow: 3,
//         p: 2.5,
//         overflowY: "auto",
//         zIndex: 1000,
//       }}
//     >
//       <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
//         <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>
//           BOOK APPOINTMENT
//         </Typography>
//         <Button
//           onClick={onClose}
//           sx={{ minWidth: "auto", p: 0.5, fontSize: "1.5rem" }}
//         >
//           ✕
//         </Button>
//       </Box>

//       {error && (
//         <Alert severity="error" sx={{ mb: 2 }}>
//           {error}
//         </Alert>
//       )}

//       <Stack spacing={1.5}>
//         <TextField
//           label="Date*"
//           type="date"
//           value={editableDate}
//           onChange={(e) => setEditableDate(e.target.value)}
//           fullWidth
//           size="small"
//           InputLabelProps={{ shrink: true }}
//         />

//         <Box sx={{ display: "flex", gap: 1 }}>
//           <TextField
//             label="Start Time*"
//             value={startTime}
//             onChange={(e) => setStartTime(e.target.value)}
//             fullWidth
//             size="small"
//             placeholder="9:15"
//             helperText="Format: HH:MM"
//           />
//           <Typography sx={{ alignSelf: "center", px: 0.5 }}>to</Typography>
//           <TextField
//             label="End Time*"
//             value={endTime}
//             onChange={(e) => setEndTime(e.target.value)}
//             fullWidth
//             size="small"
//             placeholder="9:30"
//             helperText="Format: HH:MM"
//           />
//         </Box>

//         <TextField
//           label="Applicant Name*"
//           value={form.name}
//           onChange={onChange("name")}
//           fullWidth
//           size="small"
//         />

//         <TextField
//           label="Email*"
//           type="email"
//           value={form.email}
//           onChange={onChange("email")}
//           fullWidth
//           size="small"
//         />

//         <TextField
//           label="Phone Number*"
//           type="tel"
//           value={form.phone}
//           onChange={onChange("phone")}
//           fullWidth
//           size="small"
//           placeholder="(123) 456-7890"
//           error={phoneInvalid}
//           helperText={phoneInvalid ? "Must be at least 10 digits" : ""}
//         />

//         <TextField
//     label="Address*"
//     value={form.address}
//     onChange={onChange("address")}
//     fullWidth
//     size="small"
//     placeholder="123 Main St, Surrey, BC V3T 0A1"
// />

//         <TextField
//           label="Household Members*"
//           type="number"
//           value={form.householdMembers}
//           onChange={onChange("householdMembers")}
//           fullWidth
//           size="small"
//           inputProps={{ min: "1", step: "1" }}
//           error={householdSizeInvalid}
//           helperText={
//             householdSizeInvalid
//               ? "Must be 1 or more"
//               : form.householdMembers >= 5
//               ? "30 min appointment"
//               : form.householdMembers >= 1
//               ? "15 min appointment"
//               : ""
//           }
//         />

//         <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
//           <Button
//             variant="outlined"
//             onClick={onClose}
//             fullWidth
//             size="small"
//             sx={{ fontWeight: 600 }}
//           >
//             Discard
//           </Button>
//           <Button
//             variant="contained"
//             color="secondary"
//             onClick={handleConfirm}
//             fullWidth
//             size="small"
//             sx={{ fontWeight: 600, color: "common.white" }}
//           >
//             Confirm
//           </Button>
//         </Stack>
//       </Stack>
//     </Box>
//   );
// }

// // Copilot was used to format the code and help with bug fixes. The code has been reviewed

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
    householdMembers: rebookingAppointment?.householdMembers || "",
    applyingToTinyBundles: rebookingAppointment?.applyingToTinyBundles || "no",
    language: rebookingAppointment?.language || "English",
    email: rebookingAppointment?.email || rebookingAppointment?.applicantEmail || "",
  });

  const [error, setError] = React.useState("");
  const [formErrors, setFormErrors] = React.useState({})
  const [editableDate, setEditableDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");

  // // Update form if rebookingAppointment changes (e.g. on mount)
  // React.useEffect(() => {
  //   if (rebookingAppointment) {
  //     setForm({
  //       name: rebookingAppointment.name || "",
  //       email: rebookingAppointment.email || rebookingAppointment.applicantEmail || "",
  //       phone: rebookingAppointment.phone || "",
  //       address: rebookingAppointment.address || "",
  //       householdMembers: rebookingAppointment.householdMembers || "",
  //     });
  //   }
  // }, [rebookingAppointment]);

  React.useEffect(() => {
    if (selectedSlot) {
      const date = selectedSlot.date
        ? new Date(selectedSlot.date)
        : (() => {
          const dayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(selectedSlot.day);
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
    const size = Number(form.householdMembers);
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
    return !isSlotBooked(day, time, excludeEmail) && !isSlotBooked(day, nextTime, excludeEmail);
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
    if (endMinute >= 60) { endMinute -= 60; endHour += 1; }
    const endHour12 = endHour === 0 ? 12 : endHour > 12 ? endHour - 12 : endHour;
    const endPeriod = endHour >= 12 ? "pm" : "am";
    const endFormatted = `${endHour12}:${endMinute.toString().padStart(2, "0")}${endPeriod}`;
    return `${startFormatted} – ${endFormatted}`;
  };

  const formatDateLabel = (day, date) => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const d = new Date(date + "T00:00:00");
    return `${day} ${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const handleConfirm = () => {

    const errors = validateRegistrationForm(form);
    if (!form.email.trim()) errors.email = "Please enter the applicant's email";
    if (Object.keys(errors).length) { setFormErrors(errors); return; }
    if (!editableDate) { setError("Please select a date"); return; }
    if (!startTime) { setError("Please enter a start time"); return; }
    if (!endTime) { setError("Please enter an end time"); return; }

    // For new bookings, check the email isn't already booked
    // For rebookings, skip this check since they already have a booking
    if (!isRebooking) {
      const existingAppointment = existingAppointments.find(
        (apt) => apt.email === form.email.trim()
      );
      if (existingAppointment) {
        setError("This applicant already has an appointment. Please cancel the existing one first.");
        return;
      }
    }

    const dateObj = new Date(editableDate + "T00:00:00");
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = dayNames[dateObj.getDay()];
    const duration = getDuration();

    // When rebooking, exclude the applicant's own current slot from conflict check
    const excludeEmail = isRebooking
      ? (rebookingAppointment?.email || rebookingAppointment?.applicantEmail)
      : null;

    if (!checkSlotAvailability(dayName, startTime, duration, excludeEmail)) {
      setError("The selected time slot is not available. Please choose another time.");
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
      householdMembers: form.householdMembers,
      statusInCanada: form.statusInCanada,
      applyingToTinyBundles: form.applyingToTinyBundles,
      language: form.language,
      day: dayName,
      startTime: startTime.padStart(5, "0"),
      duration: duration,
      date: dateObj.toISOString(),
      dateLabel: formatDateLabel(dayName, editableDate),
      timeLabel: formatTimeLabel(startTime, duration),
    }

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
        <Button onClick={onClose} aria-label="Close appointment booking panel and discard changes" sx={{ minWidth: "auto", p: 0.5, fontSize: "1.5rem" }}>
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
          InputProps={isRebooking ? { endAdornment: <LockIcon sx={{ fontSize: 16, color: "text.disabled" }} /> } : {}}
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