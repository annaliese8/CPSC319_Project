import React from "react";
import { Typography, Box, Paper, Button, Divider, Stack } from "@mui/material";
import AppointmentStatus from "./AppointmentStatus";

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

  // CHANGED: display DB fields with fallback to old label fields
  const dateDisplay = appointment?.appointment_date ?? appointment?.dateLabel ?? "";
  const timeDisplay = appointment?.appointment_time ?? appointment?.timeLabel ?? "";

  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: "grey.50",
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            py: 4,
            m: 4,
            borderRadius: 2,
            bgcolor: "common.white",
            textAlign: "center",
          }}
        >
          {hasAppointment ? (
            <>
              <Typography
                color="secondary"
                variant="h5"
                size="large"
                sx={{ fontWeight: 700 }}
              >
                {dateDisplay}
              </Typography>
              <Typography color="primary" variant="h6" sx={{ fontWeight: 600 }}>
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
            </>
          ) : (
            <Button
              variant="contained"
              onClick={onBookAppointment}
              sx={{
                fontWeight: 700,
                backgroundColor: "#4cc5dc",
                color: "common.white",
                fontSize: "1.2rem",
                px: 4,
                py: 1.5,
                "&:hover": { backgroundColor: "#005070" },
              }}
            >
              Book an Appointment
            </Button>
          )}
        </Paper>
        {hasAppointment && (
          <>
            <Divider sx={{ my: 2 }} />
            <Stack
              justifyContent="center"
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
            >
              <Button
                variant="contained"
                color="warning"
                onClick={onCancelBooking}
                sx={{ fontWeight: 800, color: "common.white" }}
              >
                Cancel Booking
              </Button>
              <Button
                variant="contained"
                onClick={onChangeBooking}
                sx={{
                  fontWeight: 800,
                  bgcolor: "grey.600",
                  color: "common.white",
                  "&:hover": { bgcolor: "grey.700" },
                }}
              >
                Change Booking
              </Button>
            </Stack>
          </>
        )}
      </Paper>
    </Box>
  );
}