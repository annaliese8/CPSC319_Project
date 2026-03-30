// Copilot was used to help create the form validation functions
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import EmailField from "../../components/EmailField";
import MuiLink from "@mui/material/Link";
import PasswordField from "../../components/PasswordField";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Window from "../../components/Window";
import { useNavigate } from "react-router-dom";
import useTextField from "../../hooks/useTextField";
import { useState } from "react";
import { getSupabaseClient } from "../../lib/supabaseClient";

function getApiBaseUrl() {
  const envBase = (import.meta.env.VITE_API_BASE_URL || "").trim();
  if (envBase) return envBase.replace(/\/$/, "");
  return import.meta.env.DEV ? "http://localhost:3000" : "";
}

function Login() {
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailField = useTextField(
    "",
    () => "",
    false,
  );

  // Password must match the one associated with the given email
  const passwordField = useTextField(
    "",
    () => "",
    false,
  );

  const navigate = useNavigate();

  // When the form is submitted, validate the fields.
  // If no errors exist, set active user and navigate to applicant's profile page
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError("");
    const emailError = emailField.validate();
    const passwordError = passwordField.validate();
    const hasErrors = Boolean(emailError) || Boolean(passwordError);
    const hasEmptyFields = !emailField.value || !passwordField.value;
    if (hasErrors || hasEmptyFields) {
      setSubmitError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailField.value,
      password: passwordField.value,
    });

    if (error || !data?.session) {
      setSubmitError("Incorrect email or password. Please try again.");
      setIsSubmitting(false);
      return;
    }

    localStorage.setItem(
      "activeUser",
      JSON.stringify({ email: emailField.value }),
    );

    const apiBase = getApiBaseUrl();

    try {
      const response = await fetch(`${apiBase}/api/applicant/registration-status`, {
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
        },
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setSubmitError(result?.error || "Unable to check registration status.");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      if (result?.data?.completed) {
        navigate("/applicant/profile");
        return;
      }

      navigate("/applicant/register");
    } catch (_err) {
      setIsSubmitting(false);
      setSubmitError("Unable to check registration status. Please try again.");
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
            helperText={emailField.errorMessage || "Use your account email"}
          />
          <PasswordField
            value={passwordField.value}
            onChange={passwordField.onChange}
            error={Boolean(submitError)}
            helperText={submitError || passwordField.errorMessage}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Log In"}
            </Button>
          </Stack>
        </Box>
      </Window>
    </>
  );
}

export default Login;
