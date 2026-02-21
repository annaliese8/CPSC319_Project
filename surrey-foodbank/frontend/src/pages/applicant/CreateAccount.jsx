// Copilot was used to help create the form validation functions

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import EmailField from "../../components/EmailField";
import Link from "@mui/material/Link";
import PasswordField from "../../components/PasswordField";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Window from "../../components/Window";

import useTextField from "../../hooks/useTextField";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Account creation page for new applicants to set an email and password

function CreateAccount() {
  // Email must follow a basic email format
  const emailField = useTextField("", (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? ""
      : "Please enter a valid email address",
  );

  // Password must meet minimum length requirement
  const passwordField = useTextField("", (value) =>
    value.length < 10 ? "Password must be at least 10 characters" : "",
  );

  // Confirm password must always match the password field
  const confirmPasswordField = useTextField("", (value) =>
    value !== passwordField.value ? "Passwords do not match" : "",
  );

  // Re-run confirm password validation whenever the main password changes
  useEffect(() => {
    confirmPasswordField.onChange({
      target: { value: confirmPasswordField.value },
    });
  }, [passwordField.value]);

  // Re-validate fields when the form is submitted
  // and prevent navigation to next page if any errors exist
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();

    emailField.validate();
    passwordField.validate();
    confirmPasswordField.validate();

    const hasErrors =
      emailField.isInvalid ||
      passwordField.isInvalid ||
      confirmPasswordField.isInvalid;

    const hasEmptyFields =
      !emailField.value || !passwordField.value || !confirmPasswordField.value;

    if (hasErrors || hasEmptyFields) {
      return;
    } else {
      navigate("/applicant/book-appointment");
    }
  };

  return (
    <Window title="Surrey Food Bank Appointment Booking">
      <Typography align="center" sx={{ fontSize: 18, padding: 2 }}>
        Please create an account to continue booking your appointment
      </Typography>
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
        <PasswordField
          id="confirm-password"
          label="Confirm Password"
          value={confirmPasswordField.value}
          onChange={confirmPasswordField.onChange}
          error={confirmPasswordField.isInvalid}
          helperText={confirmPasswordField.errorMessage}
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
          <Link href="/applicant/login" underline="hover">
            <Typography>Already have an account?</Typography>
          </Link>
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{ fontWeight: "bold" }}
          >
            Create Account
          </Button>
        </Stack>
      </Box>
    </Window>
  );
}

export default CreateAccount;
