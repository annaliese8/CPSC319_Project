import {
  AppBar,
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import BookingInfo from "../../components/BookingInfo";
import CancelBookingDialogue from "../../components/CancelBookingDialogue";
import RegistrationFormInfo from "../../components/RegistrationFormInfo";
import HouseholdMemberInfo from "../../components/HouseholdMemberInfo";
import { validateHouseholdMembers } from "../../utils/ValidateHouseholdMembers";
import { updateApplicant } from "../../api/applicantsAPI";

export default function ApplicantInfoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleBack = () => navigate("/staff/home");
  const [appointment, setAppointment] = useState(location.state?.appointment);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const [pendingHouseholdMembers, setPendingHouseholdMembers] = useState(
    appointment?.householdMembers ?? [],
  );
  const [memberErrors, setMemberErrors] = useState({});

  const hasChanges =
    JSON.stringify(pendingHouseholdMembers) !==
    JSON.stringify(appointment?.householdMembers ?? []);

  // Keep in sync when appointment loads
  useEffect(() => {
    setPendingHouseholdMembers(appointment?.householdMembers ?? []);
  }, [appointment?.householdMembers]);

  // // Load fresh data from localStorage when component mounts or when applicantEmail changes
  // useEffect(() => {
  //   const applicantEmail = location.state?.appointment?.email
  //     || location.state?.appointment?.applicantEmail;
  //   if (applicantEmail) {
  //     const storedData = localStorage.getItem(`applicant_${applicantEmail}`);
  //     if (storedData) {
  //       const data = JSON.parse(storedData);
  //       setAppointment({ ...data, email: applicantEmail, applicantEmail });
  //     } else {
  //       setAppointment(location.state.appointment);
  //     }
  //   }
  // }, [location.state?.appointment?.email]);

  // // Listens for local storage changes from other tabs
  // useEffect(() => {
  //   const handleStorageChange = (e) => {
  //     if (e.key?.startsWith("applicant_")) {
  //       const updatedData = JSON.parse(e.newValue);
  //       if (updatedData.email === appointment?.email) {
  //         setAppointment(updatedData);
  //       }
  //     }
  //   };
  //   window.addEventListener("storage", handleStorageChange);
  //   return () => window.removeEventListener("storage", handleStorageChange);
  // }, [appointment]);

  const onCancelBooking = () => {
    setShowCancelDialog(true);
  };

  const handleCancelComplete = () => {
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

  // Navigate to staff home with the appointment pre-loaded for rebooking
  const onChangeBooking = () => {
    navigate("/staff/home", {
      state: {
        changeBooking: true,
        appointment: appointment,
      },
    });
  };

  const handleSavePersonalInfo = async (updatedData) => {
    const applicantId = appointment?.id;
    if (!applicantId) {
      console.error("No applicant id found — cannot save to database");
      return;
    }
    try {
      await updateApplicant(applicantId, updatedData);
      setAppointment((prev) => ({ ...prev, ...updatedData }));
    } catch (err) {
      console.error("Failed to save applicant info:", err.message);
    }
  };

  const handleHouseholdSave = () => {
    const errors = validateHouseholdMembers(pendingHouseholdMembers);
    if (Object.keys(errors).length) {
      setMemberErrors(errors);
      return;
    }
    setMemberErrors({});
    handleSavePersonalInfo({
      ...appointment,
      householdMembers: pendingHouseholdMembers,
    });
  };

  const handleHouseholdDiscard = () => {
    setPendingHouseholdMembers(appointment?.householdMembers ?? []);
    setMemberErrors({});
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <title>Applicant Info | Surrey Food Bank</title>
      <AppBar
        position="static"
        sx={{
          bgcolor: "primary.main",
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBack}
            aria-label="Back"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Applicant Info
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }} elevation={1}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            divider={<Divider orientation="vertical" flexItem />}
            sx={{
              justifyContent: "center",
              alignItems: "stretch",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: "primary.main", mb: 2 }}
              >
                Registration Form Responses
              </Typography>
              <RegistrationFormInfo
                appointment={appointment || null}
                onSave={handleSavePersonalInfo}
              />
            </Box>
            <Stack>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color: "primary.main", mb: 2 }}
                >
                  Booking Information
                </Typography>
                <BookingInfo
                  appointment={appointment}
                  onCancelBooking={onCancelBooking}
                  onChangeBooking={onChangeBooking}
                />
              </Box>
              <Divider sx={{ my: 3 }} />
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: "primary.main", mb: 2 }}
              >
                Household Members
              </Typography>
              <Paper
                variant="outlined"
                sx={{ p: 4, borderRadius: 2, bgcolor: "grey.25" }}
              >
                <Stack spacing={2}>
                  {hasChanges && (
                    <>
                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="large"
                          startIcon={<ClearIcon />}
                          sx={{ fontWeight: 800, flex: 1 }}
                          onClick={handleHouseholdDiscard}
                        >
                          Discard Changes
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          startIcon={<CheckIcon />}
                          sx={{
                            fontWeight: 800,
                            color: "common.white",
                            flex: 1,
                          }}
                          onClick={handleHouseholdSave}
                        >
                          Save Changes
                        </Button>
                      </Stack>
                      <Divider />
                    </>
                  )}
                  <HouseholdMemberInfo
                    householdMembers={pendingHouseholdMembers}
                    onChange={setPendingHouseholdMembers}
                    errors={memberErrors}
                  />
                </Stack>
              </Paper>
            </Stack>
          </Stack>
        </Paper>
      </Box>

      <CancelBookingDialogue
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        appointment={appointment}
        isStaff={true}
        applicantEmail={appointment?.email || null}
        onCancelComplete={handleCancelComplete}
      />
    </Box>
  );
}

// GitHub Copilot and ChatGPT was used to debug the code above and help with localStorage logic
