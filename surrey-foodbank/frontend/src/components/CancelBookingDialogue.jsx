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

function CancelBookingDialogue({
  open,
  onClose,
  appointment,
  isStaff = false,
  applicantEmail = null,
  onCancelComplete = null,
}) {
  const navigate = useNavigate();

  const handleCancel = () => {
  const emailToUse = isStaff
    ? applicantEmail
    : JSON.parse(localStorage.getItem("activeUser") || "null")?.email;

  if (emailToUse) {
    const key = `applicant_${emailToUse}`;
    const storedData = localStorage.getItem(key);
    if (storedData) {
      const data = JSON.parse(storedData);
      // Clear all booking fields, not just labels
      data.day = "";
      data.startTime = "";
      data.date = "";
      data.duration = 0;
      data.dateLabel = "";
      data.timeLabel = "";
      localStorage.setItem(key, JSON.stringify(data));

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
        <IconButton onClick={onClose} sx={{ color: "common.white" }}>
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
            {appointment?.name || "N/A"}
          </Typography>
          <Typography variant="body1" sx={{ fontStyle: "italic", mb: 0.5 }}>
            {appointment?.dateLabel || "No date set"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {appointment?.timeLabel || "No time set"}
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