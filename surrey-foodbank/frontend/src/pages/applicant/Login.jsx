import Button from "@mui/material/Button";
import EmailField from "../../components/EmailField";
import Link from "@mui/material/Link";
import PasswordField from "../../components/PasswordField";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Window from "../../components/Window";

function Login() {
  return (
    <>
      <Window title="Surrey Food Bank Appointment Booking">
        <EmailField />
        <PasswordField />
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
          <Link href="/applicant/create-account" underline="hover">
            <Typography>Don't have an account?</Typography>
          </Link>
          <Button
            variant="contained"
            href="/applicant/home"
            size="large"
            sx={{
              fontWeight: "bold",
            }}
          >
            Log In
          </Button>
        </Stack>
      </Window>
    </>
  );
}

export default Login;
