// import React, { useState } from "react";
// import { Box } from "@mui/material";
// import StaffTopBar from "../../components/StaffTopBar";
// import WelcomePanel from "../../components/WelcomePanel";
// import AdminCalendarPanel from "../../components/AdminCalendarPanel";
// import { useNavigate, useLocation } from 'react-router-dom';
// import AppointmentInfoDialog from "../../components/AppointmentInfoDialog";

// function Home() {
//   const [openInfoDialog, setOpenInfoDialog] = React.useState(false);
//   const [appointmentData, setAppointmentData] = React.useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [canceled, setCanceled] = useState(false);
//   const [saved, setSaved] = useState(false);
//   const [toggleBookingPanel, setToggleBookingPanel] = React.useState(0);

//   const navigate = useNavigate();
//   const location = useLocation();
//   const staffBase = import.meta.env.VITE_STAFF_BASE;

//   // Detect if we arrived here from "Change Booking" on ApplicantInfoPage
//   const changeBookingAppointment = location.state?.changeBooking
//     ? location.state.appointment
//     : null;

//   const handleLogout = () => navigate(`/${staffBase}/login`);

//   const handleEditSlots = () => {
//     setIsEditing(true);
//     setCanceled(false);
//     setSaved(false);
//   };

//   const handleCancel = () => {
//     setCanceled(true);
//     setIsEditing(false);
//   };

//   const handleSave = () => {
//     setSaved(true);
//     setIsEditing(false);
//   };

//   const handleBook = () => {
//     setToggleBookingPanel(toggleBookingPanel + 1);
//   };

//   // Load appointment from demo user for testing
//   React.useEffect(() => {
//     const demoEmail = localStorage.getItem("activeUser")
//       ? JSON.parse(localStorage.getItem("activeUser")).email
//       : "harnoor@example.com";
//     const storedData = localStorage.getItem(`applicant_${demoEmail}`);
//     if (storedData) {
//       setAppointmentData(JSON.parse(storedData));
//     } else {
//       setAppointmentData({
//         name: "Joshua Pemberton",
//         address: "123 Main Street, Surrey BC V3T 1A2",
//         statusInCanada: "Permanent Resident",
//         applyingToTinyBundles: "yes",
//         householdMembers: "2",
//         dateLabel: "Monday March 26, 2026",
//         timeLabel: "3:30pm – 3:45pm",
//       });
//     }
//   }, []);

//   return (
//     <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
//       <title>Appointment Calendar | Surrey Food Bank</title>
//       <StaffTopBar position="sticky" onLogout={handleLogout} />
//       {/* Main Layout */}
//       <Box
//         sx={{
//           padding: { xs: 2, md: 4 },
//           display: "grid",
//           gridTemplateColumns: { xs: "1.2fr", md: "370px 1fr" },
//           gap: { xs: 2, md: 4 },
//           alignItems: "start",
//         }}
//       >
//         {/* Left Panel for staff instructions */}
//         <WelcomePanel
//           onEditSlots={handleEditSlots}
//           onCancel={handleCancel}
//           onSave={handleSave}
//           onBook={handleBook}
//         />
//         {/* Right panel to show calendar and manage bookings */}
//         <AdminCalendarPanel
//           isEditing={isEditing}
//           saveChanges={saved}
//           discardChanges={canceled}
//           toggleBookingPanel={toggleBookingPanel}
//           setShowBookingPanel={setToggleBookingPanel}
//           // Pass the appointment to rebook (if coming from ApplicantInfoPage)
//           changeBookingAppointment={changeBookingAppointment}
//         />
//       </Box>
//     </Box>
//   );
// }

// export default Home;

// // GitHub Copilot was used to debug the code above and help with localStorage logic
import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import StaffTopBar from "../../components/StaffTopBar";
import WelcomePanel from "../../components/WelcomePanel";
import AdminCalendarPanel from "../../components/AdminCalendarPanel";
import { useNavigate, useLocation } from "react-router-dom";
import AppointmentInfoDialog from "../../components/AppointmentInfoDialog";
import { getAppointments } from "../../api/appointmentsAPI"; // CHANGED: import appointments API

function Home() {
  const [openInfoDialog, setOpenInfoDialog] = React.useState(false);
  const [appointmentData, setAppointmentData] = React.useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [canceled, setCanceled] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toggleBookingPanel, setToggleBookingPanel] = React.useState(0);
  // CHANGED: added state for appointments loaded from DB
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
    setToggleBookingPanel(toggleBookingPanel + 1);
  };

  // CHANGED: replaced localStorage demo user logic with API call
  useEffect(() => {
    getAppointments()
      .then((data) => {
        setAppointments(data);
        // Set first appointment as the preview appointment if available
        if (data.length > 0) {
          const first = data[0];
          setAppointmentData({
            appointment_id: first.appointment_id,
            response_id: first.response_id,
            name: first.registrationformresponse
              ? `${first.registrationformresponse.first_name} ${first.registrationformresponse.last_name}`
              : "",
            email: first.registrationformresponse?.email_address ?? "",
            appointment_date: first.appointment_date,
            appointment_time: first.appointment_time,
            appointment_status: first.appointment_status,
            duration: first.duration,
          });
        }
      })
      .catch((err) => console.error("Failed to load appointments:", err.message))
      .finally(() => setLoadingAppointments(false));
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <title>Appointment Calendar | Surrey Food Bank</title>
      <StaffTopBar position="sticky" onLogout={handleLogout} />
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
        <WelcomePanel
          onEditSlots={handleEditSlots}
          onCancel={handleCancel}
          onSave={handleSave}
          onBook={handleBook}
        />
        {/* Right panel to show calendar and manage bookings */}
        <AdminCalendarPanel
          isEditing={isEditing}
          saveChanges={saved}
          discardChanges={canceled}
          toggleBookingPanel={toggleBookingPanel}
          setShowBookingPanel={setToggleBookingPanel}
          appointments={appointments} // CHANGED: pass DB appointments to calendar
          changeBookingAppointment={changeBookingAppointment}
        />
      </Box>
    </Box>
  );
}

export default Home;
// GitHub Copilot was used to debug the code above and help with localStorage logic