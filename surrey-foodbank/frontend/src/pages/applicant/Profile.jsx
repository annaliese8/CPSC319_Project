import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
  Button,
  Stack,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import BookingInfo from "../../components/BookingInfo";
import AppointmentPersonalInfo from "../../components/AppointmentPersonalInfo";
import ApplicantTopBar from "../../components/ApplicantTopBar";
import CancelBookingDialogue from "../../components/CancelBookingDialogue";

function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("activeUser");
    navigate("/applicant/login");
  };

  // Sample appointment data - in production, this would come from a backend or localStorage
    const appointment = location.state ?? {
    name: "Harnoor Kaur",
    address: "5462 Example Ln.",
    statusInCanada: "Temporary Resident (6 months+)",
    applyingToTinyBundles: "Yes",
    householdMembers: "3",
    dateLabel: "Monday March 26, 2026",
    timeLabel: "3:30pm – 3:45pm",
  };

  const onCancelBooking = () => {
    setShowCancelDialog(true);
  };
  const onChangeBooking = () => navigate(`/applicant/book-appointment`);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <ApplicantTopBar onLogout={handleLogout}/>

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }} elevation={1}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: { xs: 2, md: 4 },
              alignItems: "start",
            }}
          >
            <AppointmentPersonalInfo appointment={appointment} />
            <BookingInfo
              appointment={appointment}
              onCancelBooking={onCancelBooking}
              onChangeBooking={onChangeBooking}
            />
          </Box>
        </Paper>
      </Box>
      <CancelBookingDialogue
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        appointment={appointment}
        isStaff={false}
      />
    </Box>
  );
}

export default Profile;

// GitHub Copilot was used to format the page above