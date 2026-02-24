import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
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
          <Link href="https://surreyfoodbank.org/">
            <Box
              component="img"
              src={logo}
              alt="Surrey Food Bank Logo"
              height={40}
            />
          </Link>
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
                  <Link href="/applicant/create-account" color="primary">
                    here.
                  </Link>
                </>
              }
              secondary={
                <>
                  Already have an account? Log in{" "}
                  <Link href="/applicant/login" color="primary">
                    here.
                  </Link>
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
                  <Link
                    href="https://maps.app.goo.gl/1H39wzvMBqmki2se6"
                    color="primary.main"
                  >
                    registration office.
                  </Link>
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
