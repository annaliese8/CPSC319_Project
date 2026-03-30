// import {
//   AppBar,
//   Box,
//   Button,
//   Divider,
//   IconButton,
//   Paper,
//   Stack,
//   Toolbar,
//   Typography,
// } from "@mui/material";
// import {
//   ArrowBack as ArrowBackIcon,
//   Check as CheckIcon,
//   Clear as ClearIcon,
// } from "@mui/icons-material";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// import BookingInfo from "../../components/BookingInfo";
// import CancelBookingDialogue from "../../components/CancelBookingDialogue";
// import RegistrationFormInfo from "../../components/RegistrationFormInfo";
// import HouseholdMemberInfo from "../../components/HouseholdMemberInfo";
// import { validateHouseholdMembers } from "../../utils/ValidateHouseholdMembers";
// import { updateApplicant } from "../../api/applicantsAPI";

// export default function ApplicantInfoPage() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const handleBack = () => navigate("/staff/applicant-database");
//   const [appointment, setAppointment] = useState(location.state?.appointment);
//   const [showCancelDialog, setShowCancelDialog] = useState(false);

//   const [pendingHouseholdMembers, setPendingHouseholdMembers] = useState(
//     appointment?.householdMembers ?? [],
//   );
//   const [memberErrors, setMemberErrors] = useState({});

//   const hasChanges =
//     JSON.stringify(pendingHouseholdMembers) !==
//     JSON.stringify(appointment?.householdMembers ?? []);

//   // Keep in sync when appointment loads
//   useEffect(() => {
//     setPendingHouseholdMembers(appointment?.householdMembers ?? []);
//   }, [appointment?.householdMembers]);

//   const onCancelBooking = () => {
//     setShowCancelDialog(true);
//   };

//   const handleCancelComplete = () => {
//     if (appointment) {
//       setAppointment({
//         ...appointment,
//         day: "",
//         startTime: "",
//         dateLabel: "",
//         timeLabel: "",
//         appointmentStatus: "",
//       });
//     }
//   };

//   // Navigate to staff home with the appointment pre-loaded for rebooking
//   const onChangeBooking = () => {
//     navigate("/staff/home", {
//       state: {
//         changeBooking: true,
//         appointment: appointment,
//       },
//     });
//   };

//   const handleSavePersonalInfo = async (updatedData) => {
//     const applicantId = appointment?.id;
//     if (!applicantId) {
//       console.error("No applicant id found — cannot save to database");
//       return;
//     }
//     try {
//       // Map frontend field names to DB column names
//       const dbData = {
//         first_name: updatedData.first_name,
//         last_name: updatedData.last_name,
//         email_address: updatedData.email,
//         phone: updatedData.phone,
//         street_addr: updatedData.street_addr,
//         city: updatedData.city,
//         postal_code: updatedData.postal_code,
//         status_in_canada: updatedData.status_in_canada,
//         tiny_bundles_program: updatedData.tiny_bundles_program,
//       };
//       // Remove undefined fields so we don't overwrite with null
//       Object.keys(dbData).forEach((k) => dbData[k] === undefined && delete dbData[k]);

//       await updateApplicant(applicantId, dbData);
//       setAppointment((prev) => ({ ...prev, ...updatedData }));
//     } catch (err) {
//       console.error("Failed to save applicant info:", err.message);
//     }
//   };

//   const handleHouseholdSave = () => {
//     const errors = validateHouseholdMembers(pendingHouseholdMembers);
//     if (Object.keys(errors).length) {
//       setMemberErrors(errors);
//       return;
//     }
//     setMemberErrors({});
//     handleSavePersonalInfo({
//       ...appointment,
//       householdMembers: pendingHouseholdMembers,
//     });
//   };

//   const handleHouseholdDiscard = () => {
//     setPendingHouseholdMembers(appointment?.householdMembers ?? []);
//     setMemberErrors({});
//   };

//   // CHANGED: was writing to localStorage, now updates via API
//   const handleStatusChange = async (newStatus) => {
//     const applicantId = appointment?.id;
//     if (!applicantId) {
//       console.error("No applicant id found — cannot update status");
//       return;
//     }
//     try {
//       await updateApplicant(applicantId, { appointmentStatus: newStatus });
//       setAppointment((prev) => ({ ...prev, appointmentStatus: newStatus }));
//     } catch (err) {
//       console.error("Failed to update status:", err.message);
//     }
//   };

//   return (
//     <Box sx={{ minHeight: "100vh" }}>
//       <title>Applicant Info | Surrey Food Bank</title>
//       <AppBar
//         position="static"
//         sx={{
//           bgcolor: "primary.main",
//           borderBottomLeftRadius: 20,
//           borderBottomRightRadius: 20,
//           borderTopLeftRadius: 20,
//           borderTopRightRadius: 20,
//         }}
//       >
//         <Toolbar>
//           <IconButton
//             edge="start"
//             color="inherit"
//             onClick={handleBack}
//             aria-label="Back"
//           >
//             <ArrowBackIcon />
//           </IconButton>
//           <Typography variant="h6" sx={{ fontWeight: 800 }}>
//             Applicant Info
//           </Typography>
//         </Toolbar>
//       </AppBar>

