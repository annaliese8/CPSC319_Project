import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  Tabs,
  Tab,
  Box
} from "@mui/material";
import logo from "../styles/full-logo.png";
import { useState, useEffect } from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PeopleIcon from "@mui/icons-material/People";
import { useNavigate, useLocation } from "react-router-dom";


// Used as a common top bar for the admin page
function StaffTopBar({ onLogout, label }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: "Calendar View", icon: <CalendarMonthIcon />, path: "/staff/home" },
    { label: "Applicant Database", icon: <PeopleIcon />, path: "/staff/applicant-database" },
  ];

  // Update active tab based on current location
  useEffect(() => {
    const currentTabIndex = tabs.findIndex(tab => tab.path === location.pathname);
    if (currentTabIndex !== -1) {
      setActiveTab(currentTabIndex);
    }
  }, [location.pathname]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    navigate(tabs[newValue].path);
  };

  return (
    <AppBar position="static" color="transparent" elevation={1}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
        {/* Left group - Logo */}
        <Stack direction="row" spacing={1.25} alignItems="center">
          <a href="https://surreyfoodbank.org/">
            <img 
              src={logo} 
              alt="Surrey Food Bank Logo" 
              style={{ height: 40 }}
            />
          </a>
          <Typography variant="h6" sx={{ ml: 2 }}>
            {label}
          </Typography>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: 14,
                fontWeight: 500,
                minHeight: 48,
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab 
                key={index}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Stack>


        {/* Right group - Logout */}
        <Button 
          onClick={onLogout} 
          color="secondary" 
          variant="text" 
          sx={{ fontSize: 14, fontWeight: 800, textTransform: 'none' }}
        >
          Log Out
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default StaffTopBar;
