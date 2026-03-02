import React from "react";
import { Typography, Box, Paper, Button, Divider, Stack } from "@mui/material";

export default function BookingInfo({
  appointment,
  onCancelBooking,
  onChangeBooking,
}) {
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
          <Typography
            color="secondary"
            variant="h5"
            size="large"
            sx={{ fontWeight: 700 }}
          >
            {appointment?.dateLabel ?? "Monday, March 26, 2026"}
          </Typography>
          <Typography color="primary" variant="h6" sx={{ fontWeight: 600 }}>
            {appointment?.timeLabel ?? "3:30pm – 3:45pm"}
          </Typography>
        </Paper>

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
      </Paper>
    </Box>
  );
}
