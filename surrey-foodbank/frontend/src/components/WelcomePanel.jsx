import React from "react";
import { Typography, Box } from "@mui/material";

function WelcomePanel() {
  return (
    <Box sx={{ pt: { xs: 0, md: 6 } }}>
      <Typography variant="h3" align= "center" color="primary" sx={{ fontSize: 25, mb: 2, fontWeight: "bold"}}>
        Welcome!
      </Typography>
      <Typography variant="body1" sx={{ mb: 1.5, fontStyle: "italic" }}>
        Click on booked appointments to see details and edit.
      </Typography>
      <Typography variant="body1" sx={{ fontStyle: "italic" }}>
        Click on grey availability slots to book appointment.
      </Typography>
    </Box>
  );
}

export default WelcomePanel;
