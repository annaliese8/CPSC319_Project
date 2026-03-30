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
  onStatusChange,
}) {
  const navigate = useNavigate();

  const handleMoreDetails = () => {
    navigate("/staff/applicant-info", { state: { appointment } });
  };

  const dateLabel = appointment?.date
    ? new Date(appointment.date).toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      })
    : ""

  const timeLabel = appointment?.startTime || ""

  return (
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
      <DialogContent>
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {appointment?.name}
          </Typography>
          <Typography variant="body1" sx={{ m: 2 }}>
            {dateLabel}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {timeLabel}
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