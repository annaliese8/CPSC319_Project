import React, { useState, useEffect, useCallback } from "react";
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import StaffTopBar from "../../components/StaffTopBar";
import WelcomePanel from "../../components/WelcomePanel";
import AdminCalendarPanel from "../../components/AdminCalendarPanel";
import { useNavigate, useLocation } from "react-router-dom";
import { useSessionTimeout } from "../../hooks/useSessionTimeout";

function Home() {
  const [isEditing, setIsEditing] = useState(false);
  const [canceled, setCanceled] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [toggleBookingPanel, setToggleBookingPanel] = useState(0);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const staffBase = import.meta.env.VITE_STAFF_BASE;

  // Capture booking state once on mount (location.state is only valid on initial navigation)
  const [changeBookingAppointment] = useState(() =>
    location.state?.changeBooking ? location.state.appointment : null
  );
  const [isNewBooking] = useState(() => location.state?.isNewBooking ?? false);

  // Immediately clear location.state so that:
  // 1. A page refresh doesn't re-open the booking panel
  // 2. isNewBooking doesn't linger and cause "Change Appointment" to misbehave
  useEffect(() => {
    if (location.state?.changeBooking) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("staffAuth");
    navigate(`/${staffBase}/login`);
  }, [navigate, staffBase]);

  const handleWarning = useCallback(() => {
    setShowTimeoutWarning(true);
  }, []);

  const resetTimer = useSessionTimeout(handleLogout, handleWarning);

  const handleStayLoggedIn = () => {
    setShowTimeoutWarning(false);
    resetTimer();
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

      <Dialog open={showTimeoutWarning} onClose={handleStayLoggedIn}>
        <DialogTitle>Session Expiring Soon</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You will be logged out in 1 minute due to inactivity. Do you want to stay logged in?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogout} color="error">
            Log Out
          </Button>
          <Button onClick={handleStayLoggedIn} variant="contained" autoFocus>
            Stay Logged In
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Home;
