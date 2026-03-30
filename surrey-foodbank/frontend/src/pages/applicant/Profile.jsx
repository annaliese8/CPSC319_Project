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
  Check as CheckIcon,
  Clear as ClearIcon,
  ContactSupport as ContactSupportIcon,
  FormatListBulleted as FormatListBulletedIcon,
  Place as PlaceIcon,
  FamilyRestroom as FamilyRestroomIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import BookingInfo from "../../components/BookingInfo";
import RegistrationFormInfo from "../../components/RegistrationFormInfo";
import ApplicantTopBar from "../../components/ApplicantTopBar";
import CancelBookingDialogue from "../../components/CancelBookingDialogue";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { formatTime } from "../../components/BookingSteps";
import { addMinutesToTime } from "../../utils/TimeUtils";
import { INELIGIBLE_STATUS_OPTIONS } from "../../components/RegistrationFields";
import IneligibleStatusDialog from "../../components/IneligibleStatusDialog";

function getApiBaseUrl() {
  const envBase = (import.meta.env.VITE_API_BASE_URL || "").trim();
  if (envBase) return envBase.replace(/\/$/, "");
  return import.meta.env.DEV ? "http://localhost:3000" : "";
}

function toAppointmentDisplay(appointment) {
  if (!appointment?.date || !appointment?.startTime) {
    return {
      day: "",
      startTime: "",
      date: "",
      duration: 0,
      dateLabel: "",
      timeLabel: "",
    };
  }

  const duration = Number(appointment.duration || 15);
  const date = new Date(appointment.date);

  return {
    day:
      appointment.day ||
      date.toLocaleDateString("en-US", { weekday: "long" }),
    startTime: appointment.startTime,
    date: appointment.date,
    duration,
    dateLabel: date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    timeLabel: `${formatTime(appointment.startTime)} – ${formatTime(
      addMinutesToTime(appointment.startTime, duration),
    )}`,
  };
}
import HouseholdMemberInfo from "../../components/HouseholdMemberInfo";
import { validateHouseholdMembers } from "../../utils/ValidateHouseholdMembers";

