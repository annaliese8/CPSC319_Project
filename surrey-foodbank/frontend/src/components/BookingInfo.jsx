import React from "react";
import { Typography, Box, Paper, Button, Divider, Stack } from "@mui/material";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AppointmentStatus from "./AppointmentStatus";
import { formatDateFull, formatTimeRange } from "../utils/TimeUtils";

export default function BookingInfo({
  appointment,
  onCancelBooking,
  onChangeBooking,
  onBookAppointment,
  onStatusChange,
  isStaffPage,
}) {
  // CHANGED: check DB fields (appointment_date/appointment_time) with fallback to old fields
  const hasAppointment =
    !!(appointment?.appointment_date || appointment?.day) &&
    !!(appointment?.appointment_time || appointment?.startTime);

  // Format date with full weekday; format time as "9:00am – 9:15am" range
  const dateDisplay = formatDateFull(
    appointment?.appointment_date ??
      appointment?.date ??
      appointment?.dateLabel ??
      "",
  );
  const timeDisplay =
    appointment?.appointment_date || appointment?.date
      ? formatTimeRange(
          appointment?.appointment_time ?? appointment?.startTime,
          appointment?.duration,
        )
      : (appointment?.timeLabel ?? "");

  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          bgcolor: "grey.50",
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            m: { xs: 4, md: 6 },
            borderRadius: 2,
            bgcolor: "common.white",
            textAlign: "center",
          }}
        >
          {hasAppointment ? (
            // Shows if the applicant has an existing appointment
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  px: 2,
                  py: 3.5,
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2.5,
                    bgcolor: "#e9f3f7",
                    border: "2px solid #4cc5dc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <EventAvailableIcon
                    sx={{ fontSize: "1.5rem", color: "primary.main" }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "primary.main",
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    mb: 0.5,
                  }}
                >
                  Appointment Confirmed
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ color: "primary.main", fontWeight: 700 }}
                >
                  {dateDisplay}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ color: "#2a7f9e", fontWeight: 600 }}
                >
                  {timeDisplay}
                </Typography>
                {/* If it's a staff page, render the appointment status component */}
                {isStaffPage && (
                  <Box sx={{ mt: 1 }}>
                    <AppointmentStatus
                      appointment={appointment}
                      onStatusChange={onStatusChange}
                    />
                  </Box>
                )}
              </Box>
              <Divider />
              <Stack
                // justifyContent="center"
                // direction={{ xs: "column", sm: "row" }}
                // spacing={2}
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                justifyContent="center"
                sx={{ px: 2.5, py: 1.75 }}
              >
                <Button
                  variant="contained"
                  color="warning"
                  onClick={onCancelBooking}
                  sx={{ fontWeight: 700, color: "common.white" }}
                >
                  Cancel Booking
                </Button>
                <Button
                  variant="contained"
                  onClick={onChangeBooking}
                  sx={{
                    fontWeight: 700,
                    bgcolor: "grey.600",
                    color: "common.white",
                    "&:hover": { bgcolor: "grey.700" },
                  }}
                >
                  Change Booking
                </Button>
              </Stack>
            </>
          ) : (
            // Shows if the applicant doesn't have an existing appointment
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                px: 2,
                py: 3.5,
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2.5,
                  bgcolor: "#e9f3f7",
                  border: "2px solid #4cc5dc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <EventBusyIcon
                  sx={{ fontSize: "1.5rem", color: "primary.main" }}
                />
              </Box>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  fontSize: "1.3rem",
                  color: "primary.main",
                }}
              >
                No appointment booked
              </Typography>
              <Typography variant="body2">
                Click below to select a time that works best for you
              </Typography>
              <Button
                variant="contained"
                onClick={onBookAppointment}
                sx={{
                  mt: 1.5,
                  fontWeight: 700,
                  backgroundColor: "primary",
                  color: "common.white",
                  fontSize: { xs: "1rem", md: "1.2rem" },
                  px: 2,
                  py: 1.5,
                  textTransform: "none",
                }}
              >
                Make an Appointment Now
              </Button>
            </Box>
          )}
        </Paper>
      </Paper>
    </Box>
  );
}