//       <Box sx={{ p: { xs: 2, md: 4 } }}>
//         <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }} elevation={1}>
//           <Stack
//             direction={{ xs: "column", md: "row" }}
//             spacing={3}
//             divider={<Divider orientation="vertical" flexItem />}
//             sx={{
//               justifyContent: "center",
//               alignItems: "stretch",
//             }}
//           >
//             <Box sx={{ flex: 1 }}>
//               <Typography
//                 variant="h4"
//                 sx={{ fontWeight: 800, color: "primary.main", mb: 2 }}
//               >
//                 Registration Form Responses
//               </Typography>
//               <RegistrationFormInfo
//                 appointment={appointment || null}
//                 onSave={handleSavePersonalInfo}
//               />
//             </Box>
//             <Stack>
//               <Box sx={{ flex: 1 }}>
//                 <Typography
//                   variant="h4"
//                   sx={{ fontWeight: 800, color: "primary.main", mb: 2 }}
//                 >
//                   Booking Information
//                 </Typography>
//                 <BookingInfo
//                   appointment={appointment}
//                   onCancelBooking={onCancelBooking}
//                   onChangeBooking={onChangeBooking}
//                   onStatusChange={handleStatusChange}
//                   isStaffPage={true}
//                 />
//               </Box>
//               <Divider sx={{ my: 3 }} />
//               <Typography
//                 variant="h4"
//                 sx={{ fontWeight: 800, color: "primary.main", mb: 2 }}
//               >
//                 Household Members
//               </Typography>
//               <Paper
//                 variant="outlined"
//                 sx={{ p: 4, borderRadius: 2, bgcolor: "grey.25" }}
//               >
//                 <Stack spacing={2}>
//                   {hasChanges && (
//                     <>
//                       <Stack direction="row" spacing={2}>
//                         <Button
//                           variant="outlined"
//                           color="primary"
//                           size="large"
//                           startIcon={<ClearIcon />}
//                           sx={{ fontWeight: 800, flex: 1 }}
//                           onClick={handleHouseholdDiscard}
//                         >
//                           Discard Changes
//                         </Button>
//                         <Button
//                           variant="contained"
//                           color="primary"
//                           size="large"
//                           startIcon={<CheckIcon />}
//                           sx={{
//                             fontWeight: 800,
//                             color: "common.white",
//                             flex: 1,
//                           }}
//                           onClick={handleHouseholdSave}
//                         >
//                           Save Changes
//                         </Button>
//                       </Stack>
//                       <Divider />
//                     </>
//                   )}
//                   <HouseholdMemberInfo
//                     householdMembers={pendingHouseholdMembers}
//                     onChange={setPendingHouseholdMembers}
//                     errors={memberErrors}
//                   />
//                 </Stack>
//               </Paper>
//             </Stack>
//           </Stack>
//         </Paper>
//       </Box>

//       <CancelBookingDialogue
//         open={showCancelDialog}
//         onClose={() => setShowCancelDialog(false)}
//         appointment={appointment}
//         isStaff={true}
//         applicantEmail={appointment?.email || null}
//         onCancelComplete={handleCancelComplete}
//       />
//     </Box>
//   );
// }

// // GitHub Copilot and ChatGPT was used to debug the code above and help with localStorage logic
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
import { useState, useEffect } from "react";
import BookingInfo from "../../components/BookingInfo";
import CancelBookingDialogue from "../../components/CancelBookingDialogue";
import RegistrationFormInfo from "../../components/RegistrationFormInfo";
import HouseholdMemberInfo from "../../components/HouseholdMemberInfo";
import { validateHouseholdMembers } from "../../utils/ValidateHouseholdMembers";
import { updateApplicant } from "../../api/applicantsAPI";
import { getAppointmentByResponseId, updateAppointment } from "../../api/appointmentsAPI"
  import { getHouseholdMembers } from "../../api/applicantsAPI"

export default function ApplicantInfoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleBack = () => navigate("/staff/applicant-database");

  const [appointment, setAppointment] = useState(location.state?.appointment);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [dbAppointment, setDbAppointment] = useState(null);

  const [pendingHouseholdMembers, setPendingHouseholdMembers] = useState(
    appointment?.householdMembers ?? []
  );
  const [memberErrors, setMemberErrors] = useState({});

  const hasChanges =
    JSON.stringify(pendingHouseholdMembers) !==
    JSON.stringify(appointment?.householdMembers ?? []);

  useEffect(() => {
    setPendingHouseholdMembers(appointment?.householdMembers ?? []);
  }, [appointment?.householdMembers]);

  // CHANGED: load appointment record from DB using response_id