function Profile() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("appointment");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [appointment, setAppointment] = useState({
    applicantEmail: "",
    firstName: "",
    lastName: "",
    name: "",
    phone: "",
    address: "",
    streetAddress: "",
    city: "",
    postalCode: "",
    province: "",
    statusInCanada: "",
    applyingToTinyBundles: "no",
    householdMembers: [],
    language: "",
    day: "",
    startTime: "",
    duration: 0,
    dateLabel: "",
    timeLabel: "",
  });
  const [pendingHouseholdMembers, setPendingHouseholdMembers] = useState(
    appointment.householdMembers ?? [],
  );
  const [memberErrors, setMemberErrors] = useState({});

  // Compare stringified arrays to detect any additions, removals, or edits of household members
  const hasChanges =
    JSON.stringify(pendingHouseholdMembers) !==
    JSON.stringify(appointment.householdMembers ?? []);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIneligibleStatusDialog, setShowIneligibleStatusDialog] = useState(false);
  const [ineligibleStatus, setIneligibleStatus] = useState("");

  // Load user and appointment data
  useEffect(() => {
    let isMounted = true;

    async function loadProfileData() {
      const supabase = getSupabaseClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const userEmail = sessionData?.session?.user?.email || "";

      if (!accessToken) {
        navigate("/applicant/login", { replace: true });
        return;
      }

      const apiBase = getApiBaseUrl();

      try {
        const [registrationResponse, appointmentResponse] = await Promise.all([
          fetch(`${apiBase}/api/applicant/registration`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }),
          fetch(`${apiBase}/api/applicant/appointment`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }),
        ]);

        const result = await registrationResponse.json().catch(() => null);
        const appointmentResult = await appointmentResponse.json().catch(() => null);
        if (!isMounted) return;

        if (!registrationResponse.ok) {
          setSubmitError(result?.error || "Unable to load registration form data.");
          setAppointment((prev) => ({
            ...prev,
            applicantEmail: userEmail,
            name: userEmail.split("@")[0] || prev.name,
          }));
          return;
        }

        if (!appointmentResponse.ok) {
          setSubmitError(
            appointmentResult?.error ||
            "Unable to load appointment data from database.",
          );
        }

        const registration = result?.data?.registration || null;
        const appointmentFromDb = toAppointmentDisplay(
          appointmentResult?.data?.appointment || null,
        );

        setAppointment((prev) => ({
          ...prev,
          applicantEmail: userEmail,
          ...appointmentFromDb,
          ...(registration || {}),
          name:
            [registration?.first_name, registration?.last_name].filter(Boolean).join(" ") ||
            userEmail.split("@")[0] ||
            prev.name,
        }));
      } catch (_error) {
        if (!isMounted) return;
        setSubmitError("Unable to load registration form data.");
      }
    }

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Keep in sync when appointment loads
  useEffect(() => {
    setPendingHouseholdMembers(appointment.householdMembers ?? []);
  }, [appointment.householdMembers]);

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
  const handleRegistrationSave = async (updatedForm) => {
    // Check if status in Canada is ineligible, and show dialog
    if (INELIGIBLE_STATUS_OPTIONS.includes(updatedForm.status_in_canada)) {
      setIneligibleStatus(updatedForm.status_in_canada);
      setShowIneligibleStatusDialog(true);
      return;
    }
    setSubmitError("");
    setIsSubmitting(true);

    const supabase = getSupabaseClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    if (!accessToken) {
      setIsSubmitting(false);
      setSubmitError("Your session has expired. Please log in again.");
      navigate("/applicant/login", { replace: true });
      return false;
    }

    const apiBase = getApiBaseUrl();

    const registerPayload = {
      ...updatedForm,
      tiny_bundles_program:
        updatedForm?.tiny_bundles_program === true || updatedForm?.tiny_bundles_program === "yes"
          ? "yes"
          : "no",
    };

    delete registerPayload.householdMembers;

    try {
      const response = await fetch(`${apiBase}/api/applicant/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(registerPayload),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setSubmitError(result?.error || "Unable to save registration form.");
        setIsSubmitting(false);
        return false;
      }

      setAppointment((prev) => ({
        ...prev,
        ...updatedForm,
        name:
          `${updatedForm.first_name || ""} ${updatedForm.last_name || ""}`.trim() ||
          prev.name,
      }));
      setIsSubmitting(false);
      return true;
    } catch (_error) {
      setSubmitError("Unable to save registration form.");
      setIsSubmitting(false);
      return false;
    }
  };

  const handleCancelComplete = async () => {
    setSubmitError("");

    const supabase = getSupabaseClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    if (!accessToken) {
      setSubmitError("Your session has expired. Please log in again.");
      navigate("/applicant/login", { replace: true });
      return;
    }

    const apiBase = getApiBaseUrl();

    try {
      const response = await fetch(`${apiBase}/api/applicant/appointment`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setSubmitError(result?.error || "Unable to cancel appointment.");
        return;
      }

      setAppointment((prev) => ({
        ...prev,
        day: "",
        startTime: "",
        date: "",
        duration: 0,
        dateLabel: "",
        timeLabel: "",
        appointmentStatus: ""
      }));
    } catch (_error) {
      setSubmitError("Unable to cancel appointment.");
    }
  };

  // Saves household member changes to database
  const handleHouseholdSave = async () => {
    const errors = validateHouseholdMembers(pendingHouseholdMembers);
    if (Object.keys(errors).length) {
      setMemberErrors(errors);
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    const supabase = getSupabaseClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    if (!accessToken) {
      setIsSubmitting(false);
      setSubmitError("Your session has expired. Please log in again.");
      navigate("/applicant/login", { replace: true });
      return;
    }

    const apiBase = getApiBaseUrl();

    try {
      const response = await fetch(`${apiBase}/api/applicant/household-members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ householdMembers: pendingHouseholdMembers }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setSubmitError(result?.error || "Unable to save household members.");
        setIsSubmitting(false);
        return;
      }
    } catch (_error) {
      setSubmitError("Unable to save household members.");
      setIsSubmitting(false);
      return;
    }

    setMemberErrors({});
    setAppointment((prev) => ({
      ...prev,
      householdMembers: pendingHouseholdMembers,
    }));
    setIsSubmitting(false);
  };

  // Reverts unsaved household member changes
  const handleHouseholdDiscard = () => {
    setPendingHouseholdMembers(appointment.householdMembers ?? []);
    setMemberErrors({});
  };

  return (
    <>
      <title>My Profile | Surrey Food Bank</title>
      <ApplicantTopBar onLogout={handleLogout} />
      {/* Tabs for switching between appointment, registration form, and household members.
          Active section is displayed on the left. Next steps secion is always on the right. */}
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
          value="registration-form"
          icon={<FormatListBulletedIcon />}
          iconPosition="start"
          label="Registration Form"
        />
        <Tab
          value="household-members"
          icon={<FamilyRestroomIcon />}
          iconPosition="start"
          label="Household Members"
        />
      </Tabs>
      {/* Shows Appointment Information when tab is active */}
      {activeTab === "appointment" && (
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
              Booking Information
            </Typography>
            <BookingInfo
              appointment={appointment}
              onCancelBooking={onCancelBooking}
              onChangeBooking={onChangeBooking}
              onBookAppointment={onBookAppointment}
              onStatusChange={null}
              isStaffPage={false}
            />
            <CancelBookingDialogue
              open={showCancelDialog}
              onClose={() => setShowCancelDialog(false)}
              appointment={appointment}
              isStaff={false}
              onConfirmCancel={handleCancelComplete}
            />
          </Box>
          <NextSteps />
        </Stack>
      )}
      {/* Shows Registration Form when tab is active */}
      {activeTab === "registration-form" && (
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
            {isSubmitting ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Saving registration form...
              </Typography>
            ) : null}
            {submitError ? (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {submitError}
              </Typography>
            ) : null}
          </Box>
          <NextSteps />
          <IneligibleStatusDialog
            open={showIneligibleStatusDialog}
            onClose={() => setShowIneligibleStatusDialog(false)}
            status={ineligibleStatus}
          />
        </Stack>
      )}
      {/* Shows Household Members when tab is active */}
      {activeTab === "household-members" && (
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          divider={<Divider orientation="vertical" flexItem />}
          sx={{ justifyContent: "center", alignItems: "stretch" }}
        >
          <Box sx={{ flex: 1, px: 5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
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
                        sx={{ fontWeight: 800, color: "common.white", flex: 1 }}
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
                aria-label="Google Maps of Surrey Food Bank's registration office"
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
                  aria-label="Surrey Food Bank website"
                >
                  surreyfoodbank.org/clients
                </Link>
              </Typography>
              <Typography color="text.secondary">
                • Email:{" "}
                <Link
                  href="mailto:registration@surreyfoodbank.org"
                  aria-label="Email address of Surrey Food Bank"
                >
                  registration@surreyfoodbank.org
                </Link>
              </Typography>
              <Typography color="text.secondary">
                • Call:{" "}
                <Link
                  href="tel:16045815443"
                  aria-label="Phone number of Surrey Food Bank"
                >
                  (604) 581-5443
                </Link>
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
