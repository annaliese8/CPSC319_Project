import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import MuiLink from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import logo from "../../styles/full-logo.png";

function Home() {
  const listItemIconStyle = {
    fontSize: "1.7rem",
    fontWeight: "bold",
    color: "warning.main",
  };

  const listItemTextStyle = {
    primary: { fontSize: "1.1rem" },
    secondary: { fontSize: "1rem" },
  };

  return (
    <>
      {/* Simple navbar */}
      <AppBar position="sticky" color="transparent" elevation={1}>
        <Toolbar>
          <MuiLink href="https://surreyfoodbank.org/">
            <Box
              component="img"
              src={logo}
              alt="Surrey Food Bank Logo"
              height={40}
            />
          </MuiLink>
        </Toolbar>
      </AppBar>
      {/* Webpage body */}
      <Stack
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          my: 4,
        }}
      >
        <Typography
          variant="h3"
          align="center"
          fontWeight="bold"
          color="primary"
        >
          Welcome to the Surrey Food Bank!
        </Typography>
        <Divider
          sx={{
            width: "60%",
            borderColor: "warning.main",
            borderBottomWidth: 4,
            my: 4,
          }}
        />
        <Typography variant="h5" align="center">
          If you're a prospective client, you're in the right place.
        </Typography>
        <Typography variant="h5" align="center">
          Just follow the steps below to complete your registration.
        </Typography>
        {/* Account buttons */}
        <Paper
          variant="outlined"
          sx={{
            mt: { xs: 2.5, sm: 3 },
            mb: { xs: 1, sm: 2 },
            px: { xs: 2.5, sm: 4 },
            py: { xs: 2, sm: 2.5 },
            width: "100%",
            maxWidth: 700,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            borderColor: "warning.main",
            borderRadius: 2,
            backgroundColor: "warning.50",
          }}
        >
          <Box>
            <Typography fontWeight="bold" sx={{ fontSize: "clamp(0.95rem, 1.6vw, 1.1rem)" }}>
              New here?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start by creating an account.
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ flexShrink: 0 }}>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/applicant/create-account"
              size="medium"
              sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}
            >
              Create Account
            </Button>
            <Button
              variant="outlined"
              color="primary"
              component={Link}
              to="/applicant/login"
              size="medium"
              sx={{ whiteSpace: "nowrap" }}
            >
              Log In
            </Button>
          </Stack>
        </Paper>
        <List sx={{ width: "100%", maxWidth: 700, mx: "auto" }}>
          {/* Step 1 */}
          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <Typography sx={listItemIconStyle}>1.</Typography>
            </ListItemIcon>
            <ListItemText
              primary={
                <>
                  Create an account in our registration system{" "}
                  <MuiLink component={Link} to="/applicant/create-account" color="primary">
                    here.
                  </MuiLink>
                </>
              }
              secondary={
                <>
                  Already have an account? Log in{" "}
                  <MuiLink component={Link} to="/applicant/login" color="primary">
                    here.
                  </MuiLink>
                </>
              }
              slotProps={listItemTextStyle}
            />
          </ListItem>
          {/* Step 2 */}
          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <Typography sx={listItemIconStyle}>2.</Typography>
            </ListItemIcon>
            <ListItemText
              primary={"Fill out a short form with your personal information."}
              slotProps={listItemTextStyle}
            />
          </ListItem>
          {/* Step 3 */}
          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <Typography sx={listItemIconStyle}>3.</Typography>
            </ListItemIcon>
            <ListItemText
              primary={"Pick an appointment date and time that works for you."}
              secondary={
                "You can cancel or reschedule your appointment at any time."
              }
              slotProps={listItemTextStyle}
            />
          </ListItem>
          {/* Step 4 */}
          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <Typography sx={listItemIconStyle}>4.</Typography>
            </ListItemIcon>
            <ListItemText
              primary={
                <>
                  Attend your scheduled appointment at our{" "}
                  <MuiLink
                    href="https://maps.app.goo.gl/1H39wzvMBqmki2se6"
                    color="primary.main"
                  >
                    registration office.
                  </MuiLink>
                </>
              }
              secondary={
                "Bring proof of address and original government-issued photo ID for each household member."
              }
              slotProps={listItemTextStyle}
            />
          </ListItem>
          {/* Step 5 */}
          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <Typography sx={listItemIconStyle}>5.</Typography>
            </ListItemIcon>
            <ListItemText
              primary={
                "Visit us on your biweekly pick-up day to collect your food hamper!"
              }
              slotProps={listItemTextStyle}
            />
          </ListItem>
        </List>
      </Stack>
    </>
  );
}

export default Home;