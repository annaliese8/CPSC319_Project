import { Box } from "@mui/material";
import StaffTopBar from "../../components/StaffTopBar";
import WelcomePanel from "../../components/WelcomePanel";
//import AdminCalendarPanel from "../../components/AdminCalendarPanel";
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const staffBase = import.meta.env.VITE_STAFF_BASE;
  const handleLogout = () => navigate(`/${staffBase}/login`);
  //const handleEditSlots = () => console.log("Edit Available Slots clicked");

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <StaffTopBar onLogout={handleLogout} />

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
        {/* <AdminCalendarPanel onEditSlots={handleEditSlots} /> */}
      </Box>
    </Box>
  );
}

export default Home;
