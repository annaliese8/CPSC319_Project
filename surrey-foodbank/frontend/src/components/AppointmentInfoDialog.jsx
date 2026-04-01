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
import { formatDateFull, formatTimeRange, formatPhone } from "../utils/TimeUtils";

function AppointmentInfoDialog({
  open,
  onClose,
  appointment,
  onDelete,
  onStatusChange,
}) {
  const navigate = useNavigate();

  const handleMoreDetails = () => {
    navigate("/staff/applicant-info", {
      state: {
        from: "calendar",
        appointment: {
          ...appointment,
          // ApplicantInfoPage keys off `id` to fire its API calls
          id: appointment?.response_id ?? appointment?.id,
        },
      },
    });
  };

  const dateLabel = formatDateFull(appointment?.date);
  const timeLabel = formatTimeRange(appointment?.startTime, appointment?.duration ?? 15);

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

          {/* Phone + household size with labels */}
          <Box sx={{ mt: 1, display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 0.25 }}>
            {appointment?.phone && (
              <Typography variant="body2" color="text.secondary">
                <span style={{ fontWeight: 600 }}>Phone: </span>
                {formatPhone(appointment.phone)}
              </Typography>
            )}
            {appointment?.householdSize != null && (
              <Typography variant="body2" color="text.secondary">
                <span style={{ fontWeight: 600 }}>Household Size: </span>
                {appointment.householdSize}
              </Typography>
            )}
          </Box>

          <Typography variant="body1" sx={{ mt: 1.5, mb: 0.5 }}>
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
          color="primary"
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