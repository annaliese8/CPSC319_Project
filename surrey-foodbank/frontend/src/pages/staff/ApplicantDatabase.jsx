// claude.ai was used to generate and debug this page
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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

import StaffTopBar from "../../components/StaffTopBar";

// Read all applicants from localStorage at render time.
// Every account created by HomePage writes a key of the form `applicant_<email>`.
function loadApplicants() {
  const applicants = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("applicant_")) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data) applicants.push({ key, ...data });
      } catch {
        // skip malformed entries
      }
    }
  }
  // Sort newest accounts first using the email key as a stable fallback
  return applicants;
}

function ApplicantDatabase() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const staffBase = import.meta.env.VITE_STAFF_BASE;
  const handleLogout = () => navigate(`/${staffBase}/login`);

  // Load once on mount — a full page reload will refresh the list
  const applicants = useMemo(() => loadApplicants(), []);

  // Filter by name or email
  const filtered = useMemo(() =>
    applicants.filter((a) =>
      (a.name || "").toLowerCase().includes(query.toLowerCase()) ||
      (a.email || "").toLowerCase().includes(query.toLowerCase())
    ), [applicants, query]);

  const handleRowClick = (applicant) => {
    navigate(`/staff/applicant-info`, {
      state: {
        appointment: {
          name:                 applicant.name        || "",
          email:                applicant.email       || "",
          phone:                applicant.phone       || "",
          address:              applicant.address     || "",
          statusInCanada:       applicant.statusInCanada       || "",
          applyingToTinyBundles: applicant.applyingToTinyBundles || "no",
          householdMembers:     applicant.householdMembers     || "",
          dateLabel:            applicant.dateLabel   || "",
          timeLabel:            applicant.timeLabel   || "",
          duration:             applicant.duration    || 0,
          day:                  applicant.day         || "",
          startTime:            applicant.startTime   || "",
        },
      },
    });
  };

  // Derive a booking status label from the stored data
  const bookingStatus = (a) => {
    if (a.dateLabel && a.timeLabel) return "Booked";
    if (a.name) return "Registered";
    return "Pending";
  };

  const statusColor = (s) =>
    s === "Booked" ? "success" : s === "Registered" ? "warning" : "default";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <StaffTopBar onLogout={handleLogout} label="Admin Page" />

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
          fullWidth
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setQuery("")}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {applicants.length === 0 ? (
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
                      key={applicant.key}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleRowClick(applicant)}
                    >
                      <TableCell>{applicant.name || <em style={{ color: "#aaa" }}>Not provided</em>}</TableCell>
                      <TableCell>{applicant.email}</TableCell>
                      <TableCell>
                        {applicant.dateLabel && applicant.timeLabel
                          ? `${applicant.dateLabel} · ${applicant.timeLabel}`
                          : <em style={{ color: "#aaa" }}>No appointment booked</em>}
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