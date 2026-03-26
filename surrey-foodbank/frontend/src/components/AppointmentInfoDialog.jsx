import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Button,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AppointmentStatus from "./AppointmentStatus";
import { useNavigate } from "react-router-dom";

function AppointmentInfoDialog({
  open,
  onClose,
  appointment,
  onDelete,
  onStatusChange
}) {
  const navigate = useNavigate();

  const handleMoreDetails = () => {
    // Pass data via router state for now (no backend yet)
    navigate("/staff/applicant-info", { state: { appointment } });
  };

  return (
    // Creates a dialog box to interact with when clicked on the appointment in calendar
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "primary.main",
          fontWeight: 800,
          letterSpacing: 0.3,
        }}
      >
        APPOINTMENT INFO
        <IconButton aria-label="Close appointment information dialog window" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Shows appointment details here */}
      <DialogContent>
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {appointment?.name}
          </Typography>
          <Typography variant="body1" sx={{ m: 2 }}>
            {appointment?.dateLabel}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {appointment?.timeLabel}
          </Typography>
          <AppointmentStatus
            appointment={appointment}
            onStatusChange={onStatusChange}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
        <Button
          variant="contained"
          color="warning"
          onClick={() => onDelete?.(appointment)}
          sx={{ fontWeight: 800, color: "common.white" }}
        >
          Delete Booking
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleMoreDetails}
          sx={{ fontWeight: 800, color: "common.white" }}
        >
          More Details
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AppointmentInfoDialog;