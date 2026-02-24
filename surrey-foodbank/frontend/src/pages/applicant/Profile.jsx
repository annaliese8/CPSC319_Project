import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
  Button,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import BookingInfo from "../../components/BookingInfo";
import AppointmentPersonalInfo from "../../components/AppointmentPersonalInfo";
import ApplicantTopBar from "../../components/ApplicantTopBar";
import CancelBookingDialogue from "../../components/CancelBookingDialogue";

function Profile() {
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Load applicant data from localStorage on mount
  useEffect(() => {
    const activeUser = JSON.parse(localStorage.getItem("activeUser"));
    if (!activeUser || !activeUser.email) {
      navigate("/applicant/login");
      return;
    }

    // Get applicant data from localStorage
    const applicantData = JSON.parse(localStorage.getItem(`applicant_${activeUser.email}`)) || {
      name: "",
      address: "",
      statusInCanada: "Temporary Resident (6 months+)",
      applyingToTinyBundles: "no",
      householdMembers: "0",
      dateLabel: "Monday March 26, 2026",
      timeLabel: "3:30pm – 3:45pm",
    };

    setAppointment(applicantData);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("activeUser");
    navigate("/applicant/login");
  };

  const handleSavePersonalInfo = (updatedData) => {
    const activeUser = JSON.parse(localStorage.getItem("activeUser"));
    if (activeUser && activeUser.email) {
      // Save to localStorage
      localStorage.setItem(`applicant_${activeUser.email}`, JSON.stringify(updatedData));
      // Update local state
      setAppointment(updatedData);
      console.log("Data saved to localStorage", updatedData);
    }
  };

  const onCancelBooking = () => {
    setShowCancelDialog(true);
  };
  
  const onChangeBooking = () => console.log("Change booking clicked");

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
            <AppointmentPersonalInfo 
              appointment={appointment} 
              onSave={handleSavePersonalInfo}
            />
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