import React from "react";
import { Box, Button } from "@mui/material";
import StaffTopBar from "../../components/StaffTopBar";
import WelcomePanel from "../../components/WelcomePanel";
import AdminCalendarPanel from "../../components/AdminCalendarPanel";
import { useNavigate } from 'react-router-dom';
import AppointmentInfoDialog from "../../components/ApplicantInfoCard";

function Home() {
  const navigate = useNavigate();
  // const staffBase = import.meta.env.VITE_STAFF_BASE;
  // const handleLogout = () => navigate(`/${staffBase}/login`);
  //const handleEditSlots = () => console.log("Edit Available Slots clicked");
  const handleLogout = () => navigate('/staff/login');
  const handleEditSlots = () => console.log("Edit Available Slots clicked");
  const [openInfoDialog, setOpenInfoDialog] = React.useState(false);
  const sampleAppointment = {
    name: "Joshua Pemberton",
    dateLabel: "Monday March 26, 2026",
    timeLabel: "3:30pm – 3:45pm",
  };



  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <StaffTopBar onLogout={handleLogout} label = "Admin Page"/>

      {/* Main Layout */}
      <Box
        sx={{
          padding: { xs: 2, md: 4 },
          display: "grid",
          gridTemplateColumns: { xs: "1.2fr", md: "370px 1fr" },
          gap: { xs: 2, md: 4 },
          alignItems: "start",
        }}
      >
        {/* Left Panel for staff instructions */}
        <WelcomePanel />
        {/* Right panel to show calendar and manage bookings */}
        <AdminCalendarPanel onEditSlots={handleEditSlots} />
        {/*TODO: Testing Applicant Info */}
        <Button variant="outlined" onClick={() => setOpenInfoDialog(true)}>
            Open Appointment Dialog (test)
        </Button>
        <AppointmentInfoDialog open={openInfoDialog} onClose={() => setOpenInfoDialog(false)} appointment={sampleAppointment} onDelete={() => {}} />
      </Box>
    </Box>
  );
}

export default Home;
