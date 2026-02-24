import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
// Claude.ai help used {
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

// Create mock applicants 
const MOCK_APPLICANTS = [
  { id: 1, name: "Walter White", email: "Heisenberg@email.com", createdAt: "2026-11-01", status: "Approved" },
  { id: 2, name: "Skyler White", email: "Skyler@email.com", createdAt: "2026-11-05", status: "Pending" },
  { id: 3, name: "Jesse Pinkman", email: "Je$$eCooks@email.com", createdAt: "2026-11-10", status: "Denied" },
  { id: 4, name: "Hank Schrader", email: "H.Schrader@FDA.com", createdAt: "2026-11-12", status: "Approved" },
  { id: 5, name: "Saul Goodman", email: "bettercallsaul@email.com", createdAt: "2026-11-15", status: "Pending" },
  { id: 6, name: "Mike Ehrmantraut", email: "mike@email.com", createdAt: "2026-11-18", status: "Approved" },
  { id: 7, name: "Gus Fring", email: "g.fring@lospolloshermanos.com", createdAt: "2026-11-20", status: "Pending" },
];
// Claude.ai help used }

function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");


  const staffBase = import.meta.env.VITE_STAFF_BASE;
  const handleLogout = () => navigate(`/${staffBase}/login`);

// Claude.ai help used {
// filter through the created table values by name or email (compares all searches and results in lowercase)
  const filtered = useMemo(() =>
    MOCK_APPLICANTS.filter((a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.email.toLowerCase().includes(query.toLowerCase())
    ), [query]);
// Claude.ai help used }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <StaffTopBar onLogout={handleLogout} />

      <Box sx={{ p: { xs: 2, md: 4 } }}></Box>
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
        // Claude.ai help used {
      />
      {/* Text shown if search produces no results */}
      {filtered.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          No applicants found for "{query}".
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              {/* Create react table */}
              <TableRow sx={{ backgroundColor: "grey.100" }}>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Date Applied</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((applicant) => (
                <TableRow
                  key={applicant.id}
                  hover
                  sx={{ cursor: "pointer" }} 
                  // navigate into the applicant page on click TODO
                  onClick={() => navigate(`/staff/applicant-info`, { 
                  state: { 
                  appointment: {
                  name: applicant.name,
                  address: "123 Example St.",         
                  statusInCanada: "Canadian Citizen", 
                  applyingToTinyBundles: "no",         
                  householdMembers: "2",               
                  dateLabel: "Monday March 26, 2026",  
                  timeLabel: "3:30pm – 3:45pm",        
                  email: applicant.email,
                  status: applicant.status,
                  createdAt: applicant.createdAt,
                  }
                }
})}
                >
                  {/* Fill in applicant information */}
                  <TableCell>{applicant.name}</TableCell>
                  <TableCell>{applicant.email}</TableCell>
                  <TableCell>
                    {new Date(applicant.createdAt).toLocaleDateString("en-CA", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={applicant.status}
                      size="small"
                      color={
                        // create status color based on application status
                        applicant.status === "Approved" ? "success" :
                        applicant.status === "Pending" ? "warning" : "default"
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <ArrowForwardIosIcon fontSize="small" color="action" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        // Claude.ai help used }
      )}
    </Box>
  );
}

export default Home;