useEffect(() => {
  const responseId = appointment?.id
  if (!responseId) return

  getAppointmentByResponseId(responseId)
    .then((data) => { if (data) setDbAppointment(data) })
    .catch((err) => console.error("Failed to load appointment:", err.message))

  getHouseholdMembers(responseId)
    .then((result) => {
      const members = result?.data ?? []
      setAppointment((prev) => ({ ...prev, householdMembers: members }))
      setPendingHouseholdMembers(members)
    })
    .catch((err) => console.error("Failed to load household members:", err.message))

  fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/applicants/${responseId}`)
    .then((res) => res.json())
    .then((result) => {
      const reg = result?.data ?? null
      if (!reg) return
      setAppointment((prev) => ({
        ...prev,
        first_name: reg.first_name || "",
        last_name: reg.last_name || "",
        email: reg.email_address || "",
        phone: reg.phone || "",
        street_addr: reg.street_addr || "",
        city: reg.city || "",
        postal_code: reg.postal_code || "",
        status_in_canada: reg.status_in_canada || "",
        tiny_bundles_program: reg.tiny_bundles_program || false,
      }))
    })
    .catch((err) => console.error("Failed to load registration:", err.message))
}, [appointment?.id])

  const onCancelBooking = () => setShowCancelDialog(true);

  const handleCancelComplete = () => setDbAppointment(null);

  const onChangeBooking = () => {
    navigate("/staff/home", {
      state: {
        changeBooking: true,
        appointment: {
          ...appointment,
          response_id: appointment?.id,
          appointment_id: dbAppointment?.appointment_id,
        },
      },
    });
  };

  const onBookAppointment = () => {
    navigate("/staff/home", {
      state: {
        changeBooking: true,
        appointment: {
          ...appointment,
          response_id: appointment?.id,
        },
        isNewBooking: true,
      },
    });
  };

  const handleSavePersonalInfo = async (updatedData) => {
    const applicantId = appointment?.id ?? appointment?.response_id;
    if (!applicantId) {
      console.error("No applicant id found — cannot save to database");
      return;
    }
    try {
      const dbData = {
        first_name: updatedData.first_name,
        last_name: updatedData.last_name,
        email_address: updatedData.email,
        phone: updatedData.phone,
        street_addr: updatedData.street_addr,
        city: updatedData.city,
        postal_code: updatedData.postal_code,
        status_in_canada: updatedData.status_in_canada,
        tiny_bundles_program: updatedData.tiny_bundles_program,
      };
      // Remove undefined keys
      Object.keys(dbData).forEach(
        (k) => dbData[k] === undefined && delete dbData[k]
      );
      await updateApplicant(applicantId, dbData);
      setAppointment((prev) => ({ ...prev, ...updatedData }));
      return true;
    } catch (err) {
      console.error("Failed to save applicant info:", err.message);
      return false;
    }
  };

  // Save household members directly to the DB via the dedicated endpoint
  const handleHouseholdSave = async () => {
    const errors = validateHouseholdMembers(pendingHouseholdMembers);
    if (Object.keys(errors).length) {
      setMemberErrors(errors);
      return;
    }
    setMemberErrors({});

    const responseId = appointment?.id ?? appointment?.response_id;
    if (!responseId) {
      console.error("No responseId — cannot save household members");
      return;
    }

    try {
      const result = await saveHouseholdMembers(
        responseId,
        pendingHouseholdMembers
      );
      const saved = result?.data ?? pendingHouseholdMembers;
      setAppointment((prev) => ({ ...prev, householdMembers: saved }));
      setPendingHouseholdMembers(saved);
    } catch (err) {
      console.error("Failed to save household members:", err.message);
    }
  };

  const handleHouseholdDiscard = () => {
    setPendingHouseholdMembers(appointment?.householdMembers ?? []);
    setMemberErrors({});
  };

  const handleStatusChange = async (newStatus) => {
  const appointmentId = dbAppointment?.appointment_id
  if (!appointmentId) {
    console.error("No appointment_id found — cannot update status")
    return
  }
  try {
    await updateAppointment(appointmentId, { appointment_status: newStatus })
    setDbAppointment((prev) => ({ ...prev, appointment_status: newStatus }))
  } catch (err) {
    console.error("Failed to update status:", err.message)
  }
}

  const mergedAppointment = {
  ...appointment,
  ...dbAppointment,
  appointmentStatus: dbAppointment?.appointment_status || appointment?.appointmentStatus || "",
}

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
            sx={{ justifyContent: "center", alignItems: "stretch" }}
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
                isStaffPage={true}
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
                  appointment={mergedAppointment}
                  onCancelBooking={onCancelBooking}
                  onChangeBooking={onChangeBooking}
                  onBookAppointment={onBookAppointment}
                  onStatusChange={handleStatusChange}
                  isStaffPage={true}
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
        appointment={mergedAppointment}
        isStaff={true}
        onCancelComplete={handleCancelComplete}
      />
    </Box>
  );
}

// GitHub Copilot and ChatGPT was used to debug the code above and help with localStorage logic