import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Stack,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "../styles/full-logo.png";
import { useState } from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PeopleIcon from "@mui/icons-material/People";
import { useNavigate } from "react-router-dom";


// Used as a common top bar for the admin page
function StaffTopBar({ onLogout }) {

  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { label: "Calendar View", icon: <CalendarMonthIcon />, key: "/staff/home" },
    { label: "Applicant Database", icon: <PeopleIcon />, key: "/staff/applicant-database" },
  ];

  return (
    <>
    <AppBar position="static" color="transparent" elevation={1}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left group */}
        <Stack direction="row" spacing={2} alignItems="center">
          {/* not sure what it does right now */}
          <IconButton
              edge="start"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
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
    <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {/* Drawer content */}
        <Stack sx={{ width: 250, pt: 2 }}>
          <Typography variant="h6" sx={{ px: 2, pb: 1 }}>
            Menu
          </Typography>
          <Divider />
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.key} disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate(item.key);
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Stack>
      </Drawer>
      </>
  );
}

export default StaffTopBar;
