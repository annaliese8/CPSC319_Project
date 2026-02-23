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
import BookingInfo from "../../components/BookingInfo";
import ApplicantPersonalInfo from "../../components/AppointmentPersonalInfo";
import StaffTopBar from "../../components/StaffTopBar";

export default function ApplicantInfoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleBack = () => navigate("/staff/home");
  const appointment = location.state?.appointment;


  const onCancelBooking = () => console.log("Cancel booking clicked");
  const onChangeBooking = () => console.log("Change booking clicked");

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
            />
            <BookingInfo 
              appointment={appointment}
              onCancelBooking={onCancelBooking}
              onChangeBooking={onChangeBooking}
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

// GitHub Copilot was used to debug the code above 