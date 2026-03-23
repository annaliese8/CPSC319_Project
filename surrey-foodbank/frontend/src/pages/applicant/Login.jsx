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
// import { loadSignupDraft } from "../../components/BookingSteps";

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

  // Password must match the one associated with the given email
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

  const navigate = useNavigate();

  // When the form is submitted, validate the fields.
  // If no errors exist, set active user and navigate to applicant's profile page.
  // If a signup draft exists (registration was never completed), resume it instead.
  const handleSubmit = (e) => {
    e.preventDefault();
    const emailError = emailField.validate();
    const passwordError = passwordField.validate();
    const hasErrors = Boolean(emailError) || Boolean(passwordError);
    const hasEmptyFields = !emailField.value || !passwordField.value;
    if (hasErrors || hasEmptyFields) return;

    localStorage.setItem(
      "activeUser",
      JSON.stringify({ email: emailField.value }),
    );

    // // Resume incomplete registration if a draft was saved
    // const draft = loadSignupDraft();
    // if (draft) {
    //   navigate("/applicant/register");
    // } else {
    //   navigate("/applicant/profile");
    // }

    const applicantKey = `applicant_${email}`;
    const stored = JSON.parse(localStorage.getItem(applicantKey) || "{}");

    const isRegistrationComplete = stored.registrationComplete;

    if (!isRegistrationComplete) {
      navigate("/applicant/register");
    } else {
      navigate("/applicant/profile");
    }
  };

  return (
    <>
      <title>Login | Surrey Food Bank</title>
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
            <MuiLink
              component="button"
              type="button"
              underline="hover"
              onClick={() => navigate("/applicant/create-account")}
            >
              <Typography>Don't have an account?</Typography>
            </MuiLink>
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{ fontWeight: "bold" }}
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
