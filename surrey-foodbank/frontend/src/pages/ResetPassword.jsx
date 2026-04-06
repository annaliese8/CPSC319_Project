import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PasswordField from "../components/PasswordField";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import Typography from "@mui/material/Typography";
import Window from "../components/Window";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getSupabaseClient } from "../lib/supabaseClient";

function validatePassword(value) {
  if (!value || value.length < 10) {
    return "Password must be at least 10 characters long.";
  }
  if (!/[A-Z]/.test(value)) {
    return "Password must include at least one uppercase letter.";
  }
  if (!/\d/.test(value)) {
    return "Password must include at least one number.";
  }
  return "";
}

function PasswordRequirementsChecklist({ value }) {
  const passwordRules = [
    { id: "length", label: "Be at least 10 characters long", test: (v) => v.length >= 10 },
    { id: "uppercase", label: "Contain at least one capital letter (e.g., A, B, C, ...)", test: (v) => /[A-Z]/.test(v) },
    { id: "number", label: "Contain at least one number (e.g., 1, 2, 3, ...)", test: (v) => /[0-9]/.test(v) },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        p: 1.5,
        mx: 2,
        mb: 1,
        backgroundColor: "#f5f7fa",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ mb: 1.5, color: "text.secondary", fontWeight: 600, fontSize: "1rem" }}
      >
        Your password must:
      </Typography>
      <Stack spacing={1}>
        {passwordRules.map((rule) => {
          const passed = rule.test(value);
          return (
            <Stack key={rule.id} direction="row" spacing={1.5} alignItems="center">
              {passed ? (
                <CheckCircleIcon sx={{ color: "success.main", flexShrink: 0 }} />
              ) : (
                <RadioButtonUncheckedIcon sx={{ color: "text.disabled", flexShrink: 0 }} />
              )}
              <Typography
                variant="body1"
                sx={{
                  color: passed ? "success.main" : "text.primary",
                  textDecoration: passed ? "line-through" : "none",
                  transition: "color 0.2s, text-decoration 0.2s",
                }}
              >
                {rule.label}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}

function getRoleFromQuery(searchParams) {
  const rawRole = String(searchParams.get("role") || "").trim().toLowerCase();
  if (rawRole === "applicant") return "applicant";
  return "applicant";
}

function getRecoveryTokensFromHash() {
  const hash = String(window.location.hash || "");
  const recoveryFragment = hash.includes("#access_token=")
    ? hash.slice(hash.lastIndexOf("#") + 1)
    : "";

  if (!recoveryFragment.includes("access_token=")) {
    return null;
  }

  const params = new URLSearchParams(recoveryFragment.replace(/^#/, ""));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const tokenType = params.get("type");

  if (!accessToken || !refreshToken || tokenType !== "recovery") {
    return null;
  }

  return { accessToken, refreshToken };
}

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingRecovery, setIsCheckingRecovery] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);

  const requestedRole = getRoleFromQuery(searchParams);

  useEffect(() => {
    const supabase = getSupabaseClient();
    let active = true;

    const evaluateSession = (session) => {
      if (!active) return;
      setHasRecoverySession(Boolean(session));
      setIsCheckingRecovery(false);
    };

    const bootstrapRecoverySession = async () => {
      const recoveryTokens = getRecoveryTokensFromHash();

      if (recoveryTokens) {
        const { data, error } = await supabase.auth.setSession({
          access_token: recoveryTokens.accessToken,
          refresh_token: recoveryTokens.refreshToken,
        });

        if (!active) return;

        if (!error && data?.session) {
          evaluateSession(data.session);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      evaluateSession(data?.session ?? null);
    };

    bootstrapRecoverySession().catch(() => {
      if (!active) return;
      setHasRecoverySession(false);
      setIsCheckingRecovery(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        evaluateSession(session);
      }
    });

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError("");
    setSubmitMessage("");

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setSubmitError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setSubmitError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setSubmitError("Unable to reset password. This recovery link may be expired.");
        setIsSubmitting(false);
        return;
      }

      await supabase.auth.signOut();
      setSubmitMessage("Password updated successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/applicant/login", { replace: true });
      }, 1200);
    } catch (_err) {
      setSubmitError("Unable to reset password. Please request a new reset link.");
      setIsSubmitting(false);
    }
  };

  const backLoginPath = "/applicant/login";

  if (isCheckingRecovery) {
    return (
      <Window title="Reset Password">
        <Box sx={{ p: 2 }}>
          <Typography>Checking recovery link...</Typography>
        </Box>
      </Window>
    );
  }

  if (!hasRecoverySession) {
    return (
      <>
        <title>Reset Password | Surrey Food Bank</title>
        <Window title="Reset Password">
          <Stack spacing={2} sx={{ p: 2 }}>
            <Typography color="error">
              This reset link is invalid or expired.
            </Typography>
            <Button variant="contained" onClick={() => navigate(backLoginPath)}>
              Back to Login
            </Button>
          </Stack>
        </Window>
      </>
    );
  }

  return (
    <>
      <title>Reset Password | Surrey Food Bank</title>
      <Window title="Reset Password">
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <PasswordField
            id="new-password"
            label="New Password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            error={Boolean(submitError)}
          />
          <PasswordRequirementsChecklist value={newPassword} />
          <PasswordField
            id="confirm-password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            error={Boolean(submitError)}
            helperText={submitError || submitMessage || "Use at least 10 characters, one uppercase letter, and one number."}
          />
          <Stack direction="row" justifyContent="flex-end" sx={{ p: 2 }}>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Update Password"}
            </Button>
          </Stack>
        </Box>
      </Window>
    </>
  );
}

export default ResetPassword;