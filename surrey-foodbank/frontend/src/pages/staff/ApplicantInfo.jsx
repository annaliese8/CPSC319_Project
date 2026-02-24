import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import BookingInfo from "../../components/BookingInfo";
import ApplicantPersonalInfo from "../../components/AppointmentPersonalInfo";
import CancelBookingDialogue from "../../components/CancelBookingDialogue";

export default function ApplicantInfoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleBack = () => navigate("/staff/home");
  const [appointment, setAppointment] = useState(location.state?.appointment);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Load fresh data from localStorage when component mounts or when applicantEmail changes
  useEffect(() => {
    const applicantEmail = location.state?.appointment?.applicantEmail;
    if (applicantEmail) {
      const storedData = localStorage.getItem(`applicant_${applicantEmail}`);
      if (storedData) {
        const data = JSON.parse(storedData);
        setAppointment({ ...data, applicantEmail }); // Preserve the applicantEmail
      }
    }
  }, [location.state?.appointment?.applicantEmail]);


  const onCancelBooking = () => {
    setShowCancelDialog(true);
  };

  const handleCancelComplete = () => {
    // Update the local state to reflect the cancelled booking
    if (appointment) {
      setAppointment({
        ...appointment,
        dateLabel: "",
        timeLabel: "",
      });
    }
  };
  const onChangeBooking = () => console.log("Change booking clicked");
  
  const handleSavePersonalInfo = (updatedData) => {
    // Save to the APPLICANT's localStorage, not the staff's
    const applicantEmail = appointment?.applicantEmail;
    if (applicantEmail) {
      // Preserve the applicantEmail in the updated data
      const dataToSave = { ...updatedData, applicantEmail };
      localStorage.setItem(`applicant_${applicantEmail}`, JSON.stringify(dataToSave));
      // Update local state
      setAppointment(dataToSave);
      console.log("Data saved to localStorage for", applicantEmail, dataToSave);
    } else {
      console.error("No applicant email found in appointment data");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar position="static" sx={{ bgcolor: "primary.main", borderBottomLeftRadius: 20, borderBottomRightRadius: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20}}>  
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBack} aria-label="Back">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Applicant Info
          </Typography>
        </Toolbar>
      </AppBar>

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
            <ApplicantPersonalInfo 
              appointment={appointment || null}
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
        isStaff={true}
        applicantEmail={appointment?.applicantEmail || null}
        onCancelComplete={handleCancelComplete}
      />
    </Box>
  );
}

// GitHub Copilot was used to debug the code above and help with localStorage logic