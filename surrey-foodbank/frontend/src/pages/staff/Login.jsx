import Button from "@mui/material/Button";
import UserNameField from "../../components/UserNameField";
import Link from "@mui/material/Link";
import PasswordField from "../../components/PasswordField";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Window from "../../components/Window";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 * 60 minutes = 8 hours

function Login() {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/staff/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username.trim(), password: password.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(true);
        return;
      }
      sessionStorage.setItem("staffAuth", JSON.stringify({ expiry: Date.now() + SESSION_DURATION_MS }));
      navigate("/staff/home");
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <>
      <title>Staff Login Page | Surrey Food Bank</title>
      <Window title="Surrey Food Bank Administrator Login">
        <UserNameField
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
          error={error}
          helperText={
            error ? "Incorrect username or password. Please try again." : ""
          }
        />
        <PasswordField
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          error={error}
          helperText={
            error ? "Incorrect username or password. Please try again." : ""
          }
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
          <Link
            component="button"
            type="button"
            underline="hover"
            onClick={() => navigate("/applicant/login")}
          >
            <Typography>Not an administrator?</Typography>
          </Link>
          <Button
            variant="contained"
            onClick={handleLogin}
            size="large"
            sx={{ fontWeight: "bold" }}
            disabled={loading}
          >
            {loading ? "Logging in…" : "Log In"}
          </Button>
        </Stack>
      </Window>
    </>
  );
}

export default Login;
