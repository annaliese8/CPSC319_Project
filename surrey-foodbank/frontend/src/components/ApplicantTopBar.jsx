import { AppBar, Box, Button, Link, Toolbar, Typography } from "@mui/material";
import logo from "../styles/full-logo.png";

// Used as a common top bar for the applicant page
function ApplicantTopBar({ onLogout }) {
  return (
    <Box>
      <AppBar position="static" color="#ffffff" elevation={1}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Clickable logo */}
          <Link
            href="https://surreyfoodbank.org/"
            aria-label="Surrey Food Bank main website"
            underline="none"
          >
            <Box
              component="img"
              src={logo}
              alt="Surrey Food Bank Logo"
              sx={{ height: { xs: 35, sm: 50 } }}
            />
          </Link>
          {/* Main title */}
          <Typography
            sx={{
              px: 2,
              fontSize: { xs: 18, sm: 26, md: 32 },
              textAlign: "center",
            }}
          >
            Appointment System
          </Typography>
          {/* Log out */}
          <Button
            onClick={onLogout}
            color="primary"
            variant="text"
            sx={{
              fontSize: { sm: 14, md: 18 },
              fontWeight: 800,
              textTransform: "none",
              whiteSpace: "nowrap",
            }}
          >
            Log Out
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default ApplicantTopBar;
