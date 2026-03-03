import {
  Box,
  Paper,
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
  const [appointment, setAppointment] = useState({
    name: "",
    phone: "",
    address: "",
    statusInCanada: "",
    applyingToTinyBundles: "no",
    householdMembers: "",
    dateLabel: "",
    timeLabel: "",
  });

  const handleLogout = () => {
    localStorage.removeItem("activeUser");
    navigate("/applicant/login");
  };

  useEffect(() => {
    const activeUser = JSON.parse(localStorage.getItem("activeUser") || "null");

    if (!activeUser?.email) {
      navigate("/applicant/login");
      return;
    }

    const storageKey = `applicant_${activeUser.email}`;
    
    // Prioritize location.state (just completed booking) over stored data
    if (location.state) {
      setAppointment((prev) => ({ ...prev, ...location.state }));
      localStorage.setItem(storageKey, JSON.stringify(location.state));
      return;
    }

    // Otherwise load from localStorage
    const storedData = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (storedData) {
      setAppointment((prev) => ({ ...prev, ...storedData }));
      return;
    }

    // Fallback to email-based name if no data exists
    setAppointment((prev) => ({ ...prev, name: activeUser.email.split("@")[0] || "" }));
  }, [navigate, location.state]);

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