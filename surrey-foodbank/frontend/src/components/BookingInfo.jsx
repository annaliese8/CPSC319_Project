import React from "react";
import {
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  Stack,
} from "@mui/material";

export default function BookingInfo({ appointment, onCancelBooking, onChangeBooking }) {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, color: "primary.main", mb: 2 }}>
        Booking Info
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: "grey.50",
        }}
      >
        <Typography sx={{ fontSize: 20, fontWeight: 800, color: "secondary.main", mb: 1 }}>
          You Have an Appointment Booked For:
        </Typography>

        <Paper
          variant="outlined"
          sx={{ p: 2, borderRadius: 2, bgcolor: "common.white" }}
        >
          <Typography sx={{ fontStyle: "italic" }}>
            {appointment?.dateLabel ?? "Monday March 26, 2026"}
          </Typography>
          <Typography color="text.secondary">
            {appointment?.timeLabel ?? "3:30pm – 3:45pm"}
          </Typography>
        </Paper>

        <Divider sx={{ my: 2 }} />

        <Stack justifyContent="center" direction={{ xs: "column", sm: "row" }} spacing={2}>
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
      </Paper>
    </Box>
  );
}

