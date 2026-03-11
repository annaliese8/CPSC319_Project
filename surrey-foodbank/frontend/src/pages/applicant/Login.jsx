// Copilot was used to help create the form validation functions
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import EmailField from "../../components/EmailField";
import MuiLink from "@mui/material/Link";
import PasswordField from "../../components/PasswordField";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Window from "../../components/Window";
import { Link, useNavigate } from "react-router-dom";
import useTextField from "../../hooks/useTextField";

function Login() {
  // Email must be associated with an existing account
  const emailField = useTextField(
    "",
    (value) => {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      return users.some((user) => user.email === value)
        ? ""
        : "An account with this address doesn't exist";
    },
    false,
  );
  // Password much match the one accossiated with the given email
  const passwordField = useTextField(
    "",
    (value) => {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const user = users.find((u) => u.email === emailField.value);
      if (!user) return "";
      return user.password === value ? "" : "Incorrect password";
    },
    false,
  );
  // When the form is submitted, validate the fields.
  // If no errors exist, set active user,
  // and navigate to applicant's profile page
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    const emailError = emailField.validate();
    const passwordError = passwordField.validate();
    const hasErrors = Boolean(emailError) || Boolean(passwordError);
    const hasEmptyFields = !emailField.value || !passwordField.value;
    if (hasErrors || hasEmptyFields) {
      return;
    }
    localStorage.setItem(
      "activeUser",
      JSON.stringify({ email: emailField.value }),
    );
    navigate("/applicant/profile");
  };

  return (
    <>
      <Window title="Surrey Food Bank Appointment Booking">
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column" }}
          noValidate
        >
          <EmailField
            value={emailField.value}
            onChange={emailField.onChange}
            error={emailField.isInvalid}
            helperText={emailField.errorMessage}
          />
          <PasswordField
            value={passwordField.value}
            onChange={passwordField.onChange}
            error={passwordField.isInvalid}
            helperText={passwordField.errorMessage}
          />
          <Stack
            direction="row"
            spacing={2}
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              padding: 2,
            }}
          >
            <MuiLink component={Link} to="/applicant/create-account" underline="hover">
              <Typography>Don't have an account?</Typography>
            </MuiLink>
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                fontWeight: "bold",
              }}
            >
              Log In
            </Button>
          </Stack>
        </Box>
      </Window>
    </>
  );
}

export default Login;