import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import StaffTopBar from "../../components/StaffTopBar";
import WelcomePanel from "../../components/WelcomePanel";
import AdminCalendarPanel from "../../components/AdminCalendarPanel";
import { useNavigate, useLocation } from "react-router-dom";
import { getAppointments } from "../../api/appointmentsAPI";

function Home() {
  const [isEditing, setIsEditing] = useState(false);
  const [canceled, setCanceled] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toggleBookingPanel, setToggleBookingPanel] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const staffBase = import.meta.env.VITE_STAFF_BASE;

  // Detect if we arrived here from "Change Booking" on ApplicantInfoPage
  const changeBookingAppointment = location.state?.changeBooking
    ? location.state.appointment
    : null;

  const handleLogout = () => navigate(`/${staffBase}/login`);

  const handleEditSlots = () => {
    setIsEditing(true);
    setCanceled(false);
    setSaved(false);
  };

  const handleCancel = () => {
    setCanceled(true);
    setIsEditing(false);
  };

  const handleSave = () => {
    setSaved(true);
    setIsEditing(false);
  };

  const handleBook = () => {
    setToggleBookingPanel((prev) => prev + 1);
  };

  useEffect(() => {
    getAppointments()
      .then((data) => setAppointments(data))
      .catch((err) => console.error("Failed to load appointments:", err.message))
      .finally(() => setLoadingAppointments(false));
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <title>Appointment Calendar | Surrey Food Bank</title>
      <StaffTopBar position="sticky" onLogout={handleLogout} />
      <Box
        sx={{
          padding: { xs: 2, md: 4 },
          display: "grid",
          gridTemplateColumns: { xs: "1.2fr", md: "370px 1fr" },
          gap: { xs: 2, md: 4 },
          alignItems: "start",
        }}
      >
        <WelcomePanel
          onEditSlots={handleEditSlots}
          onCancel={handleCancel}
          onSave={handleSave}
          onBook={handleBook}
        />
        <AdminCalendarPanel
          isEditing={isEditing}
          saveChanges={saved}
          discardChanges={canceled}
          toggleBookingPanel={toggleBookingPanel}
          setShowBookingPanel={setToggleBookingPanel}
          appointments={appointments}
          changeBookingAppointment={changeBookingAppointment}
        />
      </Box>
    </Box>
  );
}

export default Home;
