// claude.ai was used to generate and debug this page
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getApplicants } from "../../api/applicantsAPI"

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ClearIcon from "@mui/icons-material/Clear";
import { STATUS_OPTIONS } from "../../components/AppointmentStatus";

import StaffTopBar from "../../components/StaffTopBar";

function ApplicantDatabase() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const staffBase = import.meta.env.VITE_STAFF_BASE;
  const handleLogout = () => {
    localStorage.removeItem("staffAuth");
    navigate(`/${staffBase}/login`);
  };

  useEffect(() => {
    getApplicants()
      .then(setApplicants)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, []);

  // Filter by name or email
  const filtered = applicants.filter((a) => {
    const fullName = `${a.first_name || ""} ${a.last_name || ""}`.toLowerCase();
    const email = (a.email_address || "").toLowerCase();
    const q = query.toLowerCase();
    return fullName.includes(q) || email.includes(q);
  });

  const handleRowClick = (applicant) => {
    const appt = getAppointment(applicant)
    navigate(`/staff/applicant-info`, {
      state: {
        appointment: {
          id: applicant.response_id,
          first_name: applicant.first_name || "",
          last_name: applicant.last_name || "",
          email: applicant.email_address || "",
          phone: applicant.phone || "",
          street_addr: applicant.street_addr || "",
          city: applicant.city || "",
          postal_code: applicant.postal_code || "",
          status_in_canada: applicant.status_in_canada || "",
          tiny_bundles_program: applicant.tiny_bundles_program || false,
          appointmentStatus: appt?.appointment_status || "",
        },
      },
    })
  }

  const getAppointment = (applicant) => {
    const appts = applicant.appointments
    if (!Array.isArray(appts) || appts.length === 0) return null
    return appts.sort((a, b) =>
      new Date(b.appointment_date) - new Date(a.appointment_date)
    )[0]
  }

  const bookingStatus = (a) => {
    const appt = getAppointment(a)
    if (appt) return appt.appointment_status || "Booked"
    if (a.first_name) return "Registered"
    return "Pending"
  }

  const statusColor = (s) => {
    const match = STATUS_OPTIONS.find(
      (o) => o.label.toLowerCase() === s.toLowerCase()
    )
    return match?.color ?? (s === "Registered" ? "warning" : "default")
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <title>Applicant Database | Surrey Food Bank</title>
      <StaffTopBar onLogout={handleLogout} />

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            Registered Applicants
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </Typography>
        </Box>

        <TextField
          label="Search applicant database"
          fullWidth
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ mb: 3 }}
          slotProps={{ htmlInput: { maxLength: 254 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton size="small" aria-label="Clear search" onClick={() => setQuery("")}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
            Loading...
          </Typography>
        ) : error ? (
          <Typography color="error" align="center" sx={{ mt: 4 }}>
            Error loading applicants: {error}. Please try reloading the page.
          </Typography>
        ) : applicants.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
            No applicants have registered yet.
          </Typography>
        ) : filtered.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
            No applicants found for "{query}".
          </Typography>
        ) : (
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "grey.100" }}>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Appointment</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((applicant) => {
                  const status = bookingStatus(applicant);
                  return (
                    <TableRow
                      key={applicant.response_id}
                      hover
                      sx={{
                        cursor: "pointer",
                        "&:focus-visible": {
                          outline: "5px solid",
                          outlineColor: "secondary.main",
                          outlineOffset: "-5px",
                        },
                      }}
                      onClick={() => handleRowClick(applicant)}
                      tabIndex={0}
                      role="button"
                      aria-label={`View details for ${applicant.first_name} ${applicant.last_name}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleRowClick(applicant);
                        }
                      }}
                    >
                      <TableCell>
                        {applicant.first_name && applicant.last_name
                          ? `${applicant.first_name} ${applicant.last_name}`
                          : <em style={{ color: "#aaa" }}>Not provided</em>}
                      </TableCell>
                      <TableCell>{applicant.email_address}</TableCell>
                      <TableCell>
                        {(() => {
                          const appt = getAppointment(applicant)
                          if (!appt?.appointment_date || !appt?.appointment_time) {
                            return <em style={{ color: "#757575" }}>No appointment booked</em>
                          }
                          const date = new Date(`${appt.appointment_date}T12:00:00`)
                          const dateLabel = date.toLocaleDateString("en-US", {
                            weekday: "long", month: "long", day: "numeric", year: "numeric",
                          })
                          const timeLabel = appt.appointment_time.slice(0, 5)
                          return `${dateLabel} · ${timeLabel}`
                        })()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={status}
                          size="small"
                          color={statusColor(status)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <ArrowForwardIosIcon fontSize="small" color="action" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
}

export default ApplicantDatabase;