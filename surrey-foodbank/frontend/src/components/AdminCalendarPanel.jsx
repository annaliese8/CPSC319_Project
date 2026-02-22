import React from "react";
import {
  Typography,
  Box,
  Button,
  Paper,
  Stack,
  Chip,
  Divider,
} from "@mui/material";

function AdminCalendarPanel({ onEditSlots }) {
  return (
    <Paper sx={{ padding: { xs: 2, md: 3 }, borderRadius: 2 }} elevation={1}>
      {/* Week header row to show current date */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={() => console.log("Previous 7 Days")}
          size="small"
        >
          Previous 7 Days
        </Button>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Mon Feb 23 - Sun Mar 1
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Vancouver - America (GMT -08:00)
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={() => console.log("Next 7 Days")}
          size="small"
        >
          Next 7 Days
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Calendar placeholder + legend */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "0.75fr", md: "1fr 130px" },
          gap: 2,
          alignItems: "start",
        }}
      >
        {/* Calendar Placeholder */}
        <Box
          sx={{
            height: { xs: 420, md: 560 },
            border: "1px solid",
            borderColor: "grey.300",
            borderRadius: 2,
            bgcolor: "common.white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
          }}
        >
          Calendar should go here
        </Box>

        {/* Legend */}
        <Stack direction = "column" spacing={1.5}>
          <LegendChip label="Available" sx={{ bgcolor: "grey.300" }} />
          <LegendChip label="Booked" sx={{ bgcolor: "secondary.main" }} />
          <LegendChip
            label="Staff Booked"
            sx={{ bgcolor: "primary.main", color: "common.white" }}
          />
          <LegendChip
            label="Blocked"
            sx={{ bgcolor: "warning.main", color: "common.white" }}
          />
        </Stack>
      </Box>

      {/* Edit slots should take you to edit slot window using the function we pass on here*/}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button variant="contained" color="secondary" onClick={onEditSlots} sx={{ fontWeight: "bold", color: "common.white"}}>
          Edit Available Slots
        </Button>
      </Box>
    </Paper>
  );
}

function LegendChip({ label, sx }) {
  return (
    <Chip
      label={label}
      sx={{
        justifyContent: "flex-start",
        borderRadius: 2,
        fontWeight: 600,
        px: 0.5,
        ...sx,
      }}
    />
  );
}

export default AdminCalendarPanel;
