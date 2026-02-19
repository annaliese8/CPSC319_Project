import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Stack,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "../styles/full-logo.png";


// Used as a common top bar for the admin page
function StaffTopBar({ onLogout }) {
  return (
    <AppBar position="static" color="transparent" elevation={1}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left group */}
        <Stack direction="row" spacing={2} alignItems="center">
          {/* not sure what it does right now */}
          <IconButton
            edge="start"
            aria-label="Open menu"
            onClick={() => console.log("Hamburger clicked")}
            size="large"
          >
            <MenuIcon />
          </IconButton>

          {/* Adds the logo with the title as admin page*/}
          <Stack direction="row" spacing={1.25} alignItems="center">
            <a href="https://surreyfoodbank.org/">
              <img 
              src={logo} 
              alt="Surrey Food Bank Logo" 
              style={{ height: 40 }}            />
            </a>
            
            <Typography variant="h6" sx={{ ml: 2 }}>
              Admin Page
            </Typography>
          </Stack>
        </Stack>

        {/* Right group */}
        <Button onClick={onLogout} color="secondary" variant="text" sx={{ fontSize: 14, fontWeight: 800, textTransform: 'none' }}>
          Log Out
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default StaffTopBar;
