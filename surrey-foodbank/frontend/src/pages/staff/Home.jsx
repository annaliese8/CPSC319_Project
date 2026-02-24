import React from "react";
import { Box, Button } from "@mui/material";
import StaffTopBar from "../../components/StaffTopBar";
import WelcomePanel from "../../components/WelcomePanel";
import AdminCalendarPanel from "../../components/AdminCalendarPanel";
import { useNavigate } from 'react-router-dom';
import AppointmentInfoDialog from "../../components/ApplicantInfoCard";

function Home() {
  const navigate = useNavigate();
  const staffBase = import.meta.env.VITE_STAFF_BASE;
  const handleLogout = () => navigate(`/${staffBase}/login`);
  const handleEditSlots = () => console.log("Edit Available Slots clicked");
  const [openInfoDialog, setOpenInfoDialog] = React.useState(false);
  const [appointmentData, setAppointmentData] = React.useState(null);

  // Load appointment from demo user for testing
  React.useEffect(() => {
    // Get demo user's appointment data (harnoor@example.com from InitDemoData)
    const demoEmail = localStorage.getItem("activeUser") ? JSON.parse(localStorage.getItem("activeUser")).email : "harnoor@exmaple.com";
    const storedData = localStorage.getItem(`applicant_${demoEmail}`);
    
    if (storedData) {
      setAppointmentData(JSON.parse(storedData));
    } else {
      // Fallback to sample data if no stored data exists
      setAppointmentData({
        name: "Joshua Pemberton",
        address: "123 Main Street, Surrey BC V3T 1A2",
        statusInCanada: "Permanent Resident",
        applyingToTinyBundles: "yes",
        householdMembers: "2",
        dateLabel: "Monday March 26, 2026",
        timeLabel: "3:30pm – 3:45pm",
      });
    }
  }, []);



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
        {/* Right panel to show calender and manage bookings */}
        <AdminCalendarPanel onEditSlots={handleEditSlots} />
        {/*TODO: Testing Applicant Info */}
        <Button variant="outlined" onClick={() => setOpenInfoDialog(true)}>
            Open Appointment Dialog (test)
        </Button>
        <AppointmentInfoDialog open={openInfoDialog} onClose={() => setOpenInfoDialog(false)} appointment={appointmentData} onDelete={() => {}} />
      </Box>
    </Box>
  );
}

export default Home;
// GitHub Copilot was used to debug the code above and help with localStorage logic
