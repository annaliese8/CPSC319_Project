import {
  Box,
  Button,
  Divider,
  Link,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  Badge as BadgeIcon,
  CalendarMonth as CalendarMonthIcon,
  ContactSupport as ContactSupportIcon,
  FormatListBulleted as FormatListBulletedIcon,
  Place as PlaceIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import BookingInfo from "../../components/BookingInfo";
import RegistrationFormInfo from "../../components/RegistrationFormInfo";
import ApplicantTopBar from "../../components/ApplicantTopBar";
import CancelBookingDialogue from "../../components/CancelBookingDialogue";

function Profile() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("appointment");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [appointment, setAppointment] = useState({
    applicantEmail: "",
    name: "",
    phone: "",
    address: "",
    statusInCanada: "",
    applyingToTinyBundles: "no",
    householdMembers: "",
    day: "",
    startTime: "",
    duration: 0,
    dateLabel: "",
    timeLabel: "",
  });

  // Load user and appointment data
  useEffect(() => {
    const activeUser = JSON.parse(localStorage.getItem("activeUser") || "null");

    if (!activeUser?.email) {
      navigate("/applicant/login");
      return;
    }

    const storageKey = `applicant_${activeUser.email}`;

    // Load from localStorage
    const storedData = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (storedData) {
      setAppointment((prev) => ({ ...prev, ...storedData }));
      return;
    }

    // Fallback to email-based name if no data exists
    setAppointment((prev) => ({
      ...prev,
      name: activeUser.email.split("@")[0] || "",
    }));
  }, [navigate, location.state]);

  // Listen for updates to localStorage from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      const activeUser = JSON.parse(localStorage.getItem("activeUser"))?.email;
      const storageKey = `applicant_${activeUser}`;

      if (e.key === storageKey && e.newValue) {
        setAppointment(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const onCancelBooking = () => setShowCancelDialog(true);
  const onChangeBooking = () => navigate(`/applicant/book-appointment`);
  const onBookAppointment = () => navigate(`/applicant/book-appointment`);

  const handleLogout = () => {
    localStorage.removeItem("activeUser");
    navigate("/applicant/login");
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handles saving registration form data
  const handleRegistrationSave = (updatedForm) => {
    const activeUser = JSON.parse(localStorage.getItem("activeUser") || "null");
    if (!activeUser?.email) return;
    const storageKey = `applicant_${activeUser.email}`;
    setAppointment(updatedForm);
    localStorage.setItem(storageKey, JSON.stringify(updatedForm));
  };

  const handleCancelComplete = () => {
    // Update the local state to reflect the cancelled booking
    if (appointment) {
      setAppointment({
        ...appointment,
        day: "",
        startTime: "",
        dateLabel: "",
        timeLabel: "",
      });
    }
    
  };

  return (
    <>
      <ApplicantTopBar onLogout={handleLogout} />
      {/* Tabs for switching between appointment details and registration form */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        centered
        sx={{
          my: 4,
          "& .Mui-selected": {
            border: "2px solid",
            borderColor: "secondary.main",
            borderRadius: 2,
          },
          "& .MuiTabs-indicator": {
            display: "none",
          },
        }}
      >
        <Tab
          value="appointment"
          icon={<CalendarMonthIcon />}
          iconPosition="start"
          label="Appointment Information"
        />
        <Tab
          value="registration"
          icon={<FormatListBulletedIcon />}
          iconPosition="start"
          label="Registration Form Responses"
        />
      </Tabs>
      {activeTab === "appointment" ? (
        // Stack containing booking info on the left and next steps on the right
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          divider={<Divider orientation="vertical" flexItem />}
          sx={{
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          {/* Booking Information Section */}
          <Box sx={{ flex: 1, px: 5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
              Booking Information
            </Typography>
            <BookingInfo
              appointment={appointment}
              onCancelBooking={onCancelBooking}
              onChangeBooking={onChangeBooking}
              onBookAppointment={onBookAppointment}
            />
            <CancelBookingDialogue
              open={showCancelDialog}
              onClose={() => setShowCancelDialog(false)}
              appointment={appointment}
              isStaff={false}
              applicantEmail={appointment?.applicantEmail || null}
              onCancelComplete={handleCancelComplete}
            />
          </Box>
          {/* Next Steps Section */}
          <NextSteps />
        </Stack>
      ) : (
        // Registration Information Section
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          divider={<Divider orientation="vertical" flexItem />}
          sx={{
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          <Box sx={{ flex: 1, px: 5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
              Registration Form
            </Typography>
            <RegistrationFormInfo
              appointment={appointment}
              onSave={handleRegistrationSave}
            />
          </Box>
          <NextSteps />
        </Stack>
      )}
    </>
  );
}

// Component that shows what an applicants next steps are after booking an appt
function NextSteps() {
  return (
    <Box sx={{ flex: 1, px: 5 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
        Next Steps
      </Typography>
      <Paper
        variant="outlined"
        sx={{
          p: 4,
          borderRadius: 2,
          bgcolor: "grey.25",
        }}
      >
        <Stack spacing={3}>
          {/* What to Bring */}
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
              <BadgeIcon color="secondary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }} color="primary">
                What to Bring
              </Typography>
            </Stack>
            <Stack spacing={1} mb={1}>
              <Typography color="text.secondary">
                • Government-issued photo ID for each adult - no photocopies or
                digital copies
              </Typography>
              <Typography color="text.secondary">
                • Proof of current address within Surrey or North Delta
              </Typography>
              <Typography color="text.secondary">
                • BC Services Card for each child under 19
              </Typography>
            </Stack>
          </Box>

          {/* Location */}
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
              <PlaceIcon color="secondary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }} color="primary">
                Where to Go
              </Typography>
            </Stack>

            <Typography color="text.secondary">
              Registration Office:{" "}
              <Link
                href="https://maps.app.goo.gl/1H39wzvMBqmki2se6"
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
              >
                Unit 1 - 13478 78th Avenue, Surrey, BC
              </Link>
            </Typography>
          </Box>

          {/* Contact */}
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
              <ContactSupportIcon color="secondary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }} color="primary">
                Contact & Support
              </Typography>
            </Stack>
            <Stack spacing={1} mb={1}>
              <Typography color="text.secondary">
                If you have questions or need assistance:
              </Typography>
              <Typography color="text.secondary">
                • Visit our website:{" "}
                <Link
                  href="https://surreyfoodbank.org/clients/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  surreyfoodbank.org/clients
                </Link>
              </Typography>
              <Typography color="text.secondary">
                • Email:{" "}
                <Link href="mailto:registration@surreyfoodbank.org">
                  registration@surreyfoodbank.org
                </Link>
              </Typography>
              <Typography color="text.secondary">
                • Call: <Link href="tel:16045815443">(604) 581-5443</Link>
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

export default Profile;

// GitHub Copilot was used to format the page above and ChatGPT was used to help with localStorage implementation
