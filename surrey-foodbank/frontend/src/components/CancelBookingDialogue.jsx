// GitHub copilot was used to generate parts of the dialogue box but has been reviewed manually
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { deleteAppointment } from "../api/appointmentsAPI"; // CHANGED: import API instead of localStorage
import { formatDateFull, formatTimeRange } from "../utils/TimeUtils";

function CancelBookingDialogue({
  open,
  onClose,
  appointment,
  isStaff = false,
  applicantEmail = null,
  onConfirmCancel = null,
  onCancelComplete = null,
}) {
  const navigate = useNavigate();

  // CHANGED: replaced localStorage logic with deleteAppointment API call
  const handleCancel = async () => {
    const appointmentId = appointment?.appointment_id;
    if (appointmentId) {
      try {
        await deleteAppointment(appointmentId);
      } catch (err) {
        console.error("Failed to cancel appointment:", err.message);

      }
    }

    if (onCancelComplete) onCancelComplete();
    onClose();

    // Applicant side: navigate away after cancel
    if (!isStaff) {
      navigate("/applicant/profile");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "common.white",
          display: "flex",
          alignItems: "center",
          gap: 2,
          fontWeight: 800,
          fontSize: 28,
        }}
      >
        <IconButton onClick={onClose} aria-text="Back" sx={{ color: "common.white" }}>
          <ArrowBackIcon />
        </IconButton>
        Please Confirm
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" align="center" sx={{ mb: 2, mt: 3 }}>
          Are you sure you want to cancel the following appointment?
        </Typography>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            {appointment?.first_name
              ? `${appointment.first_name} ${appointment.last_name ?? ""}`
              : appointment?.name ?? "N/A"}
          </Typography>
          <Typography variant="body1" sx={{ fontStyle: "italic", mb: 0.5 }}>
            {formatDateFull(
              appointment?.appointment_date ?? appointment?.date ?? appointment?.dateLabel ?? ""
            ) || "No date set"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {(appointment?.appointment_date || appointment?.date)
              ? formatTimeRange(
                  appointment?.appointment_time ?? appointment?.startTime,
                  appointment?.duration
                )
              : (appointment?.timeLabel ?? "No time set")}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: "space-between" }}>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            bgcolor: "grey.500",
            color: "common.white",
            fontWeight: 700,
            "&:hover": { bgcolor: "grey.600" },
          }}
        >
          Nevermind
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={handleCancel}
          sx={{ fontWeight: 700, color: "common.white" }}
        >
          Yes, Please Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CancelBookingDialogue;
// GitHub copilot was used to generate parts of the dialogue box but has been reviewed manually