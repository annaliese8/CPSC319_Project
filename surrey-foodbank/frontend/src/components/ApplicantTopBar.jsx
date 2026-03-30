import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  Box
} from "@mui/material";
import logo from "../styles/full-logo.png";

// Used as a common top bar for the admin page
function ApplicantTopBar({ onLogout }) {

  return (
    <Box>
      <AppBar position="static" color="transparent" elevation={1}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Left group */}
          <Stack direction="row" spacing={2} alignItems="center">

            {/* Adds the logo with the title as admin page*/}
            <Stack direction="row" spacing={1.25} alignItems="center">
              <a href="https://surreyfoodbank.org/">
                <img
                  src={logo}
                  alt="Surrey Food Bank Logo"
                  style={{ height: 40 }} />
              </a>

              <Typography variant="h4" sx={{ pl: 1, fontSize: { xs: 20, sm: 28, md: 32 }, }}>
                Appointment System
              </Typography>
            </Stack>
          </Stack>

          {/* Right group */}
          <Button onClick={onLogout} color="primary" variant="text" sx={{ fontSize: 14, fontWeight: 800, textTransform: 'none', whiteSpace: "nowrap", }}>
            Log Out
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default ApplicantTopBar;