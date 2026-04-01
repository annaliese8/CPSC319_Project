import React, { useState } from "react";
import { Box } from "@mui/material";
import StaffTopBar from "../../components/StaffTopBar";
import WelcomePanel from "../../components/WelcomePanel";
import AdminCalendarPanel from "../../components/AdminCalendarPanel";
import { useNavigate, useLocation } from "react-router-dom";

function Home() {
  const [isEditing, setIsEditing] = useState(false);
  const [canceled, setCanceled] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [toggleBookingPanel, setToggleBookingPanel] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const staffBase = import.meta.env.VITE_STAFF_BASE;

  // Detect if we arrived here from "Change Booking" on ApplicantInfoPage
  const changeBookingAppointment = location.state?.changeBooking
    ? location.state.appointment
    : null;
    const isNewBooking = location.state?.isNewBooking ?? false;

  const handleLogout = () => {
    localStorage.removeItem("staffAuth");
    navigate(`/${staffBase}/login`);
  };

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
  };

  const handleBook = () => {
    setToggleBookingPanel((prev) => prev + 1);
  };

  const handleConfirm = () => {
      setConfirmed(true);
      setIsEditing(false);
  };


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
          isConfirmed={confirmed}
          setIsConfirmed={setConfirmed}
        />
        <AdminCalendarPanel
          isEditing={isEditing}
          saveChanges={saved}
          setSaveState={setSaved}
          discardChanges={canceled}
          toggleBookingPanel={toggleBookingPanel}
          changeBookingAppointment={changeBookingAppointment}
          isNewBooking={isNewBooking}
          saveConfirmed={handleConfirm}
        />
      </Box>
    </Box>
  );
}

export default Home;